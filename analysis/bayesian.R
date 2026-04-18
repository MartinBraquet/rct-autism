library(brms)
library(here)
library(readr)
library(dplyr)
library(tidybayes)
library(ggplot2)

# Define the path relative to the project root
file_path <- here("data", "test_data.csv")

# Read the data
study_data <- read_csv(file_path)

# Convert to factors and set logical orders
# This ensures that "No Prep" is the reference level for your models
# and that "Tired -> Neutral -> Hyper" follows a logical progression.
study_data <- study_data %>%
  mutate(
    baseline_state = factor(baseline_state, levels = c("tired", "neutral", "hyper")),
    prep = factor(prep, levels = c("No Prep", "Calming", "Stimulating", "Child Choice")),
    child_id = as.factor(child_id)
  )

# Main Model
model_formula <- bf(
  engagement ~ 1 + 
    prep +                             # Group fixed effects
    time_point +                       # 5min vs 15min
    baseline_state +                   # Tired/Neutral/Hyper
    prep:baseline_state +              # Does best prep depend on arrival state?
    (1 + prep | child_id),             # Random intercept + slopes per child
  family = cumulative(link = "logit", threshold = "flexible")
)

# Set weakly informative priors (recommended for ordinal models)
prior_spec <- c(
  prior(normal(0, 1.5), class = "b"),      # Weakly informative priors
  prior(exponential(1), class = "sd")      # Prior for hierarchical variance
)

# Fit the model
fit <- brm(
  model_formula,
  data = study_data,
  prior = prior_spec,
  iter = 4000, warmup = 2000,
  chains = 4,
  cores = 4,
  seed = 12345,
  control = list(adapt_delta = 0.95),  # Reduce divergent transitions
  file = here("analysis", "engagement_model_fit") # Saves the model so you don't re-run it
)

summary(fit)

# Extract "Best Prep" probabilities per child
predicted_engagement <- study_data %>%
  # Create a grid of every child with every possible prep
  # keeping other covariates at a 'standard' reference level
  tidyr::expand(child_id, 
                prep = levels(prep), 
                baseline_state = "neutral", 
                time_point = "5min") %>%
  add_epred_draws(fit) 

# Calculate which prep yields the highest expected engagement score
# .category is the engagement score (1-5), .epred is the probability
best_prep_summary <- predicted_engagement %>%
  group_by(child_id, prep) %>%
  # Calculate expected value: sum(score * probability)
  summarise(mean_engagement = sum(as.numeric(.category) * .epred), .groups = "drop") %>%
  group_by(child_id) %>%
  mutate(is_best = mean_engagement == max(mean_engagement))

# 1. Calculate Expected Value for every single draw
# This preserves the uncertainty of the model
draw_level_expectations <- predicted_engagement %>%
  mutate(category_num = as.numeric(.category)) %>%
  group_by(child_id, prep, .draw) %>%
  summarise(expected_val = sum(category_num * .epred), .groups = "drop")

# 2. For each draw, find which prep had the highest score
winning_preps <- draw_level_expectations %>%
  group_by(child_id, .draw) %>%
  mutate(is_winner = expected_val == max(expected_val)) %>%
  ungroup()

# 3. Calculate "Probability of being the Best"
# This is your 'Confidence' metric
confidence_summary <- winning_preps %>%
  group_by(child_id, prep) %>%
  summarise(prob_is_best = mean(is_winner), .groups = "drop")

# Ensure we have exactly ONE value per draw per prep per child
# We summarize across any remaining covariates (like baseline_state) 
# to get the marginal expectation
draw_summarized <- draw_level_expectations %>%
  mutate(prep = factor(prep, levels = c("No Prep", "Calming", "Stimulating", "Child Choice"))) %>%
  group_by(child_id, .draw, prep) %>%
  summarise(expected_val = mean(expected_val), .groups = "drop")

# Perform the comparison WITHIN each child
lift_over_control <- draw_summarized %>%
  group_by(child_id) %>%
  compare_levels(expected_val, by = prep, comparison = "control")

# Plotting the confidence
ggplot(lift_over_control, aes(y = prep, x = expected_val)) +
  stat_slabinterval(aes(fill = after_stat(x > 0)), .width = c(.66, .95)) +
  geom_vline(xintercept = 0, linetype = "dashed") +
  facet_wrap(~child_id) +
  scale_fill_manual(values = c("gray", "skyblue")) +
  labs(title = "Posterior Lift in Engagement over No Prep",
       subtitle = "95% and 66% Credible Intervals shown",
       x = "Expected Increase in Engagement Score",
       y = "Preparation Type")

ggplot(lift_over_control, aes(x = expected_val, y = prep)) +
  # This adds the "Slab" (density) and "Interval" (point/line)
  stat_halfeye(fill = "skyblue", alpha = 0.8) +
  # Add a vertical line at 0 (The "No Effect" line)
  geom_vline(xintercept = 0, linetype = "dashed") +
  facet_wrap(~child_id) +
  theme_minimal() +
  labs(
    title = "Does the Prep Improve Engagement?",
    subtitle = "Values to the right of the red line indicate improvement over 'No Prep'",
    x = "Change in Engagement Score (Expected Value)",
    y = "Preparation Condition"
  )