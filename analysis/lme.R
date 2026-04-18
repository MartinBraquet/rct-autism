library(lme4)
library(lmerTest) # Adds p-values to lme4
library(broom.mixed)
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


# 1. Fit the Frequentist Model
# (1 + prep | child_id) is the random slope for each child
freq_fit <- lmer(
  engagement ~ prep + baseline_state + (1 + prep | child_id),
  data = study_data
)

# 2. Get the "Tidy" Results (Effect Sizes, SE, and P-values)
freq_results <- tidy(freq_fit, conf.int = TRUE, conf.level = 0.95)
freq_results <- freq_results %>%
  filter(effect == "fixed") # Focus on group-level results first

sigma_resid <- sigma(freq_fit)

# Add Effect Size (d) to your results
freq_results <- freq_results %>%
  mutate(cohens_d = estimate / sigma_resid) %>%
  select(term, estimate, std.error, conf.low, conf.high, p.value, cohens_d)

print(freq_results)

# Get the individual effect for each child
individual_freq <- coef(freq_fit)$child_id

# This shows how much each child deviates from the average 'No Prep' baseline
head(individual_freq)

library(dplyr)
library(tidyr)

# Extract individual coefficients
child_effects <- coef(freq_fit)$child_id %>%
  as.data.frame() %>%
  mutate(child_id = rownames(.)) %>%
  # Gather into long format to find the max
  pivot_longer(cols = starts_with("prep"), names_to = "prep", values_to = "score")

# Identify the prep with the highest predicted score for each child
best_prep_per_child <- child_effects %>%
  group_by(child_id) %>%
  slice_max(order_by = score, n = 1)

print(best_prep_per_child)

library(ggplot2)
library(emmeans)

# 1. Get the estimated means for each prep
prep_means <- emmeans(freq_fit, "prep")

# 2. Compare every prep against every other prep (Tukey adjustment for multiple testing)
all_comparisons <- pairs(prep_means, adjust = "tukey")

# 3. View the results
print(prep_means)
print(all_comparisons)

# 1. Force the summary to get the Confidence Intervals (CL)
plot_data <- all_comparisons %>% 
  summary(infer = TRUE) %>% 
  as.data.frame()

# If they are different, R will tell you here:
print(colnames(plot_data))

# 3. Modern ggplot2 syntax (using 'y' and 'errorbar' with orientation)
ggplot(plot_data, aes(x = estimate, y = contrast)) +
  geom_vline(xintercept = 0, color = "red", linetype = "dashed") +
  geom_errorbar(aes(xmin = lower.CL, xmax = upper.CL), width = 0.2) +
  geom_point(aes(color = (p.value < 0.05)), size = 3) +
  scale_color_manual(values = c("black", "blue"), labels = c("Non-Sig", "Significant")) +
  theme_minimal() +
  labs(
    title = "Frequentist Pairwise Comparisons",
    subtitle = "Tukey-adjusted contrasts (95% CI)",
    x = "Difference in Engagement Score",
    y = "Comparison",
    color = "Result"
  )