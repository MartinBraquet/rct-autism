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

  print(curve_data, n = nrow(curve_data))

  profile_colours <- c(
    one_winner_strong = "#1D9E75",
    one_winner_weak   = "#5DCAA5",
    multiple_winners  = "#378ADD",
    no_differential   = "#EF9F27",
    overall           = "#888780"
  )

  profile_linetypes <- c(
    one_winner_strong = "dotted",
    one_winner_weak   = "dotted",
    multiple_winners  = "dotted",
    no_differential   = "dotted",
    overall           = "solid"
  )

  p <- ggplot(curve_data, aes(
    x = session, y = pct_resolved,
    colour = true_profile,
    linetype = true_profile
  )) +
    geom_line(linewidth = 1.1) +
    geom_point(size = 2.5) +
    geom_hline(
      yintercept = 0.80, linetype = "dotted",
      colour = "grey50", linewidth = 0.6
    ) +
    annotate("text",
      x = 13, y = 0.82, label = "80\\% target",
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
        "Dashed horizontal = 80\\% resolution target."
      )
    ) +
    theme_minimal(base_size = 13) +
    theme(
      legend.position = "top",
      plot.caption = element_text(colour = "grey50", size = 9),
      panel.grid.minor = element_blank(),
      aspect.ratio = 9/16
    )

  ts <- format(Sys.time(), "%Y-%m-%d_%H%M%S")

  # save to csv with timestamp
  write_csv(curve_data, here::here("results", paste0("resolution_curve_", ts, ".csv")))

  if (save_pdf) {
    ggsave(
      filename = here::here("results", paste0("resolution_curve_", ts, ".pdf")),
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
      file = here::here("results", paste0("resolution_curve_", ts, ".tex")),
      width = 6,
      height = 3.5
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