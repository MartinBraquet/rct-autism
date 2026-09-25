# Exports the final trial results to a JSON file consumed by the website
# (web/lib/results-data.json). Reads the posterior draws and stopping checks
# written by main.R, plus the anonymized session data from etl.R.
#
# Usage (from the repo root): Rscript analysis/utils/export_web_results.R

library(here)
library(jsonlite)

source(here("analysis", "utils", "constants.R"))

draws <- read.csv(here("results", "draws.csv"), check.names = FALSE)
sessions <- read.csv(here("data", "sessions.csv"))
stopping <- read.csv(here("results", "stopping_checks.csv"))

ROPE <- 1.0

summarize_draws <- function(x) {
  list(
    mean = round(mean(x), 3),
    lo95 = round(unname(quantile(x, 0.025)), 3),
    hi95 = round(unname(quantile(x, 0.975)), 3),
    lo80 = round(unname(quantile(x, 0.1)), 3),
    hi80 = round(unname(quantile(x, 0.9)), 3),
    p_positive = round(mean(x > 0), 3),
    p_rope = round(mean(abs(x) < ROPE), 3)
  )
}

raw_summary <- function(df) {
  lapply(setNames(ALL_PREPS, ALL_PREPS), function(p) {
    e <- df$engagement[df$prep == p]
    list(
      n = length(e),
      mean = if (length(e)) round(mean(e), 2) else NULL,
      sd = if (length(e) > 1) round(sd(e), 2) else NULL
    )
  })
}

# ── Group level ─────────────────────────────────────────────────────────────
group_effects <- lapply(PREP_PARAMS, function(p) summarize_draws(draws[[paste0("b_", p)]]))
child_sd <- lapply(PREP_PARAMS, function(p) summarize_draws(draws[[paste0("sd_child_id__", p)]]))

# ── Child level ─────────────────────────────────────────────────────────────
children <- lapply(sort(unique(sessions$child_id)), function(cid) {
  arm_draws <- lapply(PREP_PARAMS, function(p) {
    draws[[paste0("b_", p)]] + draws[[sprintf("r_child_id[%s,%s]", cid, p)]]
  })
  best_matrix <- cbind(NoPrep = 0, do.call(cbind, arm_draws))
  winner <- colnames(best_matrix)[max.col(best_matrix)]
  p_best <- lapply(setNames(ALL_PREPS, ALL_PREPS), function(p) round(mean(winner == p), 3))

  child_sessions <- sessions[sessions$child_id == cid, ]
  child_sessions <- child_sessions[order(child_sessions$date, child_sessions$time_prep), ]
  stop_row <- stopping[stopping$child_id == cid, ]

  list(
    id = cid,
    n_sessions = nrow(child_sessions),
    first_date = min(child_sessions$date),
    last_date = max(child_sessions$date),
    stop_reason = stop_row$stop_reason,
    best_prep = stop_row$best_prep,
    effects = lapply(arm_draws, summarize_draws),
    p_best = p_best,
    raw = raw_summary(child_sessions),
    sessions = lapply(seq_len(nrow(child_sessions)), function(i) {
      list(
        date = child_sessions$date[i],
        prep = child_sessions$prep[i],
        engagement = round(child_sessions$engagement[i], 2)
      )
    })
  )
})

# ── Data-quality indicators (supporting the discussion) ─────────────────────
delay_hours <- as.numeric(difftime(
  as.POSIXct(sessions$time_rating), as.POSIXct(sessions$time_prep),
  units = "hours"
))
same_rating <- sessions$rating_5 == sessions$rating_15 & sessions$rating_15 == sessions$rating_30

out <- list(
  generated = format(Sys.Date()),
  rope = ROPE,
  n_children = length(children),
  n_sessions = nrow(sessions),
  first_date = min(sessions$date),
  last_date = max(sessions$date),
  n_teachers = length(unique(sessions$teacher)),
  group = list(
    intercept = summarize_draws(draws[["b_Intercept"]]),
    sigma = summarize_draws(draws[["sigma"]]),
    sd_child_intercept = summarize_draws(draws[["sd_child_id__Intercept"]]),
    effects = group_effects,
    child_sd = child_sd,
    raw = raw_summary(sessions)
  ),
  stop_counts = as.list(table(stopping$stop_reason)),
  quality = list(
    share_rated_over_1h = round(mean(delay_hours > 1, na.rm = TRUE), 3),
    share_rated_over_3h = round(mean(delay_hours > 3, na.rm = TRUE), 3),
    share_identical_ratings = round(mean(same_rating, na.rm = TRUE), 3),
    share_under_12_sessions = round(mean(sapply(children, `[[`, "n_sessions") < 12), 3)
  ),
  children = children
)

out_path <- here("web", "lib", "results-data.json")
write_json(out, out_path, auto_unbox = TRUE, pretty = TRUE, null = "null")
message("Wrote ", out_path)
