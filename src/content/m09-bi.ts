import type { Module } from '../types.ts';
import { md } from './md.ts';

const PBI = { label: 'Microsoft Learn — Power BI training (free)', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi' };
const TAB = { label: 'Tableau free training videos', url: 'https://www.tableau.com/learn/training' };
const SWD = { label: 'Storytelling with Data — blog & resources', url: 'https://www.storytellingwithdata.com/' };

export const m09: Module = {
  id: 'bi',
  number: 9,
  title: 'Data Analysis & Business Intelligence',
  short: 'Business Intelligence',
  icon: 'briefcase',
  description:
    'Turn analysis into business value: framing business questions, defining KPIs, designing dashboards and reports, Power BI and Tableau fundamentals, and communicating insights to stakeholders — with practical case studies.',
  skills: ['Business questions', 'KPIs & metric trees', 'Dashboard design', 'Power BI basics', 'Tableau basics', 'Data storytelling', 'Stakeholder communication'],
  lessons: [
    {
      id: 'bi-questions-kpis',
      title: 'Business Questions, KPIs & Data-Driven Decisions',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Turn vague requests into specific, answerable business questions',
        'Define KPIs precisely (formula, grain, filters, target) and distinguish leading vs lagging indicators',
        'Break a goal into a metric tree to find what drives it',
        'Compute a KPI scorecard with pandas',
      ],
      intro: md`
Analysis only matters if it changes a decision. Business intelligence (BI) starts by asking the **right question** and agreeing on how success is **measured**. A brilliant model answering the wrong question is worthless; a simple chart answering the right one can save millions.
`,
      simple: md`
A manager says: *“Sales are bad — look into it.”* That’s not a question yet. A good analyst asks back:
- *Which* sales — revenue, units, or number of orders?
- Bad compared to *what* — last month, last year, the target?
- *Where* — all regions or one product line?
- What *decision* will you make with the answer?

A **KPI** (Key Performance Indicator) is a number that tells you whether you are winning, like a car’s dashboard shows speed and fuel. Each KPI needs an exact definition so everyone calculates it the same way.
`,
      technical: md`
### From request to question
Use a **SMART** framing: Specific, Measurable, Actionable, Relevant, Time-bound.
*“Why did online revenue in the South region fall in Q3 2025 vs Q3 2024, and which product categories explain most of the drop?”*

Question types map to analysis types: descriptive (what happened), diagnostic (why), predictive (what will happen), prescriptive (what to do).

### Defining a KPI
| Element | Example: Average Order Value |
|---|---|
| Formula | total revenue ÷ number of orders |
| Grain | per month, per region |
| Filters | completed orders only; excludes refunds |
| Source | \`sales\` table, \`revenue\` column |
| Target / benchmark | ≥ \$150 (last year: \$142) |
| Owner | e-commerce manager |

**Leading vs lagging:** lagging KPIs report outcomes (revenue, churn); leading KPIs predict them (website visits, trial sign-ups, support tickets). **Vanity metrics** (total page views) look good but don’t guide decisions; prefer **actionable** rates and ratios.

### Common KPIs
- Sales: revenue, units, average order value (AOV), growth %, gross margin.
- Customers: customer acquisition cost (CAC), customer lifetime value (CLV), churn rate, retention, Net Promoter Score.
- Marketing: conversion rate, click-through rate, return on ad spend.
- Operations: on-time delivery %, inventory turnover, defect rate.

### Metric trees
Decompose a goal into its drivers: **Revenue = Orders × AOV**, **Orders = Visitors × Conversion rate**. When revenue drops, the tree tells you which branch moved. This is how analysts move from *what* to *why*.

### Decision-making
Compare against a baseline (target, previous period, control group), size the impact (\$, %), and recommend an action with its expected effect and risks.
`,
      terms: [
        ['Business intelligence (BI)', 'Tools and practices for turning data into business decisions (reports, dashboards).'],
        ['KPI', 'Key Performance Indicator: a precisely defined metric tied to a goal.'],
        ['Grain', 'The level of detail of a metric (per day, per store...).'],
        ['Leading indicator', 'A metric that changes before the outcome you care about.'],
        ['Lagging indicator', 'A metric that reports the outcome after it happens.'],
        ['Vanity metric', 'A metric that looks impressive but doesn’t inform decisions.'],
        ['Metric tree', 'A decomposition of a goal metric into the metrics that drive it.'],
        ['AOV', 'Average Order Value = revenue / number of orders.'],
      ],
      realWorld: md`
A subscription app’s revenue was flat. Leadership wanted more advertising. An analyst built a metric tree: **Revenue = Subscribers × Price**, **Subscribers = New − Cancellations**. New sign-ups were actually up 20%, but **cancellations** had doubled after a price change. The decision changed from “spend more on ads” to “fix retention” — saving the ad budget and addressing the real cause.
`,
      steps: [
        'Clarify the request: which metric, compared to what, where, and for which decision?',
        'Write the question in one SMART sentence.',
        'Define each KPI precisely (formula, grain, filters, target).',
        'Build a metric tree and compute each branch for the periods being compared.',
        'Size the impact and propose an action.',
      ],
      code: [
        {
          title: 'A KPI scorecard and a metric tree in pandas',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
sales["year"] = sales["order_date"].dt.year

kpis = sales.groupby("year").agg(
    revenue=("revenue", "sum"),
    orders=("order_id", "nunique"),
    customers=("customer_id", "nunique"),
    units=("units", "sum"),
)
kpis["aov"] = kpis["revenue"] / kpis["orders"]
kpis["orders_per_customer"] = kpis["orders"] / kpis["customers"]
kpis["discount_rate"] = sales.groupby("year")["discount"].apply(lambda d: (d > 0).mean())
print(kpis.round(2).T)

growth = kpis.pct_change().iloc[-1] * 100
print("\nYear-over-year change (%):")
print(growth.round(1))

# Metric tree check: revenue = customers x orders per customer x AOV
tree = kpis["customers"] * kpis["orders_per_customer"] * kpis["aov"]
print("\nTree reproduces revenue:", (tree.round(2) == kpis["revenue"].round(2)).all())
`,
          explanation: [
            'Import pandas and load the sales data with real dates.',
            'Add a `year` column so we can compare 2024 with 2025.',
            '`groupby("year").agg(...)` computes four base KPIs per year with named aggregations: total revenue, number of distinct orders, number of distinct customers and units sold.',
            'Average Order Value = revenue ÷ orders — a derived KPI.',
            'Orders per customer measures purchase frequency.',
            'Share of orders with any discount, computed per year with a small lambda.',
            '`.T` transposes the table so KPIs are rows and years are columns — the usual scorecard layout.',
            '`pct_change()` compares each year with the previous one; `iloc[-1]` takes the latest year; × 100 gives percentages.',
            'Print the year-over-year growth of every KPI.',
            'Metric tree: revenue must equal customers × orders per customer × AOV. Recomputing it confirms the decomposition is exact, so any change in revenue can be attributed to one of the three branches.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Starting analysis before agreeing on the question and the decision it supports.', fix: 'Clarify scope, comparison baseline and the decision first.' },
        { mistake: 'Two teams reporting different “revenue” numbers.', fix: 'Write a KPI definition (formula, filters, source) and share it.' },
        { mistake: 'Tracking vanity metrics (total sign-ups ever).', fix: 'Track rates and ratios that a team can act on (activation rate, churn).' },
        { mistake: 'Reporting a number without context.', fix: 'Always compare with a target, prior period or benchmark.' },
      ],
      exercises: [
        {
          id: 'bi1-ex1', title: 'Compute AOV per region', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`From \`data/sales.csv\`, compute \`aov\`: a Series of average order value (total revenue ÷ number of distinct orders) per \`region\`, sorted descending.`,
          starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv")
aov = None
print(aov)
`,
          solution: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv")
g = sales.groupby("region")
aov = (g["revenue"].sum() / g["order_id"].nunique()).sort_values(ascending=False)
print(aov)
`,
          tests: md`
_g = sales.groupby("region")
_e = (_g["revenue"].sum() / _g["order_id"].nunique()).sort_values(ascending=False)
assert aov is not None and list(aov.index) == list(_e.index), "Regions in wrong order (sort descending)"
assert (aov - _e).abs().max() < 1e-9, f"Values differ: {aov}"
`,
          hints: ['Revenue sum per region divided by `order_id.nunique()` per region.', 'Finish with `.sort_values(ascending=False)`.'],
        },
        {
          id: 'bi1-ex2', title: 'Which branch of the tree moved?', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`
For the **South** region in \`data/sales.csv\`, compute per year: \`orders\` (distinct orders) and \`aov\`. Then set \`driver\` to \`"orders"\` or \`"aov"\` — whichever had the **larger absolute percentage change** from 2024 to 2025.
`,
          starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
driver = ""
print(driver)
`,
          solution: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
south = sales[sales["region"] == "South"].copy()
south["year"] = south["order_date"].dt.year
k = south.groupby("year").agg(revenue=("revenue", "sum"), orders=("order_id", "nunique"))
k["aov"] = k["revenue"] / k["orders"]
change = k[["orders", "aov"]].pct_change().iloc[-1].abs()
driver = change.idxmax()
print(k.round(2)); print(change.round(3)); print(driver)
`,
          tests: md`
_s = sales[sales.region == "South"].copy(); _s["y"] = _s.order_date.dt.year
_k = _s.groupby("y").agg(r=("revenue", "sum"), o=("order_id", "nunique")); _k["a"] = _k.r / _k.o
_c = _k[["o", "a"]].pct_change().iloc[-1].abs()
_exp = "orders" if _c["o"] > _c["a"] else "aov"
assert driver == _exp, f"Expected {_exp!r}, got {driver!r}"
`,
          hints: ['Filter South, add a year column, aggregate revenue and distinct orders per year.', 'AOV = revenue / orders; compare `pct_change()` of both and pick the larger absolute value.'],
        },
        {
          id: 'bi1-ex3', title: 'Leading or lagging?', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`For predicting next quarter’s churn, is “number of support tickets this month” a **leading** or **lagging** indicator?`,
          solution: 'leading', accepted: ['leading', 'leading indicator'],
          hints: ['Does it change before or after customers leave?'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which is the best-formed business question?', options: ['Analyse our sales', 'Why did Q3 2025 online revenue in the South fall vs Q3 2024, and which categories drove it?', 'Make a dashboard', 'Use AI on our data'], answer: 1, explanation: 'It is specific, measurable, time-bound and points to a decision.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Revenue = Orders × AOV. Revenue fell 10%, orders are unchanged. What happened?', options: ['Fewer customers', 'Average order value fell about 10%', 'Conversion rate rose', 'Nothing can be concluded'], answer: 1, explanation: 'If one factor is flat, the other must explain the change.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which is a vanity metric?', options: ['Monthly churn rate', 'Total app downloads since launch', 'Conversion rate by channel', 'Gross margin %'], answer: 1, explanation: 'A cumulative count only goes up and doesn’t guide action.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why write a formal KPI definition?', options: ['For decoration', 'So everyone computes the metric the same way (formula, filters, grain)', 'Because BI tools require it', 'To make reports longer'], answer: 1, explanation: 'Ambiguous definitions cause conflicting numbers and lost trust.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'A dashboard shows conversion rose from 2.0% to 2.4% after a redesign, but traffic sources also changed. The safest next step is…', options: ['Declare the redesign a success', 'Segment by traffic source or run an A/B test before attributing the lift', 'Remove the metric', 'Ignore traffic'], answer: 1, explanation: 'A changed mix of sources is a confounder; control for it.' },
      ],
      summary: [
        'Clarify requests into SMART questions tied to a decision.',
        'Define KPIs precisely: formula, grain, filters, source, target, owner.',
        'Prefer actionable rates; know leading vs lagging indicators.',
        'Metric trees explain why a top-line number moved.',
      ],
      resources: [SWD, { label: 'Lean Analytics — choosing metrics (summary)', url: 'https://leananalyticsbook.com/' }],
    },
    {
      id: 'bi-dashboards-tools',
      title: 'Dashboard Design, Reporting, Power BI & Tableau Fundamentals',
      minutes: 50,
      difficulty: 'intermediate',
      objectives: [
        'Apply dashboard design principles: audience, hierarchy, layout, interactivity',
        'Choose between operational, analytical and strategic dashboards and static reports',
        'Explain the Power BI workflow: Power Query, data model, DAX measures, visuals',
        'Explain the Tableau workflow: dimensions vs measures, sheets, calculated fields, dashboards',
      ],
      intro: md`
Dashboards put KPIs in front of decision-makers every day. Most companies use a BI tool — **Power BI** and **Tableau** dominate job ads — to build them. The tools differ in buttons, but the design principles and the underlying data model concepts are the same, and they connect directly to what you learned in pandas and SQL.
`,
      simple: md`
A good dashboard is like a car dashboard: the most important numbers are big and in front of you (speed), warnings stand out (low fuel), and details are available if you need them (trip computer).

- Put the **top KPIs** at the top-left, where eyes go first.
- Below them, show **trends** (line charts) and **breakdowns** (bar charts).
- Let users **filter** (by region, date) to explore.
- Keep it to one screen and one purpose.

Power BI and Tableau let you build this by dragging fields onto charts instead of writing code.
`,
      technical: md`
### Types of dashboards and reports
| Type | Audience | Refresh | Example |
|---|---|---|---|
| Operational | front-line teams | real-time / daily | today’s orders, open tickets |
| Analytical | analysts / managers | daily–weekly | sales by segment with drill-down |
| Strategic | executives | weekly–monthly | company KPIs vs targets |
| Static report | anyone | periodic | monthly PDF with commentary |

### Design principles
1. **Know the audience and decisions** — what will they do differently after looking?
2. **Visual hierarchy:** KPI cards (number + change vs target) at top; trends next; detail tables last.
3. **Consistency:** same colours for the same meaning, aligned grids, consistent number formats.
4. **Context:** targets, previous period, conditional colours (green/red sparingly, with icons for colour-blind users).
5. **Interactivity:** slicers/filters, drill-down, tooltips — but sensible defaults.
6. **Performance & trust:** fast loads, a “last refreshed” timestamp, documented definitions.
7. Fewer charts beat more: 5–8 visuals per page.

### Power BI fundamentals
- **Power BI Desktop** (free, Windows) → build reports; **Power BI Service** → publish and share; scheduled refresh via gateways.
- **Get Data → Power Query**: clean and transform with steps (like a pandas script): remove columns, change types, merge queries, unpivot. Language behind it: **M**.
- **Data model** (Model view): tables connected by relationships — ideally a **star schema**: fact table (sales) surrounded by dimension tables (date, product, customer).
- **DAX** (Data Analysis Expressions) for measures:
  - \`Total Revenue = SUM(Sales[revenue])\`
  - \`Orders = DISTINCTCOUNT(Sales[order_id])\`
  - \`AOV = DIVIDE([Total Revenue], [Orders])\`
  - \`Revenue LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR('Date'[Date]))\`
  - **Measures** are computed at query time in the current filter context; **calculated columns** are computed per row and stored.
- Visuals: card, line, bar, matrix, map, slicer; conditional formatting; drill-through pages.

### Tableau fundamentals
- **Tableau Public** (free) / Desktop; connect to CSV, Excel, databases.
- Fields are **dimensions** (categorical, blue — slice the data) or **measures** (numeric, green — aggregated, e.g. SUM).
- Drag fields to **Rows/Columns** shelves and the **Marks** card (colour, size, label, tooltip); \`Show Me\` suggests chart types.
- **Calculated fields**: \`SUM([Revenue]) / COUNTD([Order Id])\`; **LOD expressions**: \`{FIXED [Customer Id] : SUM([Revenue])}\`.
- Build **sheets** (single charts) → combine into **dashboards** with filters and actions → **stories** for presentations.

### Mapping to what you know
Power Query ≈ pandas cleaning; relationships ≈ SQL joins; measures ≈ groupby aggregations evaluated per filter; slicers ≈ WHERE clauses.
`,
      terms: [
        ['Dashboard', 'A visual display of key metrics, usually interactive and regularly refreshed.'],
        ['KPI card', 'A tile showing one metric, often with change vs target.'],
        ['Power Query', 'Power BI/Excel tool for importing and transforming data (M language).'],
        ['DAX', 'Data Analysis Expressions: Power BI’s formula language for measures.'],
        ['Measure', 'A calculation evaluated dynamically in the current filter context.'],
        ['Star schema', 'Data model with a central fact table linked to dimension tables.'],
        ['Dimension vs measure (Tableau)', 'Categorical fields that slice data vs numeric fields that are aggregated.'],
        ['Slicer / filter', 'A control letting users restrict the data shown.'],
      ],
      realWorld: md`
A retail chain replaced 14 separate Excel reports with one Power BI dashboard: KPI cards (revenue, AOV, margin vs target), a monthly trend line, a region × category matrix with conditional colours, and slicers for date and store. Store managers check it every morning on their phones; the regional director drills from region to store to product when a number turns red. Report preparation time dropped from two days a month to zero.
`,
      steps: [
        'Interview the audience: which decisions, which KPIs, how often?',
        'Sketch the layout on paper: KPI cards → trends → breakdowns → details.',
        'Prepare a clean star-schema data model (fact + dimension tables).',
        'Build measures with clear definitions; add visuals and filters.',
        'Test with real users, check performance, add “last refreshed” and definitions, then publish.',
      ],
      code: [
        {
          title: 'Prototype a one-page dashboard in Python',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
cur = sales[sales["order_date"].dt.year == 2025]
prev = sales[sales["order_date"].dt.year == 2024]

def kpis(df):
    return {"Revenue": df["revenue"].sum(), "Orders": df["order_id"].nunique(),
            "AOV": df["revenue"].sum() / df["order_id"].nunique()}

k_cur, k_prev = kpis(cur), kpis(prev)

fig = plt.figure(figsize=(12, 6.5))
grid = fig.add_gridspec(3, 3, height_ratios=[0.7, 2, 2])
for i, name in enumerate(k_cur):
    ax = fig.add_subplot(grid[0, i]); ax.axis("off")
    change = (k_cur[name] - k_prev[name]) / k_prev[name] * 100
    value = f"\${k_cur[name]:,.0f}" if name != "Orders" else f"{k_cur[name]:,}"
    ax.text(0.5, 0.62, value, ha="center", fontsize=22, weight="bold")
    ax.text(0.5, 0.15, f"{name}  {change:+.1f}% vs 2024", ha="center", fontsize=11,
            color="#059669" if change >= 0 else "#dc2626")

ax_trend = fig.add_subplot(grid[1, :])
monthly = sales.groupby(sales["order_date"].dt.to_period("M"))["revenue"].sum()
ax_trend.plot(monthly.index.astype(str), monthly.values, marker="o", color="#4f46e5")
ax_trend.set_title("Monthly revenue"); ax_trend.tick_params(axis="x", rotation=90, labelsize=7)

ax_reg = fig.add_subplot(grid[2, :2])
cur.groupby("region")["revenue"].sum().sort_values().plot.barh(ax=ax_reg, color="#6366f1")
ax_reg.set_title("2025 revenue by region")

ax_cat = fig.add_subplot(grid[2, 2])
cur.groupby("category")["revenue"].sum().plot.pie(ax=ax_cat, autopct="%1.0f%%", ylabel="")
ax_cat.set_title("Category share")
fig.suptitle("Sales dashboard — 2025 (data refreshed from sales.csv)", fontsize=14)
fig.tight_layout(); plt.show()
`,
          explanation: [
            'Load the sales data and split it into the current year (2025) and the previous year (2024) — the comparison baseline every KPI card needs.',
            '`kpis()` returns the three headline KPIs for any slice of data, so both periods are computed identically (one definition, reused).',
            'Compute KPIs for both years.',
            'Create one figure and a 3 × 3 grid: a short top row for KPI cards and two taller rows for charts (`height_ratios`).',
            'For each KPI: a blank axis (`axis("off")`) acts as a card…',
            '…compute the change vs last year…',
            '…format money with \$ and thousands separators (orders as a plain count)…',
            '…draw the big number…',
            '…and the change, coloured green if up and red if down — visual hierarchy and context in one tile.',
            'Second row spans all columns (`grid[1, :]`): the monthly revenue trend.',
            'Third row: revenue by region as sorted horizontal bars (two columns wide)…',
            '…and the category share as a pie with only three slices (an acceptable use).',
            'A title with the data source and period, then layout and display. In Power BI or Tableau you would build the same page with cards, a line chart, a bar chart and slicers.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Cramming 20 charts onto one page.', fix: 'One purpose per page; 5–8 visuals; details on drill-through pages.' },
        { mistake: 'KPI cards without targets or comparisons.', fix: 'Show change vs target/previous period with clear formatting.' },
        { mistake: 'Building visuals on a messy flat table with duplicated keys.', fix: 'Clean data first (Power Query) and model a star schema.' },
        { mistake: 'Using calculated columns for ratios that must respond to filters.', fix: 'Use measures (DAX) or aggregate calculated fields (Tableau).' },
      ],
      exercises: [
        {
          id: 'bi2-ex1', title: 'KPI card values', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`
Write \`kpi_card(df, year)\` that returns a dict with keys \`"revenue"\` (sum), \`"orders"\` (distinct order_id) and \`"growth_pct"\` (revenue change vs the previous year in %, rounded to 1 decimal) for the given year of \`data/sales.csv\`.
`,
          starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])

def kpi_card(df, year):
    return {}

print(kpi_card(sales, 2025))
`,
          solution: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])

def kpi_card(df, year):
    yr = df["order_date"].dt.year
    cur = df.loc[yr == year, "revenue"].sum()
    prev = df.loc[yr == year - 1, "revenue"].sum()
    return {
        "revenue": cur,
        "orders": df.loc[yr == year, "order_id"].nunique(),
        "growth_pct": round((cur - prev) / prev * 100, 1),
    }

print(kpi_card(sales, 2025))
`,
          tests: md`
_r = kpi_card(sales, 2025)
_y = sales.order_date.dt.year
_c, _p = sales.loc[_y == 2025, "revenue"].sum(), sales.loc[_y == 2024, "revenue"].sum()
assert abs(_r.get("revenue", 0) - _c) < 1e-6, "revenue wrong"
assert _r.get("orders") == sales.loc[_y == 2025, "order_id"].nunique(), "orders wrong"
assert _r.get("growth_pct") == round((_c - _p) / _p * 100, 1), f"growth_pct wrong: {_r.get('growth_pct')}"
`,
          hints: ['Use `df["order_date"].dt.year` to filter each year.', 'growth = (current − previous) / previous × 100, rounded to 1 decimal.'],
        },
        {
          id: 'bi2-ex2', title: 'Measure or calculated column?', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`In Power BI you need “Average Order Value” that updates when users filter by region and month. Should it be a **measure** or a **calculated column**? (one word)`,
          solution: 'measure', accepted: ['measure', 'a measure'],
          hints: ['Which one is evaluated in the current filter context?'],
        },
        {
          id: 'bi2-ex3', title: 'Build a star-schema dimension', type: 'dataset', lang: 'python', difficulty: 'advanced',
          prompt: md`
BI models use separate **dimension tables**. From \`data/sales.csv\`, build \`dim_product\`: one row per distinct \`product\` with columns \`product_key\` (1, 2, 3… in alphabetical order of product), \`product\` and \`category\`. Then build \`fact\`: the sales table with \`product\` and \`category\` replaced by \`product_key\`.
`,
          starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv")
dim_product = None
fact = None
`,
          solution: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv")
dim_product = (sales[["product", "category"]].drop_duplicates()
               .sort_values("product").reset_index(drop=True))
dim_product.insert(0, "product_key", range(1, len(dim_product) + 1))
fact = (sales.merge(dim_product, on=["product", "category"], how="left", validate="many_to_one")
        .drop(columns=["product", "category"]))
print(dim_product); print(fact.head())
`,
          tests: md`
assert list(dim_product.columns) == ["product_key", "product", "category"], f"dim columns: {list(dim_product.columns)}"
assert dim_product["product"].is_unique and len(dim_product) == sales["product"].nunique()
assert dim_product["product"].tolist() == sorted(dim_product["product"]), "Sort products alphabetically"
assert dim_product["product_key"].tolist() == list(range(1, len(dim_product) + 1))
assert len(fact) == len(sales) and "product_key" in fact and "product" not in fact and "category" not in fact
_back = fact.merge(dim_product, on="product_key")
assert abs(_back.groupby("category")["revenue"].sum() - sales.groupby("category")["revenue"].sum()).max() < 1e-6, "Joining back should reproduce category revenue"
`,
          hints: ['`drop_duplicates()` on product + category, sort, then `insert` a key column.', 'Merge the key into sales and drop the descriptive columns.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Where should the most important KPIs go on a dashboard?', options: ['Bottom-right', 'Top-left / top row', 'In a hidden tab', 'Anywhere'], answer: 1, explanation: 'Readers scan from the top-left.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'In Power BI, Power Query is mainly used for…', options: ['Writing DAX measures', 'Importing and transforming (cleaning) data', 'Publishing reports', 'Drawing maps'], answer: 1, explanation: 'Power Query is the ETL/cleaning layer.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'A star schema consists of…', options: ['One flat table', 'A fact table linked to dimension tables', 'Only dimension tables', 'Pivot tables'], answer: 1, explanation: 'Facts (events) in the centre, descriptive dimensions around them.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'In Tableau, “Region” would usually be a…', options: ['Measure', 'Dimension', 'Calculated field only', 'Parameter'], answer: 1, explanation: 'Categorical fields that slice data are dimensions.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: '`Revenue LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(\'Date\'[Date]))` does what?', options: ['Sums all revenue ever', 'Computes revenue for the same period one year earlier in the current filter context', 'Creates a calculated column', 'Deletes last year'], answer: 1, explanation: 'CALCULATE modifies the filter context; SAMEPERIODLASTYEAR shifts dates.' },
      ],
      summary: [
        'Design for an audience and its decisions: KPIs → trends → breakdowns → details.',
        'Context (targets, comparisons), consistency and few visuals make dashboards usable.',
        'Power BI: Power Query → star-schema model → DAX measures → visuals → publish.',
        'Tableau: dimensions vs measures, shelves & marks, calculated fields, dashboards & stories.',
      ],
      resources: [PBI, TAB, { label: 'Tableau Public (free)', url: 'https://public.tableau.com/' }],
    },
    {
      id: 'bi-communicating',
      title: 'Communicating Insights & Presenting to Stakeholders (with Case Studies)',
      minutes: 45,
      difficulty: 'intermediate',
      objectives: [
        'Structure findings with the pyramid principle and SCQA',
        'Write an executive summary with recommendations, impact and caveats',
        'Tailor communication to technical and non-technical stakeholders',
        'Work through an end-to-end business case study',
      ],
      intro: md`
The most common reason analytics fails is not bad math — it’s that nobody acted on it. Communicating clearly, briefly and in the audience’s language is a core data skill and one of the main things interviewers assess when you present a portfolio project.
`,
      simple: md`
Lead with the answer. Busy managers want: **what did you find, what should we do, and how much does it matter?** — in that order. Details come after, for those who ask.

Tell it as a short story:
- **Situation:** where we are (“Churn is 33%”).
- **Complication:** the problem (“Month-to-month customers churn at 45%”).
- **Question:** what should we do?
- **Answer:** your recommendation (“Offer a discount for switching to annual plans; expected to save ~\$X per year”).
`,
      technical: md`
### Pyramid principle
Start with the **main message** (the recommendation), support it with 2–4 **key arguments**, each backed by **evidence** (numbers, charts). Readers can stop at any level and still get the point.

### SCQA framework
**Situation → Complication → Question → Answer.** Works for emails, slide decks and the opening of a report.

### Executive summary template
1. **Headline recommendation** (one sentence, action-oriented).
2. **Key findings** (3 bullets, each with a number).
3. **Expected impact** (\$, %, customers affected) and **confidence**.
4. **Risks, caveats and assumptions** (data limits, correlation ≠ causation).
5. **Next steps** (owner, timeline, how success will be measured).

### Slides & charts for stakeholders
- One message per slide, written as the **slide title** (“Annual plans churn 4× less”).
- Highlight the key data point; grey out the rest; remove clutter.
- Put methodology in an appendix.
- Translate jargon: “statistically significant at p < 0.05” → “very unlikely to be a coincidence”.

### Know your audience
| Audience | Wants | Give |
|---|---|---|
| Executives | decision, impact, risk | 1-page summary, 3–5 slides |
| Managers | what to change in their area | segment-level breakdowns, actions |
| Technical peers | methods, validity | code, assumptions, robustness checks |

### Handling questions and pushback
Anticipate questions (“is this seasonal?”), bring backup slides, admit uncertainty honestly, and separate facts from interpretation. Follow up in writing with decisions and owners.
`,
      terms: [
        ['Pyramid principle', 'Communicate the conclusion first, then supporting arguments and evidence.'],
        ['SCQA', 'Situation, Complication, Question, Answer: a narrative structure.'],
        ['Executive summary', 'A short overview of findings, recommendations and impact for decision-makers.'],
        ['Stakeholder', 'Anyone affected by or deciding on the outcome of your analysis.'],
        ['Action title', 'A slide or chart title stating the takeaway rather than the topic.'],
        ['Caveat', 'An important limitation or assumption behind a conclusion.'],
      ],
      realWorld: md`
**Case study — telecom churn (using \`data/churn.csv\`).**

*Situation:* 1,200 customers, one-third churned. *Complication:* churn concentrates in month-to-month contracts (≈45%) and among customers with 4+ support calls. *Question:* where should the retention budget go? *Answer:* target month-to-month customers with high support calls with an annual-plan offer and proactive support. The analysis below quantifies the segment, the revenue at risk and the break-even success rate of the campaign — the kind of output a manager can approve on the spot.
`,
      steps: [
        'Write the one-sentence answer first.',
        'Choose 2–4 findings that support it; quantify each.',
        'Estimate impact (revenue at risk, cost, break-even) and state assumptions.',
        'Draft with SCQA; give every chart an action title.',
        'Adapt depth to the audience; end with concrete next steps and owners.',
      ],
      code: [
        {
          title: 'Case study: from analysis to an executive summary',
          code: md`
import pandas as pd

df = pd.read_csv("data/churn.csv")
df["churned"] = df["churn"].eq("Yes")
df["high_calls"] = df["support_calls"] >= 4

overall = df["churned"].mean()
by_seg = df.groupby(["contract", "high_calls"]).agg(
    customers=("customer_id", "count"), churn_rate=("churned", "mean"),
    monthly_rev=("monthly_charges", "sum"))
target = by_seg.loc[("Month-to-month", True)]

revenue_at_risk = target["monthly_rev"] * target["churn_rate"] * 12
offer_cost_per_customer = 60
campaign_cost = target["customers"] * offer_cost_per_customer
avg_annual_value = target["monthly_rev"] / target["customers"] * 12
break_even_saves = campaign_cost / avg_annual_value

summary = f"""
EXECUTIVE SUMMARY - Retention campaign
Recommendation: offer month-to-month customers with 4+ support calls a discounted annual plan
plus proactive support outreach.

Key findings
- Overall churn is {overall:.0%}; this segment churns at {target['churn_rate']:.0%} ({int(target['customers'])} customers).
- Month-to-month customers churn far more than annual-contract customers.
- Churn rises steadily with the number of support calls.

Impact
- Annual revenue at risk in the segment: \${revenue_at_risk:,.0f}.
- Campaign cost (\${offer_cost_per_customer} per customer): \${campaign_cost:,.0f}.
- Break-even: the campaign pays off if it saves {break_even_saves:.0f} customers
  ({break_even_saves / (target['customers'] * target['churn_rate']):.0%} of expected churners).

Caveats
- Associations, not proven causes: validate with an A/B test on half the segment.
- Synthetic data; revenue uses current monthly charges.

Next steps
- Marketing to launch a 6-week A/B test; analytics to report churn difference weekly.
"""
print(by_seg.round(3))
print(summary)
`,
          explanation: [
            'Load the churn data; create a boolean churn flag and a “high support calls” flag (4 or more calls) — the segment hypothesis from EDA.',
            'Overall churn rate for the Situation.',
            'Group by contract × high-calls to size every segment: customers, churn rate and total monthly revenue.',
            'Select the target segment (month-to-month with many calls) with a tuple index.',
            'Revenue at risk = monthly revenue × churn rate × 12 months — translating a rate into money executives understand.',
            'An assumed offer cost per customer (assumptions must be explicit).',
            'Total campaign cost for the whole segment.',
            'Average annual value of one customer in the segment.',
            'Break-even: how many customers the campaign must retain to pay for itself.',
            'A triple-quoted f-string formats the summary using the pyramid principle: recommendation first, then quantified findings, impact, caveats and next steps.',
            'Each finding has a number; percentages use `:.0%` and money uses `:,.0f`.',
            'Caveats honestly separate association from causation and propose an A/B test — exactly what a sceptical stakeholder will ask.',
            'Print the segment table (backup evidence) and the summary.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Walking through the analysis chronologically (“first I cleaned the data…”).', fix: 'Lead with the answer; methods go in the appendix.' },
        { mistake: 'Charts titled “Churn by contract”.', fix: 'Action titles: “Monthly plans churn 4× more than two-year plans”.' },
        { mistake: 'Hiding uncertainty or overstating causation.', fix: 'State confidence, assumptions and how to validate (A/B test).' },
        { mistake: 'Jargon for non-technical audiences.', fix: 'Translate into business language and impact.' },
      ],
      exercises: [
        {
          id: 'bi3-ex1', title: 'Quantify revenue at risk', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Using \`data/churn.csv\`, compute \`at_risk\`: the **expected annual revenue lost** from month-to-month customers = sum of their \`monthly_charges\` × the churn rate of month-to-month customers × 12.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
at_risk = 0
print(at_risk)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
m2m = df[df["contract"] == "Month-to-month"]
rate = (m2m["churn"] == "Yes").mean()
at_risk = m2m["monthly_charges"].sum() * rate * 12
print(round(at_risk, 2))
`,
          tests: md`
_m = df[df.contract == "Month-to-month"]
_e = _m.monthly_charges.sum() * (_m.churn == "Yes").mean() * 12
assert abs(at_risk - _e) < 1e-4, f"Expected {_e:,.2f}, got {at_risk}"
`,
          hints: ['Filter month-to-month customers first.', 'Churn rate = mean of `churn == "Yes"` in that subset.'],
        },
        {
          id: 'bi3-ex2', title: 'Write an action title', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`
Write a function \`action_title(segment, rate_a, rate_b)\` returning a takeaway title like \`"Month-to-month churns 3.2x more than Two year"\` comparing two churn rates. Format: \`f"{segment[0]} churns {ratio:.1f}x more than {segment[1]}"\`, where \`ratio = rate_a / rate_b\`.
`,
          starter: md`
def action_title(segment, rate_a, rate_b):
    return "Churn by contract"

print(action_title(("Month-to-month", "Two year"), 0.48, 0.15))
`,
          solution: md`
def action_title(segment, rate_a, rate_b):
    ratio = rate_a / rate_b
    return f"{segment[0]} churns {ratio:.1f}x more than {segment[1]}"

print(action_title(("Month-to-month", "Two year"), 0.48, 0.15))
`,
          tests: md`
assert action_title(("Month-to-month", "Two year"), 0.48, 0.15) == "Month-to-month churns 3.2x more than Two year"
assert action_title(("A", "B"), 0.3, 0.1) == "A churns 3.0x more than B"
`,
          hints: ['Compute `ratio = rate_a / rate_b` and use the exact f-string format.'],
        },
        {
          id: 'bi3-ex3', title: 'Order the message', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`
In the pyramid principle, what comes **first**? Answer with the letter.

A) Methodology B) Data sources C) Recommendation / main message D) Appendix
`,
          solution: 'C', accepted: ['c', 'c)'],
          hints: ['Lead with the answer.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What should open an executive summary?', options: ['How the data was cleaned', 'The headline recommendation', 'A list of all charts', 'Python versions used'], answer: 1, explanation: 'Executives need the decision first.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'In SCQA, the “Complication” is…', options: ['The final recommendation', 'The problem or change that creates the need to act', 'The appendix', 'The data source'], answer: 1, explanation: 'Situation → Complication → Question → Answer.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'How should you present “p = 0.01” to a non-technical manager?', options: ['Show the formula', 'Say it is very unlikely the difference is just coincidence', 'Say it is 99% certain to be true', 'Omit it entirely'], answer: 1, explanation: 'Plain language, without overstating certainty.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which is an action title?', options: ['Sales by region', 'Q3 data', 'The South drove 80% of the revenue decline', 'Figure 3'], answer: 2, explanation: 'It states the takeaway.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'A strong recommendation includes…', options: ['Only a chart', 'Action, quantified impact, assumptions/risks and a way to validate', 'Every analysis you ran', 'A causal claim without evidence'], answer: 1, explanation: 'Decision-makers need impact and risk to act responsibly.' },
      ],
      summary: [
        'Lead with the answer (pyramid principle); tell it with SCQA.',
        'Executive summary: recommendation, quantified findings, impact, caveats, next steps.',
        'Action titles, highlighted key data, methods in the appendix.',
        'Tailor depth and language to each audience; propose validation (A/B tests).',
      ],
      resources: [SWD, { label: 'The Minto Pyramid Principle (overview)', url: 'https://www.barbaraminto.com/' }],
    },
  ],
};
