# Study Protocol: Personalized Pre-Session Preparation in Early Autism Intervention

**Project Title:** Personalized Pre-Session Preparation to Improve Engagement in Early Autism Intervention: A Randomized Repeated-Measures Crossover Study
**Setting:** Maya Care and Grow, Agartala  
**Principal Investigator:** Martin Braquet
**Collaborator:** Lily (Founder, Maya Care and Grow)  
**Version:** 1.0 (Final Design)

---

## 1. Study Objectives

### 1.1 Primary Objective

To determine the optimal pre-session preparation condition (Stimulating, Calming, Child-Led, or None) for maximizing engagement during learning sessions for **each individual child**.

### 1.2 Secondary Objective

To estimate the **group-level average effect** of each preparation condition on engagement, and to quantify the value of personalization compared to standard care (no prep).

### 1.3 Tertiary  Objective

To estimate the **group-level average effect** of each teacher on engagement, even though teacher assignment is not following careful randomization.

---

## 2. Study Design

**Type:** Randomized N-of-1 Crossover Trial with Hierarchical Bayesian Analysis.  
**Structure:** Each child serves as their own control across multiple sessions.  
**Randomization Unit:** Session-level within each child.  
**Allocation Ratio:** 1:1:1:1 (Condition A, B, C, D).
3 consecutive scores <= 2 on a single arm at the 15-min mark: Remove that arm from the child’s randomization.

### 2.1 Design Rationale

- **N-of-1:** Captures heterogeneity in treatment response (what works for Child 1 may not work for Child 2).
- **Crossover:** Controls for stable child characteristics (age, severity) by using within-subject comparisons.
- **Bayesian Analysis:** Provides probabilistic recommendations for individuals (e.g., "85% probability Condition A is best") rather than binary significance testing.

---

## 3. Participants

### 3.1 Setting

Maya Care and Grow, Agartala. Census recruitment of all enrolled children.

### 3.2 Sample Size and Stopping Protocol

This study uses simulation-based power analysis and Bayesian adaptive stopping rather than a fixed sample size. Power was established through simulation of 25 children under a mixture of child response profiles (see Section 7).

**Adaptive stopping rules (applied per child):**

**Rule 1 — Superiority (primary stopping criterion):**
Stop and recommend prep condition A when P(A is the best condition for this child) ≥ 0.9.

**Rule 2 — AIPE (precision-based stopping) ([[Accuracy in Parameter Estimation]]):**
Stop when the leading two active preps are both credibly effective (10th percentile of each arm's posterior > 0.5 on the engagement scale) AND the difference between them is sufficiently small to call a tie (80% [[Credible Interval]]  of the difference < 2.0 engagement points). This applies to children with two similarly effective preps; the recommendation is "either Calming or Stimulating works — use whichever is operationally convenient."

**Rule 3 — ROPE (null-detection stopping):**
Stop when ≥ 80% of the posterior for each active prep falls within the Region of Practical Equivalence [−1.0, +1.0] on the latent engagement scale. This indicates no prep is meaningfully different from No Prep for this child.

**Boundaries:**
- Minimum: 12 sessions before any stopping rule is evaluated.
- Maximum: 28 sessions regardless of stopping status (computed based on 80% power, see section 7)

To maintain developmental consistency and treatment density, data collection for any individual participant will conclude after 6 weeks, regardless of the number of sessions completed. Data from participants who do not reach the 12-session minimum within this window will not be excluded (following Intent-to-Treat analysis).

For ease of implementation, the rules will be checked once a week (every Sunday). The model will run on all the existing sessions but only the children who have hit a multiple of 4 sessions (since their last eligibility) will be eligible for stopping.

### 3.3 Inclusion Criteria

1. **Diagnosis:** ASD (DSM-5/ICD-10).
2. **Enrollment:** Active at Maya Care and Grow.
3. **Attendance:** Minimum average 2 sessions/week over the past month.
4. **Consent:** Written informed consent from guardian; assent from child.

### 3.4 Exclusion Criteria

1. **Medical:** Contraindications to specific sensory activities (e.g., seizures, orthopedic issues).
2. **Safety:** Severe sensory aversions posing risk of harm.
3. **Stability:** Planned discharge or acute behavioral/medical crisis during the study period.

---

## 4. Interventions

Each child is assigned one fixed activity within each condition prior to the study to prevent activity-type confounding.

| Condition | Label | Description | Fixed Activity Example |
|---|---|---|---|
| **A** | **Stimulating** | High-energy, vestibular/proprioceptive input. | Jumping & Body Massage |
| **B** | **Calming** | Quiet, fine-motor, tactile input. | Clay Modeling |
| **C** | **ChildChoice** | Autonomy-based selection from a fixed choice board. | Choice Board (All Items) |
| **D** | **NoPrep** | No preparation; session starts immediately. | — |

**Duration:** Prep conditions (A, B, C) last 10 minutes. NoPrep (D) is 0 minutes.

See [[Treatment Arms]] for the rationale behind.

---

## 5. Procedures

### 5.1 Standardized Learning Block

To isolate the effect of prep, the subsequent learning task is held constant. The first 20 minutes of every session follows a standardized curriculum (e.g., specific Discrete Trial Training tasks or structured tabletop work). This prevents variation in task difficulty from confounding engagement scores.

### 5.2 Randomization Rules

- **Method:** Blocked randomization, block size = 4, generated per child (via a custom R algorithm).
- **Constraint:** No condition is repeated twice consecutively (enforced algorithmically across block boundaries).
- **Implementation:** Pre-generated sequences stored in a secure lookup table for practitioners.

**Safety removal rule:** If a child scores ≤ 2 on the BRES-10 for three consecutive sessions under the same condition, that condition is removed from that child's randomization sequence. Subsequent randomization proceeds over the remaining conditions.

### 5.3 Blinding Protocol

1. **Practitioner:** Unblinded (must deliver the prep).
2. **Rater:** Partially blinded.
3. **Procedure:** Sessions are not video-recorded due to resource constraints in the centre. The rater scores the learning block from a separate room. Because the NoPrep condition results in an immediate session start, the rater may be able to infer when NoPrep has been assigned; this is an acknowledged partial unblinding risk for that condition only and will be noted as a limitation.

See [[Blinding Protocol]] for details.

### 5.4 Ethical Safeguards

- **Voluntariness:** Non-participation does not affect care quality or access.
- **Safety stop:** NoPrep condition removed for a child if score ≤ 2 on three consecutive NoPrep sessions.
- **Adaptive stopping:** Randomization stops per child once the Bayesian stopping rule fires; the optimal prep begins immediately.

---

## 6. Outcome Measures

### 6.1 Primary Outcome: BRES-10 (Blinded Rater Engagement Scale)

**Ordinal scale (1–10)**, where 1 = active refusal/distress and 10 = fully self-directed engaged behavior. A single composite score per session is derived by averaging the ratings at the 5-minute, 15-minute, and 30-minute marks of the learning block.

The scale is treated as approximately continuous in the statistical model (Gaussian likelihood; see Section 7.1).

| Score | Label | Behavioral Anchors |
|---|---|---|
| **9–10** | Active / Independent | Eyes on task >90%; 0–1 prompts; self-initiated behavior. |
| **7–8** | Steady / Supported | Eyes on task >75%; 2–3 prompts; consistently compliant. |
| **5–6** | Inconsistent / Reactive | Eyes on task ~50%; frequent prompts; passive engagement. |
| **3–4** | Passive / Disengaged | Eyes off task >50%; constant prompting; withdrawn. |
| **1–2** | Active Refusal | No engagement; elopement, aggression, or distress. |

See [[Outcomes]] for details.

### 6.2 Inter-rater Reliability (IRR) and Calibration

To ensure the stability of the BRES-10 measurements, a secondary rater will be trained on the behavioral anchors.

**Calibration:** Prior to study commencement, the primary and secondary raters will achieve a minimum ICC > 0.75 on five pilot sessions.

**Monitoring:** During the study, 20% of sessions will be independently double-scored. IRR will be quantified using a Two-way Random Effects Intraclass Correlation Coefficient (ICC(2,1)) for absolute agreement. Due to implementation limitations, those double-scored sessions are not randomly selected, but rather based on the availability of practitioners / raters. This may induce bias, but we expect it to be limited as the practitioners typically have shifts that resemble a near-random schedule.

**Discrepancy Resolution:** If the two raters differ by $\le 1$ point, the primary rater’s score is used. If they differ by $> 1$ point, the PI will review the session to provide a final consensus score. If the cumulative ICC falls below 0.60, data collection will pause for re-calibration of the raters.

## 7. Covariates and Predictors

The model includes confirmatory and secondary covariates as specified below. All covariate decisions for the primary analysis are pre-registered and evaluated before examining any prep-condition coefficients (see Section 7.4).

### 7.1 Confirmatory Covariates (included in primary model)

**Age (continuous, mean-centred):** Age in years is included as a fixed effect. Children range from 3 to 14 years; age is mean-centred at 9 years in the model (`age_model = age_years − 9`) so that the intercept represents a typical 9-year-old. The coefficient β_age is expected to be positive (older children tend to have higher baseline engagement capacity).

**Teacher identity (categorical):** Teacher is included as a fixed effect with one teacher serving as the reference category. Teacher effects are expected to be substantial given the therapist-dependent nature of ABA-style intervention as well as the current skill gap (exacerbating student-teacher comfort differences) between the lead practitioner and her assistants. Six teachers (A–F) are currently active at the centre (one lead practitioner and 5 assistants).

### 7.2 Secondary Covariates (evaluated by pre-registered decision rule)

**Baseline state on arrival:** Rated by the rater at session start as Tired/Lethargic, Neutral/Calm, or Hyperactive/Silly. Both Tired and Hyper states are expected to reduce engagement relative to Neutral. This covariate is included in sensitivity analyses; it is not in the primary model formula because session-to-session variation is partially captured by the session-level random effect.

### 7.3 Variables Maybe Included

Time of day, past session outcomes, and child-expressed preference for prep will be recorded but will not be included in the primary analysis (too few degrees of freedom, and preference ratings may influence subsequent behavior).

### 7.4 Pre-registered Covariate Decision Rule for Age

Age will be retained in the primary model depending on the the following three conditions, evaluated before examining prep effects:

1. LOO-CV comparison favors the model with age by elpd_diff > 1.5 × se_diff.
2. Sample SD of age in years exceeds 1.5.
3. Spearman correlation between age and mean engagement (pooled across all sessions) exceeds |0.15|.

Age will be retained if:
- Condition 1 is met,
- and at least one of the remaining conditions (2 or 3) is met.

Otherwise, age is reported descriptively but removed from the primary model.

---

## 8. Statistical Analysis Plan

See [[Statistical Design]] for details.

Optional stopping (p-hacking) is the practice of checking results and stopping data collection once which severely inflates Type I error rates in frequentist null-hypothesis testing. Conversely, Bayesian methods allow for continuous monitoring and data collection, as posterior probabilities and Bayes factors are not dependent on the sampling plan or stopping intentions.

### 8.1 Primary Model

A Bayesian hierarchical linear model is fitted to the session-level composite engagement score:

$$\text{engagement}_{ij} \sim \text{Normal}(\mu_{ij},\ \sigma^2)$$

$$\mu_{ij} = \underbrace{(\beta_{\text{Prep}} \cdot \text{Prep}_{ij} + \beta_{\text{Age}} \cdot \text{Age}_i + \beta_{\text{Teacher}} \cdot \text{Teacher}_{ij})}_{\text{Group level (fixed effects)}} + \underbrace{(u_{0i} + u_{1i} \cdot \text{Prep}_{ij})}_{\text{Child level (random effects)}}$$

where:
- $\text{Prep}_{ij}$ is a three-level contrast variable with NoPrep as the reference.
- Random intercepts and random prep slopes are modelled as independent (no correlation structure between them).
- $\sigma$ is the residual SD, estimated from data.

**Rationale for Gaussian likelihood:** The BRES-10 scale (1–10) has sufficient categories and approximately equal spacing in behavioral terms to support a continuous normal approximation. An ordinal cumulative model was considered but adds substantial computational cost and complexity for limited gain given the scale width.

Model summary (with sim data):

```
SHARED_PRIOR <- c(
	prior(normal(0, 1), class = b),
	prior(normal(5, 2), class = Intercept),
	prior(exponential(1), class = sd),
	prior(exponential(1), class = sigma)
)

Family: gaussian 
  Links: mu = identity 
Formula: engagement ~ prep + teacher + age + (1 + prep || child_id) 
   Data: data (Number of observations: 900) 
  Draws: 2 chains, each with iter = 2000; warmup = 1000; thin = 1;
         total post-warmup draws = 2000

Multilevel Hyperparameters:
~child_id (Number of levels: 25) 
                    Estimate Est.Error l-95% CI u-95% CI Rhat
sd(Intercept)           1.97      0.48     1.27     3.11 1.00
sd(prepCalming)         0.96      0.33     0.45     1.71 1.00
sd(prepStimulating)     0.37      0.25     0.02     0.94 1.00
sd(prepChildChoice)     1.47      0.39     0.88     2.44 1.00

Regression Coefficients:
                Estimate Est.Error l-95% CI u-95% CI Rhat Bulk_ESS
Intercept           6.97      0.85     5.25     8.60 1.00     1184
prepCalming         0.97      0.34     0.25     1.59 1.00     1203
prepStimulating     0.40      0.21    -0.04     0.82 1.00     1769
prepChildChoice     0.88      0.46    -0.10     1.70 1.00      905
teacherB           -0.53      0.21    -0.94    -0.12 1.00     1805
teacherC           -0.66      0.21    -1.06    -0.26 1.00     2013
teacherD           -0.69      0.21    -1.09    -0.27 1.00     1908
teacherE           -0.65      0.22    -1.08    -0.21 1.00     2067
teacherF           -0.47      0.21    -0.88    -0.06 1.00     2238
age                 0.27      0.21    -0.15     0.71 1.00     1104


Further Distributional Parameters:
      Estimate Est.Error l-95% CI u-95% CI Rhat Bulk_ESS Tail_ESS
sigma     1.16      0.04     1.08     1.25 1.00     2189     1505
```


### 8.2 Priors

| Parameter | Prior | Rationale |
|---|---|---|
| Fixed effects β | Normal(0, 1) | Conservative; ±2 covers the full plausible range on the engagement scale |
| Intercept | Normal(5, 2) | Mean engagement near mid-scale (5/10); SD allows for substantial variation |
| Random-effect SDs | Exponential(1) | Weakly regularising; penalises very large child-level heterogeneity |
| Residual SD σ | Exponential(1) | Same rationale |

### 8.3 Individual-Level Inference

For each child i and each interim, individual-level posterior draws are computed as:

$$\tilde{\beta}_{\text{Prep},i} = \beta_{\text{Prep}} + u_{1i,\text{Prep}}$$

P(condition A is best for child i) is computed per posterior draw by comparing all four arms simultaneously, including NoPrep at zero. This propagates uncertainty about which arm is truly best rather than conditioning on the posterior-mean winner.

### 8.4 Key Reporting Metrics

1. **Group effect:** Posterior distribution of β_Prep for each condition (e.g., "Calming increases engagement by X points on average across children, 95% CrI [a, b]").
2. **Personalisation probability:** For each child, P(condition A is best), reported at study exit.
3. **Detection breakdown:** Proportion of children resolved via each stopping rule (superiority, AIPE, ROPE, max reached), disaggregated by true response profile in the simulation.
4. **Value of personalisation:** Expected engagement under group-optimal assignment vs. individual-optimal assignment, computed from the posterior.

### 8.5 Covariate Sensitivity

1. Primary model excluding teacher fixed effect.
2. Primary model excluding age fixed effect.
3. Primary model excluding both age and teacher fixed effects.

Success is defined as:
1. Exact agreement on the superior condition, OR
2. The superior condition identified in the primary model remains part of the 'Top-ranked Tie Set' in the sensitivity models.

Results on the simulated data: 100% success across all 4 models (the three above + baseline).

### 8.6 Prior Sensitivity & Decision Stability

We will evaluate prior sensitivity by comparing posterior probabilities of treatment superiority across four prior specifications (Baseline, Skeptical, Vague, and Low-Heterogeneity).

#### **1. Purpose of Sensitivity Analysis**
Because this study employs Bayesian adaptive stopping rules, we must ensure that the clinical recommendations (the "winner" for each child) are driven by the child's behavioral data rather than the specific hyper-parameters of the priors.

#### **2. Evaluation Framework**
We will fit the primary model under four distinct prior regimes:
* **Baseline:** Our primary informative prior.
* **Skeptical:** Assumes treatment effects are near-zero ($Normal(0, 0.25)$).
* **Vague:** A "flat" prior that allows maximum influence from data noise ($Normal(0, 10)$).
* **Low-Heterogeneity:** Penalizes differences between children ($Exponential(5)$ on group-level SD).

#### **3. Pre-defined Success Criteria**
For the simulation-based validation (N=25), we define the following thresholds for robustness:

| Metric | Threshold | Justification |
| :--- | :--- | :--- |
| **Individual Decision Stability** | $> 85\%$ Agreement | At least 22 out of 25 children must be assigned the same "Best Prep" across all four models. |
| **Temporal Stability (Delay)** | $< 4$ sessions | The average stopping point under a Skeptical prior should not lag more than one full block (4 sessions) behind the Baseline. |
#### **4. Results of Simulation Validation**
Based on our current simulation, the model meets all pre-defined stability criteria:

| Metric                        | Observed Value     | Result   |
| :---------------------------- | :----------------- | :------- |
| **Overall Average Agreement** | **88.6%**          | **PASS** |
| **Delay (Skeptical)**         | **+0.56 sessions** | **PASS** |
| **Delay (Low SD)**            | **-0.15 sessions** | **PASS** |
| **Vague**                     | **-0.16 sessions** | **PASS** |

In cases where a child's recommendation is sensitive to the prior (i.e., 'Fragile' recommendations), the lead practitioner and PI will review the raw session data and qualitative behavioral notes to make the final clinical assignment.

See [[Prior Sensitivity Analysis]] for details.

---

## 9. Expected Child Response Profiles

The simulation assumes the following mixture of child response types, informed by the current situation in the learning center:

Child response profiles were simulated using a latent variable approach. A 'Strong Winner' is defined as a child where the random slope for a specific prep ($\beta_{prep,i}$) is shifted by +2.0 units on the latent scale relative to the mean. 'Multiple Winners' represent children with two slopes shifted by +2.0, creating an ambiguous superiority but a clear benefit over NoPrep. These profiles allow us to test the model's ability to recover true clinical signals amidst session-level noise ($\sigma = 0.7$).

| Profile           | Proportion | Description                                  | Primary stopping path |
| ----------------- | ---------- | -------------------------------------------- | --------------------- |
| one winner strong | 20%        | One prep clearly superior (large effect)     | Superiority           |
| one winner weak   | 10%        | One prep best but modest effect              | Superiority or AIPE   |
| multiple winners  | 60%        | Two preps similarly helpful; no clear winner | AIPE or Superiority   |
| no differential   | 10%        | No prep meaningfully different from NoPrep   | ROPE                  |

The 60% multiple_winners assumption reflects the clinical view that most children in this setting benefit from any structured sensory prep, with the practical question being which is most convenient or preferred. This assumption is pre-registered and will be examined against the observed data.

### Power Analysis

We design the max number of sessions per child in order to reach 80% of  children who found their best prep (matching the stopping criteria) for a Smallest Effect Size of Interest of 2 on the 10-point scale. An adaptive simulation reveals that we need 28 sessions. The ones with no differential or weak effect (less than 1 point on the scale) are the harder to detect, but we don't expect many kids to fit those profiles.

| Profile           | Resolved after 28 sessions |
| ----------------- | -------------------------- |
| one winner strong | 91%                        |
| one winner weak   | 59%                        |
| multiple winners  | 91%                        |
| no differential   | 47%                        |
| Overall           | 83%                        |
See Appendix A for details.

---

## 10. Ethics and Approvals

This study involves minors with a developmental condition.

**Consent:** Written parental consent will be obtained for all participants. Child assent will be sought in an age-appropriate manner.

**Declaration of Helsinki:** This study is conducted in accordance with the Declaration of Helsinki. Formal IRB/ethics committee review was not available in this resource-constrained setting. Written parental consent and practitioner oversight are the primary ethical safeguards.

**Risk assessment:** All prep activities (Clay Modeling, Jumping, Choice Board) are standard components of existing therapeutic programming at the centre. No novel interventions are introduced. The primary risk is opportunity cost: children assigned to a suboptimal prep may receive slightly less effective preparation than if individually optimised. The adaptive stopping rule minimises this risk by stopping randomization as soon as a personal recommendation can be made with 80% confidence.

## Appendix A

To establish the 28-session maximum and validate the adaptive stopping rules, we performed a Monte Carlo power analysis ($N_{sim}=2000$ iterations).

**Simulation Parameters:**
* **Likelihood:** Gaussian approximation of an underlying ordinal process.
* **Randomization:** Blocked 1:1:1:1.
* **Stopping Rules:** Evaluated every 4 sessions after an initial 12-session burn-in.

The simulation confirmed that at 28 sessions, the model achieves **83% overall power** to resolve a child's optimal prep, with 91% success for children with strong response profiles. The full code for this simulation is available in the project's GitHub repository (https://github.com/MartinBraquet/rct-autism) under `/analysis/utils/sim.R`."
