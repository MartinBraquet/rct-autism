library(tidyverse)
library(brms)
library(here)

# Load specialized utility functions
source(here("analysis", "utils", "model.R"))
source(here("analysis", "utils", "sim.R"))
source(here("analysis", "utils", "plotting.R"))
source(here("analysis", "utils", "power.R"))
source(here("analysis", "utils", "stop_criteria.R"))
source(here("analysis", "utils", "sensitivity.R"))

set.seed(42)

source(here("analysis", "utils", "parse_form_data.R"))

# boxplot_per_child()

file_path <- here("data", "sessions.csv")
data <- read_csv(file_path)
glimpse(data)

chains <- 4
fit <- fit_model_fresh(
  data,
  threads = threading(chains),
  chains = chains,
  iter = 2000
)

summary_table <- posterior_summary(fit) %>%
  as.data.frame() %>%
  rownames_to_column(var = "parameter")
save_csv(summary_table, name = "fit_summary")

write.csv(as_draws_df(fit), here::here("results", "draws.csv"), row.names = FALSE)

results <- check_stopping_per_child(fit)
print(results, n=100)
save_csv(results, name = "stopping_checks")

plot_forest_group_effects(fit, save_tikz = FALSE)
plot_forest_per_child(fit)