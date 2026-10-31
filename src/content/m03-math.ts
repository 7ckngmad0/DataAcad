import type { Module } from '../types.ts';
import { md } from './md.ts';

const KHAN = { label: 'Khan Academy — Math', url: 'https://www.khanacademy.org/math' };
const MML = { label: 'Mathematics for Machine Learning (free book)', url: 'https://mml-book.github.io/' };

export const m03: Module = {
  id: 'math',
  number: 3,
  title: 'Mathematics for Data Science',
  short: 'Math',
  icon: 'sigma',
  description:
    'Only the math you actually need — arithmetic and algebra, functions and logarithms, summation, vectors and matrices, derivatives and gradients — explained visually and tied directly to data science uses.',
  skills: ['Algebra', 'Functions & logs', 'Summation notation', 'Vectors', 'Matrices', 'Derivatives', 'Gradient descent'],
  lessons: [
    {
      id: 'math-arithmetic-algebra',
      title: 'Arithmetic & Algebra Refresher',
      minutes: 30,
      difficulty: 'beginner',
      objectives: [
        'Apply order of operations, fractions, percentages and ratios',
        'Read and manipulate algebraic expressions with variables',
        'Solve linear equations and simple inequalities',
        'Translate word problems into formulas and code',
      ],
      intro: md`
Data Science math starts with the basics you already half-know. Percent changes, ratios, rates and solving for an unknown appear in every report and every model. This lesson makes sure those foundations are solid — no calculus yet!
`,
      simple: md`
**Algebra** is just arithmetic with placeholders. Instead of saying *“price times 3 plus 5 shipping”* you write $3p + 5$. Here $p$ is a **variable** — a number we don’t know yet or that can change.

**Solving an equation** means finding the value that makes both sides equal, by doing the same thing to both sides — like keeping a balance scale level.

$3p + 5 = 20 \;\Rightarrow\; 3p = 15 \;\Rightarrow\; p = 5$.
`,
      technical: md`
### Order of operations (PEMDAS/BODMAS)
Parentheses → Exponents → Multiplication/Division (left to right) → Addition/Subtraction (left to right).

### Fractions, percentages, ratios
- Percentage: $\text{part} / \text{whole} \times 100$.
- **Percentage change:** $\dfrac{\text{new} - \text{old}}{\text{old}} \times 100\%$.
- **Percentage points** vs percent: a rate going from 10% to 12% is +2 **percentage points** but +20% **relative** change.
- Ratios and rates: conversion rate $= \frac{\text{purchases}}{\text{visitors}}$; ratios compare quantities.

### Algebraic manipulation
- Combine like terms: $3x + 2x = 5x$. Distribute: $a(b + c) = ab + ac$.
- **Linear equation** $ax + b = c \Rightarrow x = \dfrac{c - b}{a}$ (for $a \neq 0$).
- **Inequalities** behave like equations, except multiplying/dividing by a negative number **flips** the sign: $-2x > 6 \Rightarrow x < -3$.
- **Systems of two equations** can be solved by substitution or elimination (or with matrices — Lesson 4).

### Why it matters
- Linear regression’s model $\hat{y} = b_0 + b_1 x$ is a linear equation.
- Break-even analysis: price × units − fixed cost − variable cost × units = 0.
- Normalising data: $z = (x - \mu)/\sigma$; min-max scaling: $(x - \min)/(\max - \min)$.
`,
      terms: [
        ['Variable', 'A symbol (like x) representing an unknown or changing number.'],
        ['Expression', 'A combination of numbers, variables and operators, e.g. 3x + 5.'],
        ['Equation', 'A statement that two expressions are equal; solving finds the variable’s value.'],
        ['Coefficient', 'The number multiplying a variable (3 in 3x).'],
        ['Percentage point', 'The arithmetic difference between two percentages.'],
        ['Inequality', 'A comparison such as x > 3; dividing by a negative flips it.'],
      ],
      realWorld: md`
**Break-even analysis.** A student startup sells tote bags for \$15. Each bag costs \$6 to make; fixed monthly costs are \$1,800. How many bags per month to break even?

Profit $= 15u - 6u - 1800 = 0 \Rightarrow 9u = 1800 \Rightarrow u = 200$ bags.

**Percentage points.** Churn fell from 8% to 6%: that is −2 percentage points, or a −25% relative change. Reports that confuse these mislead executives.
`,
      steps: [
        'Write what you know and what you want in words.',
        'Assign variables to the unknowns.',
        'Translate the relationships into an equation.',
        'Isolate the unknown by doing the same operation to both sides.',
        'Check the answer by plugging it back in (or with code).',
      ],
      code: [
        {
          title: 'Break-even and percentage change in Python',
          code: md`
price, unit_cost, fixed = 15, 6, 1800
break_even = fixed / (price - unit_cost)
print("Break-even units:", break_even)

def profit(units):
    return price * units - unit_cost * units - fixed
print([profit(u) for u in (150, 200, 250)])

old_rate, new_rate = 0.08, 0.06
print(f"Change: {(new_rate - old_rate) * 100:+.1f} percentage points")
print(f"Relative change: {(new_rate - old_rate) / old_rate:+.0%}")

values = [12, 30, 18, 45, 25]
lo, hi = min(values), max(values)
print([round((v - lo) / (hi - lo), 2) for v in values])
`,
          explanation: [
            'Inputs of the break-even problem.',
            'Solving $9u = 1800$ means dividing fixed cost by the margin per unit → 200.0.',
            '…',
            'A profit function lets us **check** the solution…',
            '…',
            '…losses below 200, zero at 200, profit above → [-450, 0, 450].',
            'Two churn rates.',
            'Difference × 100 → −2.0 percentage points (`+` in the format shows the sign).',
            'Relative change → −25%.',
            'Some values to rescale.',
            'Find min and max.',
            'Min-max scaling maps them into [0, 1] — a common preprocessing step for ML.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Reporting “churn decreased 2%” when it went from 8% to 6%.', fix: 'Say “−2 percentage points (−25% relative)”.' },
        { mistake: 'Forgetting to flip an inequality when dividing by a negative.', fix: '$-2x > 6 \\Rightarrow x < -3$.' },
        { mistake: 'Averaging percentages from groups of different sizes.', fix: 'Compute the overall rate from totals (total successes / total trials).' },
      ],
      exercises: [
        {
          id: 'm1-ex1', title: 'Solve a linear equation in code', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Solve $4x - 7 = 21$ and store the answer in \`x\`. Compute it with arithmetic (don’t just type the number).`,
          starter: md`
x = 0
print(x)
`,
          solution: md`
x = (21 + 7) / 4
print(x)
`,
          tests: md`assert abs(x - 7) < 1e-9, f"x should be 7, got {x}"`,
          hints: ['Add 7 to both sides, then divide by 4.'],
        },
        {
          id: 'm1-ex2', title: 'Weighted overall rate', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Store A converted 30 of 200 visitors; store B converted 5 of 20. Compute the **overall** conversion rate \`overall\` (as a fraction) correctly from totals — not by averaging the two rates.`,
          starter: md`
conv = {"A": (30, 200), "B": (5, 20)}
overall = (30 / 200 + 5 / 20) / 2
print(overall)
`,
          solution: md`
conv = {"A": (30, 200), "B": (5, 20)}
total_conv = sum(c for c, v in conv.values())
total_visits = sum(v for c, v in conv.values())
overall = total_conv / total_visits
print(overall)
`,
          tests: md`assert abs(overall - 35 / 220) < 1e-9, f"Overall should be 35/220 ≈ 0.159, got {overall}"`,
          hints: ['Add all conversions, add all visitors, then divide.', 'The simple average (0.2) over-weights the small store.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'Solve for x: $2x + 6 = 20$', accepted: ['7', 'x=7', 'x = 7'], explanation: '2x = 14 → x = 7.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Sales grew from 80 to 100. What is the percentage change?', options: ['20%', '25%', '80%', '125%'], answer: 1, explanation: '(100 − 80)/80 = 0.25 = 25%.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'An interest rate rises from 4% to 5%. Which statement is correct?', options: ['It rose 1%', 'It rose 1 percentage point (25% relative)', 'It rose 25 percentage points', 'It rose 5%'], answer: 1, explanation: '5 − 4 = 1 percentage point; relative change 1/4 = 25%.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Solve $-3x \\ge 12$.', options: ['x ≥ −4', 'x ≤ −4', 'x ≥ 4', 'x ≤ 4'], answer: 1, explanation: 'Divide by −3 and flip the sign: x ≤ −4.' },
        { id: 'q5', kind: 'text', difficulty: 'beginner', prompt: 'Compute $2 + 3 \\times 2^2$.', accepted: ['14'], explanation: 'Exponent first (4), then 3×4 = 12, then +2 = 14.' },
      ],
      summary: [
        'Order of operations: parentheses, exponents, ×/÷, +/−.',
        'Percentage change = (new − old)/old; distinguish percentage points.',
        'Solve linear equations by doing the same operation to both sides.',
        'Compute overall rates from totals, not averages of rates.',
      ],
      resources: [KHAN, { label: 'Khan Academy — Algebra 1', url: 'https://www.khanacademy.org/math/algebra' }],
    },
    {
      id: 'math-functions-logs',
      title: 'Functions, Graphs, Exponents & Logarithms',
      minutes: 40,
      difficulty: 'beginner',
      widgets: ['function-grapher'],
      objectives: [
        'Understand a function as an input→output rule and read its graph',
        'Recognise linear, quadratic, exponential, logarithmic and sigmoid shapes',
        'Apply exponent and logarithm rules',
        'Explain why logs are used to transform skewed data and model growth',
      ],
      intro: md`
A **function** turns inputs into outputs. Every machine-learning model *is* a function: house features in, predicted price out. Recognising common function shapes — and knowing what exponentials and logarithms do — is essential for modelling growth, interpreting charts with log axes and transforming skewed data.
`,
      simple: md`
A function is a machine: put in $x$, get out $f(x)$. For $f(x) = 2x + 1$, putting in 3 gives 7.

- **Linear** functions make straight lines (steady change).
- **Exponential** functions *multiply* by the same amount each step — like a rumour spreading or money with compound interest. They explode upward.
- **Logarithms** are the opposite: they ask *“how many times do I multiply 10 to get this number?”* $\log_{10}(1000) = 3$. Logs squash huge ranges (1 to 1,000,000) into small ones (0 to 6).
`,
      technical: md`
### Functions
$f: x \mapsto y$. The **domain** is the set of allowed inputs, the **range** the possible outputs. Graph = all points $(x, f(x))$.

| Family | Formula | Shape / use |
|---|---|---|
| Linear | $f(x) = mx + b$ | slope $m$, intercept $b$; regression |
| Quadratic | $f(x) = ax^2 + bx + c$ | parabola; squared-error loss |
| Exponential | $f(x) = a \cdot b^x$ | growth ($b>1$), decay ($0<b<1$); compounding |
| Logarithmic | $f(x) = \log_b x$ | slow growth; inverse of exponential |
| Sigmoid | $\sigma(x) = \dfrac{1}{1 + e^{-x}}$ | squashes to (0, 1); logistic regression |

### Exponent rules
$a^m a^n = a^{m+n}$, $\;\dfrac{a^m}{a^n} = a^{m-n}$, $\;(a^m)^n = a^{mn}$, $\;a^0 = 1$, $\;a^{-n} = \dfrac{1}{a^n}$, $\;a^{1/2} = \sqrt{a}$.

### Logarithms
$\log_b x = y \iff b^y = x$. Common bases: 10, 2 (bits), and $e \approx 2.71828$ (natural log, $\ln$).
- $\log(xy) = \log x + \log y$ → logs turn **multiplication into addition**.
- $\log(x/y) = \log x - \log y$, $\;\log(x^k) = k\log x$.
- Only defined for $x > 0$ (use $\log(1 + x)$ — \`np.log1p\` — when zeros occur).

### Why logs in Data Science
- **Skewed data** (incomes, prices, populations) becomes more symmetric after a log transform.
- **Multiplicative relationships** become linear: if $y = a x^b$, then $\log y = \log a + b \log x$.
- **Log-scale charts** show growth rates: constant % growth is a straight line.
- **Log-loss** (cross-entropy) is the standard loss for classification.
`,
      terms: [
        ['Function', 'A rule assigning exactly one output to each input.'],
        ['Domain', 'The set of valid inputs.'],
        ['Slope', 'Rate of change of a line: rise over run.'],
        ['Exponential growth', 'Growth by a constant factor per step.'],
        ['Logarithm', 'The exponent you need: log_b(x) = y means b^y = x.'],
        ['Natural log (ln)', 'Logarithm with base e ≈ 2.718.'],
        ['Sigmoid', 'S-shaped function mapping any number into (0, 1).'],
      ],
      realWorld: md`
**Compound interest:** \$1,000 at 6% per year grows as $1000 \cdot 1.06^t$. How long to double? Solve $1.06^t = 2$ → $t = \ln 2 / \ln 1.06 \approx 11.9$ years. (The “rule of 72”: 72 / 6 = 12.)

**Skewed incomes:** in a salary dataset most people earn 20–60k but a few earn millions. A histogram is a spike plus a long tail; after \`np.log\` it looks roughly bell-shaped, which many models handle better.
`,
      steps: [
        'Identify the input and output of the relationship.',
        'Plot it (or imagine it): straight, curved, exploding, flattening, S-shaped?',
        'Match it to a function family.',
        'If values span many orders of magnitude or grow multiplicatively, try a log transform.',
        'Use the inverse function (log ↔ exp) to solve for unknowns.',
      ],
      code: [
        {
          title: 'Exponential growth and logarithms',
          code: md`
import math
import numpy as np

years = np.arange(0, 31, 5)
balance = 1000 * 1.06 ** years
for y, b in zip(years, balance):
    print(f"year {y:2d}: {b:9,.2f}")

doubling = math.log(2) / math.log(1.06)
print(f"Doubling time: {doubling:.1f} years")

print(math.log10(1000), math.log2(8), round(math.log(math.e), 6))
print(np.isclose(math.log(20), math.log(4) + math.log(5)))
`,
          explanation: [
            'math for scalar functions, NumPy for arrays (Module 5).',
            '…',
            '`np.arange(0, 31, 5)` → 0, 5, …, 30.',
            '`**` on a NumPy array computes the exponential for every year at once.',
            'Print each year’s balance.',
            '…',
            'Solve $1.06^t = 2$ by taking logs of both sides: $t \\ln 1.06 = \\ln 2$.',
            '≈ 11.9 years.',
            'log10(1000) = 3, log2(8) = 3, ln(e) = 1.',
            'The product rule: ln(20) = ln(4) + ln(5) → True.',
          ],
        },
        {
          title: 'A log transform reduces skew',
          code: md`
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
incomes = rng.lognormal(mean=10.5, sigma=0.8, size=2000)

fig, axes = plt.subplots(1, 2, figsize=(9, 3))
axes[0].hist(incomes, bins=40, color="#6366f1")
axes[0].set_title("Income (skewed)")
axes[1].hist(np.log(incomes), bins=40, color="#10b981")
axes[1].set_title("log(income) (roughly symmetric)")
plt.tight_layout()
plt.show()

print("mean vs median (raw):", round(incomes.mean()), round(np.median(incomes)))
`,
          explanation: [
            'NumPy for numbers…',
            '…matplotlib for charts (Module 7).',
            'A random generator with a fixed seed (reproducible).',
            'Simulate 2,000 right-skewed incomes.',
            'Two side-by-side plots.',
            'Histogram of raw incomes: a long right tail.',
            '…',
            'Histogram of log(income): roughly bell-shaped.',
            '…',
            '…',
            'Display the figure (this app captures it as an image).',
            'In skewed data the mean is pulled above the median by the tail.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Taking the log of zero or negative values → -inf / NaN.', fix: 'Use `np.log1p(x)` (log of 1 + x) for non-negative data with zeros.' },
        { mistake: 'Thinking exponential means “fast” in everyday speech.', fix: 'Exponential means multiplying by a constant factor per step.' },
        { mistake: 'Misreading log-scale charts as linear.', fix: 'Check the axis: equal distances mean equal *ratios* on a log scale.' },
      ],
      exercises: [
        {
          id: 'm2-ex1', title: 'Doubling time', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`A user base grows 15% per month. Compute the number of months to triple, \`months_to_triple\`, using logarithms: solve $1.15^t = 3$.`,
          starter: md`
import math
months_to_triple = 0
print(months_to_triple)
`,
          solution: md`
import math
months_to_triple = math.log(3) / math.log(1.15)
print(months_to_triple)
`,
          tests: md`assert abs(months_to_triple - 7.8606) < 1e-3, f"Expected about 7.86, got {months_to_triple}"`,
          hints: ['Take ln of both sides: t·ln(1.15) = ln(3).'],
        },
        {
          id: 'm2-ex2', title: 'Sigmoid function', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Write \`sigmoid(z)\` returning $1 / (1 + e^{-z})$. Use \`math.exp\`.`,
          starter: md`
import math

def sigmoid(z):
    return z

print(sigmoid(0))
`,
          solution: md`
import math

def sigmoid(z):
    return 1 / (1 + math.exp(-z))

print(sigmoid(0))
`,
          tests: md`
assert sigmoid(0) == 0.5, "sigmoid(0) should be 0.5"
assert abs(sigmoid(2) - 0.880797) < 1e-5
assert sigmoid(-50) < 1e-10 and sigmoid(50) > 1 - 1e-10
`,
          hints: ['`math.exp(-z)` computes e to the power −z.'],
        },
        {
          id: 'm2-ex3', title: 'Log rules', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`What is $\log_{10}(100) + \log_{10}(1000)$? (a number)`,
          solution: '5', accepted: ['5', '5.0'],
          hints: ['10² = 100, 10³ = 1000.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which function grows by a constant **factor** each step?', options: ['Linear', 'Exponential', 'Logarithmic', 'Constant'], answer: 1, explanation: 'Exponential functions multiply by the base each step.' },
        { id: 'q2', kind: 'text', difficulty: 'beginner', prompt: 'What is $\\log_2(32)$?', accepted: ['5'], explanation: '2⁵ = 32.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: '$\\log(a \\cdot b)$ equals…', options: ['log a · log b', 'log a + log b', 'log(a) / log(b)', 'a · log b'], answer: 1, explanation: 'Logs turn multiplication into addition.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why apply a log transform to income data?', options: ['To make values negative', 'To reduce right skew and stabilise variance', 'To remove outliers entirely', 'Because models require logs'], answer: 1, explanation: 'Logs compress large values, making skewed distributions more symmetric.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'The sigmoid function outputs values in…', options: ['(−∞, ∞)', '[0, ∞)', '(0, 1)', '(−1, 1)'], answer: 2, explanation: 'σ(x) is always between 0 and 1 — ideal for probabilities.' },
        { id: 'q6', kind: 'text', difficulty: 'beginner', prompt: 'What is $5^0$?', accepted: ['1'], explanation: 'Any non-zero number to the power 0 is 1.' },
      ],
      summary: [
        'Functions map inputs to outputs; ML models are functions.',
        'Know the shapes: linear, quadratic, exponential, logarithmic, sigmoid.',
        'Exponent rules and log rules (log turns × into +).',
        'Log transforms tame skewed, multiplicative data.',
      ],
      resources: [KHAN, { label: '3Blue1Brown — What makes the natural log natural?', url: 'https://www.youtube.com/watch?v=m2MIpDrF7Es' }],
    },
    {
      id: 'math-summation-vectors',
      title: 'Summation Notation & Vectors',
      minutes: 40,
      difficulty: 'beginner',
      widgets: ['vectors'],
      objectives: [
        'Read and write sigma (Σ) notation and translate it to code',
        'Express the mean and variance with summations',
        'Understand vectors as lists of numbers and as arrows',
        'Compute vector addition, scalar multiplication, dot products and norms',
      ],
      intro: md`
Formulas in statistics and ML papers are full of $\sum$ symbols and bold letters like $\mathbf{x}$. They look scary but describe simple things: “add these up” and “a list of numbers”. Once you can read them, you can turn any formula into a few lines of Python.
`,
      simple: md`
$\sum$ (capital Greek *sigma*) means **“add them all up”**.

$\sum_{i=1}^{4} x_i$ means $x_1 + x_2 + x_3 + x_4$ — it is just a \`for\` loop that adds.

A **vector** is an ordered list of numbers, like a customer described by \`[age, income, visits] = [29, 52000, 14]\`. Geometrically it is an arrow from the origin to that point. Each customer in a dataset is a vector; the whole dataset is a stack of vectors (a matrix — next lesson).
`,
      technical: md`
### Summation
$$\sum_{i=1}^{n} x_i = x_1 + x_2 + \dots + x_n$$
- **Mean:** $\bar{x} = \dfrac{1}{n}\sum_{i=1}^{n} x_i$
- **Sample variance:** $s^2 = \dfrac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})^2$
- **Mean squared error:** $\text{MSE} = \dfrac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$
- Rules: $\sum c\,x_i = c\sum x_i$; $\;\sum (x_i + y_i) = \sum x_i + \sum y_i$; $\;\sum_{i=1}^{n} c = nc$.
- Product notation $\prod$ multiplies instead (used in likelihoods).

### Vectors
A vector $\mathbf{v} \in \mathbb{R}^n$ has $n$ components: $\mathbf{v} = (v_1, \dots, v_n)$.
- **Addition:** $\mathbf{u} + \mathbf{v} = (u_1 + v_1, \dots, u_n + v_n)$.
- **Scalar multiplication:** $c\mathbf{v} = (cv_1, \dots, cv_n)$.
- **Dot product:** $\mathbf{u}\cdot\mathbf{v} = \sum_i u_i v_i = \lVert\mathbf{u}\rVert\,\lVert\mathbf{v}\rVert\cos\theta$.
- **Norm (length):** $\lVert\mathbf{v}\rVert = \sqrt{\sum_i v_i^2}$ (Euclidean / L2). L1 norm: $\sum_i |v_i|$.
- **Euclidean distance:** $d(\mathbf{u},\mathbf{v}) = \lVert\mathbf{u} - \mathbf{v}\rVert$ — used by k-NN and k-means.
- **Cosine similarity:** $\dfrac{\mathbf{u}\cdot\mathbf{v}}{\lVert\mathbf{u}\rVert\lVert\mathbf{v}\rVert}$ — used for text and recommendation similarity.

A linear model’s prediction is a dot product: $\hat{y} = \mathbf{w}\cdot\mathbf{x} + b$.
`,
      terms: [
        ['Σ (sigma)', 'Summation symbol: add the terms over the index range.'],
        ['Index (i)', 'Counter variable in a summation, e.g. i = 1..n.'],
        ['Vector', 'An ordered list of numbers; an arrow in space.'],
        ['Scalar', 'A single number.'],
        ['Dot product', 'Sum of element-wise products of two vectors.'],
        ['Norm', 'The length of a vector.'],
        ['Cosine similarity', 'Similarity of direction between vectors, from −1 to 1.'],
      ],
      realWorld: md`
**Movie recommendations.** Each user is a vector of ratings for 5 genres: Ana = (5, 1, 4, 0, 2), Ben = (4, 0, 5, 1, 1), Carla = (0, 5, 1, 4, 5). Cosine similarity says Ana is much closer to Ben (≈ 0.93) than to Carla (≈ 0.27) — so recommend Ana the movies Ben loved. Real recommender systems do this with millions of dimensions.

**Shopping basket total** = prices · quantities (a dot product).
`,
      steps: [
        'Read the limits of the sum (where i starts and ends).',
        'Identify the term being summed (what depends on i).',
        'Write it as a loop or, better, a vectorised NumPy expression.',
        'For vectors, check both have the same length before combining them.',
        'Interpret the result: a total, an average, a length, a similarity.',
      ],
      code: [
        {
          title: 'From Σ to code',
          code: md`
import numpy as np

x = [4, 8, 6, 5, 7]
n = len(x)

total = 0
for i in range(n):
    total += x[i]
mean = total / n

var = sum((xi - mean) ** 2 for xi in x) / (n - 1)
print(total, mean, round(var, 3))

a = np.array(x)
print(a.sum(), a.mean(), round(a.var(ddof=1), 3))
`,
          explanation: [
            'NumPy provides vectorised versions of these formulas.',
            'Data values $x_1..x_5$.',
            '$n = 5$.',
            '$\\sum x_i$ as a literal loop…',
            '…Python indexes from 0, while math often starts at 1 — same idea.',
            '…',
            '$\\bar{x} = \\frac{1}{n}\\sum x_i$ = 6.0.',
            'Sample variance: sum of squared deviations divided by $n-1$ → 2.5.',
            'Print all three.',
            'The same with NumPy…',
            '…`ddof=1` means divide by $n - 1$ (sample variance).',
          ],
        },
        {
          title: 'Vector operations',
          code: md`
import numpy as np

ana = np.array([5, 1, 4, 0, 2])
ben = np.array([4, 0, 5, 1, 1])
carla = np.array([0, 5, 1, 4, 5])

print("sum:", ana + ben, " scaled:", 2 * ana)
print("dot:", np.dot(ana, ben), "=", (ana * ben).sum())
print("length of ana:", round(np.linalg.norm(ana), 3))
print("distance ana-ben:", round(np.linalg.norm(ana - ben), 3))

def cosine(u, v):
    return np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))

print("cos(ana, ben) =", round(cosine(ana, ben), 2))
print("cos(ana, carla) =", round(cosine(ana, carla), 2))
`,
          explanation: [
            '…',
            'Ana’s genre ratings as a vector.',
            'Ben’s.',
            'Carla’s.',
            'Element-wise addition and scalar multiplication.',
            'Dot product: 5·4 + 1·0 + 4·5 + 0·1 + 2·1 = 42 — same as summing element-wise products.',
            'Norm: $\\sqrt{25+1+16+0+4} = \\sqrt{46} ≈ 6.782$.',
            'Euclidean distance = norm of the difference.',
            'Cosine similarity formula…',
            '…',
            'Ana–Ben ≈ 0.93 (very similar tastes).',
            'Ana–Carla ≈ 0.27 (different tastes).',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Off-by-one between math (i = 1..n) and Python (0..n−1).', fix: 'Loop `for i in range(n)` covers n items; better still, loop over values directly.' },
        { mistake: 'Dividing variance by n when the formula says n − 1 (or vice versa).', fix: 'Sample variance uses n − 1 (`ddof=1`); population variance uses n.' },
        { mistake: 'Combining vectors of different lengths.', fix: 'Vector operations require matching dimensions.' },
      ],
      exercises: [
        {
          id: 'm3-ex1', title: 'Implement MSE', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Implement $\text{MSE} = \frac{1}{n}\sum_{i=1}^{n}(y_i - \hat{y}_i)^2$ as \`mse(y, y_hat)\` for two equal-length lists (plain Python, no NumPy required).`,
          starter: md`
def mse(y, y_hat):
    return 0

print(mse([3, 5, 7], [2, 5, 9]))
`,
          solution: md`
def mse(y, y_hat):
    return sum((a - b) ** 2 for a, b in zip(y, y_hat)) / len(y)

print(mse([3, 5, 7], [2, 5, 9]))
`,
          tests: md`
assert abs(mse([3, 5, 7], [2, 5, 9]) - 5 / 3) < 1e-9, "(1 + 0 + 4) / 3"
assert mse([1, 2], [1, 2]) == 0
`,
          hints: ['zip the two lists, square each difference, sum, divide by n.'],
        },
        {
          id: 'm3-ex2', title: 'Basket total with a dot product', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Use \`np.dot\` to compute \`total\`, the cost of the basket given \`prices\` and \`quantities\`.`,
          starter: md`
import numpy as np
prices = np.array([2.5, 10.0, 4.0])
quantities = np.array([4, 1, 3])
total = 0
print(total)
`,
          solution: md`
import numpy as np
prices = np.array([2.5, 10.0, 4.0])
quantities = np.array([4, 1, 3])
total = np.dot(prices, quantities)
print(total)
`,
          tests: md`assert abs(total - 32.0) < 1e-9, f"Expected 32.0, got {total}"`,
          hints: ['10 + 10 + 12.'],
        },
        {
          id: 'm3-ex3', title: 'Read the summation', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`Compute $\sum_{i=1}^{4} i^2$.`,
          solution: '30', accepted: ['30'],
          hints: ['1 + 4 + 9 + 16.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'Compute $\\sum_{i=1}^{3} 2i$.', accepted: ['12'], explanation: '2 + 4 + 6 = 12.' },
        { id: 'q2', kind: 'text', difficulty: 'beginner', prompt: 'What is the dot product of (1, 2, 3) and (4, 5, 6)?', accepted: ['32'], explanation: '4 + 10 + 18 = 32.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'If two vectors have a dot product of 0, they are…', options: ['Equal', 'Parallel', 'Perpendicular (orthogonal)', 'Both zero'], answer: 2, explanation: 'cos θ = 0 → θ = 90°.' },
        { id: 'q4', kind: 'text', difficulty: 'intermediate', prompt: 'What is the length (L2 norm) of the vector (3, 4)?', accepted: ['5', '5.0'], explanation: '√(9 + 16) = 5.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which formula is the sample mean?', options: ['$\\sum x_i$', '$\\frac{1}{n}\\sum x_i$', '$\\frac{1}{n-1}\\sum x_i^2$', '$\\prod x_i$'], answer: 1, explanation: 'Sum divided by the number of values.' },
      ],
      summary: [
        'Σ means sum; it is a loop that adds.',
        'Mean, variance and MSE are summations.',
        'Vectors: add, scale, dot product, norm, distance, cosine similarity.',
        'Linear predictions are dot products: ŷ = w·x + b.',
      ],
      resources: [MML, { label: '3Blue1Brown — Essence of Linear Algebra', url: 'https://www.3blue1brown.com/topics/linear-algebra' }],
    },
    {
      id: 'math-matrices',
      title: 'Matrices & Linear Algebra Fundamentals',
      minutes: 45,
      difficulty: 'intermediate',
      widgets: ['matrix-multiply'],
      objectives: [
        'Represent a dataset as a matrix and know its shape',
        'Perform matrix addition, scalar multiplication, transpose and multiplication',
        'Understand identity and inverse matrices and solve linear systems',
        'Connect matrix multiplication to linear models and neural networks',
      ],
      intro: md`
A dataset with 1,000 customers and 5 features is a **1000 × 5 matrix**. Linear regression, PCA, recommendation systems and neural networks are all built from matrix operations. You don’t need to compute them by hand — NumPy does that — but you must understand shapes and what multiplication means.
`,
      simple: md`
A **matrix** is a grid of numbers — a table without labels. It has **rows × columns**.

Multiplying a matrix by a vector is like a **recipe card**: each row says “take this much of each ingredient”, and the result tells you the total for each recipe. If ingredients cost \`[2, 3]\` dollars, and recipe A uses 1 and 4 units while recipe B uses 2 and 1, then the costs are \`[1·2 + 4·3, 2·2 + 1·3] = [14, 7]\`.
`,
      technical: md`
A matrix $A \in \mathbb{R}^{m \times n}$ has $m$ rows and $n$ columns; $a_{ij}$ is the entry in row $i$, column $j$. In data, rows are observations and columns are features: $X \in \mathbb{R}^{n_{\text{samples}} \times n_{\text{features}}}$.

| Operation | Rule | Shape requirement |
|---|---|---|
| Addition $A + B$ | element-wise | same shape |
| Scalar $cA$ | multiply every entry | — |
| Transpose $A^\top$ | rows ↔ columns, $(A^\top)_{ij} = a_{ji}$ | $m\times n \to n \times m$ |
| Product $AB$ | $(AB)_{ij} = \sum_k a_{ik} b_{kj}$ (row · column) | $(m\times n)(n\times p) \to m\times p$ |
| Element-wise $A \odot B$ | multiply matching entries | same shape |

- Matrix multiplication is **not commutative**: generally $AB \neq BA$.
- **Identity** $I$: ones on the diagonal; $AI = IA = A$.
- **Inverse** $A^{-1}$ (square, non-singular): $AA^{-1} = I$. Exists iff the **determinant** $\neq 0$.
- **Linear system** $A\mathbf{x} = \mathbf{b}$ → $\mathbf{x} = A^{-1}\mathbf{b}$. In code use \`np.linalg.solve(A, b)\` (more stable than computing the inverse).
- **Rank:** the number of linearly independent rows/columns; perfectly correlated features (multicollinearity) reduce rank.

### Where it shows up
- Linear regression predictions for all rows at once: $\hat{\mathbf{y}} = X\mathbf{w} + b$; least-squares solution: $\mathbf{w} = (X^\top X)^{-1}X^\top\mathbf{y}$ (the **normal equation**).
- Neural networks: each layer computes $\sigma(W\mathbf{x} + \mathbf{b})$.
- PCA uses eigenvectors of the covariance matrix $\frac{1}{n-1}X_c^\top X_c$.
`,
      terms: [
        ['Matrix', 'A rectangular grid of numbers with m rows and n columns.'],
        ['Shape', '(rows, columns) of a matrix.'],
        ['Transpose', 'Flipping rows and columns (Aᵀ).'],
        ['Matrix multiplication', 'Each entry is the dot product of a row of A and a column of B.'],
        ['Identity matrix', 'Square matrix with 1s on the diagonal; multiplying by it changes nothing.'],
        ['Inverse', 'A⁻¹ such that A·A⁻¹ = I; undoes A.'],
        ['Determinant', 'A number telling whether a square matrix is invertible (≠ 0).'],
      ],
      realWorld: md`
**Pricing three products from bundle sales.** A shop sells three bundles. Bundle 1 = 2 pens + 1 notebook + 1 ruler sold for \$9; bundle 2 = 1 pen + 3 notebooks for \$13; bundle 3 = 1 notebook + 2 rulers for \$7. What does each item cost? That is a system $A\mathbf{x} = \mathbf{b}$ with 3 unknowns, solved in one line with \`np.linalg.solve\` → pens \$2.50, notebooks \$3.50, rulers \$1.75.
`,
      steps: [
        'Write down the shapes of every matrix before multiplying.',
        'Check inner dimensions match: (m×**n**)·(**n**×p).',
        'The result has the outer dimensions: m×p.',
        'Use `@` (or `np.matmul`) for matrix products and `*` for element-wise.',
        'Solve systems with `np.linalg.solve`, not by inverting manually.',
      ],
      code: [
        {
          title: 'Matrix basics with NumPy',
          code: md`
import numpy as np

A = np.array([[1, 2, 0],
              [3, -1, 4]])
B = np.array([[2, 1],
              [0, 3],
              [-1, 5]])

print("A shape:", A.shape, " B shape:", B.shape)
print("A @ B =\n", A @ B)
print("B @ A shape:", (B @ A).shape)
print("A transpose =\n", A.T)
print("A * 2 =\n", A * 2)
print("A * A (element-wise) =\n", A * A)
`,
          explanation: [
            '…',
            'A is a 2 × 3 matrix (2 rows, 3 columns)…',
            '…written row by row.',
            'B is 3 × 2.',
            '…',
            '…',
            'Shapes: (2, 3) and (3, 2).',
            '`@` is matrix multiplication: (2×3)(3×2) → 2×2 = [[2, 7], [2, 20]] — the same as the interactive demo above.',
            'B @ A is (3×2)(2×3) → 3×3: a different result — order matters!',
            '`.T` transposes: 3 × 2.',
            'Scalar multiplication.',
            '`*` is element-wise, not matrix multiplication.',
          ],
        },
        {
          title: 'Solving a linear system and the normal equation',
          code: md`
import numpy as np

A = np.array([[2, 1, 1],
              [1, 3, 0],
              [0, 1, 2]], dtype=float)
b = np.array([9, 13, 7], dtype=float)
x = np.linalg.solve(A, b)
print("pen, notebook, ruler =", x)
print("check A @ x =", A @ x)

hours = np.array([1, 2, 3, 4, 5], dtype=float)
score = np.array([52, 58, 65, 70, 78], dtype=float)
X = np.column_stack([np.ones_like(hours), hours])
w = np.linalg.solve(X.T @ X, X.T @ score)
print(f"score ≈ {w[0]:.2f} + {w[1]:.2f} * hours")
`,
          explanation: [
            '…',
            'Coefficients: each row is a bundle; columns are pens, notebooks, rulers.',
            '…',
            '…',
            'Bundle prices.',
            'Solve $A\\mathbf{x} = \\mathbf{b}$ → [2.5, 3.5, 1.75].',
            '…',
            'Verify: multiplying back gives b.',
            'Hours studied and exam scores.',
            '…',
            'Design matrix X: a column of 1s (for the intercept) next to hours → shape (5, 2).',
            'Normal equation $(X^\\top X)\\mathbf{w} = X^\\top \\mathbf{y}$ solved for the regression weights.',
            'score ≈ 45.30 + 6.40 × hours — linear regression is linear algebra!',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Using `*` when you meant matrix multiplication.', fix: 'Use `@` for matrix products; `*` is element-wise.' },
        { mistake: 'Assuming AB = BA.', fix: 'Matrix multiplication is not commutative; check shapes and order.' },
        { mistake: '“ValueError: shapes not aligned”.', fix: 'Print `.shape` of both; inner dimensions must match. Transpose if needed.' },
        { mistake: 'Inverting a matrix to solve a system (`np.linalg.inv(A) @ b`).', fix: 'Use `np.linalg.solve(A, b)` — faster and numerically stable.' },
      ],
      exercises: [
        {
          id: 'm4-ex1', title: 'Predict with a matrix', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Each row of \`X\` is a house: [size in 100 sqft, bedrooms]. With weights \`w\` and intercept \`b\`, compute predicted prices for all houses at once as \`preds = X @ w + b\`.`,
          starter: md`
import numpy as np
X = np.array([[12, 2], [20, 3], [8, 1]])
w = np.array([15000, 8000])
b = 20000
preds = None
print(preds)
`,
          solution: md`
import numpy as np
X = np.array([[12, 2], [20, 3], [8, 1]])
w = np.array([15000, 8000])
b = 20000
preds = X @ w + b
print(preds)
`,
          tests: md`assert list(preds) == [216000, 344000, 148000], f"Got {preds}"`,
          hints: ['`X @ w` gives one number per row.', 'Then add the intercept.'],
        },
        {
          id: 'm4-ex2', title: 'Solve a 2×2 system', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Solve $3x + 2y = 18$ and $x - y = 1$ with \`np.linalg.solve\`. Store the solution array in \`sol\` (\`[x, y]\`).`,
          starter: md`
import numpy as np
sol = None
print(sol)
`,
          solution: md`
import numpy as np
A = np.array([[3, 2], [1, -1]], dtype=float)
b = np.array([18, 1], dtype=float)
sol = np.linalg.solve(A, b)
print(sol)
`,
          tests: md`assert np.allclose(sol, [4, 3]), f"Expected [4, 3], got {sol}"`,
          hints: ['A = [[3, 2], [1, -1]], b = [18, 1].'],
        },
        {
          id: 'm4-ex3', title: 'Result shape', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`A is 4×3 and B is 3×5. What is the shape of A @ B? (format: rows x columns, e.g. 2x2)`,
          solution: '4x5', accepted: ['4x5', '4 x 5', '(4, 5)', '(4,5)', '4×5'],
          hints: ['Outer dimensions give the result shape.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'A dataset with 500 rows and 8 features is a matrix of shape…', options: ['8 × 500', '500 × 8', '500 × 500', '8 × 8'], answer: 1, explanation: 'Rows (samples) × columns (features).' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Can a 2×3 matrix be multiplied by a 2×3 matrix (A @ B)?', options: ['Yes, result 2×3', 'Yes, result 3×3', 'No — inner dimensions 3 and 2 differ', 'Only element-wise'], answer: 2, explanation: 'For A@B, A’s columns must equal B’s rows. (Element-wise `*` would work.)' },
        { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'Compute the matrix-vector product [[1, 2], [3, 4]] · [1, 1]. (format: [a, b])', accepted: ['[3, 7]', '[3,7]'], explanation: 'Row 1: 1 + 2 = 3; row 2: 3 + 4 = 7.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does multiplying any matrix by the identity matrix do?', options: ['Doubles it', 'Transposes it', 'Leaves it unchanged', 'Inverts it'], answer: 2, explanation: 'AI = A.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'A square matrix is invertible if and only if…', options: ['All entries are positive', 'Its determinant is non-zero', 'It is symmetric', 'It has more rows than columns'], answer: 1, explanation: 'det(A) ≠ 0 ⇔ A is invertible (full rank).' },
      ],
      summary: [
        'Datasets are matrices: samples × features.',
        'Matrix product (m×n)(n×p) → m×p; each entry is a row·column dot product.',
        'Transpose, identity and inverse; solve systems with np.linalg.solve.',
        'Linear regression and neural networks are built from matrix multiplications.',
      ],
      resources: [MML, { label: '3Blue1Brown — Matrix multiplication as composition', url: 'https://www.3blue1brown.com/lessons/matrix-multiplication' }],
    },
    {
      id: 'math-derivatives',
      title: 'Limits, Derivatives & Partial Derivatives',
      minutes: 45,
      difficulty: 'intermediate',
      widgets: ['derivative'],
      objectives: [
        'Explain limits and the derivative as an instantaneous rate of change / slope',
        'Apply the power, constant, sum and chain rules',
        'Approximate derivatives numerically in code',
        'Compute partial derivatives of multi-variable functions',
      ],
      intro: md`
Training a model means finding the parameters that make the error as small as possible. To know *which direction* reduces the error, you need the **derivative**: it tells you how much the output changes when you nudge the input. This lesson builds the intuition and the handful of rules you actually need.
`,
      simple: md`
Imagine driving. Your speedometer shows how fast your **position is changing right now** — that is a derivative.

On a graph, the derivative at a point is the **slope of the curve there**: steep uphill = large positive; flat = zero; downhill = negative.

A **limit** describes what a value approaches as you get closer and closer — we find the slope by measuring between two points and moving them closer together until the gap is (almost) zero. Try it in the demo above by shrinking *h*.
`,
      technical: md`
### Limits
$\lim_{x \to a} f(x) = L$ means $f(x)$ gets arbitrarily close to $L$ as $x$ approaches $a$. Example: $\lim_{x\to 0}\frac{\sin x}{x} = 1$, even though the expression is undefined at 0.

### Derivative
$$f'(x) = \lim_{h \to 0} \frac{f(x + h) - f(x)}{h}$$
The slope of the tangent line; also written $\frac{df}{dx}$.

### Rules you need
| Rule | Formula |
|---|---|
| Constant | $(c)' = 0$ |
| Power | $(x^n)' = n x^{n-1}$ |
| Constant multiple | $(c f)' = c f'$ |
| Sum | $(f + g)' = f' + g'$ |
| Exponential / log | $(e^x)' = e^x$, $\;(\ln x)' = 1/x$ |
| Product | $(fg)' = f'g + fg'$ |
| **Chain** | $\big(f(g(x))\big)' = f'(g(x))\,g'(x)$ |

The chain rule is the heart of **backpropagation** in neural networks. Sigmoid has the neat derivative $\sigma'(x) = \sigma(x)(1 - \sigma(x))$.

### Critical points
Where $f'(x) = 0$ the tangent is flat: a local minimum, maximum or saddle. The second derivative $f''$ tells which: $f'' > 0$ → minimum (curving up).

### Partial derivatives
For $f(x, y)$, the partial derivative $\frac{\partial f}{\partial x}$ treats $y$ as a constant. Example: $f(x, y) = x^2 y + 3y$ → $\frac{\partial f}{\partial x} = 2xy$, $\;\frac{\partial f}{\partial y} = x^2 + 3$.

### Numerical derivative
In code: $f'(x) \approx \frac{f(x+h) - f(x-h)}{2h}$ with small $h$ (central difference) — useful to check analytic derivatives.
`,
      terms: [
        ['Limit', 'The value a function approaches as the input approaches some point.'],
        ['Derivative', 'Instantaneous rate of change; slope of the tangent.'],
        ['Tangent line', 'Line touching a curve at one point with the same slope.'],
        ['Chain rule', 'Derivative of a composition: outer′(inner) × inner′.'],
        ['Critical point', 'Where the derivative is zero (possible min/max).'],
        ['Partial derivative', 'Derivative with respect to one variable, others held fixed.'],
      ],
      realWorld: md`
**Pricing.** Weekly profit as a function of price is modelled as $P(p) = -20p^2 + 1400p - 8000$. Where is profit maximised? Set $P'(p) = -40p + 1400 = 0$ → $p = 35$. Since $P''(p) = -40 < 0$, that is a maximum: profit \$16,500.

**Machine learning.** The loss $L(w) = \frac{1}{n}\sum(y_i - w x_i)^2$ has derivative $\frac{dL}{dw} = -\frac{2}{n}\sum x_i(y_i - w x_i)$, which tells gradient descent which way to move $w$ (next lesson).
`,
      steps: [
        'Write the function clearly (expand brackets if it helps).',
        'Differentiate term by term with the power/sum/constant rules.',
        'Use the chain rule for nested functions (e.g. squared errors).',
        'Set the derivative to zero to find critical points; check with the second derivative.',
        'Verify numerically with a central difference in code.',
      ],
      code: [
        {
          title: 'Numerical vs analytic derivatives',
          code: md`
def f(x):
    return 0.5 * x**3 - 2 * x

def f_prime(x):
    return 1.5 * x**2 - 2

def numeric_derivative(func, x, h=1e-5):
    return (func(x + h) - func(x - h)) / (2 * h)

for x in [-2, 0, 1, 3]:
    print(f"x={x:>2}: analytic={f_prime(x):7.3f}  numeric={numeric_derivative(f, x):7.3f}")

# Profit maximisation
P = lambda p: -20 * p**2 + 1400 * p - 8000
best_p = 1400 / 40
print("best price:", best_p, "profit:", P(best_p))
print("slope just below/above:", round(numeric_derivative(P, 34), 2), round(numeric_derivative(P, 36), 2))
`,
          explanation: [
            'The function from the interactive demo.',
            '…',
            'Its derivative by the power rule: $0.5 \\cdot 3x^2 - 2$.',
            '…',
            'A general numerical derivative using the central difference…',
            '…with a tiny step h.',
            'Compare both at several points…',
            '…they agree to 3 decimals.',
            'A profit function of price.',
            'Setting $P\'(p) = -40p + 1400 = 0$ gives p = 35.',
            'Maximum profit = 16,500.',
            'Slope is positive just below 35 (+40) and negative above (−40) → it is a maximum.',
          ],
        },
        {
          title: 'Partial derivatives of a loss function',
          code: md`
import numpy as np

x = np.array([1, 2, 3, 4], dtype=float)
y = np.array([3, 5, 7, 9], dtype=float)   # true relation: y = 2x + 1

def loss(w, b):
    return np.mean((y - (w * x + b)) ** 2)

def grad(w, b):
    err = y - (w * x + b)
    dw = -2 * np.mean(x * err)
    db = -2 * np.mean(err)
    return dw, db

h = 1e-6
w, b = 1.0, 0.0
print("analytic:", grad(w, b))
print("numeric: ", ((loss(w + h, b) - loss(w - h, b)) / (2 * h), (loss(w, b + h) - loss(w, b - h)) / (2 * h)))
print("at the true parameters:", grad(2.0, 1.0), "loss =", loss(2.0, 1.0))
`,
          explanation: [
            '…',
            'Inputs…',
            '…and targets generated by y = 2x + 1.',
            'Mean squared error as a function of **two** parameters w and b.',
            '…',
            'Its partial derivatives (chain rule on the squared error):',
            'the error for each point,',
            '$\\partial L/\\partial w = -\\frac{2}{n}\\sum x_i e_i$,',
            '$\\partial L/\\partial b = -\\frac{2}{n}\\sum e_i$.',
            '…',
            'Tiny step for numerical checks.',
            'A poor starting guess w = 1, b = 0.',
            'Analytic gradient (−25, −8): both negative → increasing w and b reduces loss.',
            'Numerical partial derivatives agree.',
            'At w = 2, b = 1 both partials are 0 and the loss is 0: the minimum.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Forgetting the chain rule: d/dx (3x + 1)² = 2(3x + 1).', fix: 'Multiply by the inner derivative: 2(3x + 1)·3.' },
        { mistake: 'Assuming f′(x) = 0 always means a minimum.', fix: 'It could be a maximum or saddle point; check f″ or nearby slopes.' },
        { mistake: 'Using a huge h in numerical derivatives (inaccurate) or 1e-15 (round-off error).', fix: 'h around 1e-5 with the central difference works well.' },
      ],
      exercises: [
        {
          id: 'm5-ex1', title: 'Power rule', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`For $g(x) = 4x^3 - 6x + 2$, write \`g_prime(x)\` returning the analytic derivative.`,
          starter: md`
def g_prime(x):
    return 0

print(g_prime(2))
`,
          solution: md`
def g_prime(x):
    return 12 * x**2 - 6

print(g_prime(2))
`,
          tests: md`
for x in [-2, 0, 1.5, 3]:
    g = lambda t: 4 * t**3 - 6 * t + 2
    num = (g(x + 1e-6) - g(x - 1e-6)) / 2e-6
    assert abs(g_prime(x) - num) < 1e-3, f"g_prime({x}) = {g_prime(x)}, expected ≈ {num:.3f}"
`,
          hints: ['Power rule on each term: 4·3x², −6, and 0 for the constant.'],
        },
        {
          id: 'm5-ex2', title: 'Numerical derivative', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Implement \`derivative(func, x, h=1e-5)\` using the central difference $\frac{f(x+h) - f(x-h)}{2h}$.`,
          starter: md`
def derivative(func, x, h=1e-5):
    return 0

import math
print(derivative(math.sin, 0))
`,
          solution: md`
def derivative(func, x, h=1e-5):
    return (func(x + h) - func(x - h)) / (2 * h)

import math
print(derivative(math.sin, 0))
`,
          tests: md`
import math
assert abs(derivative(math.sin, 0) - 1) < 1e-6, "d/dx sin(x) at 0 is cos(0) = 1"
assert abs(derivative(lambda t: t**2, 3) - 6) < 1e-6
assert abs(derivative(math.exp, 1) - math.e) < 1e-5
`,
          hints: ['Evaluate func at x + h and x − h.'],
        },
        {
          id: 'm5-ex3', title: 'Partial derivative', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`For $f(x, y) = 3x^2 y + y^3$, what is $\frac{\partial f}{\partial x}$ at $(x, y) = (1, 2)$?`,
          solution: '12', accepted: ['12'],
          hints: ['Treat y as a constant: ∂f/∂x = 6xy.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'What is the derivative of $x^5$?', accepted: ['5x^4', '5x**4', '5*x^4', '5*x**4', '5x⁴'], explanation: 'Power rule: n·xⁿ⁻¹.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Geometrically, the derivative at a point is…', options: ['The area under the curve', 'The slope of the tangent line', 'The y-intercept', 'The maximum value'], answer: 1, explanation: 'It is the instantaneous slope.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'What is $\\frac{d}{dx}(2x + 1)^2$?', options: ['2(2x + 1)', '4(2x + 1)', '(2x + 1)', '4x'], answer: 1, explanation: 'Chain rule: 2(2x + 1) · 2.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'If $f\'(a) = 0$ and $f\'\'(a) > 0$, then a is…', options: ['A local maximum', 'A local minimum', 'Not a critical point', 'An inflection point'], answer: 1, explanation: 'Flat and curving upward → minimum.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'For $f(x, y) = x^2 + xy$, $\\partial f/\\partial y$ is…', options: ['2x + y', 'x', '2x', 'y'], answer: 1, explanation: 'x² is constant w.r.t. y; xy → x.' },
      ],
      summary: [
        'The derivative = instantaneous rate of change = tangent slope (a limit).',
        'Rules: power, constant, sum, product, chain; e^x and ln x.',
        'Critical points where f′ = 0; check with f″.',
        'Partial derivatives hold other variables fixed — the building blocks of gradients.',
      ],
      resources: [{ label: '3Blue1Brown — Essence of Calculus', url: 'https://www.3blue1brown.com/topics/calculus' }, KHAN],
    },
    {
      id: 'math-gradients-optimization',
      title: 'Gradients & Basic Optimization',
      minutes: 40,
      difficulty: 'intermediate',
      widgets: ['gradient-descent'],
      objectives: [
        'Define the gradient as the vector of partial derivatives',
        'Explain why moving against the gradient decreases a function',
        'Implement gradient descent and tune the learning rate',
        'Fit a linear model by minimising MSE with gradient descent',
      ],
      intro: md`
Almost every machine-learning model is trained by **optimisation**: define a *loss* (how wrong the model is) and find parameters that minimise it. **Gradient descent** — repeatedly stepping downhill — is the workhorse algorithm behind linear models, logistic regression and every neural network.
`,
      simple: md`
Imagine standing on a foggy mountain and wanting to reach the valley. You can’t see far, but you can feel which way the ground slopes under your feet. So you take a small step **downhill**, feel again, step again… until the ground is flat.

- The **gradient** tells you which way is *uphill* (and how steep).
- **Gradient descent** steps the opposite way.
- The **learning rate** is your step size: too small → painfully slow; too large → you overshoot and bounce around (or fly off the mountain!). Try it in the demo.
`,
      technical: md`
### Gradient
For $f(\mathbf{w})$ with $\mathbf{w} = (w_1, \dots, w_n)$:
$$\nabla f(\mathbf{w}) = \left(\frac{\partial f}{\partial w_1}, \dots, \frac{\partial f}{\partial w_n}\right)$$
It points in the direction of **steepest increase**; $-\nabla f$ is the steepest decrease. At a minimum, $\nabla f = \mathbf{0}$.

### Gradient descent
$$\mathbf{w}_{t+1} = \mathbf{w}_t - \eta\,\nabla f(\mathbf{w}_t)$$
- $\eta$ (eta) = **learning rate**.
- Stop when the gradient is tiny, the loss stops improving, or after a maximum number of iterations.
- **Convex** functions (bowl-shaped, like MSE for linear regression) have a single global minimum, so gradient descent finds it with a suitable η. Non-convex losses (neural networks) have many local minima/saddles.
- **Feature scaling** (standardising inputs) makes the loss bowl rounder and gradient descent much faster.

### Variants
- **Batch GD:** gradient on all data each step.
- **Stochastic GD (SGD):** one sample per step — noisy but cheap.
- **Mini-batch GD:** small batches (e.g. 32) — the standard in deep learning.
- **Momentum, Adam:** adaptive methods that smooth and scale steps.

### For linear regression with MSE
$L(w, b) = \frac{1}{n}\sum (y_i - (wx_i + b))^2$, $\;\frac{\partial L}{\partial w} = -\frac{2}{n}\sum x_i e_i$, $\;\frac{\partial L}{\partial b} = -\frac{2}{n}\sum e_i$ where $e_i = y_i - (wx_i + b)$.
`,
      terms: [
        ['Loss function', 'A number measuring how wrong a model’s predictions are.'],
        ['Gradient (∇)', 'Vector of partial derivatives; points uphill.'],
        ['Gradient descent', 'Iteratively moving parameters against the gradient.'],
        ['Learning rate (η)', 'Step size of each update.'],
        ['Convergence', 'When updates no longer meaningfully change the loss.'],
        ['Convex', 'Bowl-shaped; any local minimum is the global minimum.'],
        ['SGD / mini-batch', 'Gradient descent using one sample / small batches per step.'],
      ],
      realWorld: md`
When you train a scikit-learn \`SGDRegressor\`, a logistic regression, or a deep network in PyTorch, this exact loop runs under the hood — often millions of times. Choosing the learning rate is one of the most important *hyperparameters*: practitioners plot the loss curve per iteration to check it decreases smoothly.
`,
      steps: [
        'Choose a loss function and compute its gradient (analytically or automatically).',
        'Initialise parameters (zeros or small random values).',
        'Repeat: compute gradient, update parameters with `w -= lr * grad`.',
        'Track the loss each iteration and plot it.',
        'Tune the learning rate: decrease it if the loss diverges or oscillates; increase it if it crawls.',
      ],
      code: [
        {
          title: 'Gradient descent fits a line',
          code: md`
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(1)
x = rng.uniform(0, 10, 50)
y = 3.0 * x + 7 + rng.normal(0, 2, 50)

w, b, lr = 0.0, 0.0, 0.01
history = []
for step in range(2000):
    err = y - (w * x + b)
    dw = -2 * np.mean(x * err)
    db = -2 * np.mean(err)
    w -= lr * dw
    b -= lr * db
    history.append(np.mean(err ** 2))

print(f"learned: y ≈ {w:.2f}x + {b:.2f}   (true: 3x + 7)")
print("final MSE:", round(history[-1], 3))
print("closed form:", np.round(np.polyfit(x, y, 1), 2))

plt.plot(history)
plt.yscale("log")
plt.xlabel("iteration"); plt.ylabel("MSE (log scale)"); plt.title("Loss curve")
plt.show()
`,
          explanation: [
            '…',
            '…',
            'Reproducible random data.',
            '50 random x values between 0 and 10.',
            'True relationship y = 3x + 7 plus noise.',
            'Start at w = b = 0 with learning rate 0.01.',
            'Record the loss at each step.',
            'Repeat 2,000 times:',
            'current errors,',
            'partial derivative w.r.t. w,',
            'partial derivative w.r.t. b,',
            'step against the gradient for w…',
            '…and b.',
            'Store the MSE.',
            'The learned parameters are close to 3 and 7 (noise prevents an exact match).',
            '…',
            '`np.polyfit` computes the exact least-squares answer for comparison — gradient descent converged to it.',
            'Plot the loss curve on a log scale: it should fall steadily and flatten.',
            '…',
            '…',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Learning rate too large → loss explodes to inf/NaN.', fix: 'Reduce it by 10× and retry; also standardise features.' },
        { mistake: 'Adding the gradient instead of subtracting it (gradient ascent!).', fix: '`w = w - lr * grad`.' },
        { mistake: 'Not checking the loss curve.', fix: 'Always plot loss vs iteration to diagnose convergence.' },
      ],
      exercises: [
        {
          id: 'm6-ex1', title: 'Minimise a 1-D function', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Use gradient descent to minimise $f(x) = (x - 4)^2 + 2$ starting at \`x = 0\` with learning rate 0.1 for 100 steps. The derivative is $f'(x) = 2(x - 4)$. Store the final value in \`x\`.`,
          starter: md`
x = 0.0
lr = 0.1
for _ in range(100):
    pass
print(x)
`,
          solution: md`
x = 0.0
lr = 0.1
for _ in range(100):
    x -= lr * 2 * (x - 4)
print(x)
`,
          tests: md`assert abs(x - 4) < 1e-6, f"x should converge to 4, got {x}"`,
          hints: ['Update rule: `x -= lr * gradient`.', 'gradient = `2 * (x - 4)`.'],
        },
        {
          id: 'm6-ex2', title: 'Fix the divergence', type: 'debug', lang: 'python', difficulty: 'intermediate',
          prompt: md`This gradient descent on $f(w) = w^2$ blows up. Change **only the learning rate** so that \`w\` ends below 0.001 in absolute value.`,
          starter: md`
w = 5.0
lr = 1.5
for _ in range(50):
    w -= lr * 2 * w
print(w)
`,
          solution: md`
w = 5.0
lr = 0.1
for _ in range(50):
    w -= lr * 2 * w
print(w)
`,
          tests: md`assert abs(w) < 1e-3, f"w should approach 0, got {w}"`,
          hints: ['Each step multiplies w by (1 − 2·lr). For convergence |1 − 2·lr| < 1.', 'Try lr = 0.1.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'The gradient points in the direction of…', options: ['Steepest decrease', 'Steepest increase', 'Zero change', 'The origin'], answer: 1, explanation: 'So gradient descent moves the opposite way.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'What happens if the learning rate is far too large?', options: ['Training is slow but stable', 'Updates overshoot and the loss can diverge', 'Nothing changes', 'The gradient becomes zero'], answer: 1, explanation: 'Big steps jump over the minimum and can explode.' },
        { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'One gradient-descent step on $f(x) = x^2$ from x = 3 with η = 0.25 gives x = ?', accepted: ['1.5'], explanation: "f'(3) = 6; 3 − 0.25·6 = 1.5." },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Mini-batch gradient descent computes each update using…', options: ['All data', 'A single sample', 'A small subset of samples', 'No data'], answer: 2, explanation: 'Small batches balance speed and stability.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why standardise features before gradient descent?', options: ['It is required by NumPy', 'It makes the loss surface better conditioned so convergence is faster', 'It removes outliers', 'It increases the learning rate automatically'], answer: 1, explanation: 'Features on very different scales create a stretched “valley” that GD zig-zags down.' },
      ],
      summary: [
        'The gradient collects partial derivatives and points uphill.',
        'Gradient descent: w ← w − η∇L; repeat until convergence.',
        'The learning rate controls step size — watch the loss curve.',
        'Variants (SGD, mini-batch, Adam) power modern ML.',
      ],
      resources: [{ label: '3Blue1Brown — Gradient descent, how neural networks learn', url: 'https://www.3blue1brown.com/lessons/gradient-descent' }, MML],
    },
  ],
};
