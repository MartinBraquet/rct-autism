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


load_csv <- function(path) {
  read.csv(path)
}

save_csv <- function(data, name) {
  ts <- format(Sys.time(), "%Y-%m-%d_%H%M%S")
  path <- here::here("results", "draft", paste0(name, "_", ts, ".csv"))
  write_csv(data, path)
  cat(sprintf("\nData saved to: %s\n", path))
}