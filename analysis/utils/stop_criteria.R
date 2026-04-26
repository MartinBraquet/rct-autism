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

source(here::here("analysis", "utils", "model.R"))
source(here::here("analysis", "utils", "sim.R"))


# ── Per-Child Stopping Criteria ───────────────────────────────────────────

PREP_PARAMS <- c(
  Calming      = "prepCalming",
  Stimulating  = "prepStimulating",
  ChildChoice  = "prepChildChoice"
)

check_stopping_per_child <- function(fit,
                                     prob_best_threshold = 0.9,
                                     aipe_width = 2.0,
                                     rope_no_prep_threshold = 1.0) {
  draws <- as_draws_df(fit)
  child_ids <- levels(fit$data$child_id)

  # — Population-level (fixed effect) draws —
  b_cal <- draws[["b_prepCalming"]]
  b_sti <- draws[["b_prepStimulating"]]
  b_cc <- draws[["b_prepChildChoice"]]

  map_dfr(child_ids, function(cid) {
    tryCatch(
      {
        # — Individual-level draws: fixed + child-specific deviation —
        cal_draws <- b_cal + draws[[paste0("r_child_id[", cid, ",prepCalming]")]]
        sti_draws <- b_sti + draws[[paste0("r_child_id[", cid, ",prepStimulating]")]]
        cc_draws <- b_cc + draws[[paste0("r_child_id[", cid, ",prepChildChoice]")]]
        # No Prep reference = 0 on the latent logit scale for every draw

        arm_draws <- list(
          Calming     = cal_draws,
          Stimulating = sti_draws,
          ChildChoice = cc_draws
        )

        # — P(each arm is best) across posterior draws —
        best_matrix <- cbind(
          NoPrep      = 0,
          Calming     = cal_draws,
          Stimulating = sti_draws,
          ChildChoice = cc_draws
        )
        winner_draw <- max.col(best_matrix) # 1=NoPrep 2=Cal 3=Sti 4=CC

        p_best <- c(
          NoPrep      = mean(winner_draw == 1),
          Calming     = mean(winner_draw == 2),
          Stimulating = mean(winner_draw == 3),
          ChildChoice = mean(winner_draw == 4)
        )

        print(p_best)

        best_name <- names(which.max(p_best))
        p_best_max <- max(p_best)

        # Identify the top 2 names based on p_best
        top_names <- names(sort(p_best, decreasing = TRUE))
        # filter out no prep
        top_names_prep <- top_names[top_names != "NoPrep"]

        # ── Stopping criterion 1: SUPERIORITY ────────────────────────────────────
        # One active prep wins the posterior majority AND exceeds the threshold.
        # Explicitly excludes No Prep from triggering this arm.
        superiority <- p_best_max >= prob_best_threshold
        print(sprintf(
          "Superiority check for Child %s: best arm = %s (P=%.2f), met = %s",
          cid, best_name, p_best_max, superiority
        ))

        # ── Stopping criterion 2: AIPE ────────────────────────────────────────────
        # The leading active arm (by P(best)) has a narrow enough 95% CrI that
        # a "best available" recommendation is precise enough to be actionable,
        # even when no arm clearly dominates (multiple_winners profile).
        cri_1 <- as.numeric(quantile(arm_draws[[top_names_prep[1]]], 0.1))
        cri_2 <- as.numeric(quantile(arm_draws[[top_names_prep[2]]], 0.1))
        min_required_effect_both <- 0.5
        both_effective <- cri_1 > min_required_effect_both && cri_2 > min_required_effect_both

        # 2. Are the top two essentially a tie? (AIPE on the difference)
        diff_draws <- arm_draws[[top_names_prep[1]]] - arm_draws[[top_names_prep[2]]]
        cri_width <- as.numeric(quantile(diff_draws, 0.9) - quantile(diff_draws, 0.1))
        is_tie <- cri_width < aipe_width

        # Trigger Multiple Winners only if they are both good AND we can't pick a favorite
        aipe_met <- both_effective && is_tie

        # print("AIPE for Child %s: %s vs %s (CrI width = %.2f, met = %s)" %>%
        #         sprintf(cid, top_names[1], top_names[2], cri_width, aipe_met))
        print("AIPE check")
        print(sprintf(
          "  Child %s: %s vs %s (CrI %.2f and %.2f, met = %s)",
          cid, top_names[1], top_names[2], cri_1, cri_2, aipe_met
        ))
        print(cri_1)
        print(cri_2)
        print(as.numeric(quantile(arm_draws[[top_names_prep[3]]], 0.1)))

        # ── Stopping criterion 3: ROPE ────────────────────────────────────────────
        # No Prep is the most probable best arm with confidence above the threshold.
        # Interpretation: prep type does not matter for this child; No Prep is fine.
        # Define the ROPE range (the "Clinically Negligible" zone)
        rope_range <- c(-rope_no_prep_threshold, rope_no_prep_threshold)

        # Calculate what % of the posterior for each active arm is inside the ROPE
        prop_in_rope <- c(
          Calming     = mean(cal_draws > rope_range[1] & cal_draws < rope_range[2]),
          Stimulating = mean(sti_draws > rope_range[1] & sti_draws < rope_range[2]),
          ChildChoice = mean(cc_draws > rope_range[1] & cc_draws < rope_range[2])
        )
        print(prop_in_rope)

        # STOP if ALL active preps are likely in the ROPE
        # (Meaning we are confident none of them work)
        in_rope <- all(prop_in_rope > 0.80)


        # ── Resolve stop reason (priority: superiority > rope > aipe > continue) ──
        stop_reason <- case_when(
          superiority ~ "superiority",
          in_rope ~ "rope",
          aipe_met ~ "aipe",
          TRUE ~ "continue"
        )

        best_condition <- case_when(
          superiority ~ best_name,
          in_rope ~ "NoPrep",
          aipe_met ~ paste(sort(top_names_prep[1:2]), collapse = ","),
          TRUE ~ NA_character_
        )

        print(sprintf(
          "Final decision for Child %s: stop_reason = %s, best_condition = %s",
          cid, stop_reason, best_condition
        ))

        tibble(
          child_id       = cid,
          best_condition = best_condition,
          p_best         = p_best_max,
          p_no_prep      = p_best["NoPrep"],
          cri_width      = cri_width,
          superiority    = superiority,
          aipe_met       = aipe_met,
          in_rope        = in_rope,
          stop_reason    = stop_reason
        )
      },
      error = function(e) {
        # 1. Log to the console so you can see it during the run
        message(sprintf("  [!] Error for Child %s: %s", cid, e$message))
        return(NULL)
      }
    )
  })
}

check_stopping_sequentially <- function(
  template_fit = NULL,
  data,
  min_sessions = NULL,
  check_every = 4,
  consec_required = NULL,
  prior = NULL
) {
  if (is.null(consec_required)) {
    consec_required <- 1
  }

  if (is.null(template_fit)) {
    template_fit <- fit_model_fresh(data, prior = prior)
  }

  # — Initialise child tracker —
  # consec_sup: counts consecutive interims where superiority criterion holds.
  #             Resets to 0 whenever superiority is not met.
  n_children <- length(unique(data$child_id))
  max_sessions <- max(data$session)

  if (is.null(min_sessions)) {
    min_sessions <- max_sessions
  }

  child_status <- tibble(
    child_id     = factor(seq_len(n_children)),
    stopped      = FALSE,
    stop_session = NA_integer_,
    stop_reason  = NA_character_,
    consec_sup   = 0L
  )

  # — Interim checkpoints —
  print(min_sessions)
  print(check_every)
  print(max_sessions)
  checkpoints <- seq(min_sessions, max_sessions, by = check_every)
  if (tail(checkpoints, 1) < max_sessions) checkpoints <- c(checkpoints, max_sessions)

  last_fit <- NULL

  for (s in checkpoints) {
    cat(sprintf("\n=== Session %d ===", s)
    )
    active_ids <- child_status |>
      filter(!stopped) |>
      pull(child_id)
    if (length(active_ids) == 0) break

    current_data <- data |> filter(session <= s)

    fit <- tryCatch(
      fit_model_update(template_fit, current_data),
      error = function(e) NULL
    )
    if (is.null(fit)) next
    last_fit <- fit


    cat("Data generated for adaptive simulation:")
    print(current_data)
    # Group by prep and show means and std for each prep and child
    current_data |>
      group_by(child_id, prep) |>
      summarise(
        mean_latent = mean(latent_score),
        sd_latent = sd(latent_score),
        mean_engagement = mean(engagement),
        sd_engagement = sd(engagement),
        .groups = "drop"
      ) |>
      print()

    print("Model summary from fit_model_update:")
    print(summary(fit))

    child_checks <- tryCatch(
      check_stopping_per_child(fit),
      error = function(e) {
        cat(sprintf("  Session %d — ERROR in stopping checks: %s\n", s, e$message))
        NULL
      }
    )
    if (is.null(child_checks)) next

    # — Update status for each active child —
    for (cid in as.character(active_ids)) {
      if (is.null(child_checks) || nrow(child_checks) == 0) {
        message(sprintf("  [!] Skipping logic for Child %s because check failed.", cid))
        next # Move to the next child in the loop
      }

      row <- child_checks |> filter(child_id == cid)
      if (nrow(row) == 0) next

      idx <- which(child_status$child_id == cid)

      # Superiority counter: increment on hit, reset on miss
      if (isTRUE(row$superiority)) {
        child_status$consec_sup[idx] <- child_status$consec_sup[idx] + 1L
      } else {
        child_status$consec_sup[idx] <- 0L
      }

      sustained_superiority <- child_status$consec_sup[idx] >= consec_required
      at_maximum <- s == max_sessions

      # AIPE and ROPE fire immediately; superiority requires sustain
      stop_now <- sustained_superiority |
        isTRUE(row$aipe_met) |
        isTRUE(row$in_rope) |
        at_maximum

      if (stop_now) {
        child_status$stopped[idx] <- TRUE
        child_status$stop_session[idx] <- s
        child_status$stop_reason[idx] <- case_when(
          sustained_superiority ~ "superiority",
          isTRUE(row$aipe_met) ~ "aipe",
          isTRUE(row$in_rope) ~ "rope",
          TRUE ~ "max_reached"
        )
      }
    }
  }

  # — Final detection —
  # "Detected" = the recommended arm at stopping is an active prep (not No Prep
  # and not max_reached with an inconclusive posterior).
  # Uses the last fitted model as a proxy for all children.
  cat("\nEvaluating final detection based on last fitted model...")

  detected <- if (!is.null(last_fit)) {
    tryCatch(
      {
        ch <- check_stopping_per_child(last_fit)
        # Detected = best condition is an active prep with P(best) ≥ threshold,
        # OR stopped via AIPE (precise enough to recommend even without dominance)
        setNames(ch$superiority | ch$aipe_met, ch$child_id)
      },
      error = function(e) rep(NA, n_children)
    )
  } else {
    rep(NA, n_children)
  }

  # Get best condition for each child from final model
  final_winners <- if (!is.null(last_fit)) {
    tryCatch(
      {
        check_stopping_per_child(last_fit) |>
          dplyr::select(child_id, best_condition, p_best)
      },
      error = function(e) {
        tibble(
          child_id = factor(seq_len(n_children)),
          best_condition = NA_character_,
          p_best = NA_real_
        )
      }
    )
  } else {
    tibble(
      child_id = factor(seq_len(n_children)),
      best_condition = NA_character_,
      p_best = NA_real_
    )
  }

  child_status <- child_status |>
    left_join(
      final_winners,
      by = "child_id"
    ) |>
    mutate(
      detected = detected[as.character(child_id)]
    )

  list(
    child_status = child_status
  )

}


# Print list of recommended winners per child
print_winners_list <- function(child_status) {
  winners <- child_status %>%
    arrange(child_id) %>%
    dplyr::select(child_id, best_condition, p_best, stop_session, stop_reason, true_profile) %>%
    filter(!is.na(best_condition))

  cat("\n")
  cat("══════════════════════════════════════════════════════════\n")
  cat("  Recommended Preparation by Child\n")
  cat("══════════════════════════════════════════════════════════\n")

  for (i in seq_len(nrow(winners))) {
    row <- winners[i, ]
    cat(sprintf(
      "  Child %2s:  %-16s (P(best)=%.2f, stopped at session %2d via %s)\n",
      row$child_id, row$best_condition, row$p_best,
      row$stop_session, row$stop_reason
    ))
  }

  cat("══════════════════════════════════════════════════════════\n\n")

  # Summary by prep type
  prep_counts <- winners %>%
    group_by(best_condition) %>%
    summarise(n = n(), .groups = "drop") %>%
    arrange(desc(n))

  cat("  Summary by Preparation Type:\n")
  for (i in seq_len(nrow(prep_counts))) {
    row <- prep_counts[i, ]
    pct <- round(100 * row$n / nrow(winners), 1)
    cat(sprintf(
      "    %-16s: %2d children (%.1f%%)\n",
      row$best_condition, row$n, pct
    ))
  }
  cat("\n")
}