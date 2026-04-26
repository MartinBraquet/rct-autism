library(irr)

# Example data: Rows are sessions, Columns are Rater 1 and Rater 2
irr_data <- data.frame(
  rater_lily = c(8, 7, 5, 2, 9, 6),
  rater_assistant = c(7, 7, 4, 3, 9, 5)
)

# Calculate ICC (Two-way, Absolute Agreement, Single Rater)
results <- irr::icc(
  irr_data,
  model = "twoway",
  type = "agreement",
  unit = "single"
)

print(results$value) # This is your ICC score