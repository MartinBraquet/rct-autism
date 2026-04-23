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

# ── Model Fitting ──────────────────────────────────────────────────────────
#
# Two chains and 500 post-warmup draws per chain give reliable individual-level
# 95% CrI (needed for per-child stopping decisions).
# Double-bar || keeps random intercept and slopes independent (no correlation
# term), matching the data-generation structure.
#
# PRIORS (fully specified — no implicit defaults)
#   β  ~ Normal(0, 1.5)   conservative for logit scale fixed effects
#   ζₖ ~ Normal(0, 3)     wide enough to span ±4 logit units (thresholds)
#   σᵤ ~ Exponential(1)   weakly regularising for random-effect SDs
#
# NOTE: LKJ prior is omitted because || removes the correlation structure.

SHARED_PRIOR <- c(
  prior(normal(0, 1), class = b),
  prior(normal(5, 2), class = Intercept),
  prior(exponential(1), class = sd),
  prior(exponential(1), class = sigma)
)

# Fits from scratch (used for first call per simulation)
fit_model_fresh <- function(data, prior = SHARED_PRIOR, threads = NULL, chains = 2, iter = 2000) {

  data$child_id <- as.factor(data$child_id)
  data$prep     <- as.factor(data$prep)
  data$session  <- as.factor(data$session)
  data$age      <- as.numeric(data$age)
  data$teacher  <- as.factor(data$teacher)
  data$latent_score <- as.numeric(data$latent_score)

  print(str(data))
  print(levels(data$prep))
  levels(data$prep)

  template_fit <- brm(
    engagement ~ prep + teacher + age + (1 + prep || child_id),
    # baseline_state + (1 | child_id:session)
    data = data,
    family = gaussian(),
    prior = prior,
    chains = chains,
    iter = iter,
    warmup = iter / 2,
    backend = "cmdstanr",
    # for some reason, this breaks reproducibility of results
    # (different random seed handling in cmdstanr when threading is enabled?)
    threads = threads,
    refresh = 0,
    silent = 2,
    seed = 123
  )

  print("Model summary from fit_model_fresh:")
  print(summary(template_fit))

  # Show R-hat values
  print(rhat(template_fit))

  if (any(rhat(template_fit) > 1.01, na.rm = TRUE)) {
    warning("R-hat values indicate potential convergence issues. Please check the model diagnostics.")
  }

  # Effective sample size — should be > 400 for key parameters
  summary(template_fit)$fixed[, "Bulk_ESS"]
  summary(template_fit)$fixed[, "Tail_ESS"]

  if (any(summary(template_fit)$fixed[, "Bulk_ESS"] < 400) ||
    any(summary(template_fit)$fixed[, "Tail_ESS"] < 400)) {
    warning("Effective sample size is low for some parameters. Consider increasing iterations or improving model fit.")
  }

  # Divergences — any non-zero count is a problem regardless of R-hat
  divergence_check <- nuts_params(template_fit) %>%
    filter(Parameter == "divergent__") %>%
    summarise(total = sum(Value))
  if (divergence_check$total > 0) {
    warning("Divergences detected: ", divergence_check$total)
  }

  template_fit
}

# Re-fits using a compiled template (avoids Stan recompilation — ~10× faster)
fit_model_update <- function(template_fit, new_data) {
  update(
    template_fit,
    newdata   = new_data,
    recompile = FALSE
  )
}
