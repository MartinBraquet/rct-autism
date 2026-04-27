# Study Protocol: Personalized Pre-Session Preparation in Early Autism Intervention

**Project Title:** Personalized Pre-Session Preparation to Improve Engagement in Early Autism Intervention: A Randomized Repeated-Measures Crossover Study
**Setting:** Maya Care and Grow, Agartala
**Principal Investigator:** Martin Braquet
**Collaborator:** Lily (Founder, Maya Care and Grow)
**Version:** 1.1

---

## 1. Study Objectives

### 1.1 Primary Objective

To determine the optimal pre-session preparation condition (Stimulating, Calming, Child-Led, or None) for maximizing engagement during learning sessions **for each individual child**.

### 1.2 Secondary Objective

To estimate the **group-level average effect** of each preparation condition on engagement, and to quantify the added value of personalization compared to standard care (no preparation).

### 1.3 Tertiary Objective

To estimate the **group-level average effect** of teacher identity on engagement, noting that teacher assignment does not follow strict Randomization.

---

## 2. Study Design

**Type:** Randomized N-of-1 Crossover Trial with Hierarchical Bayesian Analysis.
**Structure:** Each child serves as their own control across multiple sessions.
**Randomization Unit:** Session-level, within each child.
**Allocation Ratio:** 1:1:1:1 (Conditions A, B, C, D).

### 2.1 Design Rationale

- **N-of-1:** Captures heterogeneity in treatment response; what benefits one child may not benefit another.
- **Crossover:** Controls for stable child characteristics (age, severity) through within-subject comparisons.
- **Bayesian Analysis:** Provides probabilistic recommendations at the individual level (e.g., "85% probability that Condition A is optimal for this child") rather than relying on binary significance testing.

---

## 3. Participants

### 3.1 Setting

Maya Care and Grow, Agartala. All currently enrolled children are eligible for recruitment (census approach).

### 3.2 Sample Size and Stopping Protocol

This study uses simulation-based power analysis and Bayesian adaptive stopping rather than a fixed sample size. Stopping rules are evaluated per child, and power was established via simulation across 25 children under a mixture of response profiles (see Section 9 and Appendix A).

#### Adaptive Stopping Rules (applied per child)

**Rule 1 — Superiority (primary stopping criterion):**
Stop when P(Condition A is the best condition for this child) ≥ 0.90 for any single condition A.

**Rule 2 — AIPE (Accuracy in Parameter Estimation; precision-based stopping):**
Stop when the two leading active conditions are both credibly effective (10th percentile of each arm's posterior > 0.5 on the engagement scale) AND the difference between them is sufficiently small to declare a tie (the 80% Credible Interval of the pairwise difference is narrower than 2.0 engagement points). When this rule fires, the recommendation is: *"Either [Condition X] or [Condition Y] is effective — use whichever is operationally convenient."*

**Rule 3 — ROPE (null-detection stopping):**
Stop when ≥ 80% of the posterior for each active preparation condition falls within the Region of Practical Equivalence [−1.0, +1.0] on the latent engagement scale, indicating that no preparation is meaningfully superior to No Preparation for this child.

#### Boundaries

- **Minimum:** 12 sessions before any stopping rule is evaluated.
- **Maximum:** 28 sessions, regardless of stopping status (derived from the 80% power simulation; see Appendix A).

To maintain developmental consistency and treatment density, data collection for any individual participant concludes after **6 weeks**, regardless of sessions completed. Data from participants who do not reach the 12-session minimum within this window are retained in the analysis following an Intent-to-Treat approach and will not be excluded.

Stopping rules are checked once weekly (every Sunday). At each check, only children who have completed a multiple of four sessions since their last eligibility evaluation are candidates for stopping.

### 3.3 Inclusion Criteria

1. **Diagnosis:** ASD (DSM-5 or ICD-10).
2. **Enrolment:** Currently active at Maya Care and Grow.
3. **Attendance:** Minimum average of two sessions per week over the preceding month.
4. **Consent:** Written informed consent from a parent or legal guardian; age-appropriate assent from the child.

### 3.4 Exclusion Criteria

1. **Medical:** Contraindications to specific sensory activities (e.g., seizure disorder, orthopaedic limitations).
2. **Safety:** Severe sensory aversions posing a risk of self-injury or harm to others.
3. **Stability:** Planned discharge or acute behavioral or medical crisis anticipated during the study period.

---

## 4. Interventions

Each child is assigned one fixed activity within each condition prior to study commencement to prevent activity-type confounding. All activities are standard components of existing therapeutic programming at the centre.

| Condition | Label | Description | Fixed Activity Example |
|---|---|---|---|
| **A** | **Stimulating** | High-energy input targeting vestibular and proprioceptive systems. | Jumping & Body Massage |
| **B** | **Calming** | Quiet, fine-motor, tactile input. | Clay Modelling |
| **C** | **Child-Led** | Autonomy-based selection from a fixed choice board. | Choice Board (All Items) |
| **D** | **No Preparation** | No preparation; session begins immediately. | — |

**Duration:** Conditions A, B, and C last 10 minutes. Condition D lasts 0 minutes.

---

## 5. Procedures

### 5.1 Standardized Learning Block

To isolate the effect of preparation condition, the subsequent learning task is held constant. The first 20 minutes of every session follows a standardised curriculum (e.g., specific Discrete Trial Training tasks or structured tabletop work), preventing variation in task difficulty from confounding engagement scores.

### 5.2 Randomization

- **Method:** Blocked Randomization, block size = 4, generated per child using a custom R algorithm.
- **Constraint:** No condition may be repeated in two consecutive sessions (enforced algorithmically across block boundaries).
- **Implementation:** Pre-generated sequences are stored in a secure lookup table accessible to practitioners.

#### Safety Removal Rule

If a child scores ≤ 2 on the BRES-10 for three consecutive sessions under the same condition — evaluated at the 15-minute mark — that condition is removed from the child's Randomization sequence. Subsequent Randomization proceeds over the remaining active conditions. The No Preparation condition (D) is subject to this same rule. A child's guardian and the supervising practitioner are informed when any condition is removed.

### 5.3 Blinding Protocol

1. **Practitioner:** Unblinded (must deliver the preparation condition).
2. **Rater:** Partially blinded; scores the learning block from a separate room without knowledge of the assigned condition.
3. **Acknowledged limitation:** Because the No Preparation condition results in an immediate session start, the rater may be able to infer when Condition D has been assigned. This constitutes a partial unblinding risk specific to that condition and will be reported as a study limitation.

### 5.4 Ethical Safeguards

- **Voluntariness:** Non-participation has no effect on quality of care or access to services.
- **Safety:** The safety removal rule (Section 5.2) applies to all conditions, including No Preparation.
- **Adaptive stopping:** Once a Bayesian stopping rule fires for a given child, Randomization ceases and the individually recommended preparation condition is implemented immediately.

---

## 6. Outcome Measures

### 6.1 Primary Outcome: BRES-10 (Blinded Rater Engagement Scale)

An **ordinal scale (1–10)**, where 1 = active refusal or distress and 10 = fully self-directed, independent engagement. A single composite score per session is computed as the mean of rater scores at the 5-, 15-, and 30-minute marks of the learning block.

For statistical modelling purposes, the scale is treated as approximately continuous under a Gaussian likelihood (see Section 8.1 for rationale).

| Score | Label | Behavioral Anchors |
|---|---|---|
| **9–10** | Active / Independent | Eyes on task >90% of the time; 0–1 prompts; self-initiated behaviour. |
| **7–8** | Steady / Supported | Eyes on task >75%; 2–3 prompts; consistently compliant. |
| **5–6** | Inconsistent / Reactive | Eyes on task ~50%; frequent prompting; passive engagement. |
| **3–4** | Passive / Disengaged | Eyes off task >50%; constant prompting; withdrawn affect. |
| **1–2** | Active Refusal | No engagement; elopement, aggression, or visible distress. |

### 6.2 Inter-Rater Reliability and Calibration

**Calibration:** Prior to data collection, the primary and secondary raters must achieve a minimum Intraclass Correlation Coefficient (ICC) > 0.75 on five pilot sessions.

**Monitoring:** During the study, 20% of sessions are independently double-scored. Inter-rater reliability is quantified using a Two-way Random Effects ICC (ICC(2,1)) for absolute agreement. These double-scored sessions are selected based on rater availability rather than by strict Randomization — an acknowledged limitation, though the near-random nature of practitioner shift schedules is expected to minimise systematic bias.

**Discrepancy resolution:** If two raters differ by ≤ 1 point, the primary rater's score is retained. A difference of > 1 point triggers PI review and consensus scoring. If the cumulative ICC falls below 0.60 at any monitoring checkpoint, data collection pauses for rater re-calibration.

---

## 7. Covariates and Predictors

All covariate decisions for the primary analysis are pre-registered and evaluated before examining any preparation-condition coefficients (see Section 7.4).

### 7.1 Confirmatory Covariates (included in primary model)

**Age (continuous, mean-centred):** Age in years, mean-centred at 9 years (`age_model = age_years − 9`), so that the model intercept represents a typical 9-year-old. Children range from 3 to 14 years. The coefficient β_age is expected to be positive, as older children tend to have higher baseline engagement capacity.

**Teacher identity (categorical):** Teacher is included as a fixed effect, with one teacher designated as the reference category. Teacher effects are expected to be substantial given the therapist-dependent nature of ABA-style intervention and the current experience gap between the lead practitioner and her five assistants. Six teachers (A–F) are currently active at the centre.

### 7.2 Secondary Covariates (evaluated by pre-registered decision rule)

**Baseline state on arrival:** Rated by the rater at session start as Tired/Lethargic, Neutral/Calm, or Hyperactive/Silly. Both Tired and Hyperactive states are expected to reduce engagement relative to Neutral. This covariate is included in sensitivity analyses but is excluded from the primary model, as session-to-session variation is partially captured by the session-level random effect.

### 7.3 Recorded but Excluded Variables

Time of day, past session outcomes, and child-expressed preference for preparation condition will be recorded for descriptive purposes but will not enter the primary analysis. Exclusion rationale: limited degrees of freedom, and preference ratings may influence subsequent behaviour in ways that are not separable from the preparation effect.

### 7.4 Pre-registered Decision Rule for Age

The decision to retain age in the primary model is determined by the following three conditions, evaluated *before* any preparation-condition coefficients are examined:

1. LOO-CV comparison favours the model with age by elpd_diff > 1.5 × se_diff.
2. The sample SD of age in years exceeds 1.5.
3. The Spearman correlation between age and mean engagement (pooled across all sessions) exceeds |0.15|.

**Retention rule:** Age is retained if Condition 1 is met *and* at least one of Conditions 2 or 3 is met. Otherwise, age is reported descriptively but removed from the primary model formula.

---

## 8. Statistical Analysis Plan

### 8.1 Primary Model

A Bayesian hierarchical linear model is fitted to the session-level composite engagement score:

$$\text{engagement}_{ij} \sim \text{Normal}(\mu_{ij},\ \sigma^2)$$

$$\mu_{ij} = \underbrace{(\beta_{\text{Prep}} \cdot \text{Prep}_{ij} + \beta_{\text{Age}} \cdot \text{Age}_i + \beta_{\text{Teacher}} \cdot \text{Teacher}_{ij})}_{\text{Group level (fixed effects)}} + \underbrace{(u_{0i} + u_{1i} \cdot \text{Prep}_{ij})}_{\text{Child level (random effects)}}$$

where:
- $\text{Prep}_{ij}$ is a three-level contrast variable with No Preparation (Condition D) as the reference category.
- Random intercepts and random preparation slopes are modelled as independent (no correlation structure assumed between them).
- $\sigma$ is the residual standard deviation, estimated from data.

**Rationale for Gaussian likelihood:** The BRES-10 scale (1–10) has sufficient categories and approximately equal behavioural spacing to support a continuous normal approximation. An ordinal cumulative model was considered but adds substantial computational cost and complexity for limited gain given the scale width.

**Note on continuous monitoring:** Bayesian posterior probabilities and credible intervals are not distorted by the act of interim checking — unlike frequentist p-values, which are inflated by optional stopping. Accordingly, the weekly evaluation of stopping rules (Section 3.2) does not require an alpha-spending correction.

**Illustrative model output (simulated data, N = 900 observations, 25 children):**

```
Family: gaussian 
Formula: engagement ~ prep + teacher + age + (1 + prep || child_id) 
  Draws: 2 chains × 2000 iterations (1000 warmup); 2000 post-warmup draws

Multilevel Hyperparameters:
~child_id (Number of levels: 25) 
                    Estimate Est.Error l-95% CI u-95% CI Rhat
sd(Intercept)           1.97      0.48     1.27     3.11 1.00
sd(prepCalming)         0.96      0.33     0.45     1.71 1.00
sd(prepStimulating)     0.37      0.25     0.02     0.94 1.00
sd(prepChildChoice)     1.47      0.39     0.88     2.44 1.00

Regression Coefficients:
                Estimate Est.Error l-95% CI u-95% CI Rhat
Intercept           6.97      0.85     5.25     8.60 1.00
prepCalming         0.97      0.34     0.25     1.59 1.00
prepStimulating     0.40      0.21    -0.04     0.82 1.00
prepChildChoice     0.88      0.46    -0.10     1.70 1.00
teacherB           -0.53      0.21    -0.94    -0.12 1.00
teacherC           -0.66      0.21    -1.06    -0.26 1.00
teacherD           -0.69      0.21    -1.09    -0.27 1.00
teacherE           -0.65      0.22    -1.08    -0.21 1.00
teacherF           -0.47      0.21    -0.88    -0.06 1.00
age                 0.27      0.21    -0.15     0.71 1.00

sigma               1.16      0.04     1.08     1.25 1.00
```

### 8.2 Priors

| Parameter | Prior | Rationale |
|---|---|---|
| Fixed effects β | Normal(0, 1) | Conservative; ±2 covers the full plausible range on the engagement scale. |
| Intercept | Normal(5, 2) | Mean engagement near mid-scale (5/10); SD allows for substantial variation. |
| Random-effect SDs | Exponential(1) | Weakly regularising; penalises implausibly large child-level heterogeneity. |
| Residual SD σ | Exponential(1) | Same rationale as random-effect SDs. |

```r
SHARED_PRIOR <- c(
  prior(normal(0, 1),   class = b),
  prior(normal(5, 2),   class = Intercept),
  prior(exponential(1), class = sd),
  prior(exponential(1), class = sigma)
)
```

### 8.3 Individual-Level Inference

For each child $i$ at each interim evaluation, individual-level posterior draws are computed as:

$$\tilde{\beta}_{\text{Prep},i} = \beta_{\text{Prep}} + u_{1i,\text{Prep}}$$

The probability that a given condition is best for child $i$ — P(Condition A is best for child $i$) — is computed per posterior draw by simultaneously comparing all four arms, with No Preparation fixed at zero. This approach propagates uncertainty about which arm is truly superior rather than conditioning on the posterior-mean winner.

### 8.4 Key Reporting Metrics

1. **Group effect:** Posterior distribution of β_Prep for each condition (e.g., "Calming increases engagement by X points on average across children; 95% CrI [a, b]").
2. **personalization probability:** For each child, P(Condition A is best), reported at study exit.
3. **Resolution breakdown:** Proportion of children resolved via each stopping rule (Superiority, AIPE, ROPE, maximum sessions reached), disaggregated by true response profile in simulation.
4. **Value of personalization:** Expected engagement under group-optimal assignment versus individual-optimal assignment, computed from the posterior.

### 8.5 Covariate Sensitivity Analyses

Three sensitivity models are pre-specified:

1. Primary model excluding teacher fixed effect.
2. Primary model excluding age fixed effect.
3. Primary model excluding both age and teacher fixed effects.

**Success criterion:** Results are considered robust if, for each sensitivity model, either (a) the same superior condition is identified, or (b) the superior condition from the primary model remains within the top-ranked tied set. Simulation results confirm 100% agreement across all four model variants (three sensitivity models plus the primary).

### 8.6 Prior Sensitivity and Decision Stability

#### Purpose

Because this study employs Bayesian adaptive stopping rules, we must confirm that clinical recommendations are driven by the child's observed data rather than by the specific hyperparameters of the priors.

#### Evaluation Framework

The primary model is re-fitted under four prior regimes:

| Label | Prior on Fixed Effects | Prior on Group SD |
|---|---|---|
| **Baseline** | Normal(0, 1) | Exponential(1) |
| **Skeptical** | Normal(0, 0.25) | Exponential(1) |
| **Vague** | Normal(0, 10) | Exponential(1) |
| **Low Heterogeneity** | Normal(0, 1) | Exponential(5) |

#### Pre-defined Success Criteria

| Metric | Threshold | Justification |
|---|---|---|
| **Individual Decision Stability** | > 85% agreement | At least 22 of 25 children must receive the same "Best Preparation" recommendation across all four prior regimes. |
| **Temporal Stability (Skeptical prior)** | < 4 sessions delay | The average stopping point under a Skeptical prior should lag no more than one full block behind Baseline. |

#### Simulation Results

| Metric | Observed Value | Result |
|---|---|---|
| Overall Average Agreement | 88.6% | **PASS** |
| Delay — Skeptical prior | +0.56 sessions | **PASS** |
| Delay — Low Heterogeneity prior | −0.15 sessions | **PASS** |
| Delay — Vague prior | −0.16 sessions | **PASS** |

Where a child's recommendation is sensitive to the prior specification (a "fragile" recommendation), the lead practitioner and PI will review raw session data and qualitative behavioural notes before making the final clinical assignment.

---

## 9. Expected Child Response Profiles

Child response profiles are simulated using a latent variable approach. A "Strong Winner" is a child whose random slope for a specific preparation condition ($\beta_{\text{prep},i}$) is shifted +2.0 units on the latent scale relative to the population mean. "Multiple Winners" have two slopes each shifted by +2.0, creating practical ambiguity between conditions but clear benefit over No Preparation. These profiles allow the model's ability to recover clinically meaningful signals to be tested against session-level noise ($\sigma = 0.7$).

| Profile | Proportion | Description | Primary Stopping Path |
|---|---|---|---|
| One winner — strong | 20% | One preparation clearly superior (large effect). | Superiority |
| One winner — weak | 10% | One preparation best, but modest effect size. | Superiority or AIPE |
| Multiple winners | 60% | Two preparations similarly effective; no clear single winner. | AIPE or Superiority |
| No differential | 10% | No preparation meaningfully different from No Preparation. | ROPE |

The 60% multiple-winners assumption reflects the clinical view that most children in this setting benefit from any structured sensory preparation, with the practical question being which is most operationally convenient or child-preferred. This assumption is pre-registered and will be evaluated against observed data at study completion.

### 9.1 Power Analysis

The maximum session count is set to achieve ≥ 80% power to resolve each child's optimal preparation condition, for a Smallest Effect Size of Interest (SESOI) of 2.0 points on the 10-point scale. A Monte Carlo adaptive simulation ($N_{\text{sim}} = 2000$) establishes this at **28 sessions** (see Appendix A for full details).

| Profile | Resolved by 28 Sessions |
|---|---|
| One winner — strong | 91% |
| One winner — weak | 59% |
| Multiple winners | 91% |
| No differential | 47% |
| **Overall** | **83%** |

Children with weak effects or no differential response are the hardest cases to resolve; however, they are expected to represent a minority of the sample.

---

## 10. Ethics and Approvals

This study involves minors with a developmental condition and is conducted accordingly.

**Consent:** Written parental consent is obtained for all participants. Child assent is sought in an age-appropriate manner prior to enrolment.

**Ethical framework:** This study is conducted in accordance with the principles of the Declaration of Helsinki. Formal IRB or ethics committee review was not available in this resource-constrained setting. Written parental consent and ongoing practitioner oversight constitute the primary ethical safeguards.

**Risk assessment:** All preparation activities (Clay Modelling, Jumping, Choice Board) are standard components of existing therapeutic programming at the centre. No novel interventions are introduced. The primary risk is opportunity cost: children assigned to a suboptimal preparation condition may receive marginally less effective preparation than if individually optimised from the outset. This risk is minimised by the adaptive stopping rule, which terminates Randomization as soon as a personal recommendation can be made with ≥ 90% posterior probability, or the equivalent AIPE or ROPE criteria are met.

---

## Appendix A: Monte Carlo Power Analysis

To establish the 28-session maximum and validate the adaptive stopping rules, a Monte Carlo power analysis was conducted ($N_{\text{sim}} = 2000$ iterations).

**Simulation parameters:**

- **Likelihood:** Gaussian approximation of an underlying ordinal process.
- **Randomization:** Balanced blocked 1:1:1:1 allocation.
- **Stopping evaluation:** Every 4 sessions after a 12-session burn-in period.

The simulation confirms that at 28 sessions, the model achieves **83% overall power** to resolve a child's optimal preparation condition, with 91% power for children exhibiting strong response profiles.

Full simulation code is available at [https://github.com/MartinBraquet/rct-autism](https://github.com/MartinBraquet/rct-autism) under `/analysis/utils/sim.R`.