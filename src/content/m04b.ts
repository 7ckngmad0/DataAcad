import type { Lesson } from '../types.ts';
import { md } from './md.ts';

export const anovaPowerLesson: Lesson = {
  id: 'stats-anova-power',
  title: 'ANOVA, Effect Size & Statistical Power',
  minutes: 50,
  difficulty: 'advanced',
  objectives: [
    'Compare the means of three or more groups with one-way ANOVA and interpret the F statistic',
    'Explain why many pairwise t-tests inflate false positives, and correct for it',
    'Measure practical importance with effect sizes (Cohen’s d, eta squared)',
    'Estimate statistical power and the sample size an experiment needs, by formula and by simulation',
  ],
  intro: md`
A t-test compares **two** groups. Real questions often involve more: *do house prices differ across five neighbourhoods? Does revenue differ by region?* **ANOVA** answers that in one test. Then come two questions every good analyst asks: *is the difference big enough to matter?* (effect size) and *was my study big enough to find it?* (power). Getting these right is what separates trustworthy A/B tests from noise.
`,
  simple: md`
- **ANOVA** asks: are the group averages spread out **more than you’d expect from random noise** within each group? If the groups differ a lot compared with how much individuals vary, something real is going on.
- A significant ANOVA says “*at least one* group is different”, not *which* one. A **post-hoc test** (like Tukey’s) finds the pairs.
- **Effect size** = *how big* the difference is, in a unit-free way. A tiny difference can be “significant” if you have millions of rows.
- **Power** = the chance your study detects a real effect. A study with 30% power misses real effects 70% of the time. Plan the sample size **before** collecting data.
`,
  technical: md`
### One-way ANOVA
Hypotheses: $H_0: \mu_1 = \mu_2 = \dots = \mu_k$ versus $H_1$: at least one mean differs.

Split the total variation into **between-group** and **within-group** parts:

$$SS_B = \sum_j n_j(\bar{x}_j - \bar{x})^2, \qquad SS_W = \sum_j \sum_i (x_{ij} - \bar{x}_j)^2$$

$$F = \frac{SS_B/(k-1)}{SS_W/(N-k)}$$

Under $H_0$, $F$ follows an F distribution with $(k-1, N-k)$ degrees of freedom. A large F means the group means are far apart relative to the noise. In Python: \`scipy.stats.f_oneway(g1, g2, g3)\`.

**Assumptions:** independent observations, roughly normal residuals (or large groups), similar variances. If the variances differ a lot, use **Welch’s ANOVA**. If the data are heavily skewed or ordinal, use **Kruskal–Wallis** (\`stats.kruskal\`).

### The multiple-comparisons problem
With $k$ groups there are $k(k-1)/2$ pairs. Five groups give 10 t-tests, and at $\alpha = 0.05$ the chance of **at least one** false positive is $1 - 0.95^{10} \approx 40\%$. Solutions:
- run ANOVA first, then a **post-hoc** test that controls the family-wise error (Tukey HSD: \`stats.tukey_hsd\`);
- or use the **Bonferroni** correction: test each pair at $\alpha / m$, where $m$ is the number of tests.

### Effect sizes
- **Cohen’s d** (two groups): $d = (\bar{x}_1 - \bar{x}_2)/s_p$, where $s_p$ is the pooled standard deviation. Rough guide: 0.2 small, 0.5 medium, 0.8 large.
- **Eta squared** (ANOVA): $\eta^2 = SS_B / SS_T$, the share of total variance explained by group membership.

### Power and sample size
Power $= 1 - \beta$ = P(reject $H_0$ | the effect is real). It grows with **sample size**, **effect size** and $\alpha$, and falls with noise. For a two-sample t-test, the per-group sample size is approximately

$$n \approx 2\left(\frac{z_{1-\alpha/2} + z_{1-\beta}}{d}\right)^2$$

Halving the effect you want to detect multiplies the required sample by **four**. When there is no formula for your design, estimate power by **simulation**: generate fake data with the effect you expect, run the test thousands of times, and count how often it is significant.
`,
  terms: [
    ['ANOVA', 'Analysis of variance: a test of whether three or more group means are equal.'],
    ['F statistic', 'The ratio of between-group variance to within-group variance.'],
    ['Post-hoc test', 'A follow-up test (e.g. Tukey HSD) that finds which pairs of groups differ while controlling false positives.'],
    ['Family-wise error rate', 'The probability of at least one false positive across a set of tests.'],
    ['Bonferroni correction', 'Testing each of m comparisons at α/m to keep the family-wise error at α.'],
    ['Effect size', 'A standardised measure of how large a difference or relationship is (Cohen’s d, η²).'],
    ['Statistical power', 'The probability that a test detects an effect that really exists (1 − β).'],
    ['Kruskal–Wallis test', 'A rank-based alternative to one-way ANOVA for skewed or ordinal data.'],
  ],
  realWorld: md`
A food-delivery app tests **four** checkout designs on 2,000 users each. The product manager wants to run six pairwise t-tests and ship whichever "wins". The data scientist runs one ANOVA first (p = 0.003), then Tukey HSD, which shows only design C beats the control. The effect is d = 0.12: real, but small. Before the *next* experiment, the team runs a power analysis and discovers that detecting an effect that small with 80% power needs about 1,100 users per arm. With 300 per arm, as the PM proposed, they would have missed it two times out of three.
`,
  steps: [
    'State $H_0$ (all means equal) and choose α before looking at the data.',
    'Check group sizes, spreads and shapes (box plots), and pick ANOVA, Welch or Kruskal–Wallis.',
    'Run the omnibus test (`stats.f_oneway`) and report F, the degrees of freedom and p.',
    'If it is significant, run a post-hoc test (Tukey HSD) to find which groups differ.',
    'Report an effect size (η² or Cohen’s d) alongside the p-value.',
    'For future studies, compute the sample size needed for the smallest effect you care about.',
  ],
  code: [
    {
      title: 'One-way ANOVA by hand, checked against scipy',
      code: md`
import numpy as np
from scipy import stats
a = np.array([72, 75, 78, 74, 76])
b = np.array([80, 83, 79, 85, 82])
c = np.array([71, 69, 74, 70, 72])
groups = [a, b, c]
grand = np.concatenate(groups).mean()
ss_between = sum(len(g) * (g.mean() - grand) ** 2 for g in groups)
ss_within = sum(((g - g.mean()) ** 2).sum() for g in groups)
df_b, df_w = len(groups) - 1, sum(len(g) for g in groups) - len(groups)
F = (ss_between / df_b) / (ss_within / df_w)
p = stats.f.sf(F, df_b, df_w)
print(f"By hand: F = {F:.2f}, p = {p:.6f}")
print(stats.f_oneway(a, b, c))
`,
      explanation: [
        'NumPy for arrays.',
        'scipy.stats has the F distribution and ready-made tests.',
        'Exam scores under teaching method A…',
        '…method B…',
        '…and method C.',
        'Put the groups in a list so we can loop over them.',
        'The grand mean of all 15 scores.',
        'Between-group sum of squares: how far each group mean is from the grand mean, weighted by group size.',
        'Within-group sum of squares: how far individuals are from their own group mean (the noise).',
        'Degrees of freedom: k − 1 = 2 between, N − k = 12 within.',
        'F = between-group variance ÷ within-group variance.',
        '`sf` (survival function) = P(F this large or larger if H₀ is true): the p-value.',
        'F ≈ 30.0, p ≈ 0.00002: the methods clearly differ.',
        'scipy gives exactly the same F and p in one call.',
      ],
    },
    {
      title: 'Do house prices differ by neighbourhood? ANOVA, η² and Tukey HSD',
      code: md`
import pandas as pd
from scipy import stats
df = pd.read_csv("data/houses.csv")
groups = {name: g["price"].to_numpy() for name, g in df.groupby("neighborhood")}
F, p = stats.f_oneway(*groups.values())
grand = df["price"].mean()
ss_between = sum(len(v) * (v.mean() - grand) ** 2 for v in groups.values())
eta_sq = ss_between / ((df["price"] - grand) ** 2).sum()
print(f"F = {F:.1f}, p = {p:.1e}, eta squared = {eta_sq:.3f}")
res = stats.tukey_hsd(*groups.values())
names = list(groups)
for i in range(len(names)):
    for j in range(i + 1, len(names)):
        if res.pvalue[i, j] < 0.05:
            print(f"{names[i]:>10} vs {names[j]:<10} mean difference {res.statistic[i, j]:>10,.0f}")
`,
      explanation: [
        'pandas to load and group.',
        'scipy for the tests.',
        '800 houses in five neighbourhoods.',
        'A dict of neighbourhood → array of prices.',
        '`*` unpacks the five arrays as separate arguments.',
        'Grand mean price.',
        'Between-group sum of squares, as before.',
        'η² = SS_between / SS_total: the share of price variance explained by neighbourhood.',
        'F ≈ 43, p ≈ 6e-33, η² ≈ 0.18: highly significant, and neighbourhood explains about 18% of price variation.',
        'Tukey HSD compares every pair while controlling the family-wise error rate.',
        'Group names, in the same order as the arrays.',
        'Loop over every pair (i, j) once…',
        '…with j > i.',
        'Keep only pairs whose adjusted p-value is below 0.05.',
        'Print the pair and the difference in mean price.',
      ],
    },
    {
      title: 'Power by simulation: how many users does an A/B test need?',
      code: md`
import numpy as np
from scipy import stats
rng = np.random.default_rng(0)

def simulated_power(n, effect, sims=4000, alpha=0.05):
    control = rng.normal(0, 1, size=(sims, n))
    treatment = rng.normal(effect, 1, size=(sims, n))
    p = stats.ttest_ind(control, treatment, axis=1).pvalue
    return (p < alpha).mean()

for n in [20, 50, 100, 175, 300]:
    print(f"n = {n:>3} per group -> power {simulated_power(n, effect=0.3):.2f}")
`,
      explanation: [
        'NumPy to generate fake experiments.',
        'The t-test.',
        'A seeded random generator, so the results are reproducible.',
        'Power = the share of simulated experiments that reach significance when the effect is real.',
        '4,000 control groups at once: each row is one experiment with n users (mean 0, SD 1).',
        'Treatment groups whose true mean is higher by `effect` standard deviations (Cohen’s d).',
        '`axis=1` runs all 4,000 t-tests in one vectorised call.',
        'The fraction of p-values below α is the estimated power.',
        'Try several sample sizes…',
        '…for a small-to-medium effect (d = 0.3). About 175 per group is needed for 80% power; with 20 per group you would miss the effect most of the time.',
      ],
    },
    {
      title: 'Sample size from the formula',
      code: md`
import math
from scipy.stats import norm

def n_per_group(d, alpha=0.05, power=0.8):
    z_alpha = norm.ppf(1 - alpha / 2)
    z_beta = norm.ppf(power)
    return math.ceil(2 * ((z_alpha + z_beta) / d) ** 2)

for d in [0.2, 0.5, 0.8]:
    print(f"d = {d}: {n_per_group(d)} per group")
print("Halving d from 0.4 to 0.2 multiplies n by", round(n_per_group(0.2) / n_per_group(0.4), 1))
`,
      explanation: [
        '`math.ceil` rounds up: you can’t recruit 62.8 people.',
        '`norm.ppf` is the inverse normal CDF (z-scores).',
        'Approximate per-group n for a two-sample test.',
        'z for a two-sided α = 0.05 is 1.96.',
        'z for 80% power is 0.84.',
        'n ≈ 2((z_α + z_β)/d)².',
        'Small, medium and large effects…',
        '…need about 393, 63 and 25 per group.',
        'Detecting an effect half as big needs about 4× the data.',
      ],
    },
  ],
  mistakes: [
    { mistake: 'Running every pairwise t-test between 5+ groups and reporting the significant ones.', fix: 'Run ANOVA, then a post-hoc test such as Tukey HSD, or apply a Bonferroni correction.' },
    { mistake: 'Concluding from a significant ANOVA that *all* groups differ.', fix: 'ANOVA only says at least one mean differs; a post-hoc test tells you which pairs.' },
    { mistake: 'Reporting only p-values.', fix: 'Always add an effect size (d, η²) and a confidence interval; with huge samples, trivial differences become “significant”.' },
    { mistake: 'Treating “not significant” in a small study as proof of no effect.', fix: 'Check power: an underpowered study often misses real effects. Absence of evidence is not evidence of absence.' },
    { mistake: 'Choosing the sample size after peeking at results, or stopping when p < 0.05.', fix: 'Do the power analysis before the experiment and stick to the planned sample size.' },
  ],
  exercises: [
    {
      id: 'an-ex1', title: 'Compute Cohen’s d', type: 'write', lang: 'python', difficulty: 'intermediate',
      prompt: md`
Compute Cohen’s d for the new checkout page vs the old one (order values in dollars) and store it, **rounded to 2 decimals**, in \`d\`. Use the pooled standard deviation with sample SDs (\`ddof=1\`):

$$s_p = \sqrt{\frac{(n_1-1)s_1^2 + (n_2-1)s_2^2}{n_1+n_2-2}}, \qquad d = \frac{\bar{x}_{new} - \bar{x}_{old}}{s_p}$$
`,
      starter: md`
import numpy as np
new = np.array([52, 61, 58, 49, 66, 57, 63, 55, 60, 59])
old = np.array([50, 54, 47, 53, 58, 49, 52, 55, 51, 48])
d = new.mean() - old.mean()
`,
      solution: md`
import numpy as np
new = np.array([52, 61, 58, 49, 66, 57, 63, 55, 60, 59])
old = np.array([50, 54, 47, 53, 58, 49, 52, 55, 51, 48])
n1, n2 = len(new), len(old)
sp = np.sqrt(((n1 - 1) * new.var(ddof=1) + (n2 - 1) * old.var(ddof=1)) / (n1 + n2 - 2))
d = round((new.mean() - old.mean()) / sp, 2)
print(d)
`,
      tests: md`
import numpy as _np
_sp = _np.sqrt((9 * new.var(ddof=1) + 9 * old.var(ddof=1)) / 18)
_exp = round((new.mean() - old.mean()) / _sp, 2)
assert d == _exp, f"Expected d = {_exp}, got {d}"
`,
      hints: ['`arr.var(ddof=1)` is the sample variance s².', 'Plug both variances into the pooled formula, then take the square root.', 'Divide the difference in means by s_p and round to 2 decimals.'],
    },
    {
      id: 'an-ex2', title: 'Support calls by contract type', type: 'dataset', lang: 'python', difficulty: 'intermediate',
      prompt: md`
Do customers on different \`contract\` types make a different number of \`support_calls\`? Using \`data/churn.csv\`, run a one-way ANOVA across the contract groups and store:
- \`F\` and \`p\`: the results of \`stats.f_oneway\`;
- \`significant\`: \`True\` if p < 0.05, else \`False\`.

Then think about it: what would you tell the support manager?
`,
      starter: md`
import pandas as pd
from scipy import stats
df = pd.read_csv("data/churn.csv")
F, p = None, None
significant = True
`,
      solution: md`
import pandas as pd
from scipy import stats
df = pd.read_csv("data/churn.csv")
groups = [g["support_calls"] for _, g in df.groupby("contract")]
F, p = stats.f_oneway(*groups)
significant = bool(p < 0.05)
print(f"F = {F:.2f}, p = {p:.3f}, significant: {significant}")
`,
      tests: md`
import pandas as _pd
from scipy import stats as _st
_d = _pd.read_csv("data/churn.csv")
_F, _p = _st.f_oneway(*[g["support_calls"] for _, g in _d.groupby("contract")])
assert F is not None and abs(F - _F) < 1e-6, f"F should be {_F:.4f}, got {F}"
assert abs(p - _p) < 1e-6, f"p should be {_p:.4f}"
assert significant is False or significant == False, "With p ≈ 0.51 the difference is not significant"
`,
      hints: ['Build a list with one Series per contract type: `[g["support_calls"] for _, g in df.groupby("contract")]`.', 'Unpack it into `stats.f_oneway(*groups)`.', 'p ≈ 0.51, so there is no evidence the groups differ.'],
    },
    {
      id: 'an-ex3', title: 'Plan the sample size', type: 'write', lang: 'python', difficulty: 'intermediate',
      prompt: md`An experiment should detect an effect of **d = 0.4** with **90% power** at two-sided **α = 0.05**. Using the normal-approximation formula $n = 2\left(\frac{z_{1-\alpha/2} + z_{1-\beta}}{d}\right)^2$, store the required per-group sample size, **rounded up** to a whole number, in \`n_needed\`.`,
      starter: md`
import math
from scipy.stats import norm
n_needed = 0
`,
      solution: md`
import math
from scipy.stats import norm
z_alpha = norm.ppf(1 - 0.05 / 2)
z_beta = norm.ppf(0.90)
n_needed = math.ceil(2 * ((z_alpha + z_beta) / 0.4) ** 2)
print(n_needed)
`,
      tests: md`assert n_needed == 132, f"Expected 132 per group, got {n_needed}"`,
      hints: ['`norm.ppf(0.975)` ≈ 1.96 and `norm.ppf(0.90)` ≈ 1.28.', 'Use `math.ceil` to round up.'],
    },
    {
      id: 'an-ex4', title: 'What does a significant ANOVA prove?', type: 'predict', lang: 'python', difficulty: 'intermediate',
      prompt: md`An ANOVA comparing average order value across **5 regions** gives F = 6.2, p = 0.001. Can you conclude that **all five** regions have different average order values? Answer **yes** or **no**.`,
      solution: 'no', accepted: ['no', 'n'],
      hints: ['What exactly is the alternative hypothesis of ANOVA?', 'It is “at least one mean differs”, so you need a post-hoc test to know which.'],
    },
    {
      id: 'an-ex5', title: 'Fix the multiple-comparisons bug', type: 'debug', lang: 'python', difficulty: 'advanced',
      prompt: md`
This script compares house prices between **every pair** of neighbourhoods with t-tests, but tests each pair at α = 0.05, so the chance of a false positive across all pairs is far above 5%. Apply a **Bonferroni correction**: set \`alpha_adjusted\` to 0.05 divided by the number of comparisons, and count \`n_significant\` using the adjusted threshold.
`,
      starter: md`
import pandas as pd
from itertools import combinations
from scipy import stats
df = pd.read_csv("data/houses.csv")
groups = {n: g["price"] for n, g in df.groupby("neighborhood")}
pairs = list(combinations(groups, 2))
alpha_adjusted = 0.05
n_significant = sum(stats.ttest_ind(groups[a], groups[b]).pvalue < alpha_adjusted for a, b in pairs)
print(len(pairs), "comparisons,", n_significant, "significant")
`,
      solution: md`
import pandas as pd
from itertools import combinations
from scipy import stats
df = pd.read_csv("data/houses.csv")
groups = {n: g["price"] for n, g in df.groupby("neighborhood")}
pairs = list(combinations(groups, 2))
alpha_adjusted = 0.05 / len(pairs)
n_significant = sum(stats.ttest_ind(groups[a], groups[b]).pvalue < alpha_adjusted for a, b in pairs)
print(len(pairs), "comparisons,", n_significant, "significant")
`,
      tests: md`
assert abs(alpha_adjusted - 0.005) < 1e-12, f"5 neighbourhoods give 10 pairs, so alpha_adjusted should be 0.005, got {alpha_adjusted}"
_exp = sum(stats.ttest_ind(groups[a], groups[b]).pvalue < 0.005 for a, b in pairs)
assert n_significant == _exp, f"Expected {_exp} significant pairs, got {n_significant}"
`,
      hints: ['How many pairs are there? `len(pairs)`.', 'Bonferroni: divide α by the number of tests.'],
    },
  ],
  quiz: [
    { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why run one ANOVA rather than t-tests on all 10 pairs of 5 groups?', options: ['ANOVA is more accurate for each pair', 'Ten tests at α = 0.05 give roughly a 40% chance of at least one false positive', 't-tests cannot compare more than 2 groups at once, so it is impossible', 'ANOVA does not need any assumptions'], answer: 1, explanation: '1 − 0.95¹⁰ ≈ 0.40. ANOVA tests the overall null once; post-hoc tests then control the error rate.' },
    { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'A large F statistic means…', options: ['The groups have very different sizes', 'The variation between group means is large relative to the variation within groups', 'The data are not normal', 'The within-group variance is large'], answer: 1, explanation: 'F = between-group variance ÷ within-group variance.' },
    { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'Revenue by region (4 regions, data/sales.csv) gives ANOVA p = 0.071. At α = 0.05, do you reject or fail to reject H₀? (answer: "reject" or "fail to reject")', accepted: ['fail to reject', 'do not reject', "don't reject", 'not reject'], explanation: '0.071 > 0.05, so there is no significant evidence that regions differ. It is not proof that they are equal; the study may lack power.' },
    { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Statistical power is…', options: ['The probability that H₀ is true', 'The probability of detecting an effect that really exists', '1 − α', 'The size of the effect'], answer: 1, explanation: 'Power = 1 − β = P(reject H₀ | H₁ true).' },
    { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'You need 100 users per group to detect d = 0.4. Roughly how many do you need to detect d = 0.2 with the same power?', options: ['200', '400', '141', '50'], answer: 1, explanation: 'n is proportional to 1/d², so halving d means 4× the sample.' },
    { id: 'q6', kind: 'mcq', difficulty: 'advanced', prompt: 'With 2 million users, an A/B test gives p = 0.0001 and Cohen’s d = 0.01. Best interpretation?', options: ['A huge, important effect', 'The difference is very probably real but practically negligible', 'The test is invalid', 'Accept H₀'], answer: 1, explanation: 'Huge samples make tiny effects significant. The effect size says it barely matters.' },
    { id: 'q7', kind: 'mcq', difficulty: 'intermediate', prompt: 'Your groups are very skewed with outliers, and sizes are small. A safer alternative to one-way ANOVA is…', options: ['A paired t-test', 'The Kruskal–Wallis test', 'Linear regression without checks', 'Bonferroni'], answer: 1, explanation: 'Kruskal–Wallis compares ranks, so it is robust to skew and outliers.' },
  ],
  summary: [
    'One-way ANOVA tests whether 3+ group means are equal; F = between-group ÷ within-group variance.',
    'A significant ANOVA means at least one mean differs; use Tukey HSD (or Bonferroni) to find which.',
    'Report effect sizes (Cohen’s d, η²), not just p-values.',
    'Power = P(detect a real effect); it rises with n, effect size and α.',
    'n ∝ 1/d²: plan the sample size before the experiment, by formula or simulation.',
  ],
  resources: [
    { label: 'OpenIntro Statistics, ch. 7: ANOVA (free textbook)', url: 'https://www.openintro.org/book/os/' },
    { label: 'scipy.stats.f_oneway documentation', url: 'https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.f_oneway.html' },
    { label: 'Evan Miller: Sample size calculator', url: 'https://www.evanmiller.org/ab-testing/sample-size.html' },
  ],
};
