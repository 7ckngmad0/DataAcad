import type { Module } from '../types.ts';
import { md } from './md.ts';

const MPL = { label: 'Matplotlib — Quick start guide', url: 'https://matplotlib.org/stable/users/explain/quick_start.html' };
const SNS = { label: 'seaborn tutorial', url: 'https://seaborn.pydata.org/tutorial.html' };
const FTD = { label: 'From Data to Viz — choose the right chart', url: 'https://www.data-to-viz.com/' };

export const m07: Module = {
  id: 'viz',
  number: 7,
  title: 'Data Visualization',
  short: 'Visualization',
  icon: 'chart',
  description:
    'Why visualisation matters, matplotlib and seaborn from the ground up, every core chart type (bar, line, histogram, scatter, box, pie, heatmap, pair plot), choosing the right chart, interpreting graphs and avoiding misleading visuals.',
  skills: ['matplotlib', 'seaborn', 'Chart selection', 'Distributions', 'Relationships', 'Heatmaps', 'Honest visual design'],
  lessons: [
    {
      id: 'viz-matplotlib-basics',
      title: 'Why Visualization Matters & Matplotlib Fundamentals',
      minutes: 45,
      difficulty: 'beginner',
      widgets: ['chart-gallery'],
      objectives: [
        'Explain why visualisation is essential (Anscombe’s quartet)',
        'Understand matplotlib’s Figure and Axes objects',
        'Create and label line charts and bar charts',
        'Build multi-panel figures with subplots',
      ],
      intro: md`
Humans spot patterns in pictures far faster than in tables. A good chart reveals trends, outliers and comparisons instantly — and communicates findings to people who will never read your code. **matplotlib** is Python’s foundational plotting library; pandas and seaborn are built on top of it.
`,
      simple: md`
Think of matplotlib as a painting kit:
- The **Figure** is the canvas.
- Each **Axes** is one picture (one chart) on the canvas — a canvas can hold several.
- You draw on an Axes with methods like \`ax.plot()\` (lines) or \`ax.bar()\` (bars), then add a **title** and **axis labels** so viewers know what they’re looking at.

A chart without labels is like a map without a legend.
`,
      technical: md`
### Why visualise: Anscombe’s quartet
Four datasets with (almost) identical means, variances, correlation (0.82) and regression line — yet completely different shapes when plotted (a line, a curve, an outlier-driven line, a vertical cluster). **Summary statistics can hide the truth; always plot.**

### Two interfaces
- **Object-oriented (recommended):** \`fig, ax = plt.subplots()\` then \`ax.plot(...)\`, \`ax.set_title(...)\`.
- **pyplot state machine:** \`plt.plot(...)\`, \`plt.title(...)\` — quick, but less explicit for multi-panel figures.

### Core methods
| Task | Method |
|---|---|
| line chart | \`ax.plot(x, y, marker="o", linestyle="--", color=..., label=...)\` |
| bar / horizontal bar | \`ax.bar(cats, values)\`, \`ax.barh(...)\` |
| title & labels | \`ax.set_title\`, \`ax.set_xlabel\`, \`ax.set_ylabel\` |
| legend | \`ax.legend()\` (uses \`label=\`) |
| limits & ticks | \`ax.set_ylim(0, None)\`, \`ax.tick_params(axis="x", rotation=45)\` |
| grid & annotations | \`ax.grid(alpha=.3)\`, \`ax.annotate("peak", xy=..., xytext=...)\` |
| layout | \`fig, axes = plt.subplots(2, 2, figsize=(10, 6))\`, \`fig.tight_layout()\` |
| save | \`fig.savefig("chart.png", dpi=150, bbox_inches="tight")\` |

**pandas plotting shortcut:** \`df.plot(x="date", y="sales")\`, \`series.plot.bar()\`, \`df.plot.scatter(...)\` — returns an Axes you can customise.

**Colour:** use a consistent palette; reserve a strong colour for the thing you want viewers to notice; consider colour-blind-friendly palettes (e.g. \`tab10\`, viridis).
`,
      terms: [
        ['Figure', 'The whole canvas holding one or more charts.'],
        ['Axes', 'A single chart area with its own axes, title and data.'],
        ['subplots', 'Function creating a figure with a grid of Axes.'],
        ['Legend', 'Key explaining what each colour/line represents.'],
        ['Anscombe’s quartet', 'Four datasets with identical statistics but very different plots.'],
        ['DPI', 'Dots per inch: resolution of a saved image.'],
      ],
      realWorld: md`
In 1854, Dr John Snow mapped cholera deaths in London as dots on a street map. The cluster around the Broad Street water pump convinced officials to remove the pump handle — a visualisation that helped found modern epidemiology. Today, dashboards of daily cases, hospital capacity and vaccination rates played the same role during COVID-19.
`,
      steps: [
        'Decide the message of the chart in one sentence.',
        'Create `fig, ax = plt.subplots(figsize=...)`.',
        'Draw the data with the right method (plot, bar...).',
        'Add a descriptive title, axis labels with units, and a legend if needed.',
        'Tidy: start bar axes at zero, rotate long labels, `tight_layout()`, then show or save.',
      ],
      code: [
        {
          title: 'Anscombe’s quartet: same statistics, different stories',
          code: md`
import numpy as np
import matplotlib.pyplot as plt

x = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5]
x4 = [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8]
ys = {
    "I": [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68],
    "II": [9.14, 8.14, 8.74, 8.77, 9.26, 8.10, 6.13, 3.10, 9.13, 7.26, 4.74],
    "III": [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73],
    "IV": [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.50, 5.56, 7.91, 6.89],
}
fig, axes = plt.subplots(1, 4, figsize=(12, 3), sharey=True)
for ax, (name, y) in zip(axes, ys.items()):
    xs = x4 if name == "IV" else x
    ax.scatter(xs, y, color="#6366f1")
    m, b = np.polyfit(xs, y, 1)
    ax.plot([3, 20], [m * 3 + b, m * 20 + b], color="#f59e0b")
    ax.set_title(f"{name}: mean y={np.mean(y):.2f}, r={np.corrcoef(xs, y)[0, 1]:.2f}")
fig.tight_layout()
plt.show()
`,
          explanation: [
            '…',
            '…',
            'x values shared by datasets I–III.',
            'Dataset IV has its own x values.',
            'The four y series (Anscombe, 1973).',
            '…',
            '…',
            '…',
            '…',
            'One figure with four Axes side by side, sharing the y-axis.',
            'Loop over Axes and datasets together.',
            '…',
            'Scatter the points.',
            'Fit a regression line…',
            '…and draw it — nearly identical lines in all four panels.',
            'The titles show identical means and correlations, yet the shapes differ completely.',
            '…',
            '…',
          ],
        },
        {
          title: 'Line and bar charts with proper labels',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
monthly = sales.groupby(sales["order_date"].dt.to_period("M"))["revenue"].sum()
by_cat = sales.groupby("category")["revenue"].sum().sort_values()

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(11, 3.8))
ax1.plot(monthly.index.astype(str), monthly.values / 1000, marker="o", color="#4f46e5")
ax1.set_title("Monthly revenue, 2024-2025")
ax1.set_xlabel("Month"); ax1.set_ylabel("Revenue ($ thousands)")
ax1.tick_params(axis="x", rotation=90, labelsize=7)
ax1.grid(alpha=0.3)
peak = monthly.idxmax()
ax1.annotate("peak", xy=(str(peak), monthly.max() / 1000), xytext=(2, monthly.max() / 1000 * 0.95),
             arrowprops=dict(arrowstyle="->"))

ax2.barh(by_cat.index, by_cat.values / 1000, color=["#cbd5e1", "#cbd5e1", "#4f46e5"])
ax2.set_title("Revenue by category"); ax2.set_xlabel("Revenue ($ thousands)")
for i, v in enumerate(by_cat.values / 1000):
    ax2.text(v, i, f" {v:.0f}k", va="center")
fig.tight_layout()
plt.show()
`,
          explanation: [
            '…',
            '…',
            'Load sales.',
            'Total revenue per month.',
            'Total revenue per category, sorted for a tidy bar chart.',
            '…',
            'Two Axes side by side.',
            'Line chart over time (periods converted to strings for the x-axis); values in thousands.',
            'Descriptive title.',
            'Axis labels **with units**.',
            'Rotate many month labels so they don’t overlap.',
            'A light grid helps read values.',
            'Find the best month…',
            '…and annotate it with an arrow.',
            '…',
            '…',
            'Horizontal bars handle long category names; highlight the top category with a strong colour.',
            '…',
            'Direct labels on the bars remove the need to read the axis.',
            '…',
            '…',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'No title or axis labels (or labels without units).', fix: 'Every chart needs a title and labelled axes with units.' },
        { mistake: 'Overlapping tick labels.', fix: 'Rotate them, use horizontal bars, or show fewer ticks.' },
        { mistake: 'Using rainbow colours for no reason.', fix: 'Use colour purposefully: neutral for context, a highlight for the key message.' },
        { mistake: 'Mixing `plt.` and `ax.` calls in multi-panel figures and drawing on the wrong panel.', fix: 'Use the object-oriented `ax.` interface consistently.' },
      ],
      exercises: [
        {
          id: 'viz1-ex1', title: 'Your first labelled line chart', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Create a line chart of \`visitors\` by \`day\` using \`fig, ax = plt.subplots()\` and \`ax.plot\`. Set the title to \`Daily visitors\`, the x-label to \`Day\` and the y-label to \`Visitors\`.`,
          starter: md`
import matplotlib.pyplot as plt
day = [1, 2, 3, 4, 5, 6, 7]
visitors = [120, 135, 128, 150, 190, 240, 230]
`,
          solution: md`
import matplotlib.pyplot as plt
day = [1, 2, 3, 4, 5, 6, 7]
visitors = [120, 135, 128, 150, 190, 240, 230]
fig, ax = plt.subplots()
ax.plot(day, visitors, marker="o")
ax.set_title("Daily visitors")
ax.set_xlabel("Day")
ax.set_ylabel("Visitors")
plt.show()
`,
          tests: md`
import matplotlib.pyplot as plt
_ax = plt.gcf().axes[0] if plt.get_fignums() else None
assert _ax is not None, "No chart was created"
assert len(_ax.get_lines()) >= 1, "Use ax.plot to draw a line"
assert list(_ax.get_lines()[0].get_ydata()) == visitors, "Plot visitors on the y-axis"
assert _ax.get_title() == "Daily visitors", f"Title is {_ax.get_title()!r}"
assert _ax.get_xlabel() == "Day" and _ax.get_ylabel() == "Visitors", "Set both axis labels"
`,
          hints: ['`fig, ax = plt.subplots()` then `ax.plot(day, visitors)`.', '`ax.set_title(...)`, `ax.set_xlabel(...)`, `ax.set_ylabel(...)`.'],
        },
        {
          id: 'viz1-ex2', title: 'Sorted bar chart', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`From \`data/expenses.csv\`, plot a **horizontal bar chart** (\`ax.barh\`) of total amount per category, **sorted ascending** (largest bar at the top). Give it a title.`,
          starter: md`
import pandas as pd
import matplotlib.pyplot as plt
exp = pd.read_csv("data/expenses.csv")
`,
          solution: md`
import pandas as pd
import matplotlib.pyplot as plt
exp = pd.read_csv("data/expenses.csv")
totals = exp.groupby("category")["amount"].sum().sort_values()
fig, ax = plt.subplots(figsize=(7, 4))
ax.barh(totals.index, totals.values, color="#6366f1")
ax.set_title("Total spending by category, 2025")
ax.set_xlabel("Amount")
plt.show()
`,
          tests: md`
import matplotlib.pyplot as plt
assert plt.get_fignums(), "No chart was created"
_ax = plt.gcf().axes[0]
_bars = [p for p in _ax.patches]
assert len(_bars) == 9, f"Expected 9 bars (one per category), found {len(_bars)}"
_w = [b.get_width() for b in _bars]
assert _w == sorted(_w), "Bars should be sorted ascending so the largest is at the top"
assert _ax.get_title(), "Add a title"
`,
          hints: ['`groupby("category")["amount"].sum().sort_values()`', '`ax.barh(totals.index, totals.values)`'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What does Anscombe’s quartet demonstrate?', options: ['Bar charts are best', 'Datasets with identical statistics can look completely different when plotted', 'Correlation implies causation', 'Pie charts mislead'], answer: 1, explanation: 'Always visualise, don’t rely only on summary statistics.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'In matplotlib, an Axes is…', options: ['The x and y lines only', 'A single plot area within a figure', 'The whole window', 'A colour map'], answer: 1, explanation: 'A figure can contain several Axes.' },
        { id: 'q3', kind: 'mcq', difficulty: 'beginner', prompt: 'Which chart best shows a trend over time?', options: ['Pie chart', 'Line chart', 'Box plot', 'Histogram'], answer: 1, explanation: 'Lines connect ordered time points.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: '`fig, axes = plt.subplots(2, 3)` creates…', options: ['2 figures', '6 Axes in 2 rows and 3 columns', '3 Axes', '1 Axes of size 2×3'], answer: 1, explanation: 'A 2×3 grid of Axes.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why use a horizontal bar chart?', options: ['It is always more accurate', 'Long category labels stay readable', 'It shows time better', 'It starts at zero automatically'], answer: 1, explanation: 'Labels sit on the y-axis without rotation.' },
      ],
      summary: [
        'Plot your data — statistics alone can mislead (Anscombe).',
        'Figure = canvas; Axes = chart; prefer `fig, ax = plt.subplots()`.',
        'Line charts for trends, bar charts for comparisons; label everything with units.',
        'Use colour purposefully; annotate the key message.',
      ],
      resources: [MPL, FTD],
    },
    {
      id: 'viz-distributions',
      title: 'Visualizing Distributions: Histograms & Box Plots (with seaborn)',
      minutes: 40,
      difficulty: 'beginner',
      objectives: [
        'Draw and interpret histograms (bins, shape, skew, modality)',
        'Draw and interpret box plots and violin plots',
        'Use seaborn for statistical charts with grouping (hue)',
        'Compare distributions across groups',
      ],
      intro: md`
Before modelling any numeric variable you should know its **distribution**: where values cluster, how spread out they are, whether they are skewed, and whether there are outliers or multiple peaks. Histograms and box plots answer these questions at a glance. **seaborn** makes statistical charts like these short and attractive.
`,
      simple: md`
- A **histogram** sorts values into buckets (bins) and draws a bar for how many fall in each bucket — like stacking exam papers into piles by score range. Tall piles = common values.
- A **box plot** summarises the same data in five numbers: the box is the middle 50% of values, the line inside is the median, and dots far away are outliers. Box plots are great for comparing many groups side by side.
`,
      technical: md`
### Histograms
- \`ax.hist(x, bins=30)\` / \`sns.histplot(data=df, x="col", bins=30, kde=True, hue="group")\`.
- **Bin choice changes the story**: too few bins hide structure, too many show noise. Try several.
- Read: centre, spread, **skew** (long tail side), **modality** (one or more peaks), gaps, outliers.
- \`stat="density"\` or \`"percent"\` makes groups of different sizes comparable; \`element="step"\` and transparency help overlapping groups.
- **KDE** (kernel density estimate) draws a smooth curve version of the histogram.

### Box plots
- Box = Q1..Q3 (IQR), centre line = median, whiskers = most extreme points within 1.5×IQR, dots = outliers.
- \`sns.boxplot(data=df, x="group", y="value")\`; \`order=\` controls group order.
- **Violin plots** (\`sns.violinplot\`) add the full density shape — useful when distributions are bimodal (a box plot would hide that).
- **Strip/swarm plots** show individual points (good for small samples).

### ECDF
\`sns.ecdfplot\` shows the proportion of values ≤ x — no binning choices, great for comparing groups precisely.

### seaborn basics
\`import seaborn as sns\`; functions take \`data=df\` and column names; \`hue=\` splits by a category. Axes-level functions (\`histplot\`, \`boxplot\`) accept \`ax=\` so they work in subplots; set a theme with \`sns.set_theme(style="whitegrid")\`.
`,
      terms: [
        ['Histogram', 'Bar chart of counts of values falling into bins.'],
        ['Bin', 'An interval used to group values in a histogram.'],
        ['KDE', 'Kernel density estimate: a smooth estimate of the distribution.'],
        ['Modality', 'Number of peaks (unimodal, bimodal...).'],
        ['Box plot', 'Chart of median, quartiles, whiskers and outliers.'],
        ['Violin plot', 'Box plot combined with a density shape.'],
        ['hue', 'seaborn parameter to colour/split by a category.'],
      ],
      realWorld: md`
A food-delivery company plotted delivery times as a histogram and found **two peaks**: one around 25 minutes and one around 55. Investigation showed the second peak came from orders assigned to a single overloaded restaurant cluster. An average (≈ 35 minutes) would have hidden this entirely. A box plot by city then showed which cities had the widest variability.
`,
      steps: [
        'Plot a histogram; try 2–3 bin counts.',
        'Describe shape: centre, spread, skew, peaks, outliers.',
        'Compare groups with box/violin plots (or overlaid density histograms).',
        'Use the ECDF for precise comparisons.',
        'Write one sentence describing what the distribution shows.',
      ],
      code: [
        {
          title: 'Histograms: bins, skew and groups',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid")
houses = pd.read_csv("data/houses.csv")

fig, axes = plt.subplots(1, 3, figsize=(13, 3.5))
axes[0].hist(houses["price"] / 1000, bins=8, color="#a5b4fc", edgecolor="white")
axes[0].set_title("8 bins: coarse")
axes[1].hist(houses["price"] / 1000, bins=40, color="#6366f1", edgecolor="white")
axes[1].set_title("40 bins: more detail")
sns.histplot(data=houses, x="distance_to_center_km", kde=True, ax=axes[2], color="#10b981")
axes[2].set_title("Distance: right-skewed")
for ax in axes[:2]:
    ax.set_xlabel("Price ($ thousands)")
fig.tight_layout(); plt.show()

students = pd.read_csv("data/students.csv")
sns.histplot(data=students, x="average", hue="passed", stat="density", element="step", common_norm=False)
plt.title("Average score by pass/fail"); plt.show()
`,
          explanation: [
            '…',
            '…',
            'seaborn is imported as `sns` by convention (this app installs it on first use).',
            'A clean theme for all following charts.',
            'Load houses.',
            '…',
            'Three panels.',
            'Few bins: a rough shape.',
            '…',
            'More bins: more detail (and more noise).',
            '…',
            'seaborn histogram with a smooth KDE curve, drawn into the third Axes.',
            '…',
            'Label the price panels.',
            '…',
            '…',
            'A second dataset.',
            'Overlaid distributions per group; `stat="density"` with `common_norm=False` makes groups of different sizes comparable.',
            '…',
          ],
        },
        {
          title: 'Box, violin and ECDF plots to compare groups',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid")
churn = pd.read_csv("data/churn.csv")
order = ["Month-to-month", "One year", "Two year"]

fig, axes = plt.subplots(1, 3, figsize=(14, 3.8))
sns.boxplot(data=churn, x="contract", y="tenure_months", order=order, ax=axes[0], color="#a5b4fc")
axes[0].set_title("Tenure by contract")
sns.violinplot(data=churn, x="internet_service", y="monthly_charges", ax=axes[1], color="#a7f3d0")
axes[1].set_title("Monthly charges by internet service")
sns.ecdfplot(data=churn, x="tenure_months", hue="churn", ax=axes[2])
axes[2].set_title("ECDF of tenure by churn")
fig.tight_layout(); plt.show()

print(churn.groupby("contract")["tenure_months"].describe()[["25%", "50%", "75%"]])
`,
          explanation: [
            '…',
            '…',
            '…',
            '…',
            'Churn data.',
            'Logical order for the categories.',
            '…',
            'Box plot: tenure distribution for each contract type.',
            '…',
            'Violin plot reveals the shape (three internet types have very different charge levels).',
            '…',
            'ECDF: for any tenure value, the share of customers at or below it. Churners’ curve rises much faster (shorter tenure).',
            '…',
            '…',
            'The numbers behind the boxes.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Trusting a single bin setting.', fix: 'Try several bin counts or use a KDE/ECDF.' },
        { mistake: 'Comparing raw-count histograms for groups of very different sizes.', fix: 'Use `stat="density"` or percentages with `common_norm=False`.' },
        { mistake: 'Using box plots for bimodal data.', fix: 'Box plots hide multiple peaks; use violin or histogram.' },
        { mistake: 'Pie or bar charts of individual raw values instead of distributions.', fix: 'Use histograms/box plots for numeric distributions.' },
      ],
      exercises: [
        {
          id: 'viz2-ex1', title: 'Histogram of ages', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`Plot a histogram of \`age\` from \`data/mall_customers.csv\` with **exactly 15 bins** using \`ax.hist\`, and title it \`Customer age distribution\`.`,
          starter: md`
import pandas as pd
import matplotlib.pyplot as plt
mall = pd.read_csv("data/mall_customers.csv")
`,
          solution: md`
import pandas as pd
import matplotlib.pyplot as plt
mall = pd.read_csv("data/mall_customers.csv")
fig, ax = plt.subplots()
ax.hist(mall["age"], bins=15, color="#6366f1", edgecolor="white")
ax.set_title("Customer age distribution")
ax.set_xlabel("Age (years)")
ax.set_ylabel("Customers")
plt.show()
`,
          tests: md`
import matplotlib.pyplot as plt
assert plt.get_fignums(), "No chart was created"
_ax = plt.gcf().axes[0]
assert len(_ax.patches) == 15, f"Expected 15 bins, found {len(_ax.patches)}"
assert sum(p.get_height() for p in _ax.patches) == len(mall), "All customers should be counted"
assert _ax.get_title() == "Customer age distribution"
`,
          hints: ['`ax.hist(mall["age"], bins=15)`'],
        },
        {
          id: 'viz2-ex2', title: 'Box plot by group with seaborn', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Use \`sns.boxplot\` to compare \`price\` across \`neighborhood\` in \`data/houses.csv\`. Store the returned Axes in \`ax\` and give it a title.`,
          starter: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
houses = pd.read_csv("data/houses.csv")
ax = None
`,
          solution: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
houses = pd.read_csv("data/houses.csv")
ax = sns.boxplot(data=houses, x="neighborhood", y="price")
ax.set_title("House prices by neighborhood")
plt.show()
`,
          tests: md`
assert ax is not None and hasattr(ax, "get_title"), "Store the Axes returned by sns.boxplot in ax"
assert ax.get_title(), "Add a title"
assert ax.get_xlabel() == "neighborhood" and ax.get_ylabel() == "price", "x should be neighborhood and y price"
assert len(ax.get_xticklabels()) == 5, "There should be one box per neighborhood"
`,
          hints: ['`ax = sns.boxplot(data=houses, x="neighborhood", y="price")`', 'Then `ax.set_title(...)`.'],
        },
        {
          id: 'viz2-ex3', title: 'Read a histogram', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`A histogram has a tall peak on the left and a long tail stretching to the right. Is the distribution left-skewed or right-skewed? (one word: left/right)`,
          solution: 'right', accepted: ['right', 'right-skewed', 'right skewed', 'positive'],
          hints: ['Skew is named after the side of the long tail.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'A histogram is used to show…', options: ['Parts of a whole', 'The distribution of one numeric variable', 'Change over time', 'Correlation between two variables'], answer: 1, explanation: 'It counts values in bins.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'In a box plot, the line inside the box marks the…', options: ['Mean', 'Median', 'Mode', 'Maximum'], answer: 1, explanation: 'The median.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which chart reveals a bimodal distribution that a box plot would hide?', options: ['Violin plot or histogram', 'Pie chart', 'Line chart', 'Bar chart of means'], answer: 0, explanation: 'Density shapes show multiple peaks.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does `hue="churn"` do in a seaborn plot?', options: ['Sets the title', 'Splits/colours the data by the churn category', 'Removes churn', 'Changes bin count'], answer: 1, explanation: 'hue maps a category to colour.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Whiskers in a standard box plot extend to…', options: ['Min and max always', 'The most extreme points within 1.5 × IQR of the box', '±1 SD', 'The 5th and 95th percentiles'], answer: 1, explanation: 'Points beyond are drawn as outliers.' },
      ],
      summary: [
        'Histograms show shape: centre, spread, skew, peaks; bins matter.',
        'Box plots summarise quartiles and outliers and compare groups.',
        'Violin plots show shape; ECDFs compare groups without bins.',
        'seaborn: `data=`, column names, `hue=`, `ax=`.',
      ],
      resources: [SNS, { label: 'seaborn: Visualizing distributions', url: 'https://seaborn.pydata.org/tutorial/distributions.html' }],
    },
    {
      id: 'viz-relationships',
      title: 'Relationships & Composition: Scatter Plots, Heatmaps, Pair Plots & Pie Charts',
      minutes: 45,
      difficulty: 'intermediate',
      objectives: [
        'Draw scatter plots with trend lines, colour and size encodings',
        'Visualise correlation matrices and pivot tables as heatmaps',
        'Explore many relationships at once with pair plots',
        'Use pie/donut and stacked bar charts appropriately for composition',
      ],
      intro: md`
After understanding single variables, you explore **relationships** (does X move with Y?) and **composition** (what share does each part make up?). Scatter plots, heatmaps and pair plots are the EDA workhorses; pie charts have a narrow, specific use.
`,
      simple: md`
- A **scatter plot** puts one dot per observation, placing it by two numbers (study hours → score). A cloud sloping upward = positive relationship.
- A **heatmap** colours a table of numbers — dark for high, light for low — so patterns jump out (e.g. which pairs of variables are strongly correlated).
- A **pair plot** draws scatter plots for every pair of columns at once: a quick “map” of a dataset.
- A **pie chart** shows parts of a whole — use it only for a few slices that add up to 100%.
`,
      technical: md`
### Scatter plots
\`ax.scatter(x, y, c=..., s=..., alpha=0.6)\` / \`sns.scatterplot(data, x, y, hue, size, style)\`.
- **Overplotting** with many points: use \`alpha\`, smaller markers, \`sns.histplot(x, y)\` (2-D histogram) or hexbin.
- Trend lines: \`sns.regplot\` (linear fit + confidence band), \`lowess=True\` for non-linear trends.
- Encode a third variable with colour (\`hue\`) or size.

### Heatmaps
\`sns.heatmap(df.corr(numeric_only=True), annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1)\`.
- Use a **diverging** palette centred at 0 for correlations; a **sequential** palette for counts/amounts.
- Also great for pivot tables: revenue by weekday × hour, region × category.

### Pair plots
\`sns.pairplot(df[cols], hue="group", corner=True)\` — scatter plots for each pair, distributions on the diagonal. Limit to ~5–6 columns (it grows quadratically).

### Composition
- **Pie/donut:** only for 2–5 categories summing to a meaningful whole; label percentages; sort slices. People compare angles poorly — bar charts are often clearer.
- **Stacked/100% stacked bars:** composition across groups or over time.
- **Treemaps** for hierarchical composition (outside matplotlib core).
`,
      terms: [
        ['Scatter plot', 'Points positioned by two numeric variables.'],
        ['Overplotting', 'Points hiding each other when there are many.'],
        ['Heatmap', 'A grid of colours representing values in a matrix.'],
        ['Diverging palette', 'Colours going in two directions from a midpoint (e.g. −1 to +1).'],
        ['Pair plot', 'Matrix of scatter plots for all pairs of variables.'],
        ['Pie chart', 'Circle divided into slices showing proportions of a whole.'],
        ['Stacked bar', 'Bars divided into segments showing composition.'],
      ],
      realWorld: md`
Retail analysts build a **weekday × hour heatmap** of store transactions. The dark band on Saturday 11:00–14:00 and the surprisingly busy Thursday evenings drive staff scheduling. A pair plot of customer features (age, income, spending score) reveals visible clusters that motivate the customer segmentation project in Module 12.
`,
      steps: [
        'For two numeric variables, start with a scatter plot (add alpha if crowded).',
        'Add colour/size for a third variable and a trend line if helpful.',
        'Summarise many correlations with an annotated heatmap.',
        'Use a pair plot for a quick multi-variable overview.',
        'For parts of a whole, prefer sorted bars; use a pie only with few slices.',
      ],
      code: [
        {
          title: 'Scatter plots with encodings and trend lines',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

sns.set_theme(style="whitegrid")
students = pd.read_csv("data/students.csv")
mall = pd.read_csv("data/mall_customers.csv")

fig, axes = plt.subplots(1, 2, figsize=(12, 4))
sns.regplot(data=students, x="study_hours_week", y="average", ax=axes[0],
            scatter_kws={"alpha": 0.6}, line_kws={"color": "#dc2626"})
axes[0].set_title("More study hours, higher average score")
axes[0].set_xlabel("Study hours per week"); axes[0].set_ylabel("Average score")

sns.scatterplot(data=mall, x="annual_income_k", y="spending_score", hue="gender", size="age",
                sizes=(20, 120), alpha=0.7, ax=axes[1])
axes[1].set_title("Income vs spending: visible customer groups")
axes[1].set_xlabel("Annual income ($k)")
fig.tight_layout(); plt.show()
`,
          explanation: [
            '…',
            '…',
            '…',
            '…',
            'Students data…',
            '…and mall customers.',
            '…',
            'Two panels.',
            '`regplot` draws the scatter plus a fitted line with a confidence band.',
            '…transparent points, red line.',
            'A title that states the message.',
            '…',
            '…',
            'Colour encodes gender and point size encodes age — three variables in one chart.',
            '…',
            'Five clusters are visible — the basis for k-means segmentation later.',
            '…',
            '…',
          ],
        },
        {
          title: 'Heatmaps, pair plots and composition charts',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

houses = pd.read_csv("data/houses.csv")
corr = houses.drop(columns="house_id").corr(numeric_only=True)
plt.figure(figsize=(7, 5.5))
sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1, square=True)
plt.title("Correlation matrix: house features"); plt.show()

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
sales["weekday"] = sales["order_date"].dt.day_name().str[:3]
grid = sales.pivot_table(values="revenue", index="region", columns="weekday", aggfunc="sum")
grid = grid[["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]] / 1000
sns.heatmap(grid, annot=True, fmt=".0f", cmap="Blues")
plt.title("Revenue ($k) by region and weekday"); plt.show()

g = sns.pairplot(pd.read_csv("data/mall_customers.csv"), vars=["age", "annual_income_k", "spending_score"],
                 hue="gender", corner=True, height=2)
plt.show()

share = sales.groupby("category")["revenue"].sum().sort_values(ascending=False)
fig, ax = plt.subplots(1, 2, figsize=(10, 3.5))
ax[0].pie(share, labels=share.index, autopct="%1.0f%%", startangle=90, wedgeprops={"width": 0.45})
ax[0].set_title("Revenue share (donut)")
pd.crosstab(sales["region"], sales["category"], values=sales["revenue"], aggfunc="sum", normalize="index").plot.barh(stacked=True, ax=ax[1])
ax[1].set_title("Category mix by region (100%)"); ax[1].legend(fontsize=7)
fig.tight_layout(); plt.show()
`,
          explanation: [
            '…',
            '…',
            '…',
            'House data.',
            'Correlation matrix of numeric features.',
            '…',
            'Annotated heatmap with a diverging palette fixed to [−1, 1].',
            '…',
            'Sales data…',
            '…with a short weekday label.',
            'Pivot: total revenue by region × weekday.',
            'Order weekdays logically and convert to thousands.',
            'Sequential palette for amounts.',
            '…',
            'Pair plot: every pair of three variables, coloured by gender; `corner=True` hides duplicates.',
            '…',
            '…',
            'Revenue share by category.',
            '…',
            'A donut chart (pie with a hole) with percentage labels — only 3 slices, so it works.',
            '…',
            '100% stacked bars compare composition across regions.',
            '…',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Pie charts with 10+ slices or slices that don’t sum to a whole.', fix: 'Use a sorted bar chart.' },
        { mistake: 'Sequential colours for correlations (−1 and +1 look different in importance).', fix: 'Use a diverging palette centred at 0 with vmin=-1, vmax=1.' },
        { mistake: 'Huge pair plots with 20 columns.', fix: 'Select the 4–6 most relevant variables.' },
        { mistake: 'Overplotted scatter plots that look like solid blobs.', fix: 'Use alpha, smaller markers, sampling or 2-D histograms.' },
      ],
      exercises: [
        {
          id: 'viz3-ex1', title: 'Scatter plot of price vs area', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`Make a scatter plot of \`price\` (y) against \`area_sqft\` (x) from \`data/houses.csv\` with \`ax.scatter\` and \`alpha=0.5\`. Label both axes.`,
          starter: md`
import pandas as pd
import matplotlib.pyplot as plt
houses = pd.read_csv("data/houses.csv")
`,
          solution: md`
import pandas as pd
import matplotlib.pyplot as plt
houses = pd.read_csv("data/houses.csv")
fig, ax = plt.subplots()
ax.scatter(houses["area_sqft"], houses["price"], alpha=0.5)
ax.set_xlabel("Area (sqft)")
ax.set_ylabel("Price ($)")
ax.set_title("Bigger houses cost more")
plt.show()
`,
          tests: md`
import matplotlib.pyplot as plt
assert plt.get_fignums(), "No chart was created"
_ax = plt.gcf().axes[0]
assert len(_ax.collections) >= 1, "Use ax.scatter"
_pts = _ax.collections[0].get_offsets()
assert len(_pts) == 800, f"Expected 800 points, found {len(_pts)}"
assert abs(_pts[:, 0].mean() - houses["area_sqft"].mean()) < 1e-6, "x should be area_sqft"
assert _ax.collections[0].get_alpha() == 0.5, "Set alpha=0.5"
assert _ax.get_xlabel() and _ax.get_ylabel(), "Label both axes"
`,
          hints: ['`ax.scatter(houses["area_sqft"], houses["price"], alpha=0.5)`'],
        },
        {
          id: 'viz3-ex2', title: 'Correlation heatmap', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Create an annotated correlation heatmap for the columns \`math\`, \`science\`, \`english\`, \`study_hours_week\` and \`attendance_pct\` of \`data/students.csv\` using \`sns.heatmap(..., annot=True, vmin=-1, vmax=1)\`. Store the Axes in \`ax\`.`,
          starter: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
df = pd.read_csv("data/students.csv")
ax = None
`,
          solution: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
df = pd.read_csv("data/students.csv")
cols = ["math", "science", "english", "study_hours_week", "attendance_pct"]
ax = sns.heatmap(df[cols].corr(), annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1)
ax.set_title("Correlations between student variables")
plt.show()
`,
          tests: md`
assert ax is not None, "Store the heatmap Axes in ax"
assert len(ax.texts) == 25, f"Expected 25 annotations (5x5), found {len(ax.texts)}"
_mesh = ax.collections[0]
assert _mesh.get_clim() == (-1.0, 1.0), "Set vmin=-1 and vmax=1"
`,
          hints: ['Compute `df[cols].corr()` first.', '`ax = sns.heatmap(corr, annot=True, vmin=-1, vmax=1)`'],
        },
        {
          id: 'viz3-ex3', title: 'Choose the chart', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`You want to show the relationship between advertising spend and sales for 200 stores. Which chart? (one word)`,
          solution: 'scatter', accepted: ['scatter', 'scatter plot', 'scatterplot'],
          hints: ['Two numeric variables, one dot per store.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which chart shows the relationship between two numeric variables?', options: ['Pie chart', 'Scatter plot', 'Histogram', 'Bar chart'], answer: 1, explanation: 'One point per observation.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Best colour palette for a correlation heatmap?', options: ['Sequential (light→dark)', 'Diverging centred at 0', 'Random rainbow', 'Greyscale only'], answer: 1, explanation: 'Negative and positive correlations deserve equal emphasis.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'When is a pie chart acceptable?', options: ['For 12 product categories', 'For a few parts of a meaningful whole', 'For trends over time', 'For comparing two numeric variables'], answer: 1, explanation: '2–5 slices summing to 100%.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'How can you reduce overplotting in a scatter plot of 100,000 points?', options: ['Bigger markers', 'Transparency (alpha), 2-D histogram or sampling', 'A pie chart', '3-D effects'], answer: 1, explanation: 'Alpha and density plots reveal where points concentrate.' },
        { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'What does a pair plot show?', options: ['A single scatter plot', 'Scatter plots for every pair of selected variables', 'Only histograms', 'A table'], answer: 1, explanation: 'It’s a matrix of pairwise plots.' },
      ],
      summary: [
        'Scatter plots for relationships; encode extra variables with hue/size; add trend lines.',
        'Heatmaps for matrices: diverging palettes for correlations, sequential for amounts.',
        'Pair plots for quick multivariate overviews (few columns).',
        'Composition: sorted bars or 100% stacked bars; pies only for few slices.',
      ],
      resources: [SNS, FTD],
    },
    {
      id: 'viz-choosing-honest',
      title: 'Choosing the Right Chart, Interpreting Graphs & Avoiding Misleading Visuals',
      minutes: 35,
      difficulty: 'intermediate',
      widgets: ['misleading-charts'],
      objectives: [
        'Choose a chart type from the question and data types',
        'Read and interpret charts critically',
        'Recognise common misleading techniques (truncated axes, dual axes, cherry-picking, 3-D, area distortion)',
        'Apply design principles: clarity, data-ink, accessibility, a clear message',
      ],
      intro: md`
Charts persuade. The same data can tell honest or misleading stories depending on design choices. As a data scientist you must choose charts that answer the question clearly, read others’ charts critically, and never mislead — intentionally or accidentally.
`,
      simple: md`
Pick a chart by asking **what question** it answers:
- *How do categories compare?* → bar chart
- *How does something change over time?* → line chart
- *How are values distributed?* → histogram / box plot
- *Are two numbers related?* → scatter plot
- *What share is each part?* → (few parts) pie, otherwise stacked bar

Then check for tricks: Does the bar chart start at zero? Are two different y-axes making unrelated lines look connected? Has the time period been cut to hide a bad year?
`,
      technical: md`
### Chart chooser
| Question | Data | Chart |
|---|---|---|
| Compare categories | categorical + numeric | (sorted) bar, dot plot |
| Change over time | time + numeric | line, area (for totals) |
| Distribution | one numeric | histogram, box, violin, ECDF |
| Relationship | two numeric | scatter (+ trend), hexbin |
| Composition | parts of a whole | stacked bar, pie/donut (few parts), treemap |
| Ranking | categories ordered by value | sorted horizontal bar |
| Two categorical | counts | heatmap, grouped/stacked bar |
| Geography | regions | choropleth map |

### Misleading techniques to avoid (and spot)
1. **Truncated y-axis on bar charts** — bar length must start at 0 (lines may use non-zero baselines if clearly labelled).
2. **Dual y-axes** — scaling can make any two series look correlated.
3. **Cherry-picked time windows** — show enough history for context.
4. **Area/3-D distortion** — doubling an icon’s height quadruples its area; 3-D pies distort angles.
5. **Inconsistent scales between panels** — use \`sharey=True\` when comparing.
6. **Cumulative charts** hiding declines; **missing denominators** (counts vs rates per capita).
7. **Too many categories/colours**, unlabeled axes, missing units or sources.

### Interpreting a chart critically
Read the title, axes (units, scale, start), source and sample size; identify the main pattern; check for outliers and what is **not** shown; ask whether the conclusion follows.

### Design principles
- One clear message per chart; put it in the title (“Churn is 3× higher on monthly plans”).
- Maximise **data-ink**: remove heavy gridlines, borders, 3-D effects.
- Direct labels instead of legends where possible.
- Accessibility: colour-blind-safe palettes, don’t rely on colour alone, sufficient contrast, readable font sizes.
`,
      terms: [
        ['Truncated axis', 'An axis not starting at zero, exaggerating differences in bars.'],
        ['Dual axis', 'Two y-axes with different scales on one chart.'],
        ['Cherry-picking', 'Selecting only data that supports a desired conclusion.'],
        ['Data-ink ratio', 'Proportion of a chart’s ink that shows data (Tufte).'],
        ['Per-capita rate', 'A value normalised by population, enabling fair comparison.'],
        ['Direct labelling', 'Labelling lines/bars on the chart instead of using a legend.'],
      ],
      realWorld: md`
A news graphic once showed a country’s gun deaths with an **inverted y-axis** (0 at the top), so a sharp *increase* looked like a decline. Political ads routinely use truncated axes to make a 2-point difference look enormous. Employers value analysts who can both build honest charts and catch misleading ones in reports.
`,
      steps: [
        'Write the question the chart must answer.',
        'Pick the chart type from the question + data types.',
        'Design honestly: zero baselines for bars, consistent scales, enough context, rates where fair.',
        'Simplify and highlight the message (title, colour, direct labels).',
        'Review as a sceptical reader: could this mislead anyone?',
      ],
      code: [
        {
          title: 'The same data: misleading vs honest',
          code: md`
import matplotlib.pyplot as plt

quarters = ["Q1", "Q2", "Q3", "Q4"]
ours = [96, 97, 98, 100]
rival = [94, 95, 95, 96]

fig, axes = plt.subplots(1, 2, figsize=(10, 3.5))
x = range(len(quarters))
for ax, honest in zip(axes, [False, True]):
    ax.bar([i - 0.2 for i in x], ours, width=0.4, label="Us", color="#4f46e5")
    ax.bar([i + 0.2 for i in x], rival, width=0.4, label="Rival", color="#cbd5e1")
    ax.set_xticks(list(x), quarters)
    ax.set_ylim(0 if honest else 93, 102)
    ax.set_ylabel("Sales (thousand units)")
axes[0].set_title("Misleading: axis starts at 93")
axes[1].set_title("Honest: axis starts at 0 (gap is ~3%)")
axes[1].legend()
fig.tight_layout(); plt.show()
`,
          explanation: [
            '…',
            '…',
            'Quarterly sales for us and a rival.',
            '…',
            '…',
            'Two panels with the same data.',
            'Bar positions.',
            'Draw both versions…',
            'our bars (shifted left),',
            'rival bars (shifted right),',
            'quarter labels,',
            'the **only** difference: where the y-axis starts.',
            '…',
            'On the left, our lead looks enormous.',
            'On the right, the honest view: a small advantage.',
            '…',
            '…',
          ],
        },
        {
          title: 'Counts vs rates: a fairer comparison',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt

cv = pd.read_csv("data/pandemic_cases.csv")
totals = cv.groupby("country").agg(cases=("new_cases", "sum"), population=("population", "first"))
totals["per_100k"] = totals["cases"] / totals["population"] * 100_000

fig, axes = plt.subplots(1, 2, figsize=(10, 3.5))
totals["cases"].sort_values().plot.barh(ax=axes[0], color="#94a3b8")
axes[0].set_title("Total cases (favours big countries)")
totals["per_100k"].sort_values().plot.barh(ax=axes[1], color="#4f46e5")
axes[1].set_title("Cases per 100k people (fair comparison)")
fig.tight_layout(); plt.show()
print(totals.round(0).sort_values("per_100k", ascending=False))
`,
          explanation: [
            '…',
            '…',
            'Synthetic pandemic data for five countries of very different sizes.',
            'Total cases and population per country.',
            'Normalise: cases per 100,000 people.',
            '…',
            '…',
            'Raw totals: the largest country looks worst simply because it is largest.',
            '…',
            'Per-capita rates change the ranking — the honest comparison.',
            '…',
            '…',
            'The underlying table.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Truncating the y-axis of a bar chart.', fix: 'Start bars at zero.' },
        { mistake: 'Comparing totals across groups of different sizes.', fix: 'Use rates (per capita, per customer, %).' },
        { mistake: 'Generic titles like “Sales chart”.', fix: 'Use the message as the title.' },
        { mistake: 'Relying on red/green alone.', fix: 'Use colour-blind-safe palettes plus labels or patterns.' },
      ],
      exercises: [
        {
          id: 'viz4-ex1', title: 'Fix the misleading bar chart', type: 'debug', lang: 'python', difficulty: 'beginner',
          prompt: md`This bar chart exaggerates small differences. Fix it so the **y-axis starts at 0**.`,
          starter: md`
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.bar(["A", "B", "C"], [52, 54, 55])
ax.set_ylim(50, 56)
ax.set_title("Satisfaction score by store")
plt.show()
`,
          solution: md`
import matplotlib.pyplot as plt
fig, ax = plt.subplots()
ax.bar(["A", "B", "C"], [52, 54, 55])
ax.set_ylim(0, 60)
ax.set_title("Satisfaction score by store")
plt.show()
`,
          tests: md`
import matplotlib.pyplot as plt
_ax = plt.gcf().axes[0]
assert _ax.get_ylim()[0] == 0, f"The y-axis should start at 0, starts at {_ax.get_ylim()[0]}"
assert _ax.get_ylim()[1] >= 55, "Make sure all bars are fully visible"
`,
          hints: ['Change `set_ylim(50, 56)` to start at 0 (or remove it).'],
        },
        {
          id: 'viz4-ex2', title: 'Choose the chart type', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`You need to show how monthly active users changed over the last 24 months. Which chart type? (one word)`,
          solution: 'line', accepted: ['line', 'line chart', 'line graph'],
          hints: ['Change over time.'],
        },
        {
          id: 'viz4-ex3', title: 'Per-capita comparison', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`From \`data/pandemic_cases.csv\`, find the country with the highest **total deaths per 100,000 people**. Store its name in \`worst\`.`,
          starter: md`
import pandas as pd
cv = pd.read_csv("data/pandemic_cases.csv")
worst = ""
print(worst)
`,
          solution: md`
import pandas as pd
cv = pd.read_csv("data/pandemic_cases.csv")
t = cv.groupby("country").agg(deaths=("new_deaths", "sum"), pop=("population", "first"))
t["per_100k"] = t["deaths"] / t["pop"] * 100_000
worst = t["per_100k"].idxmax()
print(t.round(1))
print(worst)
`,
          tests: md`
_c = pd.read_csv("data/pandemic_cases.csv")
_t = _c.groupby("country").agg(d=("new_deaths", "sum"), p=("population", "first"))
assert worst == (_t.d / _t.p).idxmax(), f"Got {worst!r}"
`,
          hints: ['Sum deaths per country; take the population (constant per country).', 'Divide and use `.idxmax()`.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Why must bar charts start at zero?', options: ['Matplotlib requires it', 'Bar length encodes the value, so a truncated axis exaggerates differences', 'To save space', 'It looks nicer'], answer: 1, explanation: 'Length is the visual encoding.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'What is a key risk of dual y-axis charts?', options: ['They are slow to draw', 'Arbitrary scaling can make unrelated series look correlated', 'They hide the title', 'They cannot show lines'], answer: 1, explanation: 'You can align any two series by choosing scales.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Comparing COVID cases between a country of 2M and one of 44M should use…', options: ['Total cases', 'Cases per 100k people', 'A pie chart', 'Cumulative totals only'], answer: 1, explanation: 'Rates normalise for population.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'Which is the best chart title?', options: ['Chart 1', 'Sales', 'Online sales grew 18% after the redesign', 'Data'], answer: 2, explanation: 'State the message.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'A chart shows only the 3 months when sales rose, omitting the prior year of decline. This is…', options: ['Data-ink optimisation', 'Cherry-picking', 'Normalisation', 'Smoothing'], answer: 1, explanation: 'Selective time windows mislead.' },
      ],
      summary: [
        'Choose charts from the question: compare → bar, time → line, distribution → histogram/box, relationship → scatter, composition → stacked bar/pie.',
        'Avoid truncated bar axes, misleading dual axes, cherry-picking, 3-D/area distortion.',
        'Use rates for fair comparisons; consistent scales across panels.',
        'One message per chart, stated in the title; accessible colours.',
      ],
      resources: [FTD, { label: 'Storytelling with Data — blog', url: 'https://www.storytellingwithdata.com/blog' }, { label: 'Financial Times Visual Vocabulary', url: 'https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary' }],
    },
  ],
};
