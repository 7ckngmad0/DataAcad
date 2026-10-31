// Advanced, realistic exercises and scenario-based quiz questions added after the curriculum audit.
// They are appended to existing lessons (see index.ts), so each lesson ends with a harder challenge
// and quiz questions that test judgement rather than recall.
import type { Exercise, QuizQuestion } from '../types.ts';
import { md } from './md.ts';

export const ADVANCED_PRACTICE: Record<string, { exercises?: Exercise[]; quiz?: QuizQuestion[] }> = {
  'stats-hypothesis-testing': {
    exercises: [
      {
        id: 'adv-ht-ex1', title: 'Does paperless billing relate to churn?', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
Using \`data/churn.csv\`, test whether **churn** is independent of **paperless_billing** with a chi-square test of independence.
1. Build the contingency table with \`pd.crosstab(df["paperless_billing"], df["churn"])\` and store it in \`table\`.
2. Run \`scipy.stats.chi2_contingency(table)\` and store the statistic in \`chi2\` and the p-value in \`p\`.
3. Store the churn rate (as a fraction) for paperless "Yes" customers in \`rate_yes\` and for "No" in \`rate_no\`.
`,
        starter: md`
import pandas as pd
from scipy import stats
df = pd.read_csv("data/churn.csv")
table = None
chi2, p = 0, 1
rate_yes = rate_no = 0
`,
        solution: md`
import pandas as pd
from scipy import stats
df = pd.read_csv("data/churn.csv")
table = pd.crosstab(df["paperless_billing"], df["churn"])
chi2, p, dof, expected = stats.chi2_contingency(table)
rates = (df["churn"] == "Yes").groupby(df["paperless_billing"]).mean()
rate_yes, rate_no = rates["Yes"], rates["No"]
print(table, f"chi2 = {chi2:.2f}, p = {p:.4f}", f"churn rate: paperless {rate_yes:.1%} vs not {rate_no:.1%}", sep="\n")
`,
        tests: md`
import pandas as _pd
from scipy import stats as _st
_d = _pd.read_csv("data/churn.csv")
_t = _pd.crosstab(_d["paperless_billing"], _d["churn"])
_c, _p, *_ = _st.chi2_contingency(_t)
assert table is not None and table.shape == (2, 2), "table should be the 2×2 contingency table"
assert abs(chi2 - _c) < 1e-6 and abs(p - _p) < 1e-9, f"Expected chi2 = {_c:.3f}, p = {_p:.3g}"
_r = (_d["churn"] == "Yes").groupby(_d["paperless_billing"]).mean()
assert abs(rate_yes - _r["Yes"]) < 1e-9 and abs(rate_no - _r["No"]) < 1e-9, "Churn rates by paperless group are wrong"
`,
        hints: ['`stats.chi2_contingency` returns four values: statistic, p-value, degrees of freedom, expected counts.', 'A churn rate is the mean of a True/False column: `(df["churn"] == "Yes")`, grouped by paperless_billing.'],
      },
    ],
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'An analyst checks an A/B test every morning and stops the day p first drops below 0.05. What is wrong?', options: ['Nothing; stopping early saves money', 'Repeated peeking inflates the false-positive rate far above 5%', 'p-values cannot be computed daily', 'They should use a one-sided test'], answer: 1, explanation: 'Each look is another chance for noise to cross the threshold. Fix the sample size in advance or use sequential methods designed for peeking.' },
      { id: 'adv-q2', kind: 'mcq', difficulty: 'advanced', prompt: 'A test of 20 different website colours finds one with p = 0.04. The most reasonable reaction is…', options: ['Ship that colour', 'Be sceptical: with 20 tests, about one "significant" result is expected by chance alone; correct for multiple comparisons and re-test', 'Lower α to 0.04', 'Report it as proof'], answer: 1, explanation: '20 × 0.05 = 1 expected false positive. Use a correction such as Bonferroni, then confirm with a new experiment.' },
    ],
  },
  'stats-correlation': {
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'Overall, a hospital with more doctors per patient has *higher* death rates. Within each severity level (mild, severe), more doctors means *lower* death rates. What explains this?', options: ['The data is wrong', 'Simpson’s paradox: severe cases are concentrated where there are more doctors, which confounds the overall correlation', 'Doctors cause deaths', 'Correlation is always misleading'], answer: 1, explanation: 'A lurking variable (case severity) reverses the trend when groups are combined. Always check relationships within relevant subgroups.' },
      { id: 'adv-q2', kind: 'mcq', difficulty: 'advanced', prompt: 'Pearson r between hours of sleep and test score is 0.02, yet a scatter plot shows a clear ∩-shaped pattern. Correct conclusion?', options: ['Sleep has no relationship with scores', 'There is a strong non-linear relationship that Pearson’s r, which measures only linear association, misses', 'The plot is wrong', 'Use more decimal places'], answer: 1, explanation: 'Always plot the data: r ≈ 0 means no *linear* relationship, not no relationship.' },
    ],
  },
  'np-operations': {
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: '`X` has shape (1000, 3) and `means = X.mean(axis=0)`. What does `X - means` do?', options: ['Raises a shape error', 'Subtracts each column’s mean from every row, via broadcasting (3,) across 1000 rows', 'Subtracts the overall mean', 'Subtracts row means'], answer: 1, explanation: 'axis=0 averages down the rows, giving one mean per column, shape (3,), which broadcasts across the rows. This is how centring and scaling work.' },
    ],
  },
  'pd-missing-duplicates': {
    exercises: [
      {
        id: 'adv-clean-ex1', title: 'Clean the whole messy customer file', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
\`data/messy_customers.csv\` has every classic problem. Produce a DataFrame \`clean\` where:
1. Exact duplicate rows are removed.
2. \`city\` is stripped and title-cased, and \`"Davao"\` is unified with \`"Davao City"\` (so only Manila, Cebu and Davao City remain).
3. \`age\` is numeric; non-numbers (like "thirty") and impossible ages (above 110) become \`NaN\`.
4. \`monthly_spend\` is a float (watch out for "1,450.00").

Don’t drop rows with missing values: a later step decides how to handle them.
`,
        starter: md`
import pandas as pd
df = pd.read_csv("data/messy_customers.csv")
clean = df.copy()
`,
        solution: md`
import pandas as pd
df = pd.read_csv("data/messy_customers.csv")
clean = df.drop_duplicates().copy()
clean["city"] = clean["city"].str.strip().str.title().replace({"Davao": "Davao City"})
clean["age"] = pd.to_numeric(clean["age"], errors="coerce")
clean.loc[clean["age"] > 110, "age"] = float("nan")
clean["monthly_spend"] = pd.to_numeric(clean["monthly_spend"].astype(str).str.replace(",", "", regex=False), errors="coerce")
print(clean.dtypes, clean["city"].value_counts(), clean.isna().sum(), sep="\n\n")
`,
        tests: md`
assert len(clean) == 60, f"Expected 60 rows after removing 3 duplicates, got {len(clean)}"
assert set(clean["city"]) == {"Manila", "Cebu", "Davao City"}, f"Cities: {sorted(set(clean['city']))}"
assert str(clean["age"].dtype).startswith("float") or str(clean["age"].dtype).startswith("Float"), f"age dtype is {clean['age'].dtype}"
assert clean["age"].max() <= 110, f"An impossible age is still present: {clean['age'].max()}"
assert clean["age"].isna().sum() == 5, f"Expected 5 missing ages (3 blank + 'thirty' + 230), got {clean['age'].isna().sum()}"
assert str(clean["monthly_spend"].dtype).startswith("float"), f"monthly_spend dtype is {clean['monthly_spend'].dtype}"
assert (clean["monthly_spend"] == 1450.0).any(), '"1,450.00" should become 1450.0'
`,
        hints: ['Order matters: drop duplicates first, while rows are still identical.', '`pd.to_numeric(..., errors="coerce")` turns unparseable values into NaN.', 'Remove the thousands separator before converting spend: `.str.replace(",", "")`.', 'Use `.replace({"Davao": "Davao City"})` after title-casing.'],
      },
    ],
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'In a survey, high earners skip the income question far more often than others. You fill missing incomes with the mean. What happens?', options: ['Nothing, since the mean is unbiased', 'The filled data under-states incomes and shrinks their variance, because the data is not missing at random', 'Accuracy improves', 'The mean changes to the median'], answer: 1, explanation: 'When missingness depends on the value itself, simple imputation biases results. Investigate why data is missing, and consider a missing-indicator column or model-based imputation.' },
    ],
  },
  'pd-groupby': {
    exercises: [
      {
        id: 'adv-gb-ex1', title: 'Best category in every region', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
Using \`data/sales.csv\`, build a DataFrame \`top\` with **one row per region** containing the **category with the highest total revenue** in that region. Columns: \`region\`, \`category\`, \`revenue\` (the total, rounded to 2 decimals). Sort by \`revenue\` descending. Also store each region’s **share** of that category in its own revenue as \`top["share"]\` (a fraction between 0 and 1, rounded to 3 decimals).
`,
        starter: md`
import pandas as pd
df = pd.read_csv("data/sales.csv")
top = df.groupby("region")["revenue"].sum().reset_index()
`,
        solution: md`
import pandas as pd
df = pd.read_csv("data/sales.csv")
by = df.groupby(["region", "category"], as_index=False)["revenue"].sum()
by["share"] = by["revenue"] / by.groupby("region")["revenue"].transform("sum")
top = by.loc[by.groupby("region")["revenue"].idxmax()].sort_values("revenue", ascending=False).reset_index(drop=True)
top["revenue"] = top["revenue"].round(2)
top["share"] = top["share"].round(3)
top
`,
        tests: md`
import pandas as _pd
_d = _pd.read_csv("data/sales.csv")
_b = _d.groupby(["region", "category"])["revenue"].sum()
_tot = _d.groupby("region")["revenue"].sum()
assert list(top.columns[:3]) == ["region", "category", "revenue"], f"Columns should start with region, category, revenue: {list(top.columns)}"
assert len(top) == _d["region"].nunique(), "One row per region"
for _, r in top.iterrows():
    _best = _b.loc[r["region"]].idxmax()
    assert r["category"] == _best, f"{r['region']}: best category is {_best}, not {r['category']}"
    assert abs(r["revenue"] - round(_b.loc[(r["region"], _best)], 2)) < 0.01, f"Wrong revenue for {r['region']}"
    assert abs(r["share"] - round(_b.loc[(r["region"], _best)] / _tot[r["region"]], 3)) < 0.0015, f"Wrong share for {r['region']}"
assert top["revenue"].is_monotonic_decreasing, "Sort by revenue, highest first"
`,
        hints: ['First total revenue per (region, category).', '`groupby("region")["revenue"].idxmax()` gives the row label of each region’s maximum, so use it with `.loc`.', 'The share needs the region total next to every row: `groupby("region")["revenue"].transform("sum")`.'],
      },
    ],
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'You need each order’s revenue as a percentage of *its own region’s* total, as a new column on the original 1,500-row DataFrame. Which is right?', options: ['df.groupby("region")["revenue"].sum()', 'df["revenue"] / df.groupby("region")["revenue"].transform("sum")', 'df.groupby("region").agg("mean")', 'df.pivot_table(index="region")'], answer: 1, explanation: '`transform` returns a result aligned to the original rows (1,500 values); `agg`/`sum` collapse to one row per group.' },
    ],
  },
  'pd-merge-transform': {
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'After `orders.merge(customers, on="customer_id")`, 10,000 orders became 10,350 rows. What most likely happened?', options: ['Rows were duplicated by pandas randomly', 'Some customer_ids appear more than once in customers, so matching orders were multiplied', 'An outer join was used', 'The merge dropped NaNs'], answer: 1, explanation: 'Duplicate keys on the "one" side multiply rows. Use `validate="many_to_one"` to catch this, and deduplicate the lookup table.' },
    ],
  },
  'eda-outliers-transform': {
    exercises: [
      {
        id: 'adv-out-ex1', title: 'Outliers within each category', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
A \$500 order is normal for Furniture but extreme for Office Supplies, so outliers should be judged **within each category**. Using \`data/sales.csv\`, flag an order as an outlier if its \`revenue\` is above **Q3 + 1.5 × IQR of its own category**. Store a boolean column \`df["outlier"]\` and a Series \`outliers_by_cat\` with the **number** of outliers per category.
`,
        starter: md`
import pandas as pd
df = pd.read_csv("data/sales.csv")
q1, q3 = df["revenue"].quantile([0.25, 0.75])
df["outlier"] = df["revenue"] > q3 + 1.5 * (q3 - q1)
outliers_by_cat = df.groupby("category")["outlier"].sum()
`,
        solution: md`
import pandas as pd
df = pd.read_csv("data/sales.csv")
g = df.groupby("category")["revenue"]
q1 = g.transform(lambda s: s.quantile(0.25))
q3 = g.transform(lambda s: s.quantile(0.75))
df["outlier"] = df["revenue"] > q3 + 1.5 * (q3 - q1)
outliers_by_cat = df.groupby("category")["outlier"].sum()
print(outliers_by_cat)
`,
        tests: md`
import pandas as _pd
_d = _pd.read_csv("data/sales.csv")
_g = _d.groupby("category")["revenue"]
_q1, _q3 = _g.transform(lambda s: s.quantile(0.25)), _g.transform(lambda s: s.quantile(0.75))
_exp = (_d["revenue"] > _q3 + 1.5 * (_q3 - _q1))
assert "outlier" in df and (df["outlier"].astype(bool).values == _exp.values).all(), "df['outlier'] should use each category's own Q1/Q3"
_bc = _exp.groupby(_d["category"]).sum()
assert dict(outliers_by_cat.astype(int)) == dict(_bc.astype(int)), f"Expected {dict(_bc)}"
`,
        hints: ['`groupby("category")["revenue"].transform(lambda s: s.quantile(0.75))` gives every row its own category’s Q3.', 'Then compare row by row, exactly like the global version.'],
      },
    ],
  },
  'eda-feature-engineering': {
    exercises: [
      {
        id: 'adv-fe-ex1', title: 'Date features and the weekend effect', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
From \`data/sales.csv\`:
1. Parse \`order_date\` as a datetime.
2. Add \`month\` (1–12), \`weekday\` (0 = Monday … 6 = Sunday) and a boolean \`is_weekend\`.
3. Add \`has_discount\` (discount above 0).
4. Store \`weekend_lift\` = mean revenue of weekend orders ÷ mean revenue of weekday orders, rounded to 3 decimals.
`,
        starter: md`
import pandas as pd
df = pd.read_csv("data/sales.csv")
weekend_lift = 1.0
`,
        solution: md`
import pandas as pd
df = pd.read_csv("data/sales.csv")
df["order_date"] = pd.to_datetime(df["order_date"])
df["month"] = df["order_date"].dt.month
df["weekday"] = df["order_date"].dt.weekday
df["is_weekend"] = df["weekday"] >= 5
df["has_discount"] = df["discount"] > 0
means = df.groupby("is_weekend")["revenue"].mean()
weekend_lift = round(means[True] / means[False], 3)
print(df[["order_date", "month", "weekday", "is_weekend", "has_discount"]].head(), weekend_lift)
`,
        tests: md`
import pandas as _pd
assert _pd.api.types.is_datetime64_any_dtype(df["order_date"]), "order_date must be parsed as a datetime"
for _c in ["month", "weekday", "is_weekend", "has_discount"]:
    assert _c in df.columns, f"Missing column {_c}"
assert df["weekday"].between(0, 6).all() and df["month"].between(1, 12).all(), "weekday must be 0-6 and month 1-12"
assert (df["is_weekend"] == (df["order_date"].dt.weekday >= 5)).all(), "is_weekend should be True for Saturday and Sunday"
_m = df.groupby(df["order_date"].dt.weekday >= 5)["revenue"].mean()
assert weekend_lift == round(_m[True] / _m[False], 3), f"weekend_lift should be {round(_m[True] / _m[False], 3)}"
`,
        hints: ['`pd.to_datetime` then the `.dt` accessor: `.dt.month`, `.dt.weekday`.', 'Saturday and Sunday are weekday 5 and 6.', 'Group revenue by `is_weekend` and divide the two means.'],
      },
    ],
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'To predict whether a customer will churn next month, a teammate adds the feature "number of retention calls received". The model becomes 98% accurate. What is the problem?', options: ['No problem, it is a great feature', 'Target leakage: retention calls are made *because* a customer is already about to churn, so the feature won’t be known in advance', 'Too few features', 'The feature must be scaled'], answer: 1, explanation: 'A feature that is only available as a consequence of the outcome leaks the answer. Ask: "Would I know this value at prediction time?"' },
    ],
  },
  'viz-choosing-honest': {
    exercises: [
      {
        id: 'adv-viz-ex1', title: 'A presentation-ready trend chart', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
Make a chart a manager could read in five seconds. Using \`data/sales.csv\`:
1. Compute **monthly total revenue** (\`order_date\` → month) and store it in a Series \`monthly\`.
2. Plot it as a **line chart** on \`fig, ax = plt.subplots()\`.
3. Add a dashed horizontal line at the **average** monthly revenue.
4. Give the chart a title containing the word **"Revenue"**, and label both axes.
5. Start the y-axis at **0** (an honest baseline).
`,
        starter: md`
import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv("data/sales.csv")
fig, ax = plt.subplots()
ax.plot(df["revenue"])
`,
        solution: md`
import pandas as pd
import matplotlib.pyplot as plt
df = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
monthly = df.groupby(df["order_date"].dt.to_period("M"))["revenue"].sum()
fig, ax = plt.subplots(figsize=(9, 4))
ax.plot(monthly.index.to_timestamp(), monthly.values, marker="o", label="Monthly revenue")
ax.axhline(monthly.mean(), linestyle="--", color="gray", label=f"Average ({monthly.mean():,.0f})")
ax.set_title("Monthly Revenue, 2024–2025")
ax.set_xlabel("Month")
ax.set_ylabel("Revenue")
ax.set_ylim(bottom=0)
ax.legend()
plt.show()
`,
        tests: md`
import pandas as _pd
_d = _pd.read_csv("data/sales.csv", parse_dates=["order_date"])
_m = _d.groupby(_d["order_date"].dt.to_period("M"))["revenue"].sum()
assert len(monthly) == len(_m) and abs(float(monthly.sum()) - float(_m.sum())) < 0.01, f"monthly should have {len(_m)} monthly totals"
_ax = plt.gcf().axes[0]
assert len(_ax.lines) >= 2, "Expected the revenue line plus a dashed average line"
assert any(l.get_linestyle() in ("--", "dashed") for l in _ax.lines), "The average line should be dashed"
assert "revenue" in _ax.get_title().lower(), "The title should mention Revenue"
assert _ax.get_xlabel() and _ax.get_ylabel(), "Label both axes"
assert abs(_ax.get_ylim()[0]) < 1e-9, "Start the y-axis at 0"
`,
        hints: ['Monthly totals: `df.groupby(df["order_date"].dt.to_period("M"))["revenue"].sum()` (parse the dates first).', '`ax.axhline(value, linestyle="--")` draws a dashed horizontal line.', '`ax.set_ylim(bottom=0)` fixes the baseline.'],
      },
    ],
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'Revenue and website visits are plotted with two different y-axes, and the two lines cross dramatically. Why is this risky?', options: ['Dual axes are slow to render', 'The crossing point depends entirely on how each axis is scaled, so readers may infer a relationship that is an artefact of the chart', 'Line charts cannot show two series', 'It violates colour rules'], answer: 1, explanation: 'Dual-axis charts let the designer create any visual relationship. Prefer two aligned panels or index both series to 100.' },
      { id: 'adv-q2', kind: 'mcq', difficulty: 'advanced', prompt: 'Company revenues range from $10k to $5B and you want to compare growth rates. Which axis choice helps most?', options: ['A linear axis starting at 0', 'A logarithmic axis, where equal percentage changes look equally steep', 'A pie chart', 'Truncating the axis'], answer: 1, explanation: 'On a log scale, multiplicative (percentage) changes are equal distances, so small and large companies are comparable. Always label it as log.' },
    ],
  },
  'sql-window-functions': {
    exercises: [
      {
        id: 'adv-sql-ex1', title: 'Month-over-month revenue growth', type: 'write', lang: 'sql', db: 'shop', difficulty: 'advanced',
        prompt: md`
For **delivered** orders, return one row per month with \`month\` (format \`YYYY-MM\`), \`revenue\` (sum of quantity × unit_price, rounded to 2 decimals) and \`growth_pct\`: the percentage change from the previous month, rounded to 1 decimal (NULL for the first month). Order by month.
`,
        starter: md`SELECT substr(order_date, 1, 7) AS month, COUNT(*) FROM orders GROUP BY month;`,
        solution: md`
WITH monthly AS (
  SELECT substr(o.order_date, 1, 7) AS month,
         SUM(oi.quantity * oi.unit_price) AS revenue
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.order_id
  WHERE o.status = 'delivered'
  GROUP BY month
)
SELECT month,
       ROUND(revenue, 2) AS revenue,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
FROM monthly
ORDER BY month;
`,
        hints: ['Compute monthly revenue in a CTE first.', '`LAG(revenue) OVER (ORDER BY month)` gives the previous month’s value.', 'Growth % = 100 × (this − previous) / previous. Use 100.0 to avoid integer division.'],
      },
    ],
  },
  'sql-joins': {
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: '`SELECT d.name, e.name FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id WHERE e.salary > 50000;` no longer shows departments without employees. Why?', options: ['LEFT JOIN is broken in SQLite', 'The WHERE filter on e.salary removes rows where e is NULL, turning the LEFT JOIN into an inner join; move the condition into the ON clause', 'You need RIGHT JOIN', 'salary is text'], answer: 1, explanation: 'Conditions on the right-hand table belong in ON when you want to keep unmatched left rows.' },
    ],
  },
  'ml-linear-regression': {
    exercises: [
      {
        id: 'adv-lr-ex1', title: 'Predict house prices and interpret the model', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
Using \`data/houses.csv\`, predict \`price\` from \`area_sqft\`, \`bedrooms\`, \`age_years\` and \`distance_to_center_km\`.
1. Split with \`train_test_split(X, y, test_size=0.2, random_state=42)\`.
2. Fit \`LinearRegression\` on the training set.
3. Store the **test** R² in \`r2_test\`, the **test** MAE in \`mae_test\`, and the coefficient for \`area_sqft\` in \`coef_area\` (price change per extra square foot, holding the others fixed).
`,
        starter: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error
df = pd.read_csv("data/houses.csv")
r2_test = mae_test = coef_area = None
`,
        solution: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error
df = pd.read_csv("data/houses.csv")
features = ["area_sqft", "bedrooms", "age_years", "distance_to_center_km"]
X, y = df[features], df["price"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = LinearRegression().fit(X_train, y_train)
pred = model.predict(X_test)
r2_test = r2_score(y_test, pred)
mae_test = mean_absolute_error(y_test, pred)
coef_area = dict(zip(features, model.coef_))["area_sqft"]
print(f"R² = {r2_test:.3f}, MAE = {mae_test:,.0f}, +1 sq ft adds about {coef_area:,.1f} to price")
`,
        tests: md`
from sklearn.model_selection import train_test_split as _tts
from sklearn.linear_model import LinearRegression as _LR
from sklearn.metrics import r2_score as _r2, mean_absolute_error as _mae
_d = pd.read_csv("data/houses.csv")
_f = ["area_sqft", "bedrooms", "age_years", "distance_to_center_km"]
_a, _b, _c, _e = _tts(_d[_f], _d["price"], test_size=0.2, random_state=42)
_m = _LR().fit(_a, _c)
_p = _m.predict(_b)
assert r2_test is not None and abs(r2_test - _r2(_e, _p)) < 1e-6, f"r2_test should be {_r2(_e, _p):.4f} (evaluate on the TEST set)"
assert abs(mae_test - _mae(_e, _p)) < 1e-3, f"mae_test should be {_mae(_e, _p):.1f}"
assert abs(coef_area - _m.coef_[0]) < 1e-6, f"coef_area should be {_m.coef_[0]:.3f}"
`,
        hints: ['Use exactly the four feature columns, in that order.', 'Fit on X_train/y_train; score with predictions on X_test.', '`model.coef_` is in the same order as the feature columns.'],
      },
    ],
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'In a house-price regression, the coefficient for "bedrooms" is negative even though bigger houses cost more. The model also includes area_sqft. Most likely explanation?', options: ['A bug in scikit-learn', 'Holding area fixed, more bedrooms means smaller rooms; plus bedrooms and area are correlated (multicollinearity), so coefficients are conditional and unstable', 'Bedrooms reduce value', 'The data must be scaled'], answer: 1, explanation: 'Each coefficient is the effect *holding the other features constant*. Correlated features make individual coefficients hard to interpret.' },
    ],
  },
  'ml-trees-forests': {
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'A random forest ranks "customer_id" as the most important feature for predicting churn. What should you conclude?', options: ['IDs drive churn', 'The model is memorising a high-cardinality identifier; drop it, and prefer permutation importance on a validation set', 'Increase n_estimators', 'Feature importance is always right'], answer: 1, explanation: 'Impurity-based importance favours features with many unique values. IDs carry no generalisable signal.' },
    ],
  },
  'ml-evaluation': {
    exercises: [
      {
        id: 'adv-eval-ex1', title: 'Choose a decision threshold for a business goal', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
The retention team can call customers predicted to churn and wants to catch **at least 80% of real churners** (recall ≥ 0.80), while wasting as few calls as possible (highest precision). The starter fits a model and gives you test-set churn probabilities \`proba\`.

Try thresholds \`np.arange(0.05, 0.95, 0.05)\`. Among those with recall ≥ 0.80, pick the one with the **highest precision**. Store it in \`best_threshold\`, and its precision and recall in \`best_precision\` and \`best_recall\`.
`,
        starter: md`
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
df = pd.read_csv("data/churn.csv")
X = pd.get_dummies(df[["tenure_months", "monthly_charges", "support_calls", "contract", "internet_service", "tech_support"]], drop_first=True)
y = (df["churn"] == "Yes").astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
model = LogisticRegression(max_iter=2000).fit(X_train, y_train)
proba = model.predict_proba(X_test)[:, 1]

best_threshold = 0.5
best_precision = best_recall = None
`,
        solution: md`
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import precision_score, recall_score
df = pd.read_csv("data/churn.csv")
X = pd.get_dummies(df[["tenure_months", "monthly_charges", "support_calls", "contract", "internet_service", "tech_support"]], drop_first=True)
y = (df["churn"] == "Yes").astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
model = LogisticRegression(max_iter=2000).fit(X_train, y_train)
proba = model.predict_proba(X_test)[:, 1]

best_threshold = best_precision = best_recall = None
for t in np.arange(0.05, 0.95, 0.05):
    pred = (proba >= t).astype(int)
    r = recall_score(y_test, pred)
    p = precision_score(y_test, pred, zero_division=0)
    if r >= 0.80 and (best_precision is None or p > best_precision):
        best_threshold, best_precision, best_recall = t, p, r
print(f"threshold {best_threshold:.2f}: precision {best_precision:.2f}, recall {best_recall:.2f}")
`,
        tests: md`
from sklearn.metrics import precision_score as _ps, recall_score as _rs
_best = None
for _t in np.arange(0.05, 0.95, 0.05):
    _pr = (proba >= _t).astype(int)
    _r, _p = _rs(y_test, _pr), _ps(y_test, _pr, zero_division=0)
    if _r >= 0.80 and (_best is None or _p > _best[1]):
        _best = (_t, _p, _r)
assert best_precision is not None, "Set best_precision and best_recall"
assert best_recall >= 0.80, f"The chosen threshold must give recall ≥ 0.80, got {best_recall:.3f}"
assert abs(best_threshold - _best[0]) < 1e-9, f"The best threshold is {_best[0]:.2f}"
assert abs(best_precision - _best[1]) < 1e-9 and abs(best_recall - _best[2]) < 1e-9, "Precision/recall don't match the chosen threshold"
`,
        hints: ['Turn probabilities into predictions with `(proba >= t).astype(int)`.', 'Keep track of the best precision seen among thresholds whose recall is at least 0.80.', 'Lower thresholds raise recall and lower precision: that is the trade-off.'],
      },
    ],
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'A fraud model flags transactions for manual review. Missing a fraud costs $500; a false alarm costs $5 of analyst time. Which metric should you prioritise when choosing the threshold?', options: ['Precision, to avoid false alarms', 'Recall: missed frauds are 100× more costly, so accept more false alarms', 'Accuracy', 'R²'], answer: 1, explanation: 'Translate errors into costs. When false negatives are much more expensive, favour recall (a lower threshold).' },
      { id: 'adv-q2', kind: 'mcq', difficulty: 'advanced', prompt: 'Only 1% of transactions are fraud. A model reports 99% accuracy. What should you check first?', options: ['Nothing; 99% is excellent', 'Whether it simply predicts "not fraud" for everything: look at recall, precision and the confusion matrix', 'The learning rate', 'R²'], answer: 1, explanation: 'With heavy class imbalance, accuracy is misleading; a trivial model gets 99%.' },
    ],
  },
  'ml-validation-tuning': {
    exercises: [
      {
        id: 'adv-cv-ex1', title: 'Tune k without leaking information', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
KNN needs scaled features, but scaling the **whole** dataset before cross-validation leaks information from validation folds. Build a **Pipeline** of \`StandardScaler\` → \`KNeighborsClassifier\`, and tune \`n_neighbors\` over \`[3, 5, 11, 21, 41]\` with \`GridSearchCV(..., cv=5, scoring="f1")\` on the training set.

Store the fitted search in \`search\`, the best k in \`best_k\` and the best mean CV F1 in \`best_cv_f1\`. Finally store the F1 on the **test** set in \`test_f1\`.
`,
        starter: md`
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import f1_score
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "total_charges", "support_calls"]]
y = (df["churn"] == "Yes").astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=1, stratify=y)

X_scaled = StandardScaler().fit_transform(X_train)  # leaks: scaled before CV
search = best_k = best_cv_f1 = test_f1 = None
`,
        solution: md`
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import f1_score
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "total_charges", "support_calls"]]
y = (df["churn"] == "Yes").astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=1, stratify=y)

pipe = Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier())])
search = GridSearchCV(pipe, {"knn__n_neighbors": [3, 5, 11, 21, 41]}, cv=5, scoring="f1").fit(X_train, y_train)
best_k = search.best_params_["knn__n_neighbors"]
best_cv_f1 = search.best_score_
test_f1 = f1_score(y_test, search.predict(X_test))
print(f"best k = {best_k}, CV F1 = {best_cv_f1:.3f}, test F1 = {test_f1:.3f}")
`,
        tests: md`
from sklearn.pipeline import Pipeline as _P
from sklearn.preprocessing import StandardScaler as _S
from sklearn.model_selection import GridSearchCV as _G
from sklearn.neighbors import KNeighborsClassifier as _K
from sklearn.metrics import f1_score as _f1
assert isinstance(search, _G), "search should be a fitted GridSearchCV"
assert isinstance(search.estimator, _P) and any(isinstance(s, _S) for _, s in search.estimator.steps), "Put the StandardScaler inside the Pipeline that GridSearchCV tunes"
_g = _G(_P([("s", _S()), ("k", _K())]), {"k__n_neighbors": [3, 5, 11, 21, 41]}, cv=5, scoring="f1").fit(X_train, y_train)
assert best_k == _g.best_params_["k__n_neighbors"], f"best_k should be {_g.best_params_['k__n_neighbors']}"
assert abs(best_cv_f1 - _g.best_score_) < 1e-9, f"best_cv_f1 should be {_g.best_score_:.4f}"
assert abs(test_f1 - _f1(y_test, _g.predict(X_test))) < 1e-9, "test_f1 should be computed on the test set with the best model"
`,
        hints: ['`Pipeline([("scale", StandardScaler()), ("knn", KNeighborsClassifier())])`', 'Grid keys use the step name: `{"knn__n_neighbors": [...]}`.', 'After fitting: `search.best_params_`, `search.best_score_`, `search.predict(X_test)`.'],
      },
    ],
    quiz: [
      { id: 'adv-q1', kind: 'mcq', difficulty: 'advanced', prompt: 'A colleague scales the full dataset, then runs 5-fold cross-validation and reports 0.91 F1. On new data the model scores 0.84. What is a likely cause?', options: ['Bad luck', 'Data leakage: scaling statistics were computed using the validation folds; put preprocessing inside a Pipeline', 'Too many folds', 'F1 is unstable'], answer: 1, explanation: 'Any step that learns from data (scaling, imputation, encoding, feature selection) must be fitted only on the training fold.' },
      { id: 'adv-q2', kind: 'mcq', difficulty: 'advanced', prompt: 'You tried 200 hyperparameter combinations and report the best cross-validation score as your expected performance. Why is that optimistic?', options: ['It isn’t', 'Picking the maximum of many noisy scores overfits to the validation folds; confirm on an untouched test set (or use nested CV)', 'CV always underestimates', 'You should use accuracy'], answer: 1, explanation: 'Selection itself introduces bias. Keep a final test set that played no part in any decision.' },
    ],
  },
};
