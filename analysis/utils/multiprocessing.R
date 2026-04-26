run_multiprocessing <- function(f, n_sims = 99999999) {
  n_logical_cores <- parallel::detectCores()
  n_workers <- min(max(1L, floor(n_logical_cores) - 2), n_sims)
  cat(sprintf("\nSystem has %d cores. Using %d cores total.\n", n_logical_cores, n_workers))
  cat(sprintf("Distributed simulations across %d workers with threading(1).\n", n_workers))
  if (n_workers > .8 * n_logical_cores) {
    cat("Expect your machine to go brrrrrr for some time.\n")
  }
  plan(multisession, workers = n_workers)
  results <- future_map(seq_len(n_sims), f, .options = furrr_options(seed = TRUE))
  plan(sequential)
  return(results)
}