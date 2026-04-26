library(tidyverse)
library(tidybayes)
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
source(here::here("analysis", "utils", "plotting.R"))
source(here::here("analysis", "utils", "stop_criteria.R"))
source(here::here("analysis", "utils", "power.R"))

# 1. Baseline (Your Original)
prior_baseline <- c(
  prior(normal(0, 1), class = b),
  prior(normal(5, 2), class = Intercept),
  prior(exponential(1), class = sd),
  prior(exponential(1), class = sigma)
)

# 2. Skeptical (Forces effects toward zero)
prior_skeptical <- c(
  prior(normal(0, 0.25), class = b),
  prior(normal(5, 1), class = Intercept),
  prior(exponential(2), class = sd),
  prior(exponential(2), class = sigma)
)

# 3. Diffuse (Lets the data drive everything, high risk of noise)
prior_vague <- c(
  prior(normal(0, 10), class = b),
  prior(normal(5, 5), class = Intercept),
  prior(exponential(0.1), class = sd),
  prior(exponential(0.1), class = sigma)
)

# 4. Low Heterogeneity (Assumes kids are more similar than different)
prior_low_sd <- c(
  prior(normal(0, 1), class = b),
  prior(normal(5, 2), class = Intercept),
  prior(exponential(5), class = sd), # Strongly penalizes high random effects
  prior(exponential(1), class = sigma)
)

prior_list <- list(
  baseline = prior_baseline,
  skeptical = prior_skeptical,
  vague = prior_vague,
  low_sd = prior_low_sd
)




# Check % agreement in best_condition assignments across priors
check_best_condition_agreement <- function(sensitivity_results) {
  # Extract best_condition for each child across all priors
  best_conditions <- map_dfr(names(sensitivity_results), function(prior_name) {
    child_status_df <- sensitivity_results[[prior_name]]$child_status
    data.frame(
      child_id = child_status_df$child_id,
      best_condition = child_status_df$best_condition,
      prior = prior_name
    )
  })

  # Calculate agreement for each child
  agreement_by_child <- best_conditions %>%
    group_by(child_id) %>%
    summarize(
      n_conditions = n(),
      unique_conditions = n_distinct(best_condition),
      most_common = {
        condition_table <- table(best_condition)
        if (length(condition_table) > 0) {
          names(sort(condition_table, decreasing = TRUE))[1]
        } else {
          NA_character_
        }
      },
      agreement_count = {
        condition_table <- table(best_condition)
        if (length(condition_table) > 0) {
          max(condition_table)
        } else {
          0
        }
      },
      agreement_pct = agreement_count / n_conditions * 100,
      .groups = "drop"
    )

  # Overall agreement
  total_assignments <- nrow(best_conditions)
  children_with_perfect_agreement <- sum(agreement_by_child$agreement_pct == 100)
  overall_agreement <- (children_with_perfect_agreement / nrow(agreement_by_child)) * 100

  # Print results
  cat("=== Best Condition Agreement Analysis ===\n")
  cat("Target: >80% agreement\n\n")

  cat("Agreement by child:\n")
  for (i in seq_len(nrow(agreement_by_child))) {
    cat(sprintf("Child %s: %.1f%% agreement (%d/%d priors assign '%s')\n",
                agreement_by_child$child_id[i],
                agreement_by_child$agreement_pct[i],
                agreement_by_child$agreement_count[i],
                agreement_by_child$n_conditions[i],
                agreement_by_child$most_common[i]))
  }

  cat(sprintf("\nOverall Agreement: %.1f%% (%d/%d children with perfect agreement)\n",
              overall_agreement,
              children_with_perfect_agreement,
              nrow(agreement_by_child)))

  # Check against target
  if (overall_agreement > 80) {
    cat("✅ PASS - Agreement exceeds >80% target\n")
    cat("   Priors are not exerting excessive influence on condition decisions.\n")
  } else {
    cat("❌ FAIL - Agreement below >80% target\n")
    cat("   Priors may be exerting too much influence on condition decisions.\n")
  }

  # Return detailed results for further analysis
  invisible(list(
    agreement_by_child = agreement_by_child,
    overall_agreement = overall_agreement,
    detailed_assignments = best_conditions
  ))
}

# Check stopping time efficiency across priors
check_stopping_time_efficiency <- function(sensitivity_results) {
  # Extract mean sessions for each prior
  stopping_times <- map_dfr(names(sensitivity_results), function(prior_name) {
    data.frame(
      prior = prior_name,
      mean_sessions = sensitivity_results[[prior_name]]$mean_sessions,
      p90_sessions = sensitivity_results[[prior_name]]$p90_sessions
    )
  })

  # Get baseline for comparison
  baseline_mean <- stopping_times$mean_sessions[stopping_times$prior == "baseline"]

  max_allowed_delay <- 4  # Allow up to 4 sessions delay
  
  # Calculate efficiency metrics for all priors vs baseline
  delays <- stopping_times %>%
    mutate(
      delay_vs_baseline = mean_sessions - baseline_mean,
      exceeds_threshold = delay_vs_baseline > max_allowed_delay
    )

  # Print results
  cat("\n=== Stopping Time Efficiency Analysis ===\n")
  cat("Metric: Average number of sessions to stop per child\n")
  cat("Target: Delay < 4 sessions compared to baseline\n\n")

  cat("Stopping times by prior:\n")
  for (i in seq_len(nrow(stopping_times))) {
    cat(sprintf("%s: %.1f mean sessions (P90: %.1f)\n",
                stopping_times$prior[i],
                stopping_times$mean_sessions[i],
                stopping_times$p90_sessions[i]))
  }

  cat(sprintf("\nDelay analysis (vs baseline %.1f sessions):\n", baseline_mean))
  for (i in seq_len(nrow(delays))) {
    status <- ifelse(delays$exceeds_threshold[i], "❌", "✅")
    cat(sprintf("%s %s: %+.1f sessions (%.1f total)\n",
                status,
                delays$prior[i],
                delays$delay_vs_baseline[i],
                delays$mean_sessions[i]))
  }

  # Overall assessment
  excessive_delays <- sum(delays$exceeds_threshold)
  total_priors <- nrow(delays)
  
  cat(sprintf("\nOverall: %d/%d priors exceed 4-session delay threshold\n", 
              excessive_delays, total_priors))
  
  if (excessive_delays == 0) {
    cat("✅ PASS - All priors within acceptable delay range\n")
    cat("   No prior causes excessive stopping delays\n")
  } else {
    cat("❌ FAIL - Some priors cause excessive delays\n")
    cat("   Consider adjusting priors that exceed the 4-session threshold\n")
  }

  # Return detailed results for further analysis
  invisible(list(
    stopping_times = stopping_times,
    delays = delays,
    baseline_mean = baseline_mean,
    excessive_delays = excessive_delays,
    max_allowed_delay = max_allowed_delay
  ))
}

sim_average <- function(results) {
  cat("\n=== Averaging Results Across", n_sims, "Simulations ===\n")

  # Extract best condition agreement results
  all_agreements <- map(results, function(sim_result) {
    sim_result$best_condition_agreement$agreement_by_child
  })

  # Average agreement by child across simulations
  avg_agreement_by_child <- bind_rows(all_agreements) %>%
    group_by(child_id) %>%
    summarize(
      avg_agreement_pct = mean(agreement_pct, na.rm = TRUE),
      avg_unique_conditions = mean(unique_conditions, na.rm = TRUE),
      .groups = "drop"
    )

  # Extract stopping time results
  all_stopping_times <- map(results, function(sim_result) {
    sim_result$stopping_time_efficiency$stopping_times
  })

  # Average stopping times by prior across simulations
  avg_stopping_times <- bind_rows(all_stopping_times) %>%
    group_by(prior) %>%
    summarize(
      avg_mean_sessions = mean(mean_sessions, na.rm = TRUE),
      avg_p90_sessions = mean(p90_sessions, na.rm = TRUE),
      .groups = "drop"
    )

  # Calculate average delays vs baseline
  baseline_avg <- avg_stopping_times$avg_mean_sessions[avg_stopping_times$prior == "baseline"]
  avg_delays <- avg_stopping_times %>%
    mutate(
      avg_delay_vs_baseline = avg_mean_sessions - baseline_avg,
      exceeds_threshold = avg_delay_vs_baseline > 4
    )

  # Print averaged results
  cat("\n--- Averaged Best Condition Agreement ---\n")
  for (i in seq_len(nrow(avg_agreement_by_child))) {
    cat(sprintf("Child %s: %.1f%% avg agreement (%.1f unique conditions avg)\n",
                avg_agreement_by_child$child_id[i],
                avg_agreement_by_child$avg_agreement_pct[i],
                avg_agreement_by_child$avg_unique_conditions[i]))
  }

  overall_avg_agreement <- mean(avg_agreement_by_child$avg_agreement_pct)
  cat(sprintf("\nOverall Average Agreement: %.1f%%\n", overall_avg_agreement))

  if (overall_avg_agreement > 80) {
    cat("✅ PASS - Average agreement exceeds >80% target\n")
  } else {
    cat("❌ FAIL - Average agreement below >80% target\n")
  }

  # Save results to CSV
  ts <- format(Sys.time(), "%Y%m%d_%H%M%S")
  results_dir <- here::here("results")
  if (!dir.exists(results_dir)) {
    dir.create(results_dir, recursive = TRUE)
  }

  # Create summary data frame
  summary_results <- data.frame(
    metric = c("overall_avg_agreement", paste0("delay_", avg_delays$prior)),
    value = c(overall_avg_agreement, avg_delays$avg_delay_vs_baseline),
    threshold = c(80, rep(4, nrow(avg_delays))),
    passes = c(overall_avg_agreement > 80, avg_delays$avg_delay_vs_baseline < 4)
  )

  # Save to CSV
  output_file <- here::here("results", paste0("prior_sensitivity_", ts, ".csv"))
  write.csv(summary_results, output_file, row.names = FALSE)
  cat(sprintf("\nResults saved to: %s\n", output_file))

  cat("\n--- Averaged Stopping Time Efficiency ---\n")
  cat(sprintf("Baseline: %.1f avg sessions\n", baseline_avg))
  cat("Target: Mean delays vs baseline must be < 4 sessions\n\n")

  # Check each prior's mean delay vs baseline
  all_delays_under_4 <- TRUE
  for (i in seq_len(nrow(avg_delays))) {
    delay_vs_baseline <- avg_delays$avg_delay_vs_baseline[i]
    delay_under_4 <- delay_vs_baseline < 4

    if (!delay_under_4) {
      all_delays_under_4 <- FALSE
    }

    status <- ifelse(delay_under_4, "✅", "❌")
    cat(sprintf("%s %s: %+.1f avg sessions delay (%.1f total avg)\n",
                status,
                avg_delays$prior[i],
                delay_vs_baseline,
                avg_delays$avg_mean_sessions[i]))
  }

  # Overall assessment
  cat(sprintf("\nDelay threshold check: "))
  if (all_delays_under_4) {
    cat("✅ PASS - All priors have mean delays < 4 sessions vs baseline\n")
  } else {
    cat("❌ FAIL - One or more priors have mean delays ≥ 4 sessions vs baseline\n")
    cat("   Adjust priors to reduce delays below 4 sessions threshold\n")
  }
}

run_prior_sensitivity <- function(
  n_sims,
  effect_size,
  n_children,
  max_sessions,
  check_every = 4
) {
  f <- function(i) {
    sim_data <- simulate_study_data(
      n_children = n_children,
      n_sessions = max_sessions,
      effect_size = effect_size
    )

    # Storage for results
    sensitivity_results <- list()
    for (name in names(prior_list)) {
      message(paste("Sim", i, "- Running model with prior set:", name))

      sensitivity_results[[name]] <- simulate_adaptive_one(
        n_children      = n_children,
        min_sessions    = 24,
        max_sessions    = max_sessions,
        check_every     = check_every,
        effect_size     = effect_size,
        sim_data = sim_data,
        prior = prior_list[[name]]
      )
    }

    best_condition_agreement <- check_best_condition_agreement(sensitivity_results)
    stopping_time_efficiency <- check_stopping_time_efficiency(sensitivity_results)

    list(
      best_condition_agreement = best_condition_agreement,
      stopping_time_efficiency = stopping_time_efficiency
    )
  }

  if (n_sims > 1) {
    n_logical_cores <- parallel::detectCores()
    n_workers <- min(max(1L, floor(n_logical_cores) - 2), n_sims)
    cat(sprintf("\nSystem has %d cores. Using %d cores total.\n", n_logical_cores, n_workers))
    cat(sprintf("Sensitivity analysis. Distributed across %d workers with threading(1).\n", n_workers))
    plan(multisession, workers = n_workers)
    results <- future_map(seq_len(n_sims), f, .options = furrr_options(seed = TRUE))
    plan(sequential)

    sim_average(results)
  } else {
    results <- map(seq_len(n_sims), f)
  }
  return(results)
}



