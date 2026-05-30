library(dplyr)
library(tidyr)
library(lubridate)
library(stringr)
library(here)

# ------------------------------------------------------------------
# 1.  Load data  (adjust path / read function to your actual source)
# ------------------------------------------------------------------
path <- here::here("data", "form_data.csv")
df <- read.csv(path, stringsAsFactors = FALSE)

# ------------------------------------------------------------------
# 2.  Parse & classify each row
# ------------------------------------------------------------------
df <- df |>
  mutate(
    time = mdy_hms(time),          # parse timestamp
    date = as.Date(time),          # extract calendar day
    row_type = case_when(
      grepl("I did NOT teach the child", doing, fixed = TRUE) ~ "rating",
      grepl("teaching the child",        doing, fixed = TRUE) ~ "prep",
      TRUE ~ NA_character_
    )
  ) |>
  filter(!is.na(row_type))         # drop any unclassifiable rows

# ------------------------------------------------------------------
# 3.  De-duplicate: keep the LAST row per (child, date, row_type)
# ------------------------------------------------------------------
df_dedup <- df |>
  arrange(time) |>                 # ascending so last = highest time
  group_by(child_name, date, row_type) |>
  slice_tail(n = 1) |>
  ungroup()

# ------------------------------------------------------------------
# 4.  Keep only child+day pairs that have BOTH a prep AND a rating row
# ------------------------------------------------------------------
complete_pairs <- df_dedup |>
  group_by(child_name, date) |>
  filter(n_distinct(row_type) == 2) |>   # must have both "prep" and "rating"
  ungroup()

# ------------------------------------------------------------------
# 5.  Pivot wide: one row per session
#     Columns from the prep row get suffix _prep,
#     columns from the rating row get suffix _rating.
# ------------------------------------------------------------------
# Decide which columns to widen (exclude keys & row_type itself)
value_cols <- c("prep",
                "rating_5", "rating_15", "rating_30", "assistant_name",
                "baseline_state", "time", "notes_prep", "notes_rating")

# glimpse(complete_pairs)

sessions <- complete_pairs |>
  dplyr::select(date, child_name, row_type, all_of(value_cols)) |>
  pivot_wider(
    names_from  = row_type,
    values_from = all_of(value_cols),
    names_glue  = "{.value}_{row_type}"
  )

# ------------------------------------------------------------------
# 6.  Tidy-up: sort and inspect
# ------------------------------------------------------------------
sessions <- sessions |>
  arrange(date)

# Drop baseline_state_rating, rating_5_prep, rating_15_prep, rating_30_prep, prep_rating, notes_rating_prep, notes_prep_rating
sessions <- sessions |>
  dplyr::select(-c(baseline_state_rating, rating_5_prep, rating_15_prep, rating_30_prep, prep_rating, notes_rating_prep, notes_prep_rating))

# Rename baseline_state_prep -> baseline_state, rating_5_rating -> rating_5, rating_15_rating -> rating_15, rating_30_rating -> rating_30
# prep_prep -> prep, notes_prep_prep -> notes_prep, notes_rating_rating -> notes_rating
sessions <- sessions |>
  rename(baseline_state = baseline_state_prep, rating_5 = rating_5_rating, rating_15 = rating_15_rating, rating_30 = rating_30_rating,
         prep = prep_prep, notes_prep = notes_prep_prep, notes_rating = notes_rating_rating)

# Remove space in elems of prep col
sessions <- sessions |>
  mutate(prep = str_replace(prep, " ", ""))

# Rename baseline_state values from Hyperactive/Silly, Neutral/Calm, Tired/Lethargic to c("Tired", "Neutral", "Hyper")
sessions <- sessions |>
  mutate(
    baseline_state = case_when(
      baseline_state == "Hyperactive/Silly" ~ "Hyper",
      baseline_state == "Neutral/Calm"      ~ "Neutral",
      baseline_state == "Tired/Lethargic"   ~ "Tired",
      TRUE                                  ~ NA_character_
    )
  )

# Compute rating col as average of three ratings
sessions <- sessions |>
#   mutate(engagement = rating_5)
  mutate(engagement = (rating_5 + rating_15 + rating_30) / 3)

glimpse(sessions)

# Save to CSV
write.csv(sessions, here::here("data", "sessions_with_child_names.csv"), row.names = FALSE)

# Anonymize child names by replacing child_name col with child_id whose values are in data/child_map.csv (child_id, name)
child_map <- read.csv(here::here("data", "child_map.csv"))
sessions <- sessions |>
  left_join(child_map, by = c("child_name" = "name")) |>
  dplyr::select(-child_name) |>
  rename(child_id = child_id) |>
  mutate(age = age - 9)

# Move child_id column to second position
sessions <- sessions |>
  dplyr::select(date, child_id, everything()) |>
  dplyr::select(-notes_prep, -notes_rating)

# Anonymize assistant names by replacing assistant_name_[prep,rating] col with assistant_[prep,rating] whose values are
# in data/assistant_map.csv (letter, name)
assistant_map <- read.csv(here::here("data", "assistant_map.csv"))
sessions <- sessions |>
  left_join(assistant_map, by = c("assistant_name_prep" = "name")) |>
  dplyr::select(-assistant_name_prep) |>
  rename(teacher = letter)
sessions <- sessions |>
  left_join(assistant_map, by = c("assistant_name_rating" = "name")) |>
  dplyr::select(-assistant_name_rating) |>
  rename(rater = letter)

# Move teacher to third position
sessions <- sessions |>
  dplyr::select(date, child_id, teacher, prep, engagement, everything())

# Assert prep is among c("NoPrep", "Calming", "Stimulating", "ChildChoice"), list rows where prep is invalid
invalid_prep <- sessions |>
  filter(!prep %in% c("NoPrep", "Calming", "Stimulating", "ChildChoice"))
if (nrow(invalid_prep) > 0) {
  stop("Invalid prep values found in rows:", invalid_prep$prep)
}

# Assert rating_5, rating_15 and rating_30 between 1 and 10
rating_cols <- c("rating_5", "rating_15", "rating_30")
out_of_range <- sessions |>
  summarise(across(all_of(rating_cols), ~ sum(.x < 1 | .x > 10, na.rm = TRUE)))
stopifnot(
  "Rating values outside [1, 10] found — see out_of_range for details" =
    all(out_of_range == 0)
)

# Assert no missing values
cols_required <- c("date", "child_id", "teacher", "prep",
                   "baseline_state", "rating_5", "rating_15", "rating_30")

missing_counts <- sessions |>
  summarise(across(all_of(cols_required), ~ sum(is.na(.))))

stopifnot(
  "Missing values found in required columns — see missing_counts for details" =
    all(missing_counts == 0)
)

# Save to CSV
write.csv(sessions, here::here("data", "sessions.csv"), row.names = FALSE)

mean_by_prep_child <- sessions %>%
  group_by(child_id, prep) %>%
  summarise(
    mean_rating = mean(engagement, na.rm = TRUE),
    std_rating = sd(engagement, na.rm = TRUE),
    n_sessions  = n(),
    .groups = "drop"
  ) %>%
  arrange(child_id, prep) %>%
  mutate(mean_rating = round(mean_rating, 2), std_rating = round(std_rating, 2))

save_csv(mean_by_prep_child, name = "ratings_per_child_and_prep")

sessions_per_child <- sessions %>%
  group_by(child_id) %>%
  summarise(
    mean_rating = mean(engagement, na.rm = TRUE),
    n_sessions  = n(),
    .groups = "drop"
  ) %>%
  arrange(child_id) %>%
  mutate(mean_rating = round(mean_rating, 2))

write.csv(sessions_per_child, here::here("results", "sessions_per_child.csv"), row.names = FALSE)

sessions_per_prep <- sessions %>%
  group_by(prep) %>%
  summarise(
    mean_rating = mean(engagement, na.rm = TRUE),
    std_rating = sd(engagement, na.rm = TRUE),
    n_sessions  = n(),
    .groups = "drop"
  ) %>%
  mutate(mean_rating = round(mean_rating, 2), std_rating = round(std_rating, 2))

write.csv(sessions_per_prep, here::here("results", "sessions_per_prep.csv"), row.names = FALSE)
