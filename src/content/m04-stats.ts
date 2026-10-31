import type { Module } from '../types.ts';
import { md } from './md.ts';
import { anovaPowerLesson } from './m04b.ts';

const OIS = { label: 'OpenIntro Statistics (free textbook)', url: 'https://www.openintro.org/book/os/' };
const SEEING = { label: 'Seeing Theory — visual probability & statistics', url: 'https://seeing-theory.brown.edu/' };
const KHAN_STATS = { label: 'Khan Academy — Statistics & probability', url: 'https://www.khanacademy.org/math/statistics-probability' };

export const m04: Module = {
  id: 'stats',
  number: 4,
  title: 'Statistics & Probability',
  short: 'Statistics',
  icon: 'dice',
  description:
    'Describe data, reason about uncertainty and draw conclusions: descriptive statistics, probability and Bayes, distributions, sampling and the CLT, confidence intervals, hypothesis tests, ANOVA and power analysis, and correlation — with interactive simulations.',
  skills: ['Descriptive statistics', 'Probability', 'Bayes’ theorem', 'Distributions', 'Sampling & CLT', 'Confidence intervals', 'Hypothesis testing', 'ANOVA & power', 'Correlation'],
  lessons: [
    {
      id: 'stats-descriptive',
      title: 'Population, Sample & Measures of Centre',
      minutes: 35,
      difficulty: 'beginner',
      widgets: ['descriptive-stats'],
      objectives: [
        'Distinguish population vs sample and parameter vs statistic',
        'Compute and interpret mean, median and mode',
        'Choose the right measure of centre for skewed data and outliers',
        'Compute these with Python, NumPy and pandas',
      ],
      intro: md`
Statistics starts by **describing** data. Before any model, you need to answer: *what is a typical value?* This lesson covers the three measures of centre and — just as important — when each one misleads.
`,
      simple: md`
The **population** is *everyone* you care about (all customers of a bank). A **sample** is the group you actually measured (1,000 customers who answered a survey). We use the sample to learn about the population.

Three ways to describe the “middle”:
- **Mean** (average): add everything up and divide by how many.
- **Median**: line values up from smallest to largest; take the middle one.
- **Mode**: the most common value.

If Jeff Bezos walks into a café, the **mean** wealth of people inside jumps to billions — but the **median** barely moves. That’s why median household income is reported, not mean.
`,
      technical: md`
| | Population | Sample |
|---|---|---|
| Size | $N$ | $n$ |
| Mean | $\mu = \frac{1}{N}\sum x_i$ (parameter) | $\bar{x} = \frac{1}{n}\sum x_i$ (statistic) |
| Std dev | $\sigma$ | $s$ |

A **parameter** describes the population (usually unknown); a **statistic** is computed from a sample and estimates it.

### Measures of centre
- **Mean** $\bar{x}$: uses every value; sensitive to outliers.
- **Median**: middle of the sorted data (average of the two middle values if $n$ is even); **robust** to outliers.
- **Mode**: most frequent value; the only one that works for nominal data; a distribution can be bimodal.
- **Weighted mean**: $\bar{x}_w = \frac{\sum w_i x_i}{\sum w_i}$ (e.g. GPA weighted by credits).
- **Trimmed mean**: drop the top/bottom k% before averaging.

### Skewness and centre
- Symmetric → mean ≈ median.
- **Right (positive) skew** (long tail of large values: incomes, house prices, delivery times) → mean > median.
- Left skew → mean < median.

### Sampling bias
A sample only represents the population if it is drawn appropriately (ideally **randomly**). Surveying only app users about app satisfaction gives a biased sample.
`,
      terms: [
        ['Population', 'The entire group you want to draw conclusions about.'],
        ['Sample', 'A subset of the population that is actually observed.'],
        ['Parameter', 'A numeric summary of a population (μ, σ).'],
        ['Statistic', 'A numeric summary computed from a sample (x̄, s).'],
        ['Mean', 'Sum of values divided by their count.'],
        ['Median', 'The middle value of sorted data; robust to outliers.'],
        ['Mode', 'The most frequent value.'],
        ['Skewness', 'Asymmetry of a distribution; the long tail’s direction.'],
      ],
      realWorld: md`
A real-estate site reports that the **mean** home price in a district is \$612,000 while the **median** is \$395,000. A handful of luxury mansions pull the mean up. For a typical family, the median is far more informative. Analysts at property portals, governments and banks report medians for exactly this reason.
`,
      steps: [
        'Plot the data (histogram or dot plot) to see its shape.',
        'Compute both mean and median.',
        'If they differ a lot, the data is skewed or has outliers — prefer the median for “typical”.',
        'For categories, report the mode (and counts).',
        'State whether you are describing a sample or a population.',
      ],
      code: [
        {
          title: 'Centre of the house prices dataset',
          code: md`
import pandas as pd

houses = pd.read_csv("data/houses.csv")
price = houses["price"]

print("mean:  ", round(price.mean()))
print("median:", round(price.median()))
print("mode of neighborhood:", houses["neighborhood"].mode()[0])

print("\nMedian price by neighborhood:")
print(houses.groupby("neighborhood")["price"].median().sort_values(ascending=False))

# The effect of one extreme value
small = pd.Series([310, 295, 330, 305, 320])
print("\nbefore:", small.mean(), small.median())
small[5] = 5000
print("after: ", round(small.mean(), 1), small.median())
`,
          explanation: [
            '…',
            'Load the dataset.',
            'Select the price column (a pandas Series).',
            'Mean price.',
            'Median price — here a bit lower than the mean (slight right skew).',
            '`.mode()` returns the most frequent value(s); `[0]` takes the first.',
            '…',
            'Group by neighborhood and take each group’s median (Module 5 explains groupby).',
            '…',
            'Five similar values (in \$1000s).',
            'Mean 312 and median 310 are close.',
            'Add one extreme outlier.',
            'The mean jumps to ~1093 while the median only moves to 315.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Reporting only the mean for skewed data like income or delivery time.', fix: 'Report the median too (and show the distribution).' },
        { mistake: 'Calculating a mean of categorical codes (e.g. region 1–4).', fix: 'Use the mode and counts for categorical data.' },
        { mistake: 'Treating a convenience sample as representative.', fix: 'Ask how the sample was selected and who might be missing.' },
      ],
      exercises: [
        {
          id: 's1-ex1', title: 'Mean vs median', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Compute \`mean_t\` and \`median_t\` of the delivery times (in days) using the \`statistics\` module.`,
          starter: md`
import statistics
times = [2, 3, 3, 4, 2, 3, 21, 3, 4]
mean_t = 0
median_t = 0
print(mean_t, median_t)
`,
          solution: md`
import statistics
times = [2, 3, 3, 4, 2, 3, 21, 3, 4]
mean_t = statistics.mean(times)
median_t = statistics.median(times)
print(mean_t, median_t)
`,
          tests: md`
assert abs(mean_t - 5) < 1e-9, f"mean should be 5, got {mean_t}"
assert median_t == 3, f"median should be 3, got {median_t}"
`,
          hints: ['`statistics.mean(...)` and `statistics.median(...)`.'],
        },
        {
          id: 's1-ex2', title: 'Median income by gender', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`From \`data/mall_customers.csv\`, compute the median \`annual_income_k\` for each \`gender\` as a Series \`med\` (index = gender).`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/mall_customers.csv")
med = None
print(med)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/mall_customers.csv")
med = df.groupby("gender")["annual_income_k"].median()
print(med)
`,
          tests: md`
exp = pd.read_csv("data/mall_customers.csv").groupby("gender")["annual_income_k"].median()
assert med is not None and set(med.index) == {"Female", "Male"}, "Index should be the two genders"
assert (med.sort_index() - exp.sort_index()).abs().max() < 1e-9, "Values don't match the medians"
`,
          hints: ['`df.groupby("gender")["annual_income_k"].median()`'],
        },
        {
          id: 's1-ex3', title: 'Which measure?', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`For the variable “favourite payment method” (card/cash/e-wallet), which measure of centre is appropriate? (one word)`,
          solution: 'mode', accepted: ['mode'],
          hints: ['Payment method is nominal: you cannot average or sort it.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'A survey of 500 voters is used to estimate support among all 10 million voters. The 500 voters are the…', options: ['Population', 'Sample', 'Parameter', 'Census'], answer: 1, explanation: 'The observed subset is the sample.' },
        { id: 'q2', kind: 'text', difficulty: 'beginner', prompt: 'What is the median of 7, 1, 9, 3, 5?', accepted: ['5'], explanation: 'Sorted: 1, 3, 5, 7, 9 → middle value 5.' },
        { id: 'q3', kind: 'text', difficulty: 'beginner', prompt: 'What is the median of 4, 8, 6, 2?', accepted: ['5', '5.0'], explanation: 'Sorted 2, 4, 6, 8 → mean of 4 and 6 = 5.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'In a right-skewed distribution, typically…', options: ['mean < median', 'mean = median', 'mean > median', 'there is no median'], answer: 2, explanation: 'The long right tail pulls the mean upward.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'μ (mu) denotes…', options: ['The sample mean', 'The population mean', 'The median', 'The standard deviation'], answer: 1, explanation: 'Greek letters typically denote population parameters.' },
        { id: 'q6', kind: 'mcq', difficulty: 'beginner', prompt: 'Which measure is most robust to outliers?', options: ['Mean', 'Median', 'Range', 'Sum'], answer: 1, explanation: 'The median depends only on the middle of the sorted data.' },
      ],
      summary: [
        'Population vs sample; parameters (μ, σ) vs statistics (x̄, s).',
        'Mean uses all values but is outlier-sensitive; median is robust; mode for categories.',
        'Skew: mean pulled toward the long tail.',
        'Representative (random) samples are needed for valid conclusions.',
      ],
      resources: [OIS, KHAN_STATS],
    },
    {
      id: 'stats-spread',
      title: 'Spread: Range, Variance, Standard Deviation, Quartiles & Percentiles',
      minutes: 40,
      difficulty: 'beginner',
      objectives: [
        'Compute range, variance and standard deviation (sample vs population)',
        'Compute quartiles, percentiles and the IQR',
        'Detect outliers with the 1.5 × IQR rule and read a box plot',
        'Standardise values with z-scores',
      ],
      intro: md`
Two classes can both average 75% on a test — one where everyone scored 70–80 and one where scores ranged from 30 to 100. The **average hides the spread**. Measures of variability tell you how consistent, risky or unusual values are.
`,
      simple: md`
- **Range** = largest − smallest. Simple but driven entirely by two extreme values.
- **Standard deviation** ≈ “the typical distance of values from the mean”. Small SD → values are tightly bunched; large SD → spread out.
- **Quartiles** split sorted data into four equal parts. The middle 50% lies between Q1 (25th percentile) and Q3 (75th percentile); that width is the **IQR**.
- A **percentile** says what % of values are below a point: scoring at the 90th percentile means you beat 90% of test-takers.
`,
      technical: md`
### Variance and standard deviation
- Population: $\sigma^2 = \frac{1}{N}\sum (x_i - \mu)^2$, $\;\sigma = \sqrt{\sigma^2}$.
- Sample: $s^2 = \frac{1}{n-1}\sum (x_i - \bar{x})^2$. Dividing by $n - 1$ (**Bessel’s correction**) makes $s^2$ an unbiased estimate of $\sigma^2$.
- SD is in the **same units** as the data; variance is in squared units.
- Defaults differ! NumPy \`np.std(x)\` uses $n$ (\`ddof=0\`); pandas \`Series.std()\` uses $n-1$ (\`ddof=1\`).

### Quartiles, percentiles, IQR
- $Q_1$ = 25th percentile, $Q_2$ = median, $Q_3$ = 75th percentile. $\text{IQR} = Q_3 - Q_1$.
- Several interpolation methods exist; NumPy/pandas default to linear interpolation.
- **Outlier rule (Tukey fences):** below $Q_1 - 1.5\,\text{IQR}$ or above $Q_3 + 1.5\,\text{IQR}$.
- **Five-number summary:** min, Q1, median, Q3, max — drawn as a **box plot**.

### Coefficient of variation
$\text{CV} = s / \bar{x}$ compares variability across variables with different units/scales.

### z-scores
$z = \dfrac{x - \bar{x}}{s}$: how many standard deviations a value is from the mean. Lets you compare values on different scales (a score of 80 in a hard test vs 90 in an easy one). |z| > 3 is often considered unusual.
`,
      terms: [
        ['Range', 'Maximum minus minimum.'],
        ['Variance', 'Average squared deviation from the mean.'],
        ['Standard deviation', 'Square root of variance; typical deviation in original units.'],
        ['Quartile', 'Values splitting sorted data into four equal parts (Q1, Q2, Q3).'],
        ['Percentile', 'Value below which a given percentage of observations fall.'],
        ['IQR', 'Interquartile range = Q3 − Q1; spread of the middle 50%.'],
        ['z-score', 'Number of standard deviations a value is from the mean.'],
        ['Box plot', 'Chart of the five-number summary plus outliers.'],
      ],
      realWorld: md`
**Investment risk.** Two funds both returned 7% per year on average. Fund A’s annual returns have SD 3%; Fund B’s have SD 18%. Fund B is far riskier — in a bad year it could lose 30%. In finance, standard deviation of returns is literally called **volatility**.

**Delivery promises.** An e-commerce company promises delivery within the 95th percentile of historical delivery times, so 95% of orders arrive on time.
`,
      steps: [
        'Compute the mean and standard deviation for a quick overview.',
        'Compute the five-number summary and IQR for a robust view.',
        'Draw a box plot to see spread and outliers.',
        'Flag outliers with the 1.5 × IQR rule — then investigate, don’t blindly delete.',
        'Use z-scores to compare values from different scales.',
      ],
      code: [
        {
          title: 'Spread statistics and outliers',
          code: md`
import numpy as np
import pandas as pd

scores = pd.Series([55, 62, 68, 70, 71, 73, 75, 78, 80, 84, 88, 99, 30])

print("range:", scores.max() - scores.min())
print("sample variance:", round(scores.var(), 2), " sample SD:", round(scores.std(), 2))
print("population SD (numpy default):", round(np.std(scores), 2))

q1, q2, q3 = scores.quantile([0.25, 0.5, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(f"Q1={q1}, median={q2}, Q3={q3}, IQR={iqr}")
print("outliers:", scores[(scores < low) | (scores > high)].tolist())
print("90th percentile:", scores.quantile(0.9))

z = (scores - scores.mean()) / scores.std()
print("z-score of 99:", round(z.iloc[11], 2))
`,
          explanation: [
            '…',
            '…',
            'Test scores including a very low value (30).',
            'Range = 99 − 30 = 69.',
            'pandas `.var()` / `.std()` use n − 1 (sample) by default.',
            'NumPy’s `np.std` divides by n by default — slightly smaller. Always know which you use!',
            '`.quantile()` with a list returns the three quartiles; we unpack them.',
            'IQR = Q3 − Q1.',
            'Tukey fences.',
            'Print the summary.',
            'Boolean filter for values outside the fences → [30].',
            'The value below which 90% of scores fall.',
            'Standardise every score into a z-score.',
            '99 is about 1.7 SDs above the mean — high but not extreme.',
          ],
        },
        {
          title: 'Box plots compare spread across groups',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt

houses = pd.read_csv("data/houses.csv")
order = houses.groupby("neighborhood")["price"].median().sort_values().index
data = [houses.loc[houses["neighborhood"] == n, "price"] / 1000 for n in order]

plt.figure(figsize=(8, 4))
plt.boxplot(data, labels=list(order))
plt.ylabel("Price ($1000s)")
plt.title("House prices by neighborhood")
plt.show()

print(houses.groupby("neighborhood")["price"].describe()[["25%", "50%", "75%"]].round(-3))
`,
          explanation: [
            '…',
            '…',
            'Load data.',
            'Order neighborhoods by median price for a readable chart.',
            'One Series of prices (in \$1000s) per neighborhood.',
            'Start a figure.',
            'Box plot: box = IQR, middle line = median, whiskers = 1.5 × IQR range, dots = outliers.',
            'Axis label.',
            '…',
            'Show it.',
            '`describe()` gives quartiles per group — the numbers behind the boxes.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Mixing numpy (`ddof=0`) and pandas (`ddof=1`) standard deviations and getting different numbers.', fix: 'Pass `ddof` explicitly when it matters.' },
        { mistake: 'Deleting every outlier automatically.', fix: 'Outliers may be errors — or your most important customers. Investigate first.' },
        { mistake: 'Interpreting variance in original units.', fix: 'Variance is in squared units; report the standard deviation.' },
      ],
      exercises: [
        {
          id: 's2-ex1', title: 'Sample standard deviation', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Implement \`sample_sd(xs)\` from the formula $s = \sqrt{\frac{1}{n-1}\sum (x_i - \bar{x})^2}$ (no libraries except \`math\`).`,
          starter: md`
import math

def sample_sd(xs):
    return 0

print(sample_sd([2, 4, 4, 4, 5, 5, 7, 9]))
`,
          solution: md`
import math

def sample_sd(xs):
    n = len(xs)
    m = sum(xs) / n
    return math.sqrt(sum((x - m) ** 2 for x in xs) / (n - 1))

print(sample_sd([2, 4, 4, 4, 5, 5, 7, 9]))
`,
          tests: md`
import statistics
for data in ([2, 4, 4, 4, 5, 5, 7, 9], [10, 12], [1.5, 2.5, 9.0, 4.25]):
    assert abs(sample_sd(data) - statistics.stdev(data)) < 1e-9, f"wrong for {data}"
`,
          hints: ['Compute the mean first.', 'Divide the sum of squared deviations by n − 1, then take the square root.'],
        },
        {
          id: 's2-ex2', title: 'Find outliers with the IQR rule', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`In \`data/houses.csv\`, count how many \`price\` values are outliers by the 1.5 × IQR rule. Store the count in \`n_outliers\`.`,
          starter: md`
import pandas as pd
price = pd.read_csv("data/houses.csv")["price"]
n_outliers = 0
print(n_outliers)
`,
          solution: md`
import pandas as pd
price = pd.read_csv("data/houses.csv")["price"]
q1, q3 = price.quantile([0.25, 0.75])
iqr = q3 - q1
n_outliers = int(((price < q1 - 1.5 * iqr) | (price > q3 + 1.5 * iqr)).sum())
print(n_outliers)
`,
          tests: md`
_p = pd.read_csv("data/houses.csv")["price"]
_q1, _q3 = _p.quantile([0.25, 0.75]); _i = _q3 - _q1
_exp = int(((_p < _q1 - 1.5 * _i) | (_p > _q3 + 1.5 * _i)).sum())
assert _exp > 0
assert n_outliers == _exp, f"Expected {_exp}, got {n_outliers}"
`,
          hints: ['`price.quantile([0.25, 0.75])` gives Q1 and Q3.', 'Combine the two conditions with `|` and `.sum()` the booleans.'],
        },
        {
          id: 's2-ex3', title: 'Compare with z-scores', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`Ana scored 82 on a test with mean 70 and SD 6. Ben scored 90 on a test with mean 80 and SD 10. Who did relatively better? (name)`,
          solution: 'Ana', accepted: ['ana'],
          hints: ['Ana: z = (82−70)/6 = 2. Ben: z = (90−80)/10 = 1.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which measure is in the same units as the data?', options: ['Variance', 'Standard deviation', 'Both', 'Neither'], answer: 1, explanation: 'Variance is in squared units; SD is its square root.' },
        { id: 'q2', kind: 'text', difficulty: 'intermediate', prompt: 'Q1 = 20, Q3 = 50. What is the upper outlier fence (Q3 + 1.5·IQR)?', accepted: ['95'], explanation: 'IQR = 30; 50 + 45 = 95.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why does the sample variance divide by n − 1?', options: ['To make it larger for safety', 'To give an unbiased estimate of the population variance', 'Because one value is always an outlier', 'It is a convention with no reason'], answer: 1, explanation: 'Using x̄ instead of μ underestimates spread; n − 1 corrects this bias.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'Scoring at the 80th percentile means…', options: ['You scored 80%', '80% of people scored below you', 'You are in the top 80%', 'You answered 80 questions'], answer: 1, explanation: 'Percentiles describe position, not the score itself.' },
        { id: 'q5', kind: 'text', difficulty: 'beginner', prompt: 'A value of 130 with mean 100 and SD 15 has z-score = ?', accepted: ['2', '2.0'], explanation: '(130 − 100) / 15 = 2.' },
      ],
      summary: [
        'Spread: range, variance, standard deviation (sample uses n − 1).',
        'Quartiles, percentiles and IQR describe the distribution robustly.',
        'Tukey fences flag outliers; box plots visualise the five-number summary.',
        'z-scores standardise values for comparison.',
      ],
      resources: [OIS, KHAN_STATS],
    },
    {
      id: 'stats-probability',
      title: 'Probability Fundamentals & Conditional Probability',
      minutes: 40,
      difficulty: 'beginner',
      widgets: ['probability-sim'],
      objectives: [
        'Define sample spaces, events and probabilities',
        'Apply the addition, complement and multiplication rules',
        'Compute conditional probabilities from tables',
        'Simulate probabilities with code and understand the law of large numbers',
      ],
      intro: md`
Data is uncertain. Will this customer churn? Will it rain? Is this email spam? **Probability** is the mathematics of uncertainty; it underpins statistics, A/B tests and every classification model.
`,
      simple: md`
Probability is a number from 0 (impossible) to 1 (certain). A fair coin lands heads with probability 0.5.

If all outcomes are equally likely: $P(\text{event}) = \dfrac{\text{favourable outcomes}}{\text{all outcomes}}$. Rolling a 6 on a die: 1/6.

**Conditional probability** means “probability given that we already know something”. The chance a random person is a professional basketball player is tiny — but *given* they are over 2.1 m tall, it is much higher. We write $P(A \mid B)$: probability of A **given** B.
`,
      technical: md`
### Basics
- **Sample space** $S$: all possible outcomes. **Event** $A \subseteq S$.
- Axioms: $0 \le P(A) \le 1$, $\;P(S) = 1$.
- **Complement:** $P(\text{not } A) = 1 - P(A)$.
- **Addition rule:** $P(A \cup B) = P(A) + P(B) - P(A \cap B)$; for mutually exclusive events $P(A \cap B) = 0$.

### Conditional probability
$$P(A \mid B) = \frac{P(A \cap B)}{P(B)}, \quad P(B) > 0$$
- **Multiplication rule:** $P(A \cap B) = P(A \mid B)\,P(B)$.
- **Independence:** $A$ and $B$ are independent if $P(A \mid B) = P(A)$, equivalently $P(A \cap B) = P(A)P(B)$. Coin flips are independent; drawing cards without replacement are not.
- **Law of total probability:** $P(A) = \sum_i P(A \mid B_i)P(B_i)$ for a partition $B_i$.

### Frequentist interpretation & simulation
Probability = long-run relative frequency. The **law of large numbers**: as trials increase, the observed proportion converges to the true probability (see the simulator). Monte-Carlo simulation estimates probabilities that are hard to compute analytically.

### Contingency tables
Two-way tables of counts make conditional probabilities easy: divide a cell by its **row or column total** (whichever is the “given”).
`,
      terms: [
        ['Sample space', 'Set of all possible outcomes.'],
        ['Event', 'A set of outcomes, e.g. “roll an even number”.'],
        ['Complement', 'The event “not A”; P = 1 − P(A).'],
        ['Mutually exclusive', 'Events that cannot happen together.'],
        ['Conditional probability', 'P(A | B): probability of A given that B occurred.'],
        ['Independence', 'Knowing one event doesn’t change the probability of the other.'],
        ['Law of large numbers', 'Observed frequencies converge to true probabilities with many trials.'],
      ],
      realWorld: md`
A telecom company’s data: 1,200 customers; 660 on month-to-month contracts, of whom 300 churned; 540 on long contracts, of whom 100 churned.

- $P(\text{churn}) = 400 / 1200 \approx 0.33$.
- $P(\text{churn} \mid \text{monthly}) = 300 / 660 \approx 0.45$; $\;P(\text{churn} \mid \text{long}) = 100/540 \approx 0.19$.

Since $P(\text{churn} \mid \text{monthly}) \neq P(\text{churn})$, churn and contract type are **not independent** — contract type is a useful predictor, and the business might offer incentives to switch to annual plans.
`,
      steps: [
        'Define the sample space and the event clearly.',
        'For “or”, use the addition rule; for “and”, the multiplication rule.',
        'For “given”, restrict attention to the conditioning group (the denominator changes!).',
        'Use a contingency table (pandas `crosstab`) for real data.',
        'Verify with a simulation when in doubt.',
      ],
      code: [
        {
          title: 'Simulation: estimating probabilities',
          code: md`
import numpy as np

rng = np.random.default_rng(42)
n = 100_000

rolls = rng.integers(1, 7, size=(n, 2))     # two dice
total = rolls.sum(axis=1)
print("P(sum = 7) ≈", (total == 7).mean(), " exact:", round(6 / 36, 4))
print("P(at least one 6) ≈", ((rolls == 6).any(axis=1)).mean(), " exact:", round(1 - (5 / 6) ** 2, 4))

# Conditional: P(sum >= 10 | first die is 6)
first_six = rolls[:, 0] == 6
print("P(sum>=10 | first=6) ≈", (total[first_six] >= 10).mean(), " exact:", 3 / 6)
`,
          explanation: [
            '…',
            'Seeded generator for reproducibility.',
            '100,000 simulated trials.',
            'A 100000 × 2 array of dice rolls (1–6; the upper bound 7 is excluded).',
            'Sum each row.',
            'The mean of a boolean array is the proportion of True → ≈ 0.1667 = 6/36.',
            'Complement rule: P(at least one 6) = 1 − P(no 6) = 1 − (5/6)² ≈ 0.3056.',
            '…',
            'Restrict to trials where the first die is 6…',
            '…then the sum ≥ 10 needs a second die of 4, 5 or 6 → 3/6 = 0.5.',
          ],
        },
        {
          title: 'Conditional probability from real data',
          code: md`
import pandas as pd

churn = pd.read_csv("data/churn.csv")
table = pd.crosstab(churn["contract"], churn["churn"], margins=True)
print(table, "\n")

p_churn = (churn["churn"] == "Yes").mean()
p_given = churn.groupby("contract")["churn"].apply(lambda s: (s == "Yes").mean())
print("P(churn) =", round(p_churn, 3))
print("P(churn | contract):")
print(p_given.round(3))
`,
          explanation: [
            '…',
            'Load the telecom dataset.',
            '`crosstab` counts customers for each contract × churn combination; `margins=True` adds totals.',
            'Print the contingency table.',
            'Overall churn probability: the proportion of “Yes”.',
            'For each contract type, the proportion who churned = P(churn | contract).',
            '…',
            'Month-to-month customers churn far more than two-year customers → not independent.',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Confusing P(A | B) with P(B | A) (“most spam contains ‘free’” ≠ “most emails with ‘free’ are spam”).', fix: 'Identify which event is given; it determines the denominator.' },
        { mistake: 'Adding probabilities of overlapping events.', fix: 'Subtract the overlap: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).' },
        { mistake: 'Gambler’s fallacy: “after 5 heads, tails is due”.', fix: 'Independent events have no memory.' },
      ],
      exercises: [
        {
          id: 's3-ex1', title: 'Simulate a coin', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Simulate 10,000 fair coin flips with \`rng.integers(0, 2, 10000)\` (1 = heads) and store the proportion of heads in \`p_heads\`.`,
          starter: md`
import numpy as np
rng = np.random.default_rng(7)
p_heads = 0
print(p_heads)
`,
          solution: md`
import numpy as np
rng = np.random.default_rng(7)
flips = rng.integers(0, 2, 10000)
p_heads = flips.mean()
print(p_heads)
`,
          tests: md`assert 0.48 < p_heads < 0.52, f"Proportion should be near 0.5, got {p_heads}"`,
          hints: ['The mean of 0/1 values is the proportion of 1s.'],
        },
        {
          id: 's3-ex2', title: 'Conditional probability from data', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Using \`data/churn.csv\`, compute \`p\` = P(churn = "Yes" | tech_support = "Yes").`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
p = 0
print(p)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
with_support = df[df["tech_support"] == "Yes"]
p = (with_support["churn"] == "Yes").mean()
print(p)
`,
          tests: md`
_d = pd.read_csv("data/churn.csv")
_e = (_d.loc[_d.tech_support == "Yes", "churn"] == "Yes").mean()
assert abs(p - _e) < 1e-9, f"Expected {_e:.4f}, got {p}"
`,
          hints: ['First filter rows where tech_support is "Yes".', 'Then compute the proportion of churn == "Yes" in that subset.'],
        },
        {
          id: 's3-ex3', title: 'Complement rule', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`A server fails on a given day with probability 0.02. Assuming independence, what is the probability it does **not** fail on two consecutive days? (decimal, 4 places)`,
          solution: '0.9604', accepted: ['0.9604'],
          hints: ['P(no fail one day) = 0.98; multiply for two independent days.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'P(rolling an even number on a fair die) = ? (fraction or decimal)', accepted: ['1/2', '0.5', '3/6'], explanation: '{2, 4, 6} → 3/6.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'P(A) = 0.5, P(B) = 0.4, P(A and B) = 0.2. P(A or B) = ?', options: ['0.9', '0.7', '0.2', '0.1'], answer: 1, explanation: '0.5 + 0.4 − 0.2 = 0.7.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'In the example above (P(A)=0.5, P(B)=0.4, P(A∩B)=0.2), are A and B independent?', options: ['Yes, because P(A)P(B) = 0.2', 'No', 'Cannot tell', 'Only if they are exclusive'], answer: 0, explanation: '0.5 × 0.4 = 0.2 = P(A ∩ B).' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'P(A | B) is computed as…', options: ['P(A) × P(B)', 'P(A ∩ B) / P(B)', 'P(A ∩ B) / P(A)', 'P(B) / P(A)'], answer: 1, explanation: 'Restrict to B, so divide by P(B).' },
        { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'The law of large numbers says that as the number of trials grows…', options: ['Outcomes become more extreme', 'The observed proportion approaches the true probability', 'Every outcome becomes equally likely', 'Variance increases'], answer: 1, explanation: 'Relative frequencies converge.' },
      ],
      summary: [
        'Probabilities range from 0 to 1; complement, addition and multiplication rules.',
        'P(A | B) = P(A ∩ B) / P(B); independence means P(A | B) = P(A).',
        'Contingency tables and groupby make conditional probabilities easy.',
        'Simulation estimates probabilities; frequencies converge with many trials.',
      ],
      resources: [SEEING, OIS],
    },
    {
      id: 'stats-bayes',
      title: 'Bayes’ Theorem',
      minutes: 30,
      difficulty: 'intermediate',
      widgets: ['bayes'],
      objectives: [
        'State Bayes’ theorem and name its parts (prior, likelihood, evidence, posterior)',
        'Solve medical-test and spam-filter style problems',
        'Explain the base-rate fallacy',
        'Implement Bayesian updating in code',
      ],
      intro: md`
Bayes’ theorem tells you how to **update a belief when you see new evidence**. It powers spam filters, medical diagnosis, A/B testing, recommendation systems and the Naive Bayes classifier — and it explains one of the most common reasoning errors humans make.
`,
      simple: md`
Suppose 1% of people have a disease. A test catches 95% of sick people, but also wrongly flags 10% of healthy people.

You test positive. Are you 95% likely to be sick? **No!** Imagine 1,000 people:
- 10 are sick → about 9.5 test positive.
- 990 are healthy → 99 test positive (false alarms).

Of the ~108.5 positives, only 9.5 are actually sick: **about 9%**. Because the disease is rare, false alarms outnumber true cases. Bayes’ theorem does this calculation formally. Play with the sliders above!
`,
      technical: md`
$$P(A \mid B) = \frac{P(B \mid A)\,P(A)}{P(B)}$$

| Part | Name | Meaning (disease example) |
|---|---|---|
| $P(A)$ | **Prior** | prevalence before testing |
| $P(B \mid A)$ | **Likelihood** | sensitivity: P(positive \| disease) |
| $P(B)$ | **Evidence** | overall P(positive) |
| $P(A \mid B)$ | **Posterior** | P(disease \| positive) |

The evidence comes from the law of total probability:
$$P(B) = P(B \mid A)P(A) + P(B \mid \neg A)P(\neg A)$$

**Base-rate fallacy:** ignoring the prior. With rare events, even accurate tests produce mostly false positives.

**Sequential updating:** today’s posterior becomes tomorrow’s prior. Testing positive twice (independent tests) raises the probability much more.

**Naive Bayes classifier:** for a class $C$ and features $x_1..x_n$, assume features are independent given the class:
$P(C \mid x) \propto P(C)\prod_i P(x_i \mid C)$ — fast, works well for text (spam detection).
`,
      terms: [
        ['Prior', 'Probability of a hypothesis before seeing the evidence.'],
        ['Likelihood', 'Probability of the evidence if the hypothesis is true.'],
        ['Posterior', 'Updated probability of the hypothesis after the evidence.'],
        ['Sensitivity', 'True positive rate: P(test + | condition).'],
        ['Specificity', 'True negative rate: P(test − | no condition).'],
        ['Base-rate fallacy', 'Ignoring how common something is when interpreting evidence.'],
      ],
      realWorld: md`
**Spam filtering.** 40% of emails are spam. The word “winner” appears in 20% of spam and 1% of legitimate mail. For an email containing “winner”:

$P(\text{spam} \mid \text{winner}) = \dfrac{0.20 \times 0.40}{0.20 \times 0.40 + 0.01 \times 0.60} = \dfrac{0.08}{0.086} \approx 0.93$.

Real filters combine hundreds of words this way (Naive Bayes), updating as users mark mail as spam.
`,
      steps: [
        'Identify the hypothesis A and the evidence B.',
        'Write down the prior P(A), likelihood P(B | A) and P(B | not A).',
        'Compute the evidence P(B) with the law of total probability.',
        'Apply Bayes: posterior = likelihood × prior / evidence.',
        'Sanity-check with a frequency table of 10,000 imaginary people.',
      ],
      code: [
        {
          title: 'Bayes’ theorem as a function, plus sequential updating',
          code: md`
def posterior(prior, sensitivity, specificity):
    p_pos_given_d = sensitivity
    p_pos_given_not = 1 - specificity
    evidence = p_pos_given_d * prior + p_pos_given_not * (1 - prior)
    return p_pos_given_d * prior / evidence

p1 = posterior(prior=0.01, sensitivity=0.95, specificity=0.90)
print(f"after 1 positive test: {p1:.1%}")

p2 = posterior(prior=p1, sensitivity=0.95, specificity=0.90)
print(f"after 2 positive tests: {p2:.1%}")

spam = posterior(prior=0.40, sensitivity=0.20, specificity=0.99)
print(f"P(spam | 'winner') = {spam:.1%}")
`,
          explanation: [
            'A function: prior and test characteristics in, posterior out.',
            'Likelihood of a positive if sick.',
            'False-positive rate = 1 − specificity.',
            'Evidence P(positive) via the law of total probability.',
            'Bayes’ theorem.',
            '…',
            'A rare disease (1%) and a decent test.',
            '≈ 8.8% — far below 95%!',
            '…',
            'The posterior becomes the new prior for a second, independent test…',
            '≈ 47.9%.',
            '…',
            'The spam example reuses the same function (“specificity” = P(no “winner” | legit) = 0.99).',
            '≈ 93.0%.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Equating P(positive | disease) with P(disease | positive).', fix: 'These differ; Bayes’ theorem converts one into the other using the prior.' },
        { mistake: 'Forgetting false positives when computing P(evidence).', fix: 'P(B) includes both true and false positives.' },
      ],
      exercises: [
        {
          id: 's4-ex1', title: 'Implement Bayes', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Write \`bayes(p_a, p_b_given_a, p_b_given_not_a)\` returning $P(A \mid B)$.`,
          starter: md`
def bayes(p_a, p_b_given_a, p_b_given_not_a):
    return 0

print(bayes(0.01, 0.95, 0.10))
`,
          solution: md`
def bayes(p_a, p_b_given_a, p_b_given_not_a):
    evidence = p_b_given_a * p_a + p_b_given_not_a * (1 - p_a)
    return p_b_given_a * p_a / evidence

print(bayes(0.01, 0.95, 0.10))
`,
          tests: md`
assert abs(bayes(0.01, 0.95, 0.10) - 0.0876) < 1e-3
assert abs(bayes(0.4, 0.2, 0.01) - 0.9302) < 1e-3
assert abs(bayes(0.5, 0.5, 0.5) - 0.5) < 1e-9, "Uninformative evidence should not change the prior"
`,
          hints: ['Evidence = P(B|A)P(A) + P(B|¬A)(1 − P(A)).'],
        },
        {
          id: 's4-ex2', title: 'Fraud alert', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`0.1% of transactions are fraud. An alert fires for 99% of frauds and 1% of legitimate transactions. Approximately what % of alerts are real fraud? (whole number)`,
          solution: '9', accepted: ['9', '9%', '9.0'],
          hints: ['Per 100,000 transactions: 100 frauds → 99 alerts; 99,900 legit → 999 alerts.', '99 / (99 + 999) ≈ 0.09.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'In Bayes’ theorem, the **prior** is…', options: ['The probability after seeing evidence', 'The probability before seeing evidence', 'The probability of the evidence', 'The test accuracy'], answer: 1, explanation: 'The prior is your belief before the new data.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why can an accurate test give mostly false positives?', options: ['Tests are always biased', 'When the condition is rare, false positives from the large healthy group outnumber true positives', 'Because sensitivity is low', 'Because specificity is 100%'], answer: 1, explanation: 'This is the base-rate effect.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does P(B) represent in Bayes’ theorem?', options: ['The posterior', 'The total probability of observing the evidence', 'The prior of B', 'P(A and B)'], answer: 1, explanation: 'It normalises the posterior.' },
        { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'Naive Bayes is “naive” because it assumes…', options: ['All classes are equally likely', 'Features are independent given the class', 'The data is normal', 'There are only two features'], answer: 1, explanation: 'Conditional independence of features simplifies the computation.' },
      ],
      summary: [
        'Posterior = likelihood × prior / evidence.',
        'Evidence comes from the law of total probability.',
        'Base rates matter: rare events produce many false positives.',
        'Posteriors become new priors as evidence accumulates; Naive Bayes applies this to classification.',
      ],
      resources: [{ label: '3Blue1Brown — Bayes theorem', url: 'https://www.3blue1brown.com/lessons/bayes-theorem' }, SEEING],
    },
    {
      id: 'stats-distributions',
      title: 'Random Variables & Probability Distributions (Normal, Binomial)',
      minutes: 45,
      difficulty: 'intermediate',
      widgets: ['distributions'],
      objectives: [
        'Distinguish discrete and continuous random variables',
        'Compute expected value and variance',
        'Use the binomial and normal distributions (PMF, PDF, CDF)',
        'Apply the 68–95–99.7 rule and compute probabilities with scipy.stats',
      ],
      intro: md`
A **distribution** describes all the values a random quantity can take and how likely each is. Recognising common distributions lets you compute probabilities (“what’s the chance more than 30 customers buy today?”), build confidence intervals and choose models.
`,
      simple: md`
A **random variable** is a number whose value depends on chance: the number of heads in 10 flips, tomorrow’s temperature.

- **Binomial:** count successes in a fixed number of yes/no trials. *“Of 20 visitors, each buys with probability 0.3 — how many buy?”*
- **Normal (bell curve):** many natural measurements cluster around an average with symmetric spread — heights, measurement errors, test scores. Most values (68%) are within 1 standard deviation of the mean, 95% within 2, 99.7% within 3.
`,
      technical: md`
### Random variables
- **Discrete** (countable values) → **PMF** $P(X = k)$.
- **Continuous** → **PDF** $f(x)$; probabilities are **areas**: $P(a \le X \le b) = \int_a^b f(x)\,dx$, and $P(X = x) = 0$ for any single value.
- **CDF** $F(x) = P(X \le x)$ for both.
- **Expected value** $E[X] = \sum k\,P(X=k)$ (or $\int x f(x)dx$); **variance** $\text{Var}(X) = E[(X - E[X])^2]$.

### Bernoulli and Binomial
- Bernoulli($p$): one trial, 1 with prob. $p$. $E = p$, Var $= p(1-p)$.
- Binomial($n, p$): number of successes in $n$ independent trials:
$$P(X = k) = \binom{n}{k}p^k(1-p)^{n-k}, \quad E[X] = np,\; \text{Var}(X) = np(1-p)$$

### Normal $\mathcal{N}(\mu, \sigma^2)$
$$f(x) = \frac{1}{\sigma\sqrt{2\pi}}\exp\!\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$$
- Symmetric, mean = median = mode = $\mu$.
- **Standard normal** $Z \sim \mathcal{N}(0, 1)$; standardise with $Z = (X - \mu)/\sigma$.
- **68–95–99.7 rule** (more precisely 95% within ±1.96σ).

### Other useful distributions
**Uniform** (all values equally likely), **Poisson** (counts per interval: calls per hour, $E = \text{Var} = \lambda$), **Exponential** (waiting times), **t-distribution** (like normal with heavier tails; used for small-sample inference).

In Python: \`scipy.stats.binom.pmf/cdf\`, \`scipy.stats.norm.cdf/ppf\`, \`numpy.random.default_rng().normal/binomial\`.
`,
      terms: [
        ['Random variable', 'A numeric quantity whose value depends on chance.'],
        ['PMF', 'Probability mass function: P(X = k) for discrete X.'],
        ['PDF', 'Probability density function for continuous X; areas give probabilities.'],
        ['CDF', 'P(X ≤ x).'],
        ['Expected value', 'Long-run average value of a random variable.'],
        ['Binomial distribution', 'Number of successes in n independent trials with success probability p.'],
        ['Normal distribution', 'Symmetric bell-shaped distribution defined by μ and σ.'],
        ['ppf', 'Percent-point function (inverse CDF): value at a given cumulative probability.'],
      ],
      realWorld: md`
**Call centre staffing.** Each of 200 customers on a list calls back with probability 0.05. The number of callbacks is Binomial(200, 0.05): expected 10, SD ≈ 3.1. P(more than 16 callbacks) ≈ 2.7% — so staffing for 16 calls covers ~97% of days.

**Manufacturing.** Bolt lengths are $\mathcal{N}(50\,\text{mm}, 0.2^2)$. Bolts outside 49.6–50.4 mm (±2σ) are rejected: about 4.6% of production.
`,
      steps: [
        'Decide whether the variable is discrete (counts) or continuous (measurements).',
        'Match the scenario: fixed trials & yes/no → binomial; symmetric measurement → normal; counts per interval → Poisson.',
        'Identify the parameters (n, p) or (μ, σ).',
        'Compute probabilities with the CDF; quantiles with the ppf.',
        'Check the fit by plotting a histogram of real data against the distribution.',
      ],
      code: [
        {
          title: 'Binomial and normal probabilities with scipy.stats',
          code: md`
from scipy import stats

calls = stats.binom(n=200, p=0.05)
print("E[X] =", calls.mean(), " SD =", round(calls.std(), 2))
print("P(X = 10) =", round(calls.pmf(10), 4))
print("P(X > 16) =", round(1 - calls.cdf(16), 4))

bolts = stats.norm(loc=50, scale=0.2)
p_reject = bolts.cdf(49.6) + (1 - bolts.cdf(50.4))
print("P(reject) =", round(p_reject, 4))
print("95th percentile length:", round(bolts.ppf(0.95), 3))

z = stats.norm(0, 1)
for k in (1, 2, 3):
    print(f"within ±{k}σ: {z.cdf(k) - z.cdf(-k):.4f}")
`,
          explanation: [
            'scipy.stats contains most probability distributions.',
            'A “frozen” Binomial(200, 0.05) distribution object.',
            'Expected value np = 10; SD = √(np(1−p)) ≈ 3.08.',
            'PMF: probability of exactly 10 callbacks ≈ 0.128.',
            'P(X > 16) = 1 − P(X ≤ 16) ≈ 0.027.',
            'Bolt lengths ~ Normal(50, 0.2).',
            'Rejected if below 49.6 or above 50.4: two tails ≈ 0.0455.',
            '…',
            '`ppf` is the inverse CDF: 95% of bolts are shorter than ≈ 50.329 mm.',
            'The standard normal.',
            'Verify the 68–95–99.7 rule numerically.',
            '…',
          ],
        },
        {
          title: 'Simulated vs theoretical distributions',
          code: md`
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

rng = np.random.default_rng(3)
sim = rng.binomial(n=20, p=0.3, size=10_000)
k = np.arange(0, 21)

fig, ax = plt.subplots(1, 2, figsize=(9, 3))
ax[0].hist(sim, bins=np.arange(-0.5, 21.5), density=True, color="#a5b4fc", label="simulated")
ax[0].plot(k, stats.binom.pmf(k, 20, 0.3), "o-", color="#4f46e5", label="Binomial PMF")
ax[0].legend(); ax[0].set_title("Buyers out of 20 visitors")

heights = rng.normal(165, 7, 5000)
xs = np.linspace(135, 195, 200)
ax[1].hist(heights, bins=40, density=True, color="#a7f3d0")
ax[1].plot(xs, stats.norm.pdf(xs, 165, 7), color="#047857")
ax[1].set_title("Heights ~ N(165, 7²)")
plt.tight_layout(); plt.show()
print("simulated mean:", sim.mean(), " theory:", 20 * 0.3)
`,
          explanation: [
            '…',
            '…',
            '…',
            'Seeded generator.',
            '10,000 simulated days, each counting buyers among 20 visitors.',
            'Possible values 0–20.',
            'Two plots side by side.',
            'Histogram of simulations, normalised (`density=True`) to compare with probabilities.',
            'Theoretical PMF on top — they match closely.',
            '…',
            'Simulated heights from a normal distribution.',
            'x values for the curve.',
            'Histogram…',
            '…with the theoretical PDF overlaid.',
            '…',
            '…',
            'Sample mean ≈ np = 6.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Asking for P(X = 170 cm) with a continuous variable.', fix: 'For continuous variables use intervals: P(169.5 < X < 170.5).' },
        { mistake: 'Using the binomial when trials aren’t independent or p changes.', fix: 'Check the assumptions: fixed n, independent trials, constant p.' },
        { mistake: 'Assuming all data is normal.', fix: 'Plot it! Incomes, waiting times and counts are often skewed.' },
        { mistake: 'Confusing `scale` with variance in `stats.norm(loc, scale)`.', fix: '`scale` is the standard deviation σ.' },
      ],
      exercises: [
        {
          id: 's5-ex1', title: 'Binomial probability', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`A free-throw shooter makes 70% of shots. Using \`scipy.stats.binom\`, compute \`p_at_least_8\` = P(at least 8 makes out of 10).`,
          starter: md`
from scipy import stats
p_at_least_8 = 0
print(p_at_least_8)
`,
          solution: md`
from scipy import stats
p_at_least_8 = 1 - stats.binom.cdf(7, 10, 0.7)
print(p_at_least_8)
`,
          tests: md`assert abs(p_at_least_8 - 0.3828) < 1e-3, f"Expected ≈ 0.3828, got {p_at_least_8}"`,
          hints: ['P(X ≥ 8) = 1 − P(X ≤ 7).', '`stats.binom.cdf(7, 10, 0.7)`'],
        },
        {
          id: 's5-ex2', title: 'Normal probability', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Exam scores are $\mathcal{N}(72, 9^2)$. Compute \`p_above_90\` = P(score > 90) and \`cutoff\` = the score that the top 10% exceed.`,
          starter: md`
from scipy import stats
p_above_90 = 0
cutoff = 0
print(p_above_90, cutoff)
`,
          solution: md`
from scipy import stats
dist = stats.norm(72, 9)
p_above_90 = 1 - dist.cdf(90)
cutoff = dist.ppf(0.90)
print(p_above_90, cutoff)
`,
          tests: md`
assert abs(p_above_90 - 0.02275) < 1e-4, f"P(score > 90) should be ≈ 0.0228, got {p_above_90}"
assert abs(cutoff - 83.534) < 0.01, f"Top-10% cutoff should be ≈ 83.53, got {cutoff}"
`,
          hints: ['90 is exactly 2 SDs above the mean.', 'The top 10% begins at the 90th percentile: `ppf(0.90)`.'],
        },
        {
          id: 's5-ex3', title: 'Expected value', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`A raffle ticket costs \$2. You win \$50 with probability 0.02, otherwise nothing. What is the expected **net** gain per ticket in dollars? (e.g. -0.5)`,
          solution: '-1', accepted: ['-1', '-1.0', '-1.00', '-$1'],
          hints: ['E[winnings] = 50 × 0.02 = 1. Subtract the cost.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'The number of defective items in a box of 50 is a…', options: ['Continuous random variable', 'Discrete random variable', 'Normal variable by definition', 'Constant'], answer: 1, explanation: 'Counts are discrete.' },
        { id: 'q2', kind: 'text', difficulty: 'beginner', prompt: 'Binomial(n = 40, p = 0.25): what is the expected value?', accepted: ['10', '10.0'], explanation: 'np = 40 × 0.25 = 10.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'About what fraction of a normal distribution lies within ±2σ of the mean?', options: ['68%', '90%', '95%', '99.7%'], answer: 2, explanation: '≈ 95% (exactly 95% at ±1.96σ).' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'For a continuous variable, P(X = 3) is…', options: ['f(3)', '0', '1', 'Undefined'], answer: 1, explanation: 'Single points have zero probability; only intervals have positive probability.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does `norm.ppf(0.5)` return for the standard normal?', options: ['0.5', '0', '1', '0.3989'], answer: 1, explanation: 'The median of N(0, 1) is 0.' },
        { id: 'q6', kind: 'mcq', difficulty: 'advanced', prompt: 'Calls arriving at a help desk per hour are best modelled by…', options: ['Normal', 'Binomial with n = 1', 'Poisson', 'Uniform'], answer: 2, explanation: 'Poisson models counts of events in a fixed interval.' },
      ],
      summary: [
        'Discrete variables have PMFs; continuous ones have PDFs (areas = probabilities).',
        'Binomial(n, p): E = np, Var = np(1 − p).',
        'Normal(μ, σ): 68–95–99.7 rule; standardise with z.',
        'scipy.stats: pmf/pdf, cdf, ppf, rvs.',
      ],
      resources: [SEEING, { label: 'scipy.stats documentation', url: 'https://docs.scipy.org/doc/scipy/reference/stats.html' }],
    },
    {
      id: 'stats-sampling-clt',
      title: 'Sampling Techniques & the Central Limit Theorem',
      minutes: 40,
      difficulty: 'intermediate',
      widgets: ['clt'],
      objectives: [
        'Describe simple random, stratified, cluster and systematic sampling',
        'Recognise sampling bias',
        'Explain the sampling distribution and standard error',
        'State and demonstrate the Central Limit Theorem',
      ],
      intro: md`
We almost never measure an entire population, so we rely on samples. How you sample determines whether your conclusions are trustworthy, and the **Central Limit Theorem** explains why sample averages behave so predictably — it is the foundation of confidence intervals and hypothesis tests.
`,
      simple: md`
To taste a pot of soup you don’t drink the whole pot — you **stir** it and take a spoonful. Stirring = random sampling: every part of the pot has an equal chance of being in your spoon.

The **Central Limit Theorem (CLT)** is a kind of magic: even if individual values are weirdly distributed (skewed incomes, waiting times), the **average of a large enough sample** follows a bell curve. Take many samples, compute each average, and those averages pile up in a normal shape — try it in the simulator.
`,
      technical: md`
### Sampling methods
| Method | How | Use |
|---|---|---|
| **Simple random** | every individual equally likely | baseline method |
| **Stratified** | split population into strata (e.g. regions), sample randomly within each | ensure representation of subgroups; often lower variance |
| **Cluster** | randomly select whole groups (schools, stores), measure everyone in them | cheaper when the population is spread out |
| **Systematic** | every k-th item from a list | simple; risky if the list has periodic patterns |
| **Convenience** | whoever is easy to reach | prone to bias — avoid for inference |

**Biases:** selection bias, non-response bias, survivorship bias, voluntary-response bias.

### Sampling distribution & standard error
The statistic (e.g. $\bar{x}$) varies from sample to sample. Its distribution is the **sampling distribution**. For the mean:
$$E[\bar{X}] = \mu, \qquad \text{SE}(\bar{X}) = \frac{\sigma}{\sqrt{n}}$$
The **standard error** shrinks with $\sqrt{n}$: 4× the data halves the uncertainty.

### Central Limit Theorem
For i.i.d. observations with mean $\mu$ and finite variance $\sigma^2$, as $n$ grows,
$$\bar{X} \approx \mathcal{N}\!\left(\mu, \frac{\sigma^2}{n}\right)$$
regardless of the population’s shape. Rule of thumb: $n \ge 30$ is often enough unless the population is extremely skewed. The CLT also applies to proportions: $\hat{p} \approx \mathcal{N}(p, p(1-p)/n)$.

### Bootstrap
Resample your sample **with replacement** many times to approximate a statistic’s sampling distribution without formulas — a powerful modern technique.
`,
      terms: [
        ['Random sample', 'Every member of the population has a known (often equal) chance of selection.'],
        ['Stratified sampling', 'Random sampling within predefined subgroups.'],
        ['Sampling bias', 'Systematic error because some members are more likely to be sampled.'],
        ['Sampling distribution', 'Distribution of a statistic over many possible samples.'],
        ['Standard error', 'Standard deviation of a sampling distribution, e.g. σ/√n.'],
        ['CLT', 'Sample means are approximately normal for large n, whatever the population shape.'],
        ['Bootstrap', 'Resampling with replacement to estimate uncertainty.'],
      ],
      realWorld: md`
**Survivorship bias:** in WWII, analysts studied bullet holes on returning bombers and proposed armouring the most-hit areas. Statistician Abraham Wald pointed out the sample only contained planes that **survived** — the areas *without* holes (engines) were where hits brought planes down. Armour went there.

**Election polling** uses stratified samples (by region, age, gender) of ~1,000 people, giving a margin of error around ±3 percentage points thanks to the CLT.
`,
      steps: [
        'Define the population precisely.',
        'Choose a sampling method that gives every relevant subgroup a fair chance.',
        'Collect a large enough sample (SE ∝ 1/√n).',
        'Compute the statistic and its standard error.',
        'Use the normal approximation (CLT) or the bootstrap for uncertainty.',
      ],
      code: [
        {
          title: 'Sampling methods with pandas',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv")
print("Population share by region:\n", sales["region"].value_counts(normalize=True).round(3))

simple = sales.sample(n=150, random_state=1)
strat = sales.groupby("region", group_keys=False).sample(frac=0.1, random_state=1)
system = sales.iloc[::10]

for name, s in [("simple", simple), ("stratified", strat), ("systematic", system)]:
    print(f"{name:11s} n={len(s):4d}  mean revenue={s['revenue'].mean():7.2f}")
print(f"{'population':11s} n={len(sales):4d}  mean revenue={sales['revenue'].mean():7.2f}")
`,
          explanation: [
            '…',
            'Our “population”: 1,500 orders.',
            'Region proportions in the population.',
            'Simple random sample of 150 rows (`random_state` makes it reproducible).',
            'Stratified: 10% from **each** region, so proportions are preserved exactly.',
            'Systematic: every 10th row.',
            'Compare the sample means with the population mean.',
            '…',
            'All are close to the true mean — random-based methods work.',
          ],
        },
        {
          title: 'Demonstrating the CLT and the bootstrap',
          code: md`
import numpy as np

rng = np.random.default_rng(0)
population = rng.exponential(scale=10, size=100_000)   # strongly right-skewed
print("population mean:", round(population.mean(), 2), " SD:", round(population.std(), 2))

for n in (2, 10, 50, 200):
    means = rng.choice(population, size=(5000, n)).mean(axis=1)
    print(f"n={n:3d}: SD of sample means={means.std():.3f}  theory σ/√n={population.std() / np.sqrt(n):.3f}")

sample = rng.choice(population, 60)
boot = [rng.choice(sample, 60, replace=True).mean() for _ in range(3000)]
print("bootstrap 95% interval for the mean:", np.percentile(boot, [2.5, 97.5]).round(2))
`,
          explanation: [
            '…',
            '…',
            'An exponential population — very skewed, nothing like a bell curve.',
            'Mean ≈ SD ≈ 10.',
            'For several sample sizes…',
            '…draw 5,000 samples of size n and compute each sample’s mean.',
            'The spread of the means matches σ/√n — the standard error — and their histogram would look normal for larger n.',
            'One actual sample of 60 observations.',
            'Bootstrap: resample it with replacement 3,000 times and recompute the mean each time.',
            'The middle 95% of bootstrap means gives an interval estimate of the true mean.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Thinking the CLT makes the **data** normal.', fix: 'It concerns the distribution of the **sample mean**, not individual values.' },
        { mistake: 'Believing a huge biased sample beats a small random one.', fix: 'Bias doesn’t shrink with n; randomness matters more than size.' },
        { mistake: 'Confusing standard deviation with standard error.', fix: 'SD describes individual values; SE describes the uncertainty of an estimate (SD/√n).' },
      ],
      exercises: [
        {
          id: 's6-ex1', title: 'Standard error', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Compute \`se\`, the standard error of the mean study hours in \`data/students.csv\`: sample SD divided by √n.`,
          starter: md`
import pandas as pd
import numpy as np
hours = pd.read_csv("data/students.csv")["study_hours_week"]
se = 0
print(se)
`,
          solution: md`
import pandas as pd
import numpy as np
hours = pd.read_csv("data/students.csv")["study_hours_week"]
se = hours.std() / np.sqrt(len(hours))
print(se)
`,
          tests: md`
_h = pd.read_csv("data/students.csv")["study_hours_week"]
assert abs(se - _h.std(ddof=1) / len(_h) ** 0.5) < 1e-9, f"Got {se}"
`,
          hints: ['`hours.std()` (ddof=1) / `np.sqrt(len(hours))`.'],
        },
        {
          id: 's6-ex2', title: 'Stratified sample', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Draw a stratified sample \`strat\` from \`data/churn.csv\` containing exactly **20%** of each \`contract\` group (use \`random_state=0\`).`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
strat = df.sample(frac=0.2, random_state=0)
print(strat["contract"].value_counts())
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
strat = df.groupby("contract", group_keys=False).sample(frac=0.2, random_state=0)
print(strat["contract"].value_counts())
`,
          tests: md`
_full = df["contract"].value_counts()
_s = strat["contract"].value_counts()
for k in _full.index:
    assert _s[k] == round(_full[k] * 0.2), f"{k}: expected {round(_full[k] * 0.2)} rows, got {_s.get(k)}"
`,
          hints: ['Group by contract first, then `.sample(frac=0.2, random_state=0)`.'],
        },
        {
          id: 's6-ex3', title: 'Shrinking uncertainty', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`If you increase a sample from 100 to 400 people, the standard error of the mean is multiplied by what factor? (decimal)`,
          solution: '0.5', accepted: ['0.5', '1/2', '.5'],
          hints: ['SE ∝ 1/√n; √(400/100) = 2.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Surveying customers by randomly sampling within each age group is…', options: ['Cluster sampling', 'Stratified sampling', 'Convenience sampling', 'Systematic sampling'], answer: 1, explanation: 'Random sampling within strata.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'The CLT says that for large n…', options: ['The data becomes normal', 'The sample mean is approximately normally distributed', 'The sample mean equals μ exactly', 'The variance grows'], answer: 1, explanation: 'It is about the sampling distribution of the mean.' },
        { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'σ = 20 and n = 25. What is the standard error of the mean?', accepted: ['4', '4.0'], explanation: '20 / √25 = 4.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'An online poll where anyone can vote suffers mainly from…', options: ['Voluntary-response bias', 'Too small a sample', 'Stratification', 'The CLT'], answer: 0, explanation: 'People with strong opinions self-select.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'The bootstrap resamples…', options: ['The population without replacement', 'The sample with replacement', 'Only outliers', 'New data from the field'], answer: 1, explanation: 'It treats the sample as a stand-in for the population.' },
      ],
      summary: [
        'Random, stratified, cluster and systematic sampling; beware convenience samples and bias.',
        'Statistics vary across samples: the sampling distribution.',
        'SE = σ/√n; more data → less uncertainty (with diminishing returns).',
        'CLT: sample means ≈ normal for large n; the bootstrap estimates uncertainty by resampling.',
      ],
      resources: [SEEING, OIS],
    },
    {
      id: 'stats-confidence-intervals',
      title: 'Confidence Intervals',
      minutes: 35,
      difficulty: 'intermediate',
      widgets: ['confidence-intervals'],
      objectives: [
        'Construct confidence intervals for a mean and a proportion',
        'Interpret “95% confidence” correctly',
        'Explain how sample size and confidence level affect width',
        'Use the t-distribution for means with unknown σ',
      ],
      intro: md`
A single number (“average order value is \$84.20”) hides uncertainty. A **confidence interval** (“\$79.60 to \$88.80”) communicates both the estimate and how precise it is — essential for honest reporting and decision-making.
`,
      simple: md`
Think of fishing with a net instead of a spear. A single estimate is a spear: you’ll almost never hit the exact true value. A confidence interval is a net: wider nets catch the true value more often.

“95% confidence” means: *if we repeated the whole sampling process many times, about 95% of the nets we cast would contain the true value.* Watch it happen in the simulation — some intervals (red) miss!
`,
      technical: md`
General form: **estimate ± critical value × standard error**.

### Mean (σ unknown) — t-interval
$$\bar{x} \pm t^*_{n-1}\,\frac{s}{\sqrt{n}}$$
$t^*$ comes from the t-distribution with $n - 1$ degrees of freedom (for large $n$, $t^* \approx 1.96$ at 95%).

### Proportion
$$\hat{p} \pm z^*\sqrt{\frac{\hat{p}(1-\hat{p})}{n}}$$
Valid when $n\hat{p} \ge 10$ and $n(1-\hat{p}) \ge 10$. $z^* = 1.645$ (90%), $1.96$ (95%), $2.576$ (99%).

The half-width is the **margin of error**.

### What affects width
- Larger $n$ → narrower (∝ $1/\sqrt{n}$).
- Higher confidence → wider.
- More variable data → wider.

### Correct interpretation
✓ “We are 95% confident the true mean lies between 79.6 and 88.8” — meaning the **method** captures the true value 95% of the time.
✗ “There is a 95% probability the true mean is in this interval” (in frequentist statistics the true mean is fixed; the interval is what varies).
✗ “95% of the data lies in this interval” — that’s a different concept (a prediction/reference range).

### Required sample size for a proportion
$n = \dfrac{z^{*2}\,p(1-p)}{E^2}$; with $p = 0.5$ (worst case), $E = 0.03$, 95% → $n \approx 1068$ — why polls survey about 1,000 people.
`,
      terms: [
        ['Point estimate', 'A single best guess of a parameter (e.g. x̄).'],
        ['Confidence interval', 'A range of plausible values for a parameter.'],
        ['Confidence level', 'Long-run proportion of intervals that capture the parameter (e.g. 95%).'],
        ['Margin of error', 'Half-width of the interval: critical value × SE.'],
        ['t-distribution', 'Bell-shaped distribution with heavier tails, used when σ is estimated.'],
        ['Degrees of freedom', 'n − 1 for a one-sample t-interval.'],
      ],
      realWorld: md`
A company surveys 400 customers: 248 (62%) would recommend the product. The 95% CI is $0.62 \pm 1.96\sqrt{0.62 \times 0.38/400} = 0.62 \pm 0.048$ → **57.2% to 66.8%**. Last year’s figure was 55%, which lies outside the interval, so leadership can be reasonably confident satisfaction really improved.
`,
      steps: [
        'Compute the point estimate (mean or proportion).',
        'Compute the standard error.',
        'Look up the critical value (t* or z*) for your confidence level.',
        'Margin of error = critical value × SE; interval = estimate ± margin.',
        'Interpret in context and state the confidence level.',
      ],
      code: [
        {
          title: 'Confidence intervals for a mean and a proportion',
          code: md`
import numpy as np
import pandas as pd
from scipy import stats

sales = pd.read_csv("data/sales.csv")
sample = sales["revenue"].sample(60, random_state=3)

n = len(sample)
mean, se = sample.mean(), sample.std() / np.sqrt(n)
t_star = stats.t.ppf(0.975, df=n - 1)
print(f"mean = {mean:.2f}, 95% CI = [{mean - t_star * se:.2f}, {mean + t_star * se:.2f}]  (t* = {t_star:.3f})")
print("scipy:", np.round(stats.t.interval(0.95, df=n - 1, loc=mean, scale=se), 2))
print("true population mean:", round(sales["revenue"].mean(), 2))

yes, n2 = 248, 400
p = yes / n2
moe = 1.96 * np.sqrt(p * (1 - p) / n2)
print(f"proportion = {p:.3f} ± {moe:.3f} -> [{p - moe:.3f}, {p + moe:.3f}]")
`,
          explanation: [
            '…',
            '…',
            '…',
            'Treat the full file as the population…',
            '…and take a random sample of 60 orders.',
            '…',
            'Sample mean and standard error.',
            'Critical t-value for 95% (2.5% in each tail) with 59 degrees of freedom ≈ 2.001.',
            'Estimate ± t* × SE.',
            '`stats.t.interval` does the same calculation.',
            'Compare with the population mean: usually inside the interval (95% of the time).',
            'Survey data for a proportion.',
            'p̂ = 0.62.',
            'Margin of error ≈ 0.048.',
            'Interval [0.572, 0.668].',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Saying “95% of customers spend between 79.6 and 88.8”.', fix: 'A CI is about the **parameter** (the mean), not individual values.' },
        { mistake: 'Using z = 1.96 with very small samples.', fix: 'Use the t-distribution when σ is estimated, especially for small n.' },
        { mistake: 'Ignoring bias: a CI only reflects random sampling error.', fix: 'A biased sample gives a precisely wrong interval.' },
      ],
      exercises: [
        {
          id: 's7-ex1', title: 'CI for a proportion', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`In an A/B test, 132 of 1,100 visitors clicked. Compute the 95% CI for the click rate as \`low\` and \`high\` using $z^* = 1.96$.`,
          starter: md`
import math
clicks, n = 132, 1100
low, high = 0, 0
print(low, high)
`,
          solution: md`
import math
clicks, n = 132, 1100
p = clicks / n
moe = 1.96 * math.sqrt(p * (1 - p) / n)
low, high = p - moe, p + moe
print(low, high)
`,
          tests: md`
assert abs(low - 0.10080) < 1e-4 and abs(high - 0.13920) < 1e-4, f"Expected ≈ [0.1008, 0.1392], got [{low:.4f}, {high:.4f}]"
`,
          hints: ['p̂ = 132/1100 = 0.12.', 'Margin = 1.96 × √(p̂(1 − p̂)/n).'],
        },
        {
          id: 's7-ex2', title: 't-interval for a mean', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Compute a 95% t-interval for the mean \`math\` score in \`data/students.csv\` using \`scipy.stats.t.interval\`. Store it as a tuple \`ci\`.`,
          starter: md`
import pandas as pd
import numpy as np
from scipy import stats
math_scores = pd.read_csv("data/students.csv")["math"]
ci = (0, 0)
print(ci)
`,
          solution: md`
import pandas as pd
import numpy as np
from scipy import stats
math_scores = pd.read_csv("data/students.csv")["math"]
n = len(math_scores)
se = math_scores.std() / np.sqrt(n)
ci = stats.t.interval(0.95, df=n - 1, loc=math_scores.mean(), scale=se)
print(ci)
`,
          tests: md`
_m = pd.read_csv("data/students.csv")["math"]
_e = stats.t.interval(0.95, df=len(_m) - 1, loc=_m.mean(), scale=_m.std() / np.sqrt(len(_m)))
assert abs(ci[0] - _e[0]) < 1e-6 and abs(ci[1] - _e[1]) < 1e-6, f"Expected {np.round(_e, 3)}, got {ci}"
`,
          hints: ['SE = sample SD / √n.', '`stats.t.interval(0.95, df=n-1, loc=mean, scale=se)`'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which is the correct interpretation of a 95% CI [10, 14] for a mean?', options: ['95% of values are between 10 and 14', 'The method produces intervals containing the true mean 95% of the time', 'There is a 95% chance the sample mean is in [10, 14]', 'The mean is 12 with 95% certainty'], answer: 1, explanation: 'Confidence refers to the long-run success rate of the procedure.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Increasing the sample size (other things equal) makes the CI…', options: ['Wider', 'Narrower', 'Unchanged', 'Shifted up'], answer: 1, explanation: 'SE ∝ 1/√n.' },
        { id: 'q3', kind: 'mcq', difficulty: 'beginner', prompt: 'Changing from 95% to 99% confidence makes the CI…', options: ['Narrower', 'Wider', 'Unchanged', 'Invalid'], answer: 1, explanation: 'Higher confidence needs a bigger net (z* 2.576 vs 1.96).' },
        { id: 'q4', kind: 'text', difficulty: 'intermediate', prompt: 'x̄ = 50, SE = 2, z* = 1.96. What is the upper bound of the 95% CI?', accepted: ['53.92'], explanation: '50 + 1.96 × 2 = 53.92.' },
      ],
      summary: [
        'CI = estimate ± critical value × SE.',
        'Use t* for means with estimated σ; z* for proportions (large n).',
        'Width shrinks with √n and grows with confidence level and variability.',
        'Interpret as a statement about the method’s long-run coverage.',
      ],
      resources: [SEEING, OIS],
    },
    {
      id: 'stats-hypothesis-testing',
      title: 'Hypothesis Testing, P-values & Statistical Significance',
      minutes: 50,
      difficulty: 'intermediate',
      objectives: [
        'Formulate null and alternative hypotheses',
        'Explain p-values, significance level, Type I and Type II errors',
        'Run t-tests, proportion (z) tests and chi-square tests in Python',
        'Distinguish statistical significance from practical significance',
      ],
      intro: md`
Did the new website design really increase conversions, or was it luck? Is the new drug better than the placebo? **Hypothesis testing** gives a disciplined way to decide whether an observed effect is likely real or just random noise. It is the statistics behind A/B testing, which tech companies run thousands of times a year.
`,
      simple: md`
A hypothesis test works like a courtroom:

- The **null hypothesis** ($H_0$) is “innocent until proven guilty”: *there is no effect* (the new design converts the same as the old).
- We look at the evidence (data) and ask: **if $H_0$ were true, how surprising would this data be?** That “surprise level” is the **p-value**.
- If the p-value is very small (below a threshold such as 0.05), the data would be very unlikely under “no effect”, so we **reject** $H_0$.
- A large p-value doesn’t prove innocence — it just means we don’t have enough evidence.
`,
      technical: md`
### The procedure
1. State $H_0$ (no effect / no difference) and $H_1$ (the effect you’re looking for). Decide one- or two-sided **before** looking at the data.
2. Choose the significance level $\alpha$ (commonly 0.05).
3. Compute a **test statistic** (e.g. $t$, $z$, $\chi^2$) from the data.
4. Compute the **p-value**: $P(\text{data at least as extreme} \mid H_0)$.
5. If $p \le \alpha$, reject $H_0$ (“statistically significant”); otherwise fail to reject.

### Errors
| | $H_0$ true | $H_0$ false |
|---|---|---|
| Reject $H_0$ | **Type I error** (false positive), prob. $\alpha$ | correct (power = $1 - \beta$) |
| Don’t reject | correct | **Type II error** (false negative), prob. $\beta$ |

**Power** increases with sample size and effect size. Plan sample sizes before experiments.

### Common tests
| Question | Test | scipy |
|---|---|---|
| Mean differs from a value | one-sample t-test | \`ttest_1samp\` |
| Two independent group means | two-sample t-test (Welch) | \`ttest_ind(a, b, equal_var=False)\` |
| Same subjects before/after | paired t-test | \`ttest_rel\` |
| Two proportions (A/B test) | two-proportion z-test | compute or \`statsmodels\` |
| Two categorical variables | chi-square test of independence | \`chi2_contingency\` |
| Non-normal small samples | Mann-Whitney U | \`mannwhitneyu\` |

Two-sample t statistic (Welch): $t = \dfrac{\bar{x}_1 - \bar{x}_2}{\sqrt{s_1^2/n_1 + s_2^2/n_2}}$.

### Pitfalls
- **p-value ≠ probability $H_0$ is true** and ≠ effect size.
- **Statistical vs practical significance:** with huge samples, trivial effects become “significant”. Report effect sizes and confidence intervals.
- **Multiple testing / p-hacking:** test 20 things at α = 0.05 and expect one false positive. Correct (e.g. Bonferroni: α/m) and pre-register analyses.
- **Permutation tests:** shuffle group labels many times to build the null distribution by simulation — intuitive and assumption-light.
`,
      terms: [
        ['Null hypothesis (H₀)', 'Default claim of no effect or no difference.'],
        ['Alternative hypothesis (H₁)', 'The effect or difference you are testing for.'],
        ['p-value', 'Probability of results at least this extreme if H₀ is true.'],
        ['Significance level (α)', 'Threshold for rejecting H₀; the Type I error rate.'],
        ['Type I error', 'Rejecting a true H₀ (false positive).'],
        ['Type II error', 'Failing to reject a false H₀ (false negative).'],
        ['Power', 'Probability of detecting a real effect (1 − β).'],
        ['A/B test', 'Randomised experiment comparing two variants.'],
      ],
      realWorld: md`
**A/B test.** An online shop shows design A to 5,000 visitors (400 purchases, 8.0%) and design B to 5,000 visitors (460 purchases, 9.2%). A two-proportion z-test gives $z \approx 2.15$, $p \approx 0.03$. At α = 0.05 the result is significant: B likely converts better. The 95% CI for the lift is roughly +0.1 to +2.3 percentage points — the business decides whether that justifies the redesign cost.
`,
      steps: [
        'Write H₀ and H₁ in words and symbols; choose α and one/two-sided before seeing results.',
        'Check assumptions (independence, sample sizes, roughly normal means).',
        'Compute the test statistic and p-value (scipy).',
        'Make the decision: reject or fail to reject H₀.',
        'Report effect size + confidence interval and interpret in business terms.',
      ],
      code: [
        {
          title: 'A/B test (two proportions) and a permutation test',
          code: md`
import numpy as np
from scipy import stats

conv_a, n_a = 400, 5000
conv_b, n_b = 460, 5000
p_a, p_b = conv_a / n_a, conv_b / n_b
p_pool = (conv_a + conv_b) / (n_a + n_b)
se = np.sqrt(p_pool * (1 - p_pool) * (1 / n_a + 1 / n_b))
z = (p_b - p_a) / se
p_value = 2 * (1 - stats.norm.cdf(abs(z)))
print(f"A={p_a:.3f}  B={p_b:.3f}  z={z:.2f}  p={p_value:.4f}")

# Permutation test: shuffle labels to simulate "no difference"
rng = np.random.default_rng(0)
outcomes = np.r_[np.ones(conv_a), np.zeros(n_a - conv_a), np.ones(conv_b), np.zeros(n_b - conv_b)]
observed = p_b - p_a
diffs = []
for _ in range(2000):
    rng.shuffle(outcomes)
    diffs.append(outcomes[n_a:].mean() - outcomes[:n_a].mean())
print("permutation p ≈", np.mean(np.abs(diffs) >= abs(observed)))
`,
          explanation: [
            '…',
            '…',
            'Group A: conversions and visitors.',
            'Group B.',
            'Conversion rates 8.0% and 9.2%.',
            'Under H₀ both groups share one rate: the pooled proportion.',
            'Standard error of the difference under H₀.',
            'z statistic: how many SEs apart the two rates are.',
            'Two-sided p-value: probability of a |z| this large if there were no difference.',
            'p ≈ 0.03 < 0.05 → significant.',
            '…',
            '…',
            'Build the 10,000 individual outcomes (1 = purchase).',
            'The observed difference.',
            '…',
            'Repeat 2,000 times:',
            'shuffle who was in which group (this is what “no effect” means),',
            'record the difference in rates for the shuffled groups.',
            'Proportion of shuffled differences at least as extreme as observed ≈ the p-value (≈ 0.03).',
          ],
        },
        {
          title: 't-test and chi-square test on real data',
          code: md`
import pandas as pd
from scipy import stats

students = pd.read_csv("data/students.csv")
f = students.loc[students["gender"] == "F", "math"]
m = students.loc[students["gender"] == "M", "math"]
t, p = stats.ttest_ind(f, m, equal_var=False)
print(f"math F mean={f.mean():.1f}, M mean={m.mean():.1f}, t={t:.2f}, p={p:.3f}")

churn = pd.read_csv("data/churn.csv")
table = pd.crosstab(churn["contract"], churn["churn"])
chi2, p2, dof, expected = stats.chi2_contingency(table)
print(table)
print(f"chi2={chi2:.1f}, dof={dof}, p={p2:.2e}")
`,
          explanation: [
            '…',
            '…',
            'Students dataset.',
            'Math scores of female students…',
            '…and male students.',
            'Welch’s two-sample t-test (doesn’t assume equal variances).',
            'Gender was generated independently of scores, so expect a large p-value: no evidence of a difference.',
            'Churn dataset.',
            'Contract × churn contingency table.',
            'Chi-square test of independence: are the two categorical variables related?',
            '…',
            'A tiny p-value → contract type and churn are strongly associated.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Saying “p = 0.03 means a 3% chance H₀ is true”.', fix: 'It is the probability of data this extreme **assuming** H₀ is true.' },
        { mistake: 'Concluding “no effect” from p = 0.20.', fix: 'Say “insufficient evidence”; the test may lack power.' },
        { mistake: 'Stopping an A/B test as soon as p < 0.05 (peeking).', fix: 'Fix the sample size in advance (or use sequential-testing methods).' },
        { mistake: 'Testing many metrics and reporting only the significant one.', fix: 'Pre-register the main metric; correct for multiple comparisons.' },
      ],
      exercises: [
        {
          id: 's8-ex1', title: 'Two-sample t-test', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Do customers who churned have different \`monthly_charges\` from those who stayed? Run Welch’s t-test on \`data/churn.csv\` and store the p-value in \`p\` and a boolean \`significant\` (α = 0.05).`,
          starter: md`
import pandas as pd
from scipy import stats
df = pd.read_csv("data/churn.csv")
p = 1.0
significant = False
print(p, significant)
`,
          solution: md`
import pandas as pd
from scipy import stats
df = pd.read_csv("data/churn.csv")
yes = df.loc[df["churn"] == "Yes", "monthly_charges"]
no = df.loc[df["churn"] == "No", "monthly_charges"]
t, p = stats.ttest_ind(yes, no, equal_var=False)
significant = p < 0.05
print(p, significant)
`,
          tests: md`
_y = df.loc[df.churn == "Yes", "monthly_charges"]; _n = df.loc[df.churn == "No", "monthly_charges"]
_p = stats.ttest_ind(_y, _n, equal_var=False).pvalue
assert abs(p - _p) < 1e-12, f"Expected p = {_p:.3g}, got {p}"
assert bool(significant) == (_p < 0.05)
`,
          hints: ['Split monthly_charges by churn "Yes" / "No".', '`stats.ttest_ind(a, b, equal_var=False)` returns (t, p).'],
        },
        {
          id: 's8-ex2', title: 'Z-test for an A/B test', type: 'write', lang: 'python', difficulty: 'advanced',
          prompt: md`Write \`ab_test(conv_a, n_a, conv_b, n_b)\` returning the **two-sided p-value** of the pooled two-proportion z-test.`,
          starter: md`
import numpy as np
from scipy import stats

def ab_test(conv_a, n_a, conv_b, n_b):
    return 1.0

print(ab_test(400, 5000, 460, 5000))
`,
          solution: md`
import numpy as np
from scipy import stats

def ab_test(conv_a, n_a, conv_b, n_b):
    pa, pb = conv_a / n_a, conv_b / n_b
    pool = (conv_a + conv_b) / (n_a + n_b)
    se = np.sqrt(pool * (1 - pool) * (1 / n_a + 1 / n_b))
    z = (pb - pa) / se
    return 2 * (1 - stats.norm.cdf(abs(z)))

print(ab_test(400, 5000, 460, 5000))
`,
          tests: md`
assert abs(ab_test(400, 5000, 460, 5000) - 0.0316) < 2e-3, "Expected p ≈ 0.032"
assert abs(ab_test(50, 1000, 50, 1000) - 1.0) < 1e-9, "Identical groups should give p = 1"
assert ab_test(100, 1000, 160, 1000) < 0.001
`,
          hints: ['Pool the conversion rate for the SE under H₀.', 'p = 2 × (1 − Φ(|z|)).'],
        },
        {
          id: 's8-ex3', title: 'Interpret the p-value', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`With α = 0.05, a test gives p = 0.12. Do you reject the null hypothesis? (yes/no)`,
          solution: 'no', accepted: ['no', 'n'],
          hints: ['Reject only when p ≤ α.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'For an A/B test of a new button, H₀ is usually…', options: ['The new button is better', 'There is no difference in conversion', 'The old button is better', 'Conversion is 50%'], answer: 1, explanation: 'H₀ states no effect/difference.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'A Type I error is…', options: ['Failing to detect a real effect', 'Rejecting H₀ when it is actually true', 'Using the wrong test', 'Having too small a sample'], answer: 1, explanation: 'A false positive; its probability is α.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does p = 0.01 mean?', options: ['H₀ is true with probability 1%', 'If H₀ were true, data this extreme would occur about 1% of the time', 'The effect is large', 'The alternative is 99% likely'], answer: 1, explanation: 'The p-value is computed assuming H₀.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which test checks whether two categorical variables are associated?', options: ['Paired t-test', 'Chi-square test of independence', 'One-sample t-test', 'Shapiro-Wilk'], answer: 1, explanation: 'Chi-square on a contingency table.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'With 10 million users, a 0.01% conversion lift is “significant” (p < 0.001). This illustrates…', options: ['A Type II error', 'Statistical significance without practical significance', 'p-hacking', 'Low power'], answer: 1, explanation: 'Huge samples detect tiny effects that may not matter for the business.' },
        { id: 'q6', kind: 'mcq', difficulty: 'intermediate', prompt: 'Increasing the sample size generally…', options: ['Increases Type I error', 'Increases power', 'Decreases power', 'Changes α'], answer: 1, explanation: 'Larger samples detect real effects more reliably; α is set by you.' },
      ],
      summary: [
        'Set H₀/H₁ and α first; compute the statistic and p-value; decide.',
        'p-value = P(data this extreme | H₀), not P(H₀).',
        'Type I (false positive, α) vs Type II (false negative, β); power = 1 − β.',
        'Common tests: t-tests, z-test for proportions, chi-square; report effect sizes and CIs.',
      ],
      resources: [{ label: 'Evan Miller — A/B testing tools & articles', url: 'https://www.evanmiller.org/ab-testing/' }, OIS, { label: 'ASA statement on p-values', url: 'https://www.amstat.org/asa/files/pdfs/p-valuestatements.pdf' }],
    },
    anovaPowerLesson,
    {
      id: 'stats-correlation',
      title: 'Correlation & Covariance',
      minutes: 35,
      difficulty: 'intermediate',
      widgets: ['correlation'],
      objectives: [
        'Compute and interpret covariance and Pearson correlation',
        'Use Spearman correlation for monotonic/ranked relationships',
        'Build and read a correlation matrix',
        'Explain why correlation does not imply causation (confounders, spurious correlation)',
      ],
      intro: md`
Do students who study more get higher grades? Do customers who call support more often churn? **Correlation** measures how strongly two numeric variables move together. It is one of the first things you compute in EDA — and one of the most misinterpreted.
`,
      simple: md`
- **Positive correlation:** when one goes up, the other tends to go up (height and weight).
- **Negative correlation:** one up, the other down (price and number sold).
- **No correlation:** no consistent pattern (shoe size and exam score).

The **correlation coefficient r** runs from −1 to +1. Near ±1 = points lie close to a straight line; near 0 = no *linear* pattern.

⚠️ **Correlation is not causation.** Ice-cream sales and drownings are correlated — not because ice cream causes drowning, but because both rise in hot weather.
`,
      technical: md`
### Covariance
$$\text{cov}(X, Y) = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})$$
Sign shows direction; magnitude depends on units (hard to interpret).

### Pearson correlation
$$r = \frac{\text{cov}(X, Y)}{s_X\,s_Y} \in [-1, 1]$$
- Unit-free; measures **linear** association only.
- Sensitive to outliers (one point can create or destroy a correlation — try the toggle in the demo).
- $r^2$ is the proportion of variance in $Y$ explained by a linear fit on $X$.
- Rough guide: |r| < 0.3 weak, 0.3–0.7 moderate, > 0.7 strong (context-dependent).

### Spearman rank correlation
Pearson correlation of the **ranks**; captures monotonic (not necessarily linear) relationships and is robust to outliers.

### Correlation matrix
\`df.corr(numeric_only=True)\` computes all pairwise correlations; visualise as a heatmap (Module 7). Very high correlations between predictors (**multicollinearity**) complicate regression interpretation.

### Causation
Correlation can arise from: a causal effect (X → Y), reverse causation (Y → X), a **confounder** Z affecting both, selection effects, or pure chance (**spurious correlation**, especially when testing many pairs). Establishing causation needs **randomised experiments** (A/B tests) or careful causal-inference methods.

Test significance with \`scipy.stats.pearsonr\` (returns r and a p-value for H₀: ρ = 0).
`,
      terms: [
        ['Covariance', 'Average product of deviations; sign gives direction of joint variation.'],
        ['Pearson’s r', 'Standardised covariance measuring linear association (−1 to 1).'],
        ['Spearman’s ρ', 'Correlation of ranks; measures monotonic association.'],
        ['Correlation matrix', 'Table of pairwise correlations between variables.'],
        ['Confounder', 'A third variable influencing both variables of interest.'],
        ['Spurious correlation', 'An association with no meaningful causal link.'],
        ['Multicollinearity', 'Strong correlation among predictor variables.'],
      ],
      realWorld: md`
A retailer finds that stores with more staff have higher sales (r = 0.8). Should they hire more staff everywhere? Not necessarily: **bigger stores** (a confounder) have both more staff and more customers. When analysts control for store size, the staffing effect is much smaller. A randomised experiment — adding staff to a random subset of similar stores — would give the causal answer.
`,
      steps: [
        'Plot a scatter plot first — always.',
        'Compute Pearson r (linear) and Spearman ρ (monotonic).',
        'Check for outliers driving the result.',
        'Build a correlation matrix to scan many variables.',
        'Brainstorm confounders before making causal claims.',
      ],
      code: [
        {
          title: 'Covariance, Pearson, Spearman and a correlation matrix',
          code: md`
import numpy as np
import pandas as pd
from scipy import stats

students = pd.read_csv("data/students.csv")
x, y = students["study_hours_week"], students["math"]

cov = ((x - x.mean()) * (y - y.mean())).sum() / (len(x) - 1)
r = cov / (x.std() * y.std())
print(f"cov={cov:.2f}  manual r={r:.3f}  pandas r={x.corr(y):.3f}")
print("Spearman:", round(x.corr(y, method="spearman"), 3))
r_val, p_val = stats.pearsonr(x, y)
print(f"pearsonr: r={r_val:.3f}, p={p_val:.1e}")

cols = ["study_hours_week", "attendance_pct", "math", "science", "english", "age"]
print(students[cols].corr().round(2))

# Non-linear relationship: Pearson misses it
u = np.linspace(-3, 3, 100)
print("r for y = x²:", round(np.corrcoef(u, u ** 2)[0, 1], 3))
`,
          explanation: [
            '…',
            '…',
            '…',
            'Load the student data.',
            'Two numeric variables.',
            'Covariance from the formula.',
            'Pearson r = covariance / (SD_x × SD_y).',
            'Matches pandas’ `.corr()` — a strong positive correlation.',
            'Spearman (rank-based) is similar here because the relationship is monotonic.',
            '`pearsonr` also tests H₀: no correlation.',
            'A tiny p-value — very unlikely to be chance.',
            'Columns to compare.',
            'A correlation matrix: each cell is r for a pair; age correlates with nothing (as generated).',
            '…',
            'A perfect but **non-linear** relationship (a parabola)…',
            '…has r ≈ 0! Always plot your data.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Concluding causation from correlation.', fix: 'Look for confounders; use experiments for causal claims.' },
        { mistake: 'Interpreting r ≈ 0 as “no relationship”.', fix: 'There may be a strong non-linear relationship — plot it.' },
        { mistake: 'Comparing covariances across variables with different units.', fix: 'Use correlation (unit-free).' },
      ],
      exercises: [
        {
          id: 's9-ex1', title: 'Strongest correlate', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`In \`data/houses.csv\`, which numeric column (other than \`price\` and \`house_id\`) has the **highest absolute correlation** with \`price\`? Store its name in \`best\`.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/houses.csv")
best = ""
print(best)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/houses.csv")
corr = df.drop(columns=["house_id"]).corr(numeric_only=True)["price"].drop("price")
best = corr.abs().idxmax()
print(corr.round(3))
print(best)
`,
          tests: md`
_c = df.drop(columns=["house_id"]).corr(numeric_only=True)["price"].drop("price")
assert best == _c.abs().idxmax(), f"Expected {_c.abs().idxmax()!r}, got {best!r}"
`,
          hints: ['`df.corr(numeric_only=True)["price"]` gives correlations with price.', 'Drop price itself, take `.abs()` and `.idxmax()`.'],
        },
        {
          id: 's9-ex2', title: 'Covariance by hand', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Write \`covariance(xs, ys)\` implementing the **sample** covariance formula (divide by n − 1).`,
          starter: md`
def covariance(xs, ys):
    return 0

print(covariance([1, 2, 3, 4], [2, 4, 5, 9]))
`,
          solution: md`
def covariance(xs, ys):
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (n - 1)

print(covariance([1, 2, 3, 4], [2, 4, 5, 9]))
`,
          tests: md`
import numpy as np
for a, b in [([1, 2, 3, 4], [2, 4, 5, 9]), ([5, 1, 7], [2, 2, 8])]:
    assert abs(covariance(a, b) - np.cov(a, b)[0, 1]) < 1e-9, f"wrong for {a}, {b}"
`,
          hints: ['Means first; then sum of products of deviations; divide by n − 1.'],
        },
        {
          id: 's9-ex3', title: 'Confounder', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`Cities with more firefighters have more fire damage. What is the most likely confounding variable? (one word, e.g. “size”)`,
          solution: 'size', accepted: ['size', 'population', 'city size', 'fire size', 'fires'],
          hints: ['Bigger cities (or bigger fires) need more firefighters AND have more damage.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'r = −0.85 indicates…', options: ['A weak positive relationship', 'A strong negative linear relationship', 'No relationship', 'Causation'], answer: 1, explanation: 'Close to −1: strong, and as one rises the other falls.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which statement is true?', options: ['r = 0 means no relationship of any kind', 'Correlation is unit-free', 'Covariance is always between −1 and 1', 'Pearson r is robust to outliers'], answer: 1, explanation: 'r is standardised; covariance depends on units; r is sensitive to outliers and only linear.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'When should you prefer Spearman over Pearson?', options: ['When data is perfectly linear', 'For monotonic, non-linear relationships or ranked/outlier-heavy data', 'Never', 'Only for categorical data'], answer: 1, explanation: 'Spearman uses ranks.' },
        { id: 'q4', kind: 'text', difficulty: 'intermediate', prompt: 'If r = 0.6, what fraction of variance in Y is explained by a linear fit on X? (decimal)', accepted: ['0.36', '.36', '36%'], explanation: 'r² = 0.36.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'The best way to establish that X causes Y is…', options: ['A very high correlation', 'A randomised controlled experiment', 'A large observational dataset', 'A scatter plot'], answer: 1, explanation: 'Randomisation removes confounding.' },
      ],
      summary: [
        'Covariance gives direction; correlation r standardises it to [−1, 1].',
        'Pearson = linear; Spearman = monotonic (ranks).',
        'Plot first: outliers and non-linearity mislead r.',
        'Correlation ≠ causation: think confounders, use experiments.',
      ],
      resources: [{ label: 'Spurious Correlations (Tyler Vigen)', url: 'https://www.tylervigen.com/spurious-correlations' }, SEEING],
    },
  ],
};
