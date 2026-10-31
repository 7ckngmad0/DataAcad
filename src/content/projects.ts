import type { Project } from '../types.ts';
import { md } from './md.ts';

const report = (title: string, sections: string[]) =>
  [`# ${title}`, '', '**Author:** your name · **Date:** YYYY-MM-DD · **Tools:** Python, pandas, ...', '', ...sections.flatMap((s) => [`## ${s}`, '_Write here._', ''])].join('\n');

const STD_REPORT = ['1. Executive summary (3–5 sentences: question, key findings, recommendation)', '2. Business problem & objectives', '3. Data (source, size, columns, limitations)', '4. Data cleaning (rules applied and rows affected)', '5. Analysis & findings (each with a chart and a number)', '6. Recommendations & expected impact', '7. Limitations & next steps', '8. Appendix: how to reproduce (files, versions)'];

export const PROJECTS: Project[] = [
  // ------------------------------------------------------------------ BEGINNER
  {
    id: 'student-grades',
    title: 'Student Grade Analysis',
    level: 'Beginner',
    hours: 4,
    skills: ['pandas basics', 'Descriptive statistics', 'groupby', 'Visualization', 'Correlation'],
    objectives: [
      'Load and inspect a dataset, check data quality',
      'Summarise scores with descriptive statistics',
      'Compare groups (pass/fail, gender) and relate study habits to results',
      'Communicate 3 evidence-based recommendations to a school',
    ],
    businessProblem: md`
A school wants to improve its **pass rate**. The principal asks: *Which factors are associated with passing? Do study hours and attendance matter, and by how much? Which subject needs the most support?* You have one term of anonymised results for 120 students.
`,
    dataset: {
      file: 'students.csv',
      description: '120 students with weekly study hours, attendance, three subject scores, the average and pass/fail (average ≥ 60). Synthetic but realistic.',
      columns: [['student_id', 'Unique ID'], ['name', 'Anonymised name'], ['gender', 'F / M'], ['age', '17–22'], ['study_hours_week', 'Self-reported weekly study hours'], ['attendance_pct', 'Attendance %'], ['math, science, english', 'Scores 0–100'], ['average', 'Mean of the three scores'], ['passed', 'yes / no']],
    },
    libraries: ['pandas', 'matplotlib', 'seaborn (optional)'],
    steps: [
      { title: 'Load and inspect', detail: md`Load the CSV, check shape, dtypes, missing values and duplicates. Write down anything surprising.`, code: md`
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("data/students.csv")
print(df.shape)
print(df.dtypes)
print("missing:", int(df.isna().sum().sum()), " duplicates:", int(df.duplicated().sum()))
df.head()
` },
      { title: 'Descriptive statistics per subject', detail: md`Compute mean, median, standard deviation, min and max for each subject. Which subject has the lowest average and the most spread?`, code: md`
subjects = ["math", "science", "english"]
summary = df[subjects].agg(["mean", "median", "std", "min", "max"]).round(1)
print(summary)
print("Lowest mean subject:", summary.loc["mean"].idxmin())
` },
      { title: 'Pass rate overall and by group', detail: md`Compute the overall pass rate and the pass rate by gender. Is any gap meaningful (check group sizes)?`, code: md`
df["passed_flag"] = df["passed"].eq("yes")
print("Overall pass rate:", round(df["passed_flag"].mean(), 3))
print(df.groupby("gender")["passed_flag"].agg(rate="mean", n="size").round(3))
` },
      { title: 'Study habits vs results', detail: md`Compare mean study hours and attendance for passing vs failing students, and compute correlations with the average score.`, code: md`
print(df.groupby("passed")[["study_hours_week", "attendance_pct"]].mean().round(1))
print(df[["study_hours_week", "attendance_pct", "average"]].corr().round(2))
` },
      { title: 'Visualise the key relationships', detail: md`Make a histogram of averages with the pass line, and a scatter plot of study hours vs average coloured by pass/fail. Give each chart an action title.`, code: md`
fig, ax = plt.subplots(1, 2, figsize=(11, 3.8))
ax[0].hist(df["average"], bins=15, color="#6366f1", edgecolor="white")
ax[0].axvline(60, color="red", linestyle="--"); ax[0].set_title("Most students pass; a cluster sits just below 60")
for label, color in [("yes", "#10b981"), ("no", "#ef4444")]:
    sub = df[df["passed"] == label]
    ax[1].scatter(sub["study_hours_week"], sub["average"], c=color, label=f"passed={label}", alpha=0.7)
ax[1].set_xlabel("study hours / week"); ax[1].set_ylabel("average score"); ax[1].legend()
ax[1].set_title("More study hours, higher averages")
plt.tight_layout(); plt.show()
` },
      { title: 'Quantify the effect of study time', detail: md`Fit a simple line (\`np.polyfit\`) of average on study hours: how many points does one extra weekly hour add on average? Identify students at risk (average 55–60).`, code: md`
import numpy as np
slope, intercept = np.polyfit(df["study_hours_week"], df["average"], 1)
print(f"Each extra study hour/week ≈ +{slope:.2f} points on average")
at_risk = df[df["average"].between(55, 59.99)][["student_id", "study_hours_week", "attendance_pct", "average"]]
print(len(at_risk), "students are within 5 points of passing")
` },
      { title: 'Write recommendations', detail: md`Use the report template. Example structure: (1) target the near-miss group with tutoring, (2) encourage +2 study hours/week (≈ +X points), (3) focus support on the weakest subject. State that correlations aren’t proof of causation.` },
    ],
    expectedOutput: ['A summary table per subject', 'Pass rates overall and by group with sample sizes', 'Two labelled charts with action titles', 'A short report with 3 recommendations'],
    evaluation: ['Data checked for missing values/duplicates before analysis', 'Correct statistics and group comparisons with n reported', 'Charts are labelled with clear takeaways', 'Recommendations follow from the evidence; causation caveat stated', 'Code runs top-to-bottom (restart & run all)'],
    reportTemplate: report('Student Grade Analysis', STD_REPORT),
    starter: md`
import pandas as pd
df = pd.read_csv("data/students.csv")
print(df.shape)
df.head()
`,
  },
  {
    id: 'personal-expenses',
    title: 'Personal Expense Analysis',
    level: 'Beginner',
    hours: 4,
    skills: ['Dates in pandas', 'groupby & pivot', 'Budgeting KPIs', 'Visualization'],
    objectives: [
      'Parse dates and aggregate spending by month and category',
      'Find the largest spending categories and seasonal spikes',
      'Compare against a budget and compute savings opportunities',
      'Produce a one-page monthly spending summary',
    ],
    businessProblem: md`
You (or a client) want to save \$2,000 next year. Using a year of transactions, answer: *Where does the money go? Which months are unusually expensive? Which categories offer realistic savings, and how much?*
`,
    dataset: {
      file: 'expenses.csv',
      description: 'One year (2025) of personal expenses: 422 transactions across 9 categories and 3 payment methods. Synthetic.',
      columns: [['date', 'Transaction date (YYYY-MM-DD)'], ['category', 'Rent, Groceries, Transport, Eating Out, ...'], ['amount', 'Amount spent'], ['payment_method', 'card / cash / transfer']],
    },
    libraries: ['pandas', 'matplotlib'],
    steps: [
      { title: 'Load and parse dates', detail: md`Load with \`parse_dates\`, add a \`month\` column, and check the date range and totals.`, code: md`
import pandas as pd
import matplotlib.pyplot as plt

exp = pd.read_csv("data/expenses.csv", parse_dates=["date"])
exp["month"] = exp["date"].dt.to_period("M")
print(exp["date"].min().date(), "to", exp["date"].max().date(), "| total spent:", round(exp["amount"].sum(), 2))
` },
      { title: 'Spending by category', detail: md`Total and share of spending per category, sorted. Which three categories make up most of the spending?`, code: md`
by_cat = exp.groupby("category")["amount"].sum().sort_values(ascending=False)
share = (by_cat / by_cat.sum() * 100).round(1)
print(pd.DataFrame({"total": by_cat.round(2), "share_%": share}))
` },
      { title: 'Monthly trend and spikes', detail: md`Total per month; flag months more than 15% above the monthly median.`, code: md`
monthly = exp.groupby("month")["amount"].sum()
spikes = monthly[monthly > monthly.median() * 1.15]
print(monthly.round(0))
print("Expensive months:", [str(m) for m in spikes.index])
` },
      { title: 'Category × month pivot', detail: md`A pivot table of category by month reveals *which* category caused each spike.`, code: md`
pivot = exp.pivot_table(values="amount", index="category", columns=exp["date"].dt.month, aggfunc="sum", fill_value=0).round(0)
print(pivot)
` },
      { title: 'Budget comparison', detail: md`Define a monthly budget per category and compute average monthly overspend. Where are the biggest gaps?`, code: md`
budget = {"Rent": 650, "Groceries": 330, "Transport": 90, "Eating Out": 100, "Utilities": 120,
          "Entertainment": 60, "Health": 40, "Shopping": 80, "Subscriptions": 30}
avg_month = exp.groupby("category")["amount"].sum() / exp["month"].nunique()
gap = (avg_month - pd.Series(budget)).sort_values(ascending=False).round(2)
print("Average monthly overspend vs budget:\n", gap)
print("Annual savings if overspending stopped:", round(gap[gap > 0].sum() * 12, 2))
` },
      { title: 'Visual summary', detail: md`Create a two-panel chart: monthly totals (line) and category totals (sorted bars).`, code: md`
fig, ax = plt.subplots(1, 2, figsize=(11, 3.8))
ax[0].plot(monthly.index.astype(str), monthly.values, marker="o")
ax[0].set_title("December is the most expensive month"); ax[0].tick_params(axis="x", rotation=45)
by_cat.sort_values().plot.barh(ax=ax[1], color="#6366f1")
ax[1].set_title("Rent and groceries dominate spending")
plt.tight_layout(); plt.show()
` },
      { title: 'Recommendations', detail: md`Propose 2–3 specific changes (e.g. cap Eating Out at budget → save \$X/year) and check they reach the \$2,000 goal.` },
    ],
    expectedOutput: ['Category totals and shares', 'Monthly totals with flagged spikes', 'Budget gap table and annual savings estimate', 'Two-panel summary chart'],
    evaluation: ['Dates parsed and aggregated correctly', 'Spikes explained via the pivot table', 'Savings estimate is reproducible and realistic', 'Clear, actionable recommendations'],
    reportTemplate: report('Personal Expense Analysis', STD_REPORT),
    starter: md`
import pandas as pd
exp = pd.read_csv("data/expenses.csv", parse_dates=["date"])
exp.head()
`,
  },
  {
    id: 'basic-sales',
    title: 'Basic Sales Analysis',
    level: 'Beginner',
    hours: 5,
    skills: ['KPIs', 'groupby', 'Time trends', 'Product analysis'],
    objectives: [
      'Compute core sales KPIs (revenue, orders, AOV) by year',
      'Find top products, categories and regions',
      'Analyse seasonality and discount effects',
      'Summarise insights for a store manager',
    ],
    businessProblem: md`
An online office-supplies store asks: *How did 2025 compare with 2024? Which products and regions drive revenue? When do we sell most, and do discounts increase order size?*
`,
    dataset: {
      file: 'sales.csv',
      description: '1,500 orders (2024–2025) with region, category, product, units, price, discount and revenue. Synthetic.',
      columns: [['order_id', 'Order identifier'], ['order_date', 'Date'], ['region', 'North/South/East/West'], ['category', 'Electronics, Furniture, Office Supplies'], ['product', 'Product name'], ['units', 'Units in the order'], ['unit_price', 'List price'], ['discount', '0, 0.1 or 0.2'], ['revenue', 'units × price × (1 − discount)'], ['customer_id', 'Customer ID']],
    },
    libraries: ['pandas', 'matplotlib'],
    steps: [
      { title: 'Load and add date parts', detail: md`Parse dates and add year and month columns.`, code: md`
import pandas as pd
import matplotlib.pyplot as plt

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
sales["year"] = sales["order_date"].dt.year
sales["month"] = sales["order_date"].dt.month
print(sales.shape, sales["year"].value_counts().to_dict())
` },
      { title: 'Yearly KPIs', detail: md`Revenue, orders, AOV and units per year, plus growth.`, code: md`
kpi = sales.groupby("year").agg(revenue=("revenue", "sum"), orders=("order_id", "nunique"), units=("units", "sum"))
kpi["aov"] = kpi["revenue"] / kpi["orders"]
print(kpi.round(2))
print("Revenue growth %:", round(kpi["revenue"].pct_change().iloc[-1] * 100, 1))
` },
      { title: 'Top products and regions', detail: md`Top 5 products by revenue and revenue by region and category.`, code: md`
print(sales.groupby("product")["revenue"].sum().nlargest(5).round(2))
print(sales.pivot_table(values="revenue", index="region", columns="category", aggfunc="sum").round(0))
` },
      { title: 'Seasonality', detail: md`Average revenue per calendar month across both years; plot it.`, code: md`
by_month = sales.groupby("month")["revenue"].sum() / sales["year"].nunique()
by_month.plot(kind="bar", color="#6366f1", title="Average revenue by month: Q4 peak")
plt.ylabel("revenue"); plt.show()
` },
      { title: 'Do discounts increase order size?', detail: md`Compare average units and revenue for discounted vs full-price orders, within each category.`, code: md`
sales["discounted"] = sales["discount"] > 0
print(sales.groupby(["category", "discounted"])[["units", "revenue"]].mean().round(2))
` },
      { title: 'Summarise for the manager', detail: md`Write 3 findings with numbers (growth, top driver, seasonality) and 2 recommendations (e.g. stock up before Q4; review discount policy if it doesn’t raise units).` },
    ],
    expectedOutput: ['KPI table by year with growth', 'Top products & region × category table', 'Seasonality chart', 'Discount comparison and a short summary'],
    evaluation: ['KPIs defined and computed correctly', 'Comparisons within categories (fair)', 'Charts labelled with takeaways', 'Recommendations tied to numbers'],
    reportTemplate: report('Basic Sales Analysis', STD_REPORT),
    starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
sales.head()
`,
  },
  // ------------------------------------------------------------- INTERMEDIATE
  {
    id: 'eda-houses',
    title: 'Exploratory Data Analysis of a Real-Estate Dataset',
    level: 'Intermediate',
    hours: 6,
    skills: ['EDA workflow', 'Distributions', 'Correlation', 'Outliers', 'Feature engineering'],
    objectives: [
      'Run a complete, structured EDA (univariate → bivariate → multivariate)',
      'Handle skew and outliers thoughtfully',
      'Engineer informative features (price per sqft)',
      'Produce findings that will guide a pricing model',
    ],
    businessProblem: md`
A property platform plans a price-estimation tool. Before modelling, the product team asks you: *What drives house prices in this market? Are there data issues or outliers? Which features should the model use?*
`,
    dataset: {
      file: 'houses.csv',
      description: '800 houses with size, rooms, age, garage, distance to centre, neighborhood and sale price. Synthetic.',
      columns: [['house_id', 'ID'], ['neighborhood', '5 neighborhoods'], ['area_sqft', 'Living area'], ['bedrooms / bathrooms', 'Room counts'], ['age_years', 'Age of the house'], ['garage_spaces', '0–2'], ['distance_to_center_km', 'Distance to city centre'], ['price', 'Sale price ($)']],
    },
    libraries: ['pandas', 'numpy', 'matplotlib', 'seaborn'],
    steps: [
      { title: 'Profile the data', detail: md`Shape, types, missing values, summary statistics.`, code: md`
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

h = pd.read_csv("data/houses.csv")
print(h.shape, "missing:", int(h.isna().sum().sum()), "duplicates:", int(h.duplicated().sum()))
print(h.describe().round(1))
` },
      { title: 'Univariate: price distribution', detail: md`Histogram of price and log(price); compute skew. Should the model predict log(price)?`, code: md`
fig, ax = plt.subplots(1, 2, figsize=(10, 3.5))
sns.histplot(h["price"], ax=ax[0]); ax[0].set_title(f"price (skew {h['price'].skew():.2f})")
sns.histplot(np.log(h["price"]), ax=ax[1], color="#10b981"); ax[1].set_title(f"log price (skew {np.log(h['price']).skew():.2f})")
plt.tight_layout(); plt.show()
` },
      { title: 'Outliers', detail: md`Flag price outliers with the IQR rule and inspect them. Are they errors or legitimately unusual houses?`, code: md`
q1, q3 = h["price"].quantile([0.25, 0.75]); iqr = q3 - q1
outliers = h[(h["price"] < q1 - 1.5 * iqr) | (h["price"] > q3 + 1.5 * iqr)]
print(len(outliers), "price outliers")
print(outliers[["neighborhood", "area_sqft", "bathrooms", "price"]].sort_values("price").tail())
` },
      { title: 'Bivariate: numeric drivers', detail: md`Correlation of each numeric feature with price, and a scatter of area vs price coloured by neighborhood.`, code: md`
print(h.drop(columns="house_id").corr(numeric_only=True)["price"].drop("price").sort_values(ascending=False).round(2))
sns.scatterplot(data=h, x="area_sqft", y="price", hue="neighborhood", alpha=0.6, s=15)
plt.title("Price rises with area; neighborhood shifts the level"); plt.show()
` },
      { title: 'Categorical driver: neighborhood', detail: md`Median price and price per sqft by neighborhood (feature engineering).`, code: md`
h["price_per_sqft"] = h["price"] / h["area_sqft"]
print(h.groupby("neighborhood")[["price", "price_per_sqft"]].median().round(0).sort_values("price_per_sqft"))
` },
      { title: 'Multivariate check', detail: md`Correlation heatmap; note multicollinearity between area, bedrooms and bathrooms.`, code: md`
sns.heatmap(h.drop(columns=["house_id", "price_per_sqft"]).corr(numeric_only=True), annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1)
plt.title("Correlation matrix"); plt.show()
` },
      { title: 'Findings for the modelling team', detail: md`List: main drivers with effect sizes, recommended transformations (log price), engineered features, data issues/outliers and how to treat them.` },
    ],
    expectedOutput: ['Data profile', 'Distribution and outlier analysis', 'Driver analysis (numeric + categorical)', 'Heatmap and a written feature recommendation list'],
    evaluation: ['Follows a structured EDA workflow', 'Thoughtful outlier/skew treatment', 'Uses engineered features and fair comparisons', 'Clear hand-off recommendations'],
    reportTemplate: report('EDA: Real-Estate Prices', STD_REPORT),
    starter: md`
import pandas as pd
h = pd.read_csv("data/houses.csv")
h.head()
`,
  },
  {
    id: 'customer-segmentation',
    title: 'Customer Segmentation with Clustering',
    level: 'Intermediate',
    hours: 6,
    skills: ['K-means', 'Scaling', 'Choosing k', 'Cluster profiling', 'Marketing insight'],
    objectives: [
      'Prepare and scale features for clustering',
      'Choose k with elbow and silhouette methods',
      'Profile and name segments',
      'Recommend a marketing action per segment',
    ],
    businessProblem: md`
A shopping mall’s marketing team wants to stop sending the same promotion to everyone. *Which distinct customer groups exist based on income and spending behaviour, and how should we target each?*
`,
    dataset: {
      file: 'mall_customers.csv',
      description: '216 loyalty-card customers with gender, age, annual income and a spending score (1–100). Synthetic.',
      columns: [['customer_id', 'ID'], ['gender', 'Female/Male'], ['age', 'Years'], ['annual_income_k', 'Annual income ($k)'], ['spending_score', 'Mall-assigned score based on purchases (1–100)']],
    },
    libraries: ['pandas', 'scikit-learn', 'matplotlib', 'seaborn'],
    steps: [
      { title: 'Explore', detail: md`Distributions and a scatter plot of income vs spending score.`, code: md`
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

mall = pd.read_csv("data/mall_customers.csv")
print(mall.describe().round(1))
sns.scatterplot(data=mall, x="annual_income_k", y="spending_score", hue="gender")
plt.title("Visible groups in income vs spending"); plt.show()
` },
      { title: 'Scale features', detail: md`Standardise income and spending score.`, code: md`
features = ["annual_income_k", "spending_score"]
X = StandardScaler().fit_transform(mall[features])
` },
      { title: 'Choose k', detail: md`Compute inertia and silhouette for k = 2…10 and plot them.`, code: md`
ks = range(2, 11)
results = [(k, KMeans(n_clusters=k, n_init=10, random_state=0).fit(X)) for k in ks]
inertia = [m.inertia_ for _, m in results]
sil = [silhouette_score(X, m.labels_) for _, m in results]
fig, ax = plt.subplots(1, 2, figsize=(10, 3.2))
ax[0].plot(list(ks), inertia, marker="o"); ax[0].set_title("Elbow")
ax[1].plot(list(ks), sil, marker="o", color="#10b981"); ax[1].set_title("Silhouette")
plt.show()
best_k = list(ks)[sil.index(max(sil))]
print("best k by silhouette:", best_k)
` },
      { title: 'Fit and visualise segments', detail: md`Fit k-means with the chosen k and plot segments with centroids.`, code: md`
km = KMeans(n_clusters=best_k, n_init=10, random_state=0).fit(X)
mall["segment"] = km.labels_
sns.scatterplot(data=mall, x="annual_income_k", y="spending_score", hue="segment", palette="tab10")
plt.title(f"{best_k} customer segments"); plt.show()
` },
      { title: 'Profile and name segments', detail: md`Mean income, spending, age, size and gender mix per segment; give each a business name.`, code: md`
profile = mall.groupby("segment").agg(size=("customer_id", "count"), income=("annual_income_k", "mean"),
                                      spending=("spending_score", "mean"), age=("age", "mean"),
                                      pct_female=("gender", lambda g: (g == "Female").mean() * 100)).round(1)

def name(row):
    hi_inc, hi_sp = row["income"] > mall["annual_income_k"].median(), row["spending"] > 50
    return {(True, True): "Premium spenders", (True, False): "Careful affluent",
            (False, True): "Young enthusiasts", (False, False): "Budget-conscious"}[(hi_inc, hi_sp)]

profile["name"] = profile.apply(name, axis=1)
print(profile.sort_values("income"))
` },
      { title: 'Marketing plan', detail: md`For each segment, propose a campaign, the KPI to track, and how you would A/B test it.` },
    ],
    expectedOutput: ['Elbow and silhouette charts with justified k', 'Segment scatter plot', 'Profile table with segment names', 'A marketing recommendation per segment'],
    evaluation: ['Features scaled; k chosen with evidence', 'Segments profiled numerically and named sensibly', 'Recommendations are specific and testable', 'Limitations (2 features, synthetic score) acknowledged'],
    reportTemplate: report('Customer Segmentation', STD_REPORT),
    starter: md`
import pandas as pd
mall = pd.read_csv("data/mall_customers.csv")
mall.head()
`,
  },
  {
    id: 'retail-dashboard',
    title: 'Retail Sales Dashboard',
    level: 'Intermediate',
    hours: 6,
    skills: ['KPI design', 'Dashboard layout', 'SQL', 'Data modelling', 'BI tools'],
    objectives: [
      'Define dashboard KPIs with precise formulas',
      'Prepare a star-schema model (fact + dimensions)',
      'Prototype the dashboard in Python, then rebuild it in Power BI or Tableau',
      'Write a short user guide for the dashboard',
    ],
    businessProblem: md`
Regional managers spend two days a month assembling sales reports in Excel. Build a **self-service dashboard** answering: *Are we on track vs last year? Which regions and categories are growing or shrinking? What are the monthly trends?*
`,
    dataset: {
      file: 'sales.csv',
      description: 'Same retail orders dataset as the basic sales project (1,500 orders, 2024–2025).',
      columns: [['order_date', 'Date'], ['region', 'Region'], ['category / product', 'Product hierarchy'], ['units, unit_price, discount', 'Order details'], ['revenue', 'Net revenue'], ['customer_id', 'Customer']],
    },
    libraries: ['pandas', 'matplotlib', 'sqlite3', 'Power BI Desktop or Tableau Public (free, on your computer)'],
    steps: [
      { title: 'Define KPIs', detail: md`Write formulas for: Revenue, Orders, AOV, Units, Revenue YoY %, Discount share. Compute them per year.`, code: md`
import pandas as pd
import matplotlib.pyplot as plt

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
sales["year"] = sales["order_date"].dt.year
k = sales.groupby("year").agg(revenue=("revenue", "sum"), orders=("order_id", "nunique"), units=("units", "sum"),
                             discount_share=("discount", lambda d: (d > 0).mean()))
k["aov"] = k["revenue"] / k["orders"]
print(k.round(3))
` },
      { title: 'Build a star schema', detail: md`Create \`dim_date\`, \`dim_product\` and \`fact_sales\` tables — the model you will import into Power BI/Tableau.`, code: md`
dim_product = sales[["product", "category"]].drop_duplicates().sort_values("product").reset_index(drop=True)
dim_product.insert(0, "product_key", range(1, len(dim_product) + 1))
dim_date = pd.DataFrame({"date": pd.date_range(sales["order_date"].min(), sales["order_date"].max())})
dim_date["year"], dim_date["month"], dim_date["quarter"] = dim_date["date"].dt.year, dim_date["date"].dt.month, dim_date["date"].dt.quarter
fact = sales.merge(dim_product, on=["product", "category"]).rename(columns={"order_date": "date"})
fact = fact[["order_id", "date", "region", "product_key", "customer_id", "units", "discount", "revenue"]]
print(len(fact), "fact rows,", len(dim_product), "products,", len(dim_date), "dates")
` },
      { title: 'Query the model with SQL', detail: md`Load the tables into SQLite and compute revenue by region and year with a join — what the BI tool does behind the scenes.`, code: md`
import sqlite3
con = sqlite3.connect(":memory:")
fact.assign(date=fact["date"].dt.strftime("%Y-%m-%d")).to_sql("fact_sales", con, index=False)
dim_product.to_sql("dim_product", con, index=False)
q = """SELECT f.region, strftime('%Y', f.date) AS year, p.category, ROUND(SUM(f.revenue), 0) AS revenue
       FROM fact_sales f JOIN dim_product p ON p.product_key = f.product_key
       GROUP BY f.region, year, p.category ORDER BY f.region, year"""
by_region = pd.read_sql(q, con)
print(by_region.head(8))
` },
      { title: 'Prototype the dashboard layout', detail: md`KPI cards (2025 vs 2024), monthly trend, region YoY growth and category mix.`, code: md`
cur, prev = k.loc[2025], k.loc[2024]
fig = plt.figure(figsize=(12, 6))
g = fig.add_gridspec(2, 4, height_ratios=[0.6, 2])
for i, m in enumerate(["revenue", "orders", "aov", "units"]):
    ax = fig.add_subplot(g[0, i]); ax.axis("off")
    ch = (cur[m] - prev[m]) / prev[m] * 100
    ax.text(0.5, 0.6, f"{cur[m]:,.0f}", ha="center", fontsize=18, weight="bold")
    ax.text(0.5, 0.15, f"{m.upper()} {ch:+.1f}% YoY", ha="center", color="#059669" if ch >= 0 else "#dc2626")
ax1 = fig.add_subplot(g[1, :2])
sales.groupby(sales["order_date"].dt.to_period("M"))["revenue"].sum().plot(ax=ax1, marker="o", title="Monthly revenue")
ax2 = fig.add_subplot(g[1, 2:])
yoy = by_region.groupby(["region", "year"])["revenue"].sum().unstack().pct_change(axis=1).iloc[:, -1] * 100
yoy.sort_values().plot.barh(ax=ax2, color="#6366f1", title="Revenue growth by region, 2025 vs 2024 (%)")
plt.tight_layout(); plt.show()
` },
      { title: 'Export for Power BI / Tableau', detail: md`
Export the three tables to CSV (in Jupyter on your computer, or use the Download button in the Datasets tab for the raw file). In **Power BI**: Get Data → Text/CSV for each table → Model view: relate \`fact_sales.product_key\` → \`dim_product.product_key\` and \`fact_sales.date\` → \`dim_date.date\` → create measures:

\`Total Revenue = SUM(fact_sales[revenue])\`, \`Orders = DISTINCTCOUNT(fact_sales[order_id])\`, \`AOV = DIVIDE([Total Revenue], [Orders])\`, \`Revenue LY = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(dim_date[date]))\`, \`YoY % = DIVIDE([Total Revenue] - [Revenue LY], [Revenue LY])\`.

Build: 4 KPI cards, a line chart by month, a bar chart of YoY % by region, a matrix region × category, and slicers for year and category. In **Tableau**, connect the CSVs, relate the tables, and build the same sheets into a dashboard.`, code: md`
fact.to_csv("fact_sales.csv", index=False)
dim_product.to_csv("dim_product.csv", index=False)
dim_date.to_csv("dim_date.csv", index=False)
print("Exported:", ["fact_sales.csv", "dim_product.csv", "dim_date.csv"])
` },
      { title: 'User guide & review', detail: md`Write a half-page guide: KPI definitions, how to filter, refresh frequency. Ask a classmate to use the dashboard and note what confused them.` },
    ],
    expectedOutput: ['KPI definitions table', 'Star-schema CSV exports', 'Python prototype dashboard image', 'Power BI (.pbix) or Tableau Public dashboard + user guide'],
    evaluation: ['KPIs precisely defined and correct', 'Proper star schema with working relationships', 'Clear visual hierarchy, context (YoY) and filters', 'Usable by a non-technical manager (tested)'],
    reportTemplate: report('Retail Sales Dashboard', ['1. Purpose & audience', '2. KPI definitions (formula, filters, grain)', '3. Data model (tables & relationships)', '4. Dashboard walkthrough (screenshots)', '5. Key insights visible in the dashboard', '6. Refresh & maintenance', '7. Feedback from test users']),
    starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
sales.head()
`,
  },
  {
    id: 'pandemic-analysis',
    title: 'COVID-19-Style Pandemic Data Analysis',
    level: 'Intermediate',
    hours: 6,
    skills: ['Time series wrangling', 'Rolling averages', 'Per-capita rates', 'Data quality', 'Comparative analysis'],
    objectives: [
      'Clean daily reporting data (gaps, weekend effects)',
      'Compare countries fairly with per-capita rates and 7-day averages',
      'Identify waves, peaks and case fatality rates',
      'Communicate findings responsibly with caveats',
    ],
    businessProblem: md`
A public-health NGO asks: *How did the 2021 epidemic waves differ across five countries? Which country was hit hardest per capita, when did waves peak, and what was the case fatality rate?* (Data is synthetic, modelled on COVID-19 reporting patterns.)
`,
    dataset: {
      file: 'pandemic_cases.csv',
      description: 'Daily new cases and deaths for 5 fictional countries in 2021 (1,825 rows), with reporting gaps and weekend under-reporting.',
      columns: [['date', 'Report date'], ['country', 'Avalon, Borealia, Coastria, Dunmore, Equa'], ['population', 'Country population'], ['new_cases', 'New reported cases (some missing)'], ['new_deaths', 'New reported deaths']],
    },
    libraries: ['pandas', 'matplotlib'],
    steps: [
      { title: 'Load and check quality', detail: md`Missing values per country, date coverage, negative values.`, code: md`
import pandas as pd
import matplotlib.pyplot as plt

cv = pd.read_csv("data/pandemic_cases.csv", parse_dates=["date"])
print(cv.groupby("country")["new_cases"].apply(lambda s: s.isna().sum()).rename("missing_days"))
print("date range:", cv["date"].min().date(), "-", cv["date"].max().date(), "| negative values:", int((cv[["new_cases", "new_deaths"]] < 0).sum().sum()))
` },
      { title: 'Fill gaps per country', detail: md`Interpolate missing case counts within each country (document this choice).`, code: md`
cv = cv.sort_values(["country", "date"])
cv["new_cases"] = cv.groupby("country")["new_cases"].transform(lambda s: s.interpolate().bfill())
print("remaining missing:", int(cv["new_cases"].isna().sum()))
` },
      { title: 'Per-capita rates and 7-day averages', detail: md`Cases and deaths per 100k, smoothed with a 7-day rolling mean.`, code: md`
cv["cases_100k"] = cv["new_cases"] / cv["population"] * 1e5
cv["cases_100k_7d"] = cv.groupby("country")["cases_100k"].transform(lambda s: s.rolling(7).mean())
wide = cv.pivot(index="date", columns="country", values="cases_100k_7d")
wide.plot(figsize=(10, 3.8), title="7-day average new cases per 100k")
plt.ylabel("cases per 100k"); plt.show()
` },
      { title: 'Waves and peaks', detail: md`Peak date and height per country for the first half and second half of the year.`, code: md`
half = wide.index.month <= 6
peaks = pd.DataFrame({"wave1_peak": wide[half].idxmax().dt.date, "wave1_height": wide[half].max().round(1),
                      "wave2_peak": wide[~half].idxmax().dt.date, "wave2_height": wide[~half].max().round(1)})
print(peaks)
` },
      { title: 'Totals and case fatality rate', detail: md`Total cases and deaths per 100k and CFR = deaths / cases.`, code: md`
tot = cv.groupby("country").agg(cases=("new_cases", "sum"), deaths=("new_deaths", "sum"), pop=("population", "first"))
tot["cases_per_100k"] = tot["cases"] / tot["pop"] * 1e5
tot["deaths_per_100k"] = tot["deaths"] / tot["pop"] * 1e5
tot["cfr_%"] = tot["deaths"] / tot["cases"] * 100
print(tot.round(2).sort_values("cases_per_100k", ascending=False))
` },
      { title: 'Weekend reporting artefact', detail: md`Show average cases by weekday — evidence for using 7-day averages.`, code: md`
order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
print(cv.groupby(cv["date"].dt.day_name())["cases_100k"].mean().reindex(order).round(2))
` },
      { title: 'Responsible write-up', detail: md`Report findings with caveats: reported cases depend on testing; CFR is not the infection fatality rate; data is synthetic.` },
    ],
    expectedOutput: ['Data-quality summary and documented gap filling', 'Per-capita 7-day average chart', 'Peak table and totals/CFR table', 'Report with caveats'],
    evaluation: ['Gaps handled per country and documented', 'Fair comparisons (per capita, smoothed)', 'Correct peaks/CFR', 'Responsible interpretation with limitations'],
    reportTemplate: report('Pandemic Data Analysis (2021)', STD_REPORT),
    starter: md`
import pandas as pd
cv = pd.read_csv("data/pandemic_cases.csv", parse_dates=["date"])
cv.head()
`,
  },
  // ----------------------------------------------------------------- ADVANCED
  {
    id: 'house-price-prediction',
    title: 'House Price Prediction',
    level: 'Advanced',
    hours: 8,
    skills: ['Regression', 'Pipelines', 'Cross-validation', 'Model comparison', 'Interpretation'],
    objectives: [
      'Build leakage-free preprocessing pipelines',
      'Compare linear, regularised and tree-based regressors with cross-validation',
      'Tune the best model and evaluate once on a test set',
      'Explain predictions and quantify typical error in dollars',
    ],
    businessProblem: md`
The property platform from the EDA project now wants an automatic **price estimate** for new listings, accurate to within about 10% for most homes. Build, compare and explain a model, and report its expected error.
`,
    dataset: {
      file: 'houses.csv',
      description: '800 houses (see the EDA project). Target: price.',
      columns: [['features', 'neighborhood, area_sqft, bedrooms, bathrooms, age_years, garage_spaces, distance_to_center_km'], ['price', 'Target ($)']],
    },
    libraries: ['pandas', 'numpy', 'scikit-learn', 'matplotlib'],
    steps: [
      { title: 'Split data', detail: md`Hold out 20% as a test set. Separate numeric and categorical features.`, code: md`
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score, KFold, GridSearchCV
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error

h = pd.read_csv("data/houses.csv")
num = ["area_sqft", "bedrooms", "bathrooms", "age_years", "garage_spaces", "distance_to_center_km"]
cat = ["neighborhood"]
X_tr, X_te, y_tr, y_te = train_test_split(h[num + cat], h["price"], test_size=0.2, random_state=42)
prep = ColumnTransformer([("num", StandardScaler(), num), ("cat", OneHotEncoder(handle_unknown="ignore"), cat)])
` },
      { title: 'Compare models with cross-validation', detail: md`Linear, Ridge on log(price) and random forest; 5-fold CV MAE on the training set.`, code: md`
cv5 = KFold(5, shuffle=True, random_state=0)
candidates = {
    "linear": Pipeline([("prep", prep), ("m", LinearRegression())]),
    "ridge log-price": TransformedTargetRegressor(Pipeline([("prep", prep), ("m", Ridge(alpha=1.0))]), func=np.log, inverse_func=np.exp),
    "random forest": Pipeline([("prep", prep), ("m", RandomForestRegressor(n_estimators=200, random_state=0, n_jobs=1))]),
}
for name, model in candidates.items():
    mae = -cross_val_score(model, X_tr, y_tr, cv=cv5, scoring="neg_mean_absolute_error").mean()
    print(f"{name:16s} CV MAE = \${mae:,.0f}")
` },
      { title: 'Tune the best model', detail: md`Grid-search Ridge’s alpha (on log price).`, code: md`
ridge = TransformedTargetRegressor(Pipeline([("prep", prep), ("m", Ridge())]), func=np.log, inverse_func=np.exp)
grid = GridSearchCV(ridge, {"regressor__m__alpha": [0.01, 0.1, 1, 10, 100]}, cv=cv5, scoring="neg_mean_absolute_error").fit(X_tr, y_tr)
print("best alpha:", grid.best_params_, " CV MAE: $", round(-grid.best_score_))
` },
      { title: 'Final test evaluation', detail: md`Evaluate once on the test set: MAE, MAPE and share of homes within 10%.`, code: md`
best = grid.best_estimator_
pred = best.predict(X_te)
within10 = np.mean(np.abs(pred - y_te) / y_te <= 0.10)
print(f"TEST MAE = \${mean_absolute_error(y_te, pred):,.0f}  MAPE = {mean_absolute_percentage_error(y_te, pred):.1%}  within 10%: {within10:.0%}")
` },
      { title: 'Interpret the model', detail: md`Because the model predicts log(price), each coefficient is approximately a % effect: \`exp(coef) - 1\` per one standard deviation of a numeric feature.`, code: md`
reg = best.regressor_
names = reg.named_steps["prep"].get_feature_names_out()
effects = pd.Series((np.exp(reg.named_steps["m"].coef_) - 1) * 100, index=names).round(1).sort_values()
print("Approx. % change in price (numeric: per 1 SD; neighborhoods vs average):\n", effects)
` },
      { title: 'Error analysis', detail: md`Plot predicted vs actual and check where errors are largest (by neighborhood).`, code: md`
plt.scatter(y_te, pred, alpha=0.5, s=12); plt.plot([y_te.min(), y_te.max()], [y_te.min(), y_te.max()], color="red")
plt.xlabel("actual price"); plt.ylabel("predicted price"); plt.title("Predicted vs actual (test set)"); plt.show()
err = pd.DataFrame({"hood": X_te["neighborhood"], "ape": np.abs(pred - y_te) / y_te})
print(err.groupby("hood")["ape"].median().mul(100).round(1).rename("median % error"))
` },
      { title: 'Report', detail: md`State the chosen model and why, test MAE/MAPE, key drivers, where it is weak, and how you would monitor it in production.` },
    ],
    expectedOutput: ['CV comparison table of models', 'Tuned model with test MAE, MAPE and % within 10%', 'Interpretation of drivers', 'Predicted-vs-actual plot and error analysis'],
    evaluation: ['No leakage (pipelines, single test evaluation)', 'Fair model comparison with CV', 'Clear error metrics in business terms', 'Honest interpretation and limitations'],
    reportTemplate: report('House Price Prediction', ['1. Executive summary', '2. Problem & success metric', '3. Data & features', '4. Modelling approach (pipeline, CV, models compared)', '5. Results (CV + final test metrics)', '6. Interpretation (drivers)', '7. Error analysis & limitations', '8. Deployment & monitoring plan']),
    starter: md`
import pandas as pd
h = pd.read_csv("data/houses.csv")
h.head()
`,
  },
  {
    id: 'churn-prediction',
    title: 'Customer Churn Prediction',
    level: 'Advanced',
    hours: 8,
    skills: ['Classification', 'Imbalanced metrics', 'Threshold tuning', 'Feature engineering', 'Business impact'],
    objectives: [
      'Engineer features and build a churn classifier pipeline',
      'Compare logistic regression and gradient boosting with ROC-AUC',
      'Choose a decision threshold that maximises campaign profit',
      'Explain churn drivers and recommend actions',
    ],
    businessProblem: md`
The telecom wants to spend its retention budget wisely: each retention offer costs \$60 and saves a would-be churner 40% of the time; a lost customer costs about 12 months of charges. *Who should receive offers, and what profit can we expect?*
`,
    dataset: {
      file: 'churn.csv',
      description: '1,200 customers with contract, services, charges, support calls and churn outcome. Synthetic.',
      columns: [['tenure_months', 'Months as customer'], ['contract', 'Month-to-month / One year / Two year'], ['internet_service', 'DSL / Fiber / None'], ['tech_support', 'Yes/No'], ['monthly_charges, total_charges', 'Billing'], ['support_calls', 'Calls in the last period'], ['paperless_billing', 'Yes/No'], ['churn', 'Target: Yes/No']],
    },
    libraries: ['pandas', 'numpy', 'scikit-learn', 'matplotlib'],
    steps: [
      { title: 'Prepare data and features', detail: md`Create the target, an engineered feature (charges per tenure month), and a stratified split.`, code: md`
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import roc_auc_score, classification_report

df = pd.read_csv("data/churn.csv")
df["y"] = (df["churn"] == "Yes").astype(int)
df["new_customer"] = (df["tenure_months"] <= 6).astype(int)
num = ["tenure_months", "monthly_charges", "total_charges", "support_calls", "new_customer"]
cat = ["contract", "internet_service", "tech_support", "paperless_billing"]
X_tr, X_te, y_tr, y_te = train_test_split(df[num + cat], df["y"], test_size=0.25, stratify=df["y"], random_state=7)
print("churn rate train/test:", round(y_tr.mean(), 3), round(y_te.mean(), 3))
` },
      { title: 'Compare models (CV ROC-AUC)', detail: md`Logistic regression vs histogram gradient boosting.`, code: md`
prep = ColumnTransformer([("num", StandardScaler(), num), ("cat", OneHotEncoder(handle_unknown="ignore"), cat)])
models = {"logistic": Pipeline([("prep", prep), ("m", LogisticRegression(max_iter=2000))]),
          "boosting": Pipeline([("prep", prep), ("m", HistGradientBoostingClassifier(max_depth=3, learning_rate=0.05, random_state=0))])}
skf = StratifiedKFold(5, shuffle=True, random_state=0)
scores = {n: cross_val_score(m, X_tr, y_tr, cv=skf, scoring="roc_auc") for n, m in models.items()}
for n, s in scores.items():
    print(f"{n:9s} CV ROC-AUC {s.mean():.3f} ± {s.std():.3f}")
best_name = max(scores, key=lambda n: scores[n].mean())
model = models[best_name].fit(X_tr, y_tr)
proba = model.predict_proba(X_te)[:, 1]
print("chosen:", best_name, " TEST ROC-AUC:", round(roc_auc_score(y_te, proba), 3))
` },
      { title: 'Profit-based threshold', detail: md`Expected profit of targeting customers above each threshold, using the business assumptions.`, code: md`
OFFER, SAVE_RATE = 60, 0.40
value = X_te["monthly_charges"].values * 12
rows = []
for t in np.arange(0.1, 0.9, 0.05):
    target = proba >= t
    saved_value = (value * y_te.values * target).sum() * SAVE_RATE
    rows.append((round(t, 2), int(target.sum()), saved_value - target.sum() * OFFER))
profit = pd.DataFrame(rows, columns=["threshold", "customers_targeted", "expected_profit"])
best_t = profit.loc[profit["expected_profit"].idxmax()]
print(profit.round(0).to_string(index=False))
print("best threshold:", best_t["threshold"], " expected profit on test customers: $", round(best_t["expected_profit"]))
` },
      { title: 'Metrics at the chosen threshold', detail: md`Precision/recall at the profit-optimal threshold.`, code: md`
chosen = (proba >= best_t["threshold"]).astype(int)
print(classification_report(y_te, chosen, target_names=["stay", "churn"], digits=3))
` },
      { title: 'Explain the drivers', detail: md`Fit the logistic pipeline on training data and show odds ratios — interpretable even if boosting was chosen.`, code: md`
logit = models["logistic"].fit(X_tr, y_tr)
names = logit.named_steps["prep"].get_feature_names_out()
odds = pd.Series(np.exp(logit.named_steps["m"].coef_[0]), index=names).round(2).sort_values()
odds.plot.barh(figsize=(7, 4), color=["#10b981" if v < 1 else "#ef4444" for v in odds])
plt.axvline(1, color="black"); plt.title("Churn odds ratios (>1 raises churn)"); plt.show()
` },
      { title: 'Recommendations', detail: md`Who to target, expected profit, the top 3 drivers with actions (e.g. annual-plan incentives, proactive support after 3 calls), and an A/B test plan to verify the 40% save rate.` },
    ],
    expectedOutput: ['CV comparison and test ROC-AUC', 'Profit vs threshold table with the optimal threshold', 'Classification report at that threshold', 'Odds-ratio chart and recommendations'],
    evaluation: ['Leakage-free pipeline and stratified CV', 'Metric choice justified (ROC-AUC, profit, not accuracy)', 'Threshold chosen from business costs', 'Interpretable drivers and actionable plan with an A/B test'],
    reportTemplate: report('Customer Churn Prediction', ['1. Executive summary (who to target, expected profit)', '2. Problem, costs and assumptions', '3. Data & features', '4. Models and validation', '5. Threshold & profit analysis', '6. Churn drivers', '7. Recommendations & A/B test plan', '8. Limitations & monitoring']),
    starter: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
df.head()
`,
  },
  {
    id: 'stock-time-series',
    title: 'Stock Price Time Series Analysis',
    level: 'Advanced',
    hours: 6,
    skills: ['Time series', 'Returns & volatility', 'Rolling statistics', 'Backtesting', 'Forecast evaluation'],
    objectives: [
      'Compute returns, volatility, drawdowns and moving averages',
      'Test whether past returns predict future returns',
      'Backtest a simple moving-average rule against buy-and-hold',
      'Communicate results with appropriate scepticism',
    ],
    businessProblem: md`
An investment club asks whether a popular rule — *buy when the 50-day moving average is above the 200-day average* — would have beaten simply holding the stock over three years, and how risky the stock is. (Prices are simulated; this is an analysis exercise, not investment advice.)
`,
    dataset: {
      file: 'stock_prices.csv',
      description: '783 trading days (2023–2025) of simulated closing prices and volume for a fictional stock (geometric Brownian motion).',
      columns: [['date', 'Trading day'], ['close', 'Closing price'], ['volume', 'Shares traded']],
    },
    libraries: ['pandas', 'numpy', 'matplotlib'],
    steps: [
      { title: 'Load and compute returns', detail: md`Daily returns, cumulative return and annualised volatility.`, code: md`
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

px = pd.read_csv("data/stock_prices.csv", parse_dates=["date"]).set_index("date")["close"]
ret = px.pct_change().dropna()
print(f"total return: {px.iloc[-1] / px.iloc[0] - 1:.1%}")
print(f"annualised return: {(1 + ret.mean()) ** 252 - 1:.1%}, annualised volatility: {ret.std() * np.sqrt(252):.1%}")
` },
      { title: 'Moving averages and volatility', detail: md`Plot price with 50/200-day MAs and the 30-day rolling volatility.`, code: md`
ma50, ma200 = px.rolling(50).mean(), px.rolling(200).mean()
vol30 = ret.rolling(30).std() * np.sqrt(252)
fig, ax = plt.subplots(2, 1, figsize=(10, 5.5), sharex=True)
ax[0].plot(px, label="close"); ax[0].plot(ma50, label="50-day MA"); ax[0].plot(ma200, label="200-day MA"); ax[0].legend()
ax[1].plot(vol30, color="#ef4444"); ax[1].set_title("30-day annualised volatility")
plt.tight_layout(); plt.show()
` },
      { title: 'Drawdowns', detail: md`Maximum drawdown: the largest peak-to-trough fall.`, code: md`
drawdown = px / px.cummax() - 1
print(f"max drawdown: {drawdown.min():.1%} on {drawdown.idxmin().date()}")
` },
      { title: 'Do past returns predict future returns?', detail: md`Autocorrelation of daily returns at lags 1–5.`, code: md`
print({lag: round(ret.autocorr(lag), 3) for lag in range(1, 6)})
print("Values near 0 → yesterday's return tells you almost nothing about today's (random-walk behaviour).")
` },
      { title: 'Backtest the moving-average rule', detail: md`Hold the stock only when MA50 > MA200 (signal from the **previous** day to avoid look-ahead).`, code: md`
signal = (ma50 > ma200).shift(1).reindex(ret.index).fillna(False).astype(float)
strategy = ret * signal
valid = ma200.reindex(ret.index).notna()
growth = pd.DataFrame({"buy & hold": (1 + ret[valid]).cumprod(), "MA rule": (1 + strategy[valid]).cumprod()})
growth.plot(figsize=(9, 3.5), title="Growth of $1 (after 200-day warm-up)"); plt.show()
print(growth.iloc[-1].round(3), "\ntime invested:", f"{signal[valid].mean():.0%}")
` },
      { title: 'Naive forecast evaluation', detail: md`Compare forecasting tomorrow’s price with today’s price vs a 5-day average.`, code: md`
test = px.iloc[-120:]
naive = px.shift(1).iloc[-120:]
ma5 = px.rolling(5).mean().shift(1).iloc[-120:]
print("MAE naive:", round((test - naive).abs().mean(), 3), " MAE 5-day MA:", round((test - ma5).abs().mean(), 3))
` },
      { title: 'Conclusions', detail: md`Report risk metrics, the backtest result (and why one backtest proves little), and the forecasting finding. Note transaction costs, simulated data and survivorship bias.` },
    ],
    expectedOutput: ['Return, volatility and drawdown statistics', 'Price/MA and volatility charts', 'Autocorrelation results', 'Backtest chart and naive-forecast comparison'],
    evaluation: ['Correct return/volatility calculations', 'No look-ahead bias in the backtest', 'Forecasts compared with naive baselines', 'Sceptical, well-caveated conclusions'],
    reportTemplate: report('Stock Price Time Series Analysis', STD_REPORT),
    starter: md`
import pandas as pd
px = pd.read_csv("data/stock_prices.csv", parse_dates=["date"])
px.head()
`,
  },
  {
    id: 'end-to-end-forecasting',
    title: 'End-to-End ML Project: Weekly Demand Forecasting',
    level: 'Advanced',
    hours: 10,
    skills: ['Problem framing', 'Feature pipelines', 'Time-based validation', 'Model selection', 'Packaging & model card'],
    objectives: [
      'Frame a forecasting problem with a success metric and baseline',
      'Build features with no look-ahead leakage and validate with time-based splits',
      'Select, train and package a model behind a reusable function',
      'Document the model in a model card and plan monitoring',
    ],
    businessProblem: md`
The retail chain orders stock weekly. Over-ordering ties up cash; under-ordering loses sales. Build an end-to-end system that forecasts **next week’s revenue per product category**, beats the current practice (“same as last week”) by at least 15% MAE, and can be re-run every Monday.
`,
    dataset: {
      file: 'sales.csv',
      description: 'Retail orders 2024–2025, aggregated to weekly revenue per category (3 categories × ~105 weeks).',
      columns: [['order_date', 'Order date (aggregated to weeks)'], ['category', 'Forecast series'], ['revenue', 'Target (weekly sum)']],
    },
    libraries: ['pandas', 'numpy', 'scikit-learn', 'matplotlib', 'joblib (on your computer)'],
    steps: [
      { title: 'Frame the problem', detail: md`Target: next week’s revenue per category. Metric: MAE. Baseline: last week’s value (current practice). Validation: rolling-origin over the last 26 weeks.`, code: md`
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
weekly = (sales.groupby(["category", pd.Grouper(key="order_date", freq="W")])["revenue"].sum()
          .unstack(0).fillna(0))
print(weekly.shape); print(weekly.tail(3).round(0))
` },
      { title: 'Feature engineering (leak-free)', detail: md`For each category: lags 1, 2, 4, 52 weeks, a 4-week rolling mean of past values, week of year, and the category as one-hot.`, code: md`
def make_features(wide):
    frames = []
    for cat in wide.columns:
        s = wide[cat]
        f = pd.DataFrame({"y": s, "lag1": s.shift(1), "lag2": s.shift(2), "lag4": s.shift(4),
                          "lag52": s.shift(52), "roll4": s.shift(1).rolling(4).mean()})
        f["week"] = f.index.isocalendar().week.astype(int)
        f["q4"] = (f.index.month >= 10).astype(int)
        f["category"] = cat
        frames.append(f)
    out = pd.concat(frames)
    out = pd.get_dummies(out, columns=["category"], dtype=int)
    return out

feat = make_features(weekly)
feat_model = feat.drop(columns="lag52").dropna()
print(feat_model.shape, list(feat_model.columns))
` },
      { title: 'Rolling-origin validation', detail: md`For each of the last 26 weeks: train on all earlier weeks, predict that week, compare models with the naive baseline.`, code: md`
X_cols = [c for c in feat_model.columns if c != "y"]
weeks = sorted(feat_model.index.unique())[-26:]
results = {"naive (last week)": [], "ridge": [], "random forest": []}
for w in weeks:
    train, test = feat_model[feat_model.index < w], feat_model[feat_model.index == w]
    results["naive (last week)"].append(np.abs(test["y"] - test["lag1"]).mean())
    results["ridge"].append(np.abs(test["y"] - Ridge(alpha=1.0).fit(train[X_cols], train["y"]).predict(test[X_cols])).mean())
    rf = RandomForestRegressor(n_estimators=150, min_samples_leaf=3, random_state=0, n_jobs=1).fit(train[X_cols], train["y"])
    results["random forest"].append(np.abs(test["y"] - rf.predict(test[X_cols])).mean())
mae = pd.Series({k: np.mean(v) for k, v in results.items()}).round(1)
print(mae)
print("improvement vs naive:", ((1 - mae / mae["naive (last week)"]) * 100).round(1).to_dict())
` },
      { title: 'Select and train the final model', detail: md`Pick the model with the lowest rolling MAE and retrain on all data.`, code: md`
best_name = mae.drop("naive (last week)").idxmin()
final = (Ridge(alpha=1.0) if best_name == "ridge" else
         RandomForestRegressor(n_estimators=150, min_samples_leaf=3, random_state=0, n_jobs=1)).fit(feat_model[X_cols], feat_model["y"])
print("final model:", best_name)
` },
      { title: 'Package a forecast function', detail: md`A function that takes raw sales and returns next week’s forecast per category — what the Monday job would call.`, code: md`
def forecast_next_week(raw_sales, model, x_cols):
    wide = (raw_sales.groupby(["category", pd.Grouper(key="order_date", freq="W")])["revenue"].sum().unstack(0).fillna(0))
    next_week = wide.index.max() + pd.Timedelta(weeks=1)
    extended = pd.concat([wide, pd.DataFrame(index=[next_week], columns=wide.columns, dtype=float)])
    f = make_features(extended).drop(columns="lag52")
    rows = f[f.index == next_week]
    preds = model.predict(rows[x_cols].fillna(0))
    cats = [c.replace("category_", "") for c in rows.filter(like="category_").idxmax(axis=1)]
    return pd.Series(preds.round(0), index=cats, name=str(next_week.date()))

print(forecast_next_week(sales, final, X_cols))
` },
      { title: 'Model card & monitoring', detail: md`
Write a model card: purpose, data and period, features, validation method and results vs baseline, known weaknesses (holiday weeks, new products), retraining schedule (monthly), monitoring (weekly MAE vs naive; alert if worse for 3 weeks), owner. On your computer, save the model with \`joblib.dump(final, "model.joblib")\` and schedule the script.` },
    ],
    expectedOutput: ['Weekly series per category', 'Leak-free feature table', 'Rolling-origin MAE comparison vs naive baseline', 'Reusable forecast function and a model card'],
    evaluation: ['Problem framed with metric, baseline and validation design', 'No look-ahead leakage', 'Beats the naive baseline (or honestly reports it does not)', 'Reusable code and complete model card'],
    reportTemplate: report('Weekly Demand Forecasting — Model Card & Report', ['1. Purpose & users', '2. Data (period, aggregation)', '3. Features (and leakage checks)', '4. Validation design', '5. Results vs baseline', '6. Final model & forecast function', '7. Limitations & ethical considerations', '8. Monitoring, retraining & ownership']),
    starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
weekly = sales.groupby(["category", pd.Grouper(key="order_date", freq="W")])["revenue"].sum().unstack(0)
weekly.tail()
`,
  },
];
