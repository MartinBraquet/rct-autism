# 1. Ensure renv is installed
if (!requireNamespace("renv", quietly = TRUE)) install.packages("renv")

# 2. Handle Initialization or Restoration
if (!file.exists("renv.lock")) {
  # First time setup: capture what is currently used
  renv::init(bare = TRUE)
  pkgs <- c(
    # --- Core Analysis ---
    "tidyverse",   # Covers dplyr, ggplot2, purrr, tidyr, etc.
    "brms",        # The Bayesian engine
    "tidybayes",   # Post-processing and sensitivity plots
    "here",        # Essential for the paths in your /analysis/utils/ folder
    "rmarkdown",   # Needed to run your .Rmd files
    "irr",
    # --- Simulation & Multiprocessing ---
    "simr",        # For the power analysis
    "furrr",       # For the /utils/multiprocessing.R logic
    "future",      # Parallel backend for furrr
    # --- specialized Plotting & UX ---
    "tikzDevice",  # Found in your logs (for LaTeX-quality plots)
    "languageserver" # Friendly for developers using VS Code or Neovim
  )
  renv::install(pkgs)
  if (!requireNamespace("cmdstanr", quietly = TRUE)) {
    install.packages("cmdstanr", repos = "https://stan-dev.r-universe.dev")
    cmdstanr::install_cmdstan()
  }
  renv::snapshot(confirm = FALSE)
} else {
  # The Reproducibility Step: make your library match the lockfile exactly
  # clean = TRUE removes the "unused" packages
  renv::restore(clean = TRUE)
}

# 3. Final Sync Check
# if (nrow(renv::status()$repairs) > 0) {
#   renv::snapshot(confirm = FALSE)
# }

cat("\n--- PROJECT SYNCED & REPRODUCIBLE ---\n")