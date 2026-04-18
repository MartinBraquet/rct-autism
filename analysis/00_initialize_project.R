# 1. Ensure renv is installed globally
if (!requireNamespace("renv", quietly = TRUE)) {
  install.packages("renv")
}

# 2. Initialize the project environment
# This creates the project library, .Rprofile, and renv.lock
if (!file.exists("renv.lock")) {
  renv::init()
} else {
  renv::restore()
}

# 3. Install your specific "Statistical Ability" stack
pkgs <- c(
  "tidyverse", # Data wrangling & plotting
  "brms",      # Bayesian Multilevel Modeling (The PhD flex)
  "tidybayes", # Making Bayesian plots look beautiful
  "here",      # Robust file paths
  "ggplot2",
  "simr"       # Power simulations
)

# Install them into the project-specific library
renv::install(pkgs)

# 4. Save the state
renv::snapshot(confirm = FALSE)

cat("\n--- PROJECT INITIALIZED ---\n")
cat("All packages are now isolated to this folder.\n")
cat("Run renv::status() anytime to check your environment.\n")