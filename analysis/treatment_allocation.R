# Load necessary libraries
if (!require("tidyr")) install.packages("tidyr")
if (!require("dplyr")) install.packages("dplyr")

library(tidyr)
library(dplyr)

# 1. Setup Parameters
set.seed(42) # Set seed for reproducibility
n_children <- 30
n_blocks <- 8
block_size <- 4
total_sessions <- n_blocks * block_size
preps <- c("Stimulating", "Calming", "Child Choice", "No Prep")

# 2. Function to generate a valid sequence for one child
generate_child_sequence <- function(preps, n_blocks) {
  full_sequence <- c()
  
  for (b in 1:n_blocks) {
    valid_block <- FALSE
    
    while (!valid_block) {
      # Randomly shuffle the 4 preps
      current_block <- sample(preps)
      
      # Check Constraint: No two consecutive same preps
      # Only matters at the boundary between blocks (last of previous, first of current)
      if (length(full_sequence) == 0) {
        valid_block <- TRUE
      } else {
        last_prep_prev_block <- full_sequence[length(full_sequence)]
        first_prep_curr_block <- current_block[1]
        
        if (last_prep_prev_block != first_prep_curr_block) {
          valid_block <- TRUE
        }
      }
    }
    full_sequence <- c(full_sequence, current_block)
  }
  return(full_sequence)
}

# 3. Generate data for all children
randomization_list <- list()

for (i in 1:n_children) {
  # child_id <- paste0("Child_", sprintf("%02d", i))
  child_id <- paste0("", sprintf("%02d", i))
  sequence <- generate_child_sequence(preps, n_blocks)
  
  # Create a data frame for this child
  child_data <- data.frame(
    child_id = child_id,
    session_num = 1:total_sessions,
    prep = sequence
  )
  randomization_list[[i]] <- child_data
}

# Combine into one long-format dataframe
long_df <- bind_rows(randomization_list)

# 4. Reshape to Wide Format (Rows = Child, Cols = Session)
wide_df <- long_df %>%
  pivot_wider(
    names_from = session_num, 
    values_from = prep,
    names_prefix = "Session_"
  )

# 5. Export to CSV
write.csv(wide_df, "maya_care_randomization_schedule.csv", row.names = FALSE)

# Print a preview of the first few children and sessions
print(head(wide_df[, 1:6]))
cat("\nSuccess: Randomization schedule saved as 'maya_care_randomization_schedule.csv'")
