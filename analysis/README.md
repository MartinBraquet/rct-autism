# Simulation & Analysis

This folder contains the reproducible research pipeline for the **Maya Care and Grow** randomized crossover trial. It
includes the Bayesian adaptive power simulations, prior sensitivity analyses, and the main analysis framework.

Most of the results are already stored in the [results](../results) folder.

## 1. Prerequisites

To run these scripts, you need **R (>= 4.2)** and **RStudio**.

### System Dependencies

The analysis uses `cmdstanr` as the backend for `brms`. You must have a C++ compiler installed:

* **Linux:** `sudo apt install build-essential`
* **macOS:** Install Xcode Command Line Tools via `xcode-select --install`.
* **Windows:** Install [Rtools](https://cran.r-project.org/bin/windows/Rtools/).

## 2. Setup Instructions

1. **Initialize the Project:**
   Open the `.Rproj` file in RStudio. This ensures the `here` package correctly anchors all file paths. To avoid path issues, run every script from the root directory. 

2. **Install Packages:**
   Run the initialization script to install all necessary libraries (`tidyverse`, `brms`, `cmdstanr`, `furrr`, etc.):
   ```r
   source("analysis/00_initialize_project.R")
   ```

## 3. Running the Analysis

The project is structured as a series of Literate Programming documents (`.Rmd`).

### Reproduce from Scratch

Open the desired `.Rmd` file in RStudio and click the **"Knit"** button.
If you want to run from the command line, use `rmarkdown::render`. Example for the first script:
```r
rmarkdown::render("analysis/01_power_analysis.Rmd")
```

| File                           | Description                                                                         |
|:-------------------------------|:------------------------------------------------------------------------------------|
| `01_power_analysis.Rmd`        | Simulates resolution rates across 4 child archetypes to justify the 28-session cap. |
| `02_prior_sensitivity.Rmd`     | Tests the influence of Informative vs. Flat priors on stopping decisions.           |
| `03_covariate_sensitivity.Rmd` | Validates model robustness against "noise" like time of day or assistant effects.   |
| `04_main_analysis.Rmd`         | The template for processing the actual trial data once collected.                   |

[//]: # (### B. Quick View)
[//]: # (If present, open the pre-rendered **HTML** files in the `analysis/` folder using any web browser. These contain the full)
[//]: # (code, plots, and interpretations as they appeared when the study was registered.)

## 4. Repository Structure

```text
.
├── rct-autism.Rproj      # RStudio Project (Open this first)
├── analysis/
│   ├── utils/            # Core functions (model fitting, plotting, simulation)
│   └── 01-04_*.Rmd       # Sequential analysis stages
├── data/                 # Data folder (synthetic and empirical)
└── results/              # Exported CSV/TikZ/PDF figures for the manuscript
```

## 5. Reproducibility Metadata

* **Random Seed:** `42` is used across all simulations for exact replication of MCMC chains.
* **Parallelization:** Scripts automatically detect available CPU cores using `furrr`.
* **Environment:** All simulations were originally run on an Ubuntu-based system (Zenbook).
