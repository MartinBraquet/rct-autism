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
library(future)

source(here::here("analysis", "utils", "model.R"))
source(here::here("analysis", "utils", "sim.R"))
source(here::here("analysis", "utils", "plotting.R"))
source(here::here("analysis", "utils", "stop_criteria.R"))

# ── Adaptive Simulation ───────────────────────────────────────────────────
#
# Procedure (one simulation run):
#
#   a. Pre-generate max_sessions of data per child.
#   b. At each interim checkpoint (every `check_every` sessions, starting at
#      min_sessions), fit the hierarchical model on ALL data accumulated so far.
#      Partial pooling across children is preserved at every interim.
#   c. For each active child, apply stopping criteria in priority order:
#        • SUPERIORITY fires after `consec_required` consecutive interims with
#          P(best active arm) ≥ prob_best_threshold.  Counter resets on miss.
#        • AIPE fires immediately when the leading arm's 95% CrI width is
#          below aipe_width (precision-based stopping, no sustain needed).
#        • ROPE fires immediately when P(No Prep is best) ≥ rope_threshold
#          (no active prep works — stop to avoid wasting sessions).
#   d. All children still active at max_sessions are labelled "max_reached."
#   e. Final detection is evaluated on the last fitted model.
#
# Returns a list with:
#   child_status   : per-child tibble (stop_session, stop_reason, detected)
#   mean_sessions  : mean sessions used per child in this simulation
#   p90_sessions   : 90th-percentile sessions (operational planning buffer)
#   detection_rate : proportion where the recommended arm was an active prep

simulate_adaptive_one <- function(template_fit,
                                  n_children,
                                  min_sessions,
                                  max_sessions,
                                  check_every,
                                  effect_size,
                                  consec_required) {
  # — Generate full data upfront —
  sim <- simulate_study_data(
    n_children = n_children,
    n_sessions = max_sessions,
    effect_size = effect_size
  )

  full_data <- sim$data
  child_rfx <- sim$child_rfx

  cat("Child random effects (ground truth for simulation):")
  print(child_rfx, n = n_children)

  results <- check_stopping_sequentially(
    template_fit = template_fit,
    data = full_data,
    min_sessions = min_sessions,
    check_every = check_every,
    consec_required = consec_required
  )

  child_status <- results$child_status

  child_status <- child_status |>
    left_join(
      child_rfx |>
        dplyr::select(child_id, true_profile, true_winners),
      by = "child_id"
    ) |>
    mutate(
      correct = coalesce(str_detect(true_winners, fixed(as.character(best_condition))), FALSE)
    )

  cat("\nChild status at end of simulation:")
  cols <- c("true_profile", "true_winners", "best_condition", "p_best", "correct", "stop_reason", "detected")
  print(child_status[, cols], n = n_children)
  print_winners_list(child_status)

  list(
    child_status   = child_status,
    mean_sessions  = mean(child_status$stop_session, na.rm = TRUE),
    p90_sessions   = as.numeric(quantile(child_status$stop_session, .90, na.rm = TRUE)),
    detection_rate = mean(child_status$detected, na.rm = TRUE)
  )
}

run_adaptive_sweep <- function(n_sims,
                               effect_size,
                               template_fit = NULL, # pass compiled fit to avoid recompile
                               n_children,
                               min_sessions,
                               max_sessions,
                               check_every,
                               consec_required) {
  if (is.null(template_fit)) {
    cat("Compiling Stan model for adaptive sweep...\n")
    init_data <- simulate_study_data(
      n_children = n_children, n_sessions = min_sessions,
      effect_size = effect_size
    )
    template_fit <- fit_model_fresh(init_data$data)
  }


  cat(sprintf("\n=== Adaptive sweep: %d simulations ===\n", n_sims))

  f <- function(i) {
    cat(sprintf("  sim %d/%d\r", i, n_sims))
    tryCatch(
      simulate_adaptive_one(
        template_fit    = template_fit,
        n_children      = n_children,
        min_sessions    = min_sessions,
        max_sessions    = max_sessions,
        check_every     = check_every,
        effect_size     = effect_size,
        consec_required = consec_required
      ),
      error = function(e) {
        cat(sprintf("  sim %d/%d — ERROR: %s\n", i, n_sims, e$message))
        message("\nDetailed Error: ", e)
        if (exists("last_error", where = asNamespace("rlang"))) {
          print(rlang::last_trace())
        }
        NULL
      }
    )
  }

  if (n_sims > 1) {
    n_logical_cores <- parallel::detectCores()
    n_workers <- max(1L, floor(n_logical_cores) - 1)
    cat(sprintf("\nSystem has %d cores. Using %d cores total.\n",
                n_logical_cores, n_workers))
    cat(sprintf("Adaptive loop: Refitting hierarchical model at each interim.
Distributed across %d workers with threading(1).
Expected throughput: ~10 min per batch.\n", n_workers))
    plan(multisession, workers = n_workers)
    results <- future_map(seq_len(n_sims), f, .options = furrr_options(seed = TRUE))
    plan(sequential)
  } else {
    results <- map(seq_len(n_sims), f)
  }

  if (any(map_lgl(results, is.null))) {
    stop("One or more simulations failed. Check error messages above.")
  }

  cat("\nAdaptive sweep complete.\n")

  results
}