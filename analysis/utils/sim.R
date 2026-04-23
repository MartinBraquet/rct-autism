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

# ── Blocked Randomisation ──────────────────────────────────────────────────
#
# Produces a condition sequence of length n_sessions with two constraints:
#   • Every block of 4 contains each condition exactly once (balanced).
#   • No condition is ever repeated consecutively across a block boundary.

PREP_LEVELS <- c("NoPrep", "Calming", "Stimulating", "ChildChoice") # nolint

prep_levels_no_prep <- c("Calming", "Stimulating", "ChildChoice")

generate_blocked_sequence <- function(n_sessions,
                                      conditions = PREP_LEVELS) {
  n_cond <- length(conditions)
  blocks_needed <- ceiling(n_sessions / n_cond)
  sequence <- character(0)

  for (b in seq_len(blocks_needed)) {
    # Shuffle until the first element does not repeat the last assigned 
    #condition
    repeat {
      block <- sample(conditions)
      if (length(sequence) == 0 || block[1] != tail(sequence, 1)) break
    }
    sequence <- c(sequence, block)
  }

  sequence[seq_len(n_sessions)]
}


# ── Data Generation ───────────────────────────────────────────
#
# One row per (child × session × time_point).
# time_point is the only variable expanded within a session.

#' one_winner_strong children are the easy case — the model should
#' be stop early via the superiority criterion and produce a clear
#'  recommendation. Power here is high even at 20 sessions.
#' one_winner_weak children are the clinically important hard case
#'  — the effect is real but small, requiring more sessions to
#' separate from noise. These are the children who drive the session
#'  count requirement upward. They also represent children where the
#'  rater scale's granularity (ordinal 1–5) limits detection.
#' multiple_winners children test whether the stopping rule behaves
#'  sensibly when no single arm dominates. P(arm is best) will be
#' split between two arms and may never reach 0.90. The AIPE criterion
#'  becomes the likely exit path — the model estimates both arms as
#'  moderately helpful and the CrI narrows over time. For practitioners
#' , the correct recommendation is "either Calming or Stimulating works
#'  for this child — use whichever is easier to deliver." The simulation
#'  reveals whether your decision procedure produces that output or
#'  wrongly forces a single winner.
#' no_differential children test the ROPE / null-detection arm. These
#'  children should ideally exit the study early with the output "no
#'  prep effect detected — use No Prep or clinical judgment." They
#'  represent a real clinical category: some children with ASD are
#'  already well-regulated on arrival and gain nothing from structured prep.
#' A reasonable defensible claim is that roughly half of children will show
#'  a clear single winner (strong or weak), a fifth will show multiple-winner
#'  patterns, and the remainder will show no differential response.

simulate_study_data <- function(n_children,
                                n_sessions,
                                effect_size) {
  # logit thresholds for engagement categories 1–10
  thresholds <- c(-4.0, -2.8, -2.0, -1.2, 0.0, 0.8, 1.6, 2.4, 3.2)

  child_rfx <- seq_len(n_children) |>
    map(\(id) {
      # — Profile probabilities (adjust to match clinical expectations) —
      profile <- sample(
        c(
          "one_winner_strong", # one prep clearly best, large effect
          "one_winner_weak", # one prep best, small effect (harder to detect)
          "multiple_winners", # two preps similarly helpful
          "no_differential" # all preps similar to No Prep
        ),
        size = 1,
        prob = c(0.2, 0.1, 0.6, 0.1)
        # prob = c(0, 1, 0, 0)
      )

      v <- 0.4

      slopes <- switch(profile,
        "one_winner_strong" = {
          winner <- sample(prep_levels_no_prep, 1)
          winners_vec <- winner
          s <- c(
            Calming = rnorm(1, 0, v),
            Stimulating = rnorm(1, 0, v),
            ChildChoice = rnorm(1, 0, v)
          )
          s[winner] <- s[winner] + effect_size
          s
        },
        "one_winner_weak" = {
          winner <- sample(prep_levels_no_prep, 1)
          winners_vec <- winner
          s <- c(
            Calming = rnorm(1, 0, v),
            Stimulating = rnorm(1, 0, v),
            ChildChoice = rnorm(1, 0, v)
          )
          s[winner] <- s[winner] + effect_size * 0.5
          s
        },
        "multiple_winners" = {
          # Two preps share the benefit — winner identity is ambiguous
          winners <- sample(prep_levels_no_prep, 2)
          winners_vec <- paste(sort(winners), collapse = ",")
          s <- c(
            Calming = rnorm(1, 0, v),
            Stimulating = rnorm(1, 0, v),
            ChildChoice = rnorm(1, 0, v)
          )
          s[winners] <- s[winners] + effect_size
          s
        },
        "no_differential" = {
          winners_vec <- "NoPrep"
          # All preps near No Prep — prep type doesn't matter for this child
          c(
            Calming = rnorm(1, 0, v),
            Stimulating = rnorm(1, 0, v),
            ChildChoice = rnorm(1, 0, v)
          )
        }
      )

      tibble(
        child_id       = factor(id),
        age            = sample(3:14, 1) - 9, # mean-centre age for model fitting
        true_profile   = profile, # keep for ground-truth evaluation
        true_winners   = winners_vec,
        re_intercept   = rnorm(1, 0, 1.6),
        re_calming     = slopes["Calming"],
        re_stimulating = slopes["Stimulating"],
        re_childchoice = slopes["ChildChoice"]
      )
    }) |>
    list_rbind()

  baseline_state_levels <- c("Tired", "Neutral", "Hyper")
  teacher_levels <- c("A", "B", "C", "D", "E", "F")

  session_level <- seq_len(n_children) |>
    map(\(id) {
      tibble(
        child_id = factor(id),
        session = seq_len(n_sessions),
        prep = factor(
          generate_blocked_sequence(n_sessions),
          levels = PREP_LEVELS
        ),
        baseline_state = factor(
          sample(baseline_state_levels, n_sessions, replace = TRUE),
          levels = baseline_state_levels
        ),
        teacher = factor(
          sample(teacher_levels, n_sessions, replace = TRUE),
          levels = teacher_levels
          )
      )
    }) |>
    list_rbind()

  list(
    data = session_level |>
      # expand_grid(time_point = c("5min", "15min", "30min")) |>
      left_join(child_rfx, by = "child_id") |>
      group_by(child_id, session) |>
      mutate(
        # No fixed-effect winner — all conditions treated equally
        fe_prep = 0,
        fe_time = 0, # if_else(time_point == "5min", 0.1, 0),
        fe_baseline = case_when(
          baseline_state == "Tired" ~ -1.0,
          baseline_state == "Hyper" ~ -1.0,
          TRUE ~ 0
        ),
        fe_teacher = case_when(
          teacher == "A" ~ 1.0,
          TRUE ~ 0.0
        ),
        fe_age = 0.2 * age,

        # Individual winner determined entirely by random slopes
        re_prep = case_when(
          prep == "Calming" ~ re_calming,
          prep == "Stimulating" ~ re_stimulating,
          prep == "ChildChoice" ~ re_childchoice,
          TRUE ~ 0
        ),
        re_session = rnorm(1, 0, 0.7),
        latent_score = re_intercept + fe_prep + fe_time + fe_baseline + fe_teacher +
         fe_age + re_prep + re_session + rnorm(n(), 0, 0.7),
        engagement = as.integer(
          cut(latent_score,
            breaks = c(-Inf, thresholds, Inf),
            labels = FALSE
          )
        )
      ) |>
      dplyr::select(
        child_id, session, prep, age,
        teacher, baseline_state, engagement, latent_score
      ),
    child_rfx = child_rfx
  )
}
