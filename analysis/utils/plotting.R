library(tidyverse)
library(tibble)
library(tidyr)
library(brms)
library(MASS)
library(furrr)
library(cmdstanr)
library(scales)
library(dplyr)
library(purrr)
library(ggplot2)
library(tikzDevice)
library(readr)

source(here::here("analysis", "utils", "data.R"))
source(here::here("analysis", "utils", "constants.R"))

options(tikzDefaultEngine = "pdftex")
options(tikzLatexPackages = c(
  getOption("tikzLatexPackages"),
  "\\usepackage{amsfonts}",
  "\\usepackage{amsmath}"
))


# ── Reporting & Plots ──────────────────────────────────────────────────────

# Distribution of sessions used per child under adaptive stopping
plot_session_distribution <- function(adaptive_results) {
  all_children <- map_dfr(seq_along(adaptive_results), function(i) {
    adaptive_results[[i]]$child_status |>
      mutate(sim = i)
  })

  ggplot(all_children, aes(x = stop_session, fill = stop_reason)) +
    geom_histogram(
      binwidth = 2, colour = "white", alpha = 0.9,
      position = "stack"
    ) +
    scale_fill_manual(
      values = c(
        superiority = "#1a9641", # green  — clear winner found
        aipe        = "#74c476", # light green — winner found via precision
        rope        = "#fdae61", # orange — no active prep helps
        max_reached = "#d7191c" # red    — inconclusive at max sessions
      ),
      labels = c(
        superiority = "Superiority: P(best arm) ≥ 90% for 3 interims",
        aipe        = "AIPE: 95% CrI width < 0.5 logit",
        rope        = "ROPE: No Prep most probable (no differential effect)",
        max_reached = "Max sessions reached (inconclusive)"
      ),
      name = "Stopping reason"
    ) +
    scale_x_continuous(breaks = seq(12, 60, by = 4)) +
    labs(
      title = "Distribution of sessions used per child — adaptive stopping",
      subtitle = paste0(
        "Dark green = clear winner | Light green = precise estimate | ",
        "Orange = no prep effect | Red = inconclusive"
      ),
      x = "Session number when child stopped",
      y = "Count  (children × simulations)"
    ) +
    theme_minimal(base_size = 13) +
    theme(
      legend.position = "bottom",
      legend.text = element_text(size = 8)
    )
}

plot_resolution_curve <- function(adaptive_results,
                                  max_s = 60, check_every = 4, save_tikz = TRUE, save_pdf = TRUE) {
  print("Generating resolution curve data...")
  print(adaptive_results)
  # stop if adaptive_results is empty or contains NULLs
  if (length(adaptive_results) == 0 || any(map_lgl(adaptive_results, is.null))) {
    stop("No valid adaptive results to plot. Please check the simulation outputs.")
  }
  
  checkpoints <- seq(12, max_s, by = check_every)

  all_children <- map_dfr(seq_along(adaptive_results), function(i) {
    adaptive_results[[i]]$child_status |> mutate(sim = i)
  })

  # Cumulative resolution at each checkpoint, per profile
  resolution_curve <- map_dfr(checkpoints, function(s) {
    all_children |>
      mutate(resolved_by_s = stop_reason %in% c("superiority", "aipe", "rope") &
        stop_session <= s) |>
      group_by(true_profile) |>
      summarise(pct_resolved = mean(resolved_by_s), .groups = "drop") |>
      mutate(session = s)
  })

  # Add overall (weighted by profile proportions)
  overall <- map_dfr(checkpoints, function(s) {
    all_children |>
      mutate(resolved_by_s = stop_reason %in% c("superiority", "aipe", "rope") &
        stop_session <= s) |>
      summarise(pct_resolved = mean(resolved_by_s)) |>
      mutate(session = s, true_profile = "overall")
  })

  curve_data <- bind_rows(resolution_curve, overall)

  curve_data_table <- curve_data |>
    tidyr::pivot_wider(
      names_from = true_profile,
      values_from = pct_resolved,
      names_prefix = ""
    )

#   print(curve_data, n = nrow(curve_data))
  print(curve_data_table)

  profile_colours <- c(
    one_winner_strong = "#1D9E75",
    one_winner_weak   = "#5DCAA5",
    multiple_winners  = "#378ADD",
    no_differential   = "#EF9F27",
    overall           = "#888780"
  )

  profile_linetypes <- c(
    one_winner_strong = "dashed",
    one_winner_weak   = "dashed",
    multiple_winners  = "dashed",
    no_differential   = "dashed",
    overall           = "solid"
  )

  profile_sizes <- c(
    one_winner_strong = 1.2,
    one_winner_weak   = 1.2,
    multiple_winners  = 1.2,
    no_differential   = 1.2,
    overall           = 2.0  # Keep the overall point prominent
  )

  p <- ggplot(curve_data, aes(
    x = session, y = pct_resolved,
    colour = true_profile,
    linetype = true_profile,
    size = true_profile
  )) +
    geom_line(linewidth = 1.1) +
    geom_point() +
    scale_size_manual(
      values = profile_sizes,
      name = "Profile",
      labels = c(
        one_winner_strong  = "One winner strong",
        one_winner_weak    = "One winner weak",
        multiple_winners   = "Multiple winners",
        no_differential    = "No differential",
        overall            = "Overall"
      )
    ) +
    geom_hline(
      yintercept = 0.85, linetype = "dotted",
      colour = "grey50", linewidth = 0.6
    ) +
    annotate("text",
      x = 13, y = 0.91, label = "85\\% target",
      colour = "grey40", hjust = 0, size = 3.2
    ) +
    scale_colour_manual(
      values = profile_colours,
      name = "Profile",
      labels = c(
        one_winner_strong  = "One winner strong",
        one_winner_weak    = "One winner weak",
        multiple_winners   = "Multiple winners",
        no_differential    = "No differential",
        overall            = "Overall"
      )
    ) +
    scale_linetype_manual(
      values = profile_linetypes,
      name = "Profile",
      labels = c(
        one_winner_strong  = "One winner strong",
        one_winner_weak    = "One winner weak",
        multiple_winners   = "Multiple winners",
        no_differential    = "No differential",
        overall            = "Overall"
      )
    ) +
    scale_y_continuous(
      labels = percent_format(accuracy = 1, suffix = "\\%"),
      limits = c(0, 1)
    ) +
    scale_x_continuous(breaks = checkpoints) +
    labs(
      # title = "Cumulative resolution rate by session and child profile",
      # subtitle = "Resolved = stopped via superiority, AIPE, or ROPE before max_sessions",
      x = "Session number",
      y = "Cumulative \\% resolved",
      caption = paste0(
        "Resolved = stopped via superiority, AIPE, or ROPE.\n",
        "Dashed horizontal = 85\\% resolution target."
      )
    ) +
    theme_minimal(base_size = 13) +
    theme(
      legend.position = "right",
      legend.justification = "top",
      plot.caption = element_text(colour = "grey50", size = 9),
      panel.grid.minor = element_blank()
  #     aspect.ratio = 0.5
    ) +
    guides(
      colour = guide_legend(ncol = 1),
      linetype = guide_legend(ncol = 1)
    )

  save_csv(curve_data_table, name = "01_power_analysis")

  ts <- format(Sys.time(), "%Y-%m-%d_%H%M%S")

  if (save_pdf) {
    ggsave(
      filename = here::here("results", "draft", paste0("01_power_analysis_", ts, ".pdf")),
      plot = p,
      device = cairo_pdf, # Ensures fonts are embedded correctly for journals
      width = 8, 
      height = 4, 
      units = "in",
      dpi = 300
    )
  }

  if (save_tikz) {
    tikz(
      file = here::here("results", "draft", paste0("01_power_analysis_", ts, ".tex")),
      width = 7,      # Fits standard A4 text area width
      height = 3.2   # Keeps the 9:16-ish aspect ratio but compact
    )
    print(p)
    dev.off()
  }

  return(p)
}


evaluate_accuracy <- function(child_status, child_rfx) {
  child_status |>
    left_join(
      child_rfx |> dplyr::select(child_id, true_profile),
      by = "child_id"
    ) |>
    mutate(
      # Was stopping reason appropriate given the true profile?
      correct_stop = case_when(
        true_profile == "one_winner_strong" & stop_reason == "superiority" ~ TRUE,
        true_profile == "one_winner_weak" & stop_reason %in% c("superiority", "aipe") ~ TRUE,
        true_profile == "multiple_winners" & stop_reason == "aipe" ~ TRUE,
        true_profile == "no_differential" & stop_reason == "rope" ~ TRUE,
        stop_reason == "max_reached" ~ NA, # inconclusive, not wrong
        TRUE ~ FALSE
      )
    ) |>
    group_by(true_profile) |>
    summarise(
      n             = n(),
      pct_correct   = mean(correct_stop, na.rm = TRUE),
      pct_max       = mean(stop_reason == "max_reached"),
      mean_sessions = mean(stop_session, na.rm = TRUE)
    )
}


# Summarise the list returned by the adaptive sweep
summarise_adaptive <- function(results) {
  tibble(
    n_valid = length(results),
    mean_sessions = mean(map_dbl(results, "mean_sessions"), na.rm = TRUE),
    sd_sessions = sd(map_dbl(results, "mean_sessions"), na.rm = TRUE),
    p50_sessions = median(map_dbl(results, "mean_sessions"), na.rm = TRUE),
    p90_sessions = mean(map_dbl(results, "p90_sessions"), na.rm = TRUE),
    detection_rate = mean(map_dbl(results, "detection_rate"), na.rm = TRUE),

    # Stopping reason breakdown (averaged across sims)
    pct_superiority = mean(map_dbl(results, ~ {
      mean(.x$child_status$stop_reason == "superiority", na.rm = TRUE)
    }), na.rm = TRUE),
    pct_aipe = mean(map_dbl(results, ~ {
      mean(.x$child_status$stop_reason == "aipe", na.rm = TRUE)
    }), na.rm = TRUE),
    pct_rope = mean(map_dbl(results, ~ {
      mean(.x$child_status$stop_reason == "rope", na.rm = TRUE)
    }), na.rm = TRUE),
    pct_max = mean(map_dbl(results, ~ {
      mean(.x$child_status$stop_reason == "max_reached", na.rm = TRUE)
    }), na.rm = TRUE)
  )
}

# Summary table printed to console
print_adaptive_summary <- function(summary_tbl) {
  cat("\n")
  cat("══════════════════════════════════════════════════════════\n")
  cat("  Adaptive Stopping Summary\n")
  cat("══════════════════════════════════════════════════════════\n")
  cat(sprintf("  Valid simulations:          %d\n", summary_tbl$n_valid))
  cat(sprintf("  Mean sessions per child:    %.1f\n", summary_tbl$mean_sessions))
  cat(sprintf("  Median sessions per child:  %.1f\n", summary_tbl$p50_sessions))
  cat(sprintf("  90th-pct sessions:          %.1f\n", summary_tbl$p90_sessions))
  cat(sprintf("  Mean detection rate:        %.0f%%\n", summary_tbl$detection_rate * 100))
  cat("  ── Stopping reason breakdown ──\n")
  cat(sprintf("    Superiority:   %.0f%% of children\n", summary_tbl$pct_superiority * 100))
  cat(sprintf("    AIPE:          %.0f%% of children\n", summary_tbl$pct_aipe * 100))
  cat(sprintf("    ROPE (no fx):  %.0f%% of children\n", summary_tbl$pct_rope * 100))
  cat(sprintf("    Max reached:   %.0f%% of children\n", summary_tbl$pct_max * 100))
  cat("══════════════════════════════════════════════════════════\n\n")
}

# ── Shared helpers ─────────────────────────────────────────────────────────

.forest_data_from_draws <- function(draw_list, condition_order) {
  imap_dfr(draw_list, function(vals, label) {
    tibble(
      condition = label,
      mean      = mean(vals),
      lo95      = quantile(vals, 0.025),
      hi95      = quantile(vals, 0.975),
      lo80      = quantile(vals, 0.10),
      hi80      = quantile(vals, 0.90),
      p_pos     = mean(vals > 0)
    )
  }) |>
    mutate(condition = factor(condition, levels = rev(condition_order)))
}

.render_forest_plot <- function(forest_data, x_label) {
  ggplot(forest_data, aes(y = condition, x = mean)) +
    geom_vline(xintercept = 0, linetype = "dashed", colour = "grey50", linewidth = 0.6) +
    geom_linerange(aes(xmin = lo95, xmax = hi95), linewidth = 0.7, colour = "#2166ac") +
    geom_linerange(aes(xmin = lo80, xmax = hi80), linewidth = 2.0, colour = "#2166ac") +
    geom_point(size = 3.5, colour = "#2166ac") +
    geom_text(
      aes(x = hi95 + 0.08, label = sprintf("P(+) = %.0f\\%%", p_pos * 100)),
      hjust = 0, size = 3.2, colour = "grey30"
    ) +
    scale_x_continuous(
      name   = x_label,
      expand = expansion(mult = c(0.05, 0.25))
    ) +
    labs(
      y       = NULL,
      caption = "Points = posterior mean; thick bar = 80\\% CrI; thin bar = 95\\% CrI."
    ) +
    theme_minimal(base_size = 13) +
    theme(
      panel.grid.major.y = element_blank(),
      panel.grid.minor   = element_blank(),
      plot.caption       = element_text(colour = "grey50", size = 9)
    )
}

# ── Group-level forest plot ────────────────────────────────────────────────

plot_forest_group_effects <- function(fit, save_tikz = FALSE, save_pdf = FALSE) {
  draws <- as_draws_df(fit)

  active <- PREP_PARAMS[paste0("b_", PREP_PARAMS) %in% names(draws)]

  draw_list <- imap(active, function(stem, label) draws[[paste0("b_", stem)]])
  names(draw_list) <- names(active)

  forest_data <- .forest_data_from_draws(draw_list, names(active))

  p <- .render_forest_plot(
    forest_data,
    x_label = "Effect on engagement vs.\\ No Preparation (points)"
  )

  save_csv(forest_data, name = "forest_group_effects")

  ts <- format(Sys.time(), "%Y-%m-%d_%H%M%S")

  ggsave(here::here("results", "draft", paste0(ts, "_forest_group_effects", ".png")), p, width = 6, height = 4)
  ggsave(here::here("results", "forest_group_effects.png"), p, width = 6, height = 4)

  if (save_pdf) {
    ggsave(
      filename = here::here("results", "draft", paste0(ts, "_forest_group_effects", ".pdf")),
      plot     = p,
      device   = cairo_pdf,
      width    = 7,
      height   = 6,
      units    = "in",
      dpi      = 300
    )
  }

  if (save_tikz) {
    tikz(
      file   = here::here("results", "draft", paste0(ts, "_forest_group_effects", ".tex")),
      width  = 6.5,
      height = 2.4
    )
    print(p)
    dev.off()
  }

  return(p)
}

# ── Per-child forest plots ─────────────────────────────────────────────────

plot_forest_per_child <- function(fit, save_pdf = FALSE) {
  draws    <- as_draws_df(fit)
  children <- levels(as.factor(fit$data$child_id))

  dir.create(here::here("results", "forest_plots"), showWarnings = FALSE, recursive = TRUE)

  for (child in children) {
    # brms sanitises level names in column headers (spaces → dots, etc.)
    active <- PREP_PARAMS[paste0("b_", PREP_PARAMS) %in% names(draws)]

    # individual posterior = group fixed effect + child random slope
    draw_list <- imap(active, function(stem, label) {
      fixed_col <- paste0("b_", stem)
      rfx_col   <- paste0("r_child_id[", child, ",", stem, "]")
      if (!rfx_col %in% names(draws)) {
        warning("Random-effect column not found: ", rfx_col, " — using fixed effect only")
        return(draws[[fixed_col]])
      }
      draws[[fixed_col]] + draws[[rfx_col]]
    })
    names(draw_list) <- names(active)

    forest_data <- .forest_data_from_draws(draw_list, names(active))

    p <- .render_forest_plot(
      forest_data,
      x_label = "Individual effect vs.\\ No Preparation (points)"
    ) +
      ggtitle(paste("Child", child))

    if (save_pdf) {
      ggsave(
        filename = here::here("results", "forest_plots", paste0("child_", child, ".pdf")),
        plot     = p,
        device   = cairo_pdf,
        width    = 6,
        height   = 2.8,
        units    = "in",
        dpi      = 300
      )
    }

    ggsave(
      filename = here::here("results", "forest_plots", paste0("child_", child, ".png")),
      plot     = p,
      width    = 6,
      height   = 2.8,
      units    = "in",
      dpi      = 150
    )
  }

  invisible(NULL)
}


boxplot_per_child <- function() {
  sessions <- read.csv(here::here("data", "sessions.csv"))
  sessions$prep <- factor(sessions$prep, levels = ALL_PREPS)
  for (child in unique(sessions$child_id)) {
    p <- sessions |>
      filter(child_id == child) |>
      ggplot(aes(y = prep, x = engagement, fill = prep)) +
      geom_violin(alpha = 0.4, trim = FALSE) +
      geom_boxplot(width = 0.2, outlier.shape = NA, alpha = 0.7) +
      geom_jitter(width = 0.08, size = 1.5, alpha = 0.6) +
      scale_fill_brewer(palette = "Set2") +
      labs(title = paste("Child", child), y = "Prep type", x = "Rating") +
      theme_bw() +
      theme(legend.position = "none")

    ggsave(here::here("results", "figures", paste0("child_", child, ".png")), p, width = 6, height = 4)
  }
}

# ── Posterior predictive checks ────────────────────────────────────────────
#
# Asks whether data simulated from the fitted model resemble the observed
# engagement scores. Convergence diagnostics (R-hat/ESS/divergences in
# model.R) only confirm the sampler explored the posterior — these check
# whether the *model itself* fits. Relevant here because engagement is a
# bounded mean of BRES-10 ratings fitted with a Gaussian likelihood, which
# can predict out-of-range, symmetric, constant-variance outcomes.
#
# Produces (and saves to results/ppc/):
#   - dens_overlay        : observed density vs. posterior-predictive draws
#   - stat min/max/sd     : can the model reproduce range and spread?
#   - intervals           : per-observation predictive intervals vs. observed
#   - stat_grouped (mean) : per-child fit, the level driving stopping decisions
plot_ppc <- function(fit, ndraws = 100, save_pdf = FALSE) {
  out_dir <- here::here("results", "ppc")
  dir.create(out_dir, showWarnings = FALSE, recursive = TRUE)

  plots <- list(
    dens_overlay = pp_check(fit, type = "dens_overlay", ndraws = ndraws) +
      ggtitle("PPC: observed vs. predicted density"),
    stat_min     = pp_check(fit, type = "stat", stat = "min", ndraws = ndraws) +
      ggtitle("PPC: minimum engagement"),
    stat_max     = pp_check(fit, type = "stat", stat = "max", ndraws = ndraws) +
      ggtitle("PPC: maximum engagement"),
    stat_sd      = pp_check(fit, type = "stat", stat = "sd", ndraws = ndraws) +
      ggtitle("PPC: standard deviation"),
    intervals    = pp_check(fit, type = "intervals", ndraws = ndraws) +
      ggtitle("PPC: per-observation predictive intervals"),
    stat_grouped = pp_check(
      fit,
      type = "stat_grouped", stat = "mean", group = "child_id", ndraws = ndraws
    ) +
      ggtitle("PPC: mean engagement per child")
  )

  for (name in names(plots)) {
    ggsave(
      filename = file.path(out_dir, paste0(name, ".png")),
      plot     = plots[[name]],
      width    = 7,
      height   = 4.5,
      units    = "in",
      dpi      = 150
    )

    if (save_pdf) {
      ggsave(
        filename = file.path(out_dir, paste0(name, ".pdf")),
        plot     = plots[[name]],
        device   = cairo_pdf,
        width    = 7,
        height   = 4.5,
        units    = "in",
        dpi      = 300
      )
    }
  }

  cat(sprintf("\nPosterior predictive checks saved to: %s\n", out_dir))
  invisible(plots)
}