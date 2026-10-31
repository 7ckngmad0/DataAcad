import type { Module } from '../types.ts';
import { md } from './md.ts';

const TIDY = { label: 'Tidy Data (Wickham)', url: 'https://vita.had.co.nz/papers/tidy-data.pdf' };
const PDA = { label: 'Python for Data Analysis — Data Cleaning chapter', url: 'https://wesmckinney.com/book/data-cleaning' };

export const m06: Module = {
  id: 'eda',
  number: 6,
  title: 'Data Cleaning & Exploratory Data Analysis',
  short: 'Cleaning & EDA',
  icon: 'sparkles',
  description:
    'Turn raw, messy data into trustworthy, analysis-ready data — then explore it systematically to find patterns, relationships and conclusions. Practised end-to-end on realistic messy datasets.',
  skills: ['Data profiling', 'Data quality', 'Standardising text', 'Outliers', 'Scaling & encoding', 'Feature engineering', 'Univariate & bivariate EDA', 'Drawing conclusions'],
  lessons: [
    {
      id: 'eda-data-quality',
      title: 'Understanding Datasets & Assessing Data Quality',
      minutes: 45,
      difficulty: 'intermediate',
      objectives: [
        'Profile an unfamiliar dataset systematically',
        'Identify missing values, duplicates, inconsistent categories, invalid values and wrong types',
        'Write a reusable data-quality report function',
        'Perform a complete, documented cleaning of a messy table',
      ],
      intro: md`
“Garbage in, garbage out.” Surveys of data scientists consistently report that cleaning and preparing data takes the **majority** of project time. Clean data isn’t glamorous, but every chart, test and model downstream depends on it. This lesson gives you a repeatable workflow.
`,
      simple: md`
Before cooking, a chef inspects and washes the ingredients: throws out spoiled ones, removes duplicates from the delivery, and makes sure “sugar” isn’t accidentally salt.

Data cleaning is the same:
1. **Look** at every column — what should it contain?
2. **Find problems** — blanks, duplicates, typos (“manila ” vs “Manila”), impossible values (age 230), numbers stored as text.
3. **Fix** them in code, keeping a record of what you changed and why.
`,
      technical: md`
### A profiling checklist
1. **Structure:** \`shape\`, \`dtypes\`, \`head()\`/\`sample()\`; is each row one observation? Is there a unique ID?
2. **Completeness:** \`isna().mean()\` per column; hidden sentinels (\`""\`, \`"N/A"\`, \`-999\`, \`0\` meaning unknown).
3. **Uniqueness:** \`duplicated().sum()\`, \`df["id"].is_unique\`, near-duplicates (same person, different spelling).
4. **Validity:** ranges (\`age.between(0, 110)\`), allowed categories, date ranges, formats (emails, phone numbers).
5. **Consistency:** \`value_counts()\` of categories reveals variants (“Cebu”, “CEBU”); unit consistency (kg vs lb); totals that should add up.
6. **Accuracy & timeliness:** compare against trusted sources; check the most recent date.

### Cleaning operations
| Problem | Typical fix |
|---|---|
| Inconsistent text | \`str.strip().str.lower()\`, \`replace\`/\`map\` to canonical values |
| Numbers as text | remove symbols, \`pd.to_numeric(errors="coerce")\` |
| Mixed date formats | \`pd.to_datetime(errors="coerce")\`, explicit \`format=\` or \`dayfirst=\` |
| Invalid values | set to NaN (\`mask\`/\`where\`), then treat as missing |
| Duplicates | \`drop_duplicates()\` on all or key columns |
| Missing values | drop or impute (+ a missing flag) |

### Principles
- **Never edit raw data**; write a cleaning script/function from raw → clean.
- Make every rule explicit and documented (a “cleaning log”).
- Re-run the quality report after cleaning to verify.
- Decide with domain knowledge: an age of 230 is an error; a \$98,000 monthly spend might be a real VIP — investigate.
`,
      terms: [
        ['Data profiling', 'Systematic summary of a dataset’s structure, content and quality.'],
        ['Sentinel value', 'A placeholder (like −999 or "N/A") used to mean missing.'],
        ['Validity', 'Values conform to allowed types, ranges and formats.'],
        ['Consistency', 'The same fact is represented the same way everywhere.'],
        ['Canonical value', 'The single standard spelling/format chosen for a category.'],
        ['Cleaning log', 'A record of each cleaning rule and how many rows it affected.'],
      ],
      realWorld: md`
A logistics company found its “on-time delivery rate” dashboard showed 97%. A data-quality audit revealed that failed deliveries were often recorded with a blank delivery date and then **dropped** by the dashboard query. After fixing the logic, the true rate was 88% — and the company finally addressed its real delivery problems. Data quality issues don’t just add noise; they change decisions.
`,
      steps: [
        'Run a profiling report (types, missingness, uniques, sample values).',
        'List every issue found with a proposed rule.',
        'Implement the rules in one cleaning function, in a sensible order (duplicates → text → types → invalid values → missing).',
        'Log how many rows each rule changed.',
        'Re-run the profile on the cleaned data and compare.',
      ],
      code: [
        {
          title: 'A reusable data-quality report',
          code: md`
import pandas as pd

def quality_report(df):
    return pd.DataFrame({
        "dtype": df.dtypes.astype(str),
        "missing": df.isna().sum(),
        "missing_%": (df.isna().mean() * 100).round(1),
        "unique": df.nunique(),
        "example": df.apply(lambda col: col.dropna().iloc[0] if col.notna().any() else None),
    })

raw = pd.read_csv("data/messy_customers.csv")
print("rows:", len(raw), " duplicates:", raw.duplicated().sum(), " id unique:", raw["customer_id"].is_unique)
print(quality_report(raw))
print("\ncity variants:\n", raw["city"].value_counts())
`,
          explanation: [
            '…',
            'A function so we can reuse the report on any DataFrame.',
            'Build a summary table with one row per column:',
            'its dtype,',
            'missing count,',
            'missing percentage,',
            'number of distinct values,',
            'and an example non-missing value.',
            '…',
            '…',
            'Load the raw data.',
            'Duplicates exist and the ID column isn’t unique — both red flags.',
            'The report shows text dtypes for age and spend and missing values.',
            '`value_counts` exposes inconsistent spellings of the same city.',
          ],
        },
        {
          title: 'Complete cleaning pipeline with a cleaning log',
          code: md`
import pandas as pd
import numpy as np

raw = pd.read_csv("data/messy_customers.csv")
log = []

def step(name, before, after):
    log.append((name, before, after))

df = raw.copy()
n = len(df); df = df.drop_duplicates(); step("drop exact duplicates", n, len(df))

city_map = {"manila": "Manila", "cebu": "Cebu", "davao": "Davao", "davao city": "Davao"}
df["city"] = df["city"].str.strip().str.lower().map(city_map)
step("standardise city", raw["city"].nunique(), df["city"].nunique())

df["age"] = pd.to_numeric(df["age"], errors="coerce")
invalid_age = ~df["age"].between(16, 100)
step("invalid/unparseable age -> NaN", int(invalid_age.sum()), 0)
df.loc[invalid_age, "age"] = np.nan

df["monthly_spend"] = pd.to_numeric(df["monthly_spend"].astype(str).str.replace(",", ""), errors="coerce")
df["signup_date"] = pd.to_datetime(df["signup_date"], format="mixed", dayfirst=True, errors="coerce")

df["age_missing"] = df["age"].isna()
df["age"] = df["age"].fillna(df["age"].median())
df["monthly_spend"] = df["monthly_spend"].fillna(df["monthly_spend"].median())

for name, before, after in log:
    print(f"{name:35s} {before} -> {after}")
print(df.dtypes)
print(df.describe().round(1))
`,
          explanation: [
            '…',
            '…',
            'Raw data stays untouched.',
            'A simple cleaning log.',
            '…',
            '…',
            'Work on a copy.',
            '1) Remove exact duplicates and log the row counts (63 → 60).',
            'A mapping from normalised spellings to canonical names.',
            '2) strip + lower, then map to canonical names: 6 variants → 3 cities.',
            '…',
            '3) Convert age to numbers ("thirty" → NaN).',
            'Ages outside a plausible range (or NaN) are invalid — e.g. 230.',
            '…',
            'Set them to NaN so they’re treated as missing.',
            '4) Clean spend: remove commas, convert.',
            '5) Parse dates written in mixed formats (`format="mixed"`, day-first for "15-11-2024").',
            '6) Keep a flag before imputing so information about missingness isn’t lost…',
            '…then impute with medians (robust to the 98,000 outlier we keep for investigation).',
            '…',
            'Print the cleaning log.',
            '…',
            'Final types are numeric/datetime/bool.',
            'Summary of the clean data.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Cleaning by hand in Excel and losing track of changes.', fix: 'Write a cleaning script; keep raw data read-only.' },
        { mistake: 'Imputing before fixing invalid values (the 230-year-old inflates the mean).', fix: 'Order: duplicates → text → types → invalid → missing.' },
        { mistake: 'Deleting outliers that are real (VIP customers).', fix: 'Flag and investigate; decide with domain experts.' },
        { mistake: 'Not re-checking after cleaning.', fix: 'Re-run the quality report and compare counts.' },
      ],
      exercises: [
        {
          id: 'eda1-ex1', title: 'Standardise categories', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Clean \`s\` so it has exactly three distinct values: \`"Manila"\`, \`"Cebu"\`, \`"Davao"\`. Store the cleaned Series in \`clean\`.`,
          starter: md`
import pandas as pd
s = pd.Series(["Manila", "manila ", " CEBU", "Cebu", "Davao City", "davao"])
clean = s
print(clean.unique())
`,
          solution: md`
import pandas as pd
s = pd.Series(["Manila", "manila ", " CEBU", "Cebu", "Davao City", "davao"])
clean = s.str.strip().str.lower().str.replace(" city", "").str.title()
print(clean.unique())
`,
          tests: md`assert clean.tolist() == ["Manila", "Manila", "Cebu", "Cebu", "Davao", "Davao"], f"Got {clean.tolist()}"`,
          hints: ['Chain `.str.strip().str.lower()`.', 'Remove " city", then `.str.title()`.'],
        },
        {
          id: 'eda1-ex2', title: 'Invalid values to NaN', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Set every age outside **0–110** (inclusive) to \`NaN\` in \`df["age"]\`, then store the number of valid ages in \`n_valid\`.`,
          starter: md`
import pandas as pd
import numpy as np
df = pd.DataFrame({"age": [34, -2, 51, 230, 19, 0, 110, 999]})
n_valid = 0
print(df, n_valid)
`,
          solution: md`
import pandas as pd
import numpy as np
df = pd.DataFrame({"age": [34, -2, 51, 230, 19, 0, 110, 999]})
df.loc[~df["age"].between(0, 110), "age"] = np.nan
n_valid = int(df["age"].notna().sum())
print(df, n_valid)
`,
          tests: md`
assert df["age"].isna().tolist() == [False, True, False, True, False, False, False, True], f"Got {df['age'].tolist()}"
assert n_valid == 5
`,
          hints: ['`between(0, 110)` is inclusive.', 'Use `df.loc[~mask, "age"] = np.nan`.'],
        },
        {
          id: 'eda1-ex3', title: 'Clean the messy dataset', type: 'dataset', lang: 'python', difficulty: 'advanced',
          prompt: md`
Write \`clean_customers(path)\` that returns a cleaned DataFrame from \`data/messy_customers.csv\`:
1. drop exact duplicates;
2. \`city\` standardised to \`Manila\`/\`Cebu\`/\`Davao\`;
3. \`age\` numeric, invalid (< 16 or > 100, or unparseable) set to NaN;
4. \`monthly_spend\` numeric (commas removed).
`,
          starter: md`
import pandas as pd
import numpy as np

def clean_customers(path):
    df = pd.read_csv(path)
    return df

out = clean_customers("data/messy_customers.csv")
print(out.dtypes)
`,
          solution: md`
import pandas as pd
import numpy as np

def clean_customers(path):
    df = pd.read_csv(path).drop_duplicates()
    df["city"] = (df["city"].str.strip().str.lower()
                  .str.replace(" city", "", regex=False).str.title())
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df.loc[~df["age"].between(16, 100), "age"] = np.nan
    df["monthly_spend"] = pd.to_numeric(df["monthly_spend"].astype(str).str.replace(",", ""), errors="coerce")
    return df

out = clean_customers("data/messy_customers.csv")
print(out.dtypes)
`,
          tests: md`
o = clean_customers("data/messy_customers.csv")
assert len(o) == 60, f"Expected 60 rows after removing duplicates, got {len(o)}"
assert set(o["city"].dropna()) == {"Manila", "Cebu", "Davao"}, f"Cities: {set(o['city'])}"
assert pd.api.types.is_numeric_dtype(o["age"]) and o["age"].max() <= 100, "age must be numeric with invalid values removed"
assert o["age"].isna().sum() == 5, f"Expected 5 missing ages (3 missing + 'thirty' + 230), got {o['age'].isna().sum()}"
assert pd.api.types.is_float_dtype(o["monthly_spend"]), "monthly_spend must be float"
`,
          hints: ['Do the steps in order inside the function and return df.', 'For cities: strip → lower → remove " city" → title.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: '“Cebu”, “CEBU” and “cebu ” in one column is a problem of…', options: ['Completeness', 'Consistency', 'Timeliness', 'Volume'], answer: 1, explanation: 'Same value, different representations.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'What should usually come first in a cleaning pipeline?', options: ['Imputing missing values', 'Removing duplicates and fixing types/invalid values', 'Training a model', 'Plotting'], answer: 1, explanation: 'Imputing before fixing errors spreads bad values into the fill.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'A customer’s monthly spend is 80× the median. You should…', options: ['Delete the row immediately', 'Investigate whether it is an error or a real high-value customer', 'Replace with 0', 'Ignore cleaning'], answer: 1, explanation: 'Outliers can be errors or the most important data points.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'Why keep raw data unmodified?', options: ['Saves memory', 'So cleaning is reproducible and errors can be traced', 'Pandas requires it', 'It is faster to load'], answer: 1, explanation: 'Raw → script → clean is auditable and repeatable.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which value is a likely hidden missing-value sentinel in an age column?', options: ['34', '-999', '62', '18'], answer: 1, explanation: 'Codes like -999 often mean “unknown”.' },
      ],
      summary: [
        'Profile: structure, completeness, uniqueness, validity, consistency.',
        'Clean in code in a sensible order; log every rule.',
        'Invalid values → NaN → treat as missing; flag before imputing.',
        'Re-run the quality report to verify.',
      ],
      resources: [TIDY, PDA],
    },
    {
      id: 'eda-outliers-transform',
      title: 'Outlier Detection & Data Transformation',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Detect outliers with IQR fences, z-scores and visual checks',
        'Choose between keeping, capping (winsorising), transforming or removing outliers',
        'Apply log and other transformations to skewed variables',
        'Scale numeric features and encode categorical features',
      ],
      intro: md`
Outliers and skewed variables can dominate averages, distort charts and mislead models. Transformations (logs, scaling, encoding) also convert raw columns into forms that statistical methods and machine-learning algorithms handle well.
`,
      simple: md`
An **outlier** is a value far from the others — like one 2.3 m tall student in a class photo. Sometimes it’s a mistake (someone typed 230 instead of 23); sometimes it’s real and important.

**Transformations** change the scale of data:
- A **log** squashes huge values so a few billionaires don’t dwarf everyone else.
- **Scaling** puts columns on comparable scales (age in years vs income in thousands).
- **Encoding** turns categories like “Cebu/Manila” into numbers a model can use.
`,
      technical: md`
### Detecting outliers
- **IQR rule:** outside $[Q_1 - 1.5\,\text{IQR},\; Q_3 + 1.5\,\text{IQR}]$ — robust, works for skewed data.
- **z-score:** $|z| > 3$ — assumes roughly normal data; the outliers themselves inflate the SD.
- **Visual:** box plots, histograms, scatter plots (multivariate outliers that are only unusual in combination).
- **Domain rules:** impossible values (negative prices).

### Treatments
| Approach | When |
|---|---|
| Keep | real, important values; use robust statistics (median, IQR) |
| Correct | obvious data-entry errors with a known fix |
| Remove | errors that can’t be fixed (document it!) |
| Cap/winsorise | \`clip(lower, upper)\` at e.g. the 1st/99th percentile — limits influence |
| Transform | log/sqrt for right-skewed positive data |

### Transformations
- \`np.log1p(x)\` handles zeros; \`np.sqrt\`; Box-Cox/Yeo-Johnson (\`scipy.stats.boxcox\`, sklearn \`PowerTransformer\`).
- **Standardisation:** $z = (x - \mu)/\sigma$ — mean 0, SD 1 (sklearn \`StandardScaler\`).
- **Min-max scaling:** $(x - \min)/(\max - \min)$ → [0, 1] (\`MinMaxScaler\`).
- **Robust scaling:** $(x - \text{median})/\text{IQR}$ (\`RobustScaler\`).
- Fit scalers on **training data only** to avoid data leakage (Module 10).

### Encoding categorical variables
- **One-hot encoding:** one 0/1 column per category (\`pd.get_dummies\`, sklearn \`OneHotEncoder\`) — for nominal variables.
- **Ordinal encoding:** map ordered categories to integers (\`{"S": 1, "M": 2, "L": 3}\`).
- \`drop_first=True\` avoids redundant columns for linear models.
- Many categories (e.g. 5,000 zip codes) → group rare levels into “Other”, or use target/frequency encoding carefully.
`,
      terms: [
        ['Outlier', 'An observation far from most others.'],
        ['Winsorising / capping', 'Replacing extreme values with a percentile limit.'],
        ['Log transform', 'Applying log to compress large values and reduce right skew.'],
        ['Standardisation', 'Rescaling to mean 0 and standard deviation 1.'],
        ['Min-max scaling', 'Rescaling to the range [0, 1].'],
        ['One-hot encoding', 'Representing each category as its own 0/1 column.'],
        ['Data leakage', 'Using information in training that wouldn’t be available at prediction time.'],
      ],
      realWorld: md`
**Insurance claims:** 95% of claims are under \$5,000, but a few exceed \$500,000. A linear model on raw claim amounts is dominated by those few cases. Actuaries model \`log(claim)\`, cap extreme claims for some analyses, and treat catastrophic claims with a separate model — combining several treatments for different questions.
`,
      steps: [
        'Visualise the distribution (histogram + box plot).',
        'Detect outliers with the IQR rule (and domain rules).',
        'Classify each outlier: error, rare-but-real, or interesting.',
        'Choose a treatment (keep, fix, cap, transform, remove) and document it.',
        'Scale numeric features and encode categorical ones for modelling.',
      ],
      code: [
        {
          title: 'Detecting and treating outliers',
          code: md`
import numpy as np
import pandas as pd

houses = pd.read_csv("data/houses.csv")
price = houses["price"]

q1, q3 = price.quantile([0.25, 0.75])
iqr = q3 - q1
iqr_out = (price < q1 - 1.5 * iqr) | (price > q3 + 1.5 * iqr)
z = (price - price.mean()) / price.std()
print("IQR outliers:", iqr_out.sum(), " |z|>3 outliers:", (z.abs() > 3).sum())

low, high = price.quantile([0.01, 0.99])
capped = price.clip(low, high)
print(f"max before={price.max():,}  after capping={capped.max():,.0f}")

print("skew raw:", round(price.skew(), 2), " skew log:", round(np.log(price).skew(), 2))
print("skew distance:", round(houses["distance_to_center_km"].skew(), 2),
      " after log1p:", round(np.log1p(houses["distance_to_center_km"]).skew(), 2))
`,
          explanation: [
            '…',
            '…',
            'Load house prices.',
            '…',
            'Quartiles…',
            'IQR.',
            'Tukey fences flag unusually cheap/expensive houses.',
            'z-scores for comparison.',
            'The two methods flag different numbers of points.',
            '1st and 99th percentiles…',
            '…`clip` caps extreme values (winsorising).',
            'The maximum is now limited.',
            '`.skew()` > 0 means right-skewed; the log reduces it.',
            'Distance is strongly right-skewed; `log1p` handles any zeros safely.',
          ],
        },
        {
          title: 'Scaling and encoding',
          code: md`
import pandas as pd
from sklearn.preprocessing import StandardScaler, MinMaxScaler

churn = pd.read_csv("data/churn.csv")
num = churn[["tenure_months", "monthly_charges"]]

std = pd.DataFrame(StandardScaler().fit_transform(num), columns=num.columns)
mm = pd.DataFrame(MinMaxScaler().fit_transform(num), columns=num.columns)
print(std.describe().loc[["mean", "std"]].round(3))
print(mm.describe().loc[["min", "max"]])

encoded = pd.get_dummies(churn[["contract", "internet_service"]], drop_first=True, dtype=int)
print(encoded.head())

size_order = {"Month-to-month": 0, "One year": 1, "Two year": 2}
churn["contract_length"] = churn["contract"].map(size_order)
print(churn[["contract", "contract_length"]].drop_duplicates())
`,
          explanation: [
            '…',
            'scikit-learn’s preprocessing tools.',
            '…',
            'Two numeric columns on very different scales.',
            '…',
            'StandardScaler → each column has mean 0 and SD 1.',
            'MinMaxScaler → each column ranges from 0 to 1.',
            'Verify the means/SDs…',
            '…and the ranges.',
            '…',
            'One-hot encode nominal columns; `drop_first=True` removes one redundant column per variable.',
            '…',
            'Contract length has a natural order, so ordinal encoding makes sense too.',
            '…',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Removing outliers automatically before understanding them.', fix: 'Investigate first; often only clear errors should be removed.' },
        { mistake: 'Using z-scores on heavily skewed data.', fix: 'Prefer the IQR rule or transform first.' },
        { mistake: 'Ordinal-encoding nominal categories (city 1, 2, 3) for a linear model.', fix: 'Use one-hot encoding for unordered categories.' },
        { mistake: 'Fitting a scaler on the full dataset before splitting into train/test.', fix: 'Fit on the training set only (Module 10 pipelines handle this).' },
      ],
      exercises: [
        {
          id: 'eda2-ex1', title: 'Cap with percentiles', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Cap \`s\` at its 5th and 95th percentiles using \`clip\`. Store the result in \`capped\`.`,
          starter: md`
import pandas as pd
s = pd.Series(list(range(1, 100)) + [1000])
capped = s
print(capped.max())
`,
          solution: md`
import pandas as pd
s = pd.Series(list(range(1, 100)) + [1000])
lo, hi = s.quantile([0.05, 0.95])
capped = s.clip(lo, hi)
print(capped.max())
`,
          tests: md`
_lo, _hi = s.quantile([0.05, 0.95])
assert abs(capped.max() - _hi) < 1e-9 and abs(capped.min() - _lo) < 1e-9, "Values should be clipped to the 5th/95th percentiles"
assert len(capped) == 100
`,
          hints: ['`s.quantile([0.05, 0.95])` gives both limits.', '`s.clip(lo, hi)`'],
        },
        {
          id: 'eda2-ex2', title: 'One-hot encode', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`One-hot encode the \`neighborhood\` column of \`data/houses.csv\` with \`pd.get_dummies(..., dtype=int)\` (keep all categories). Store the result in \`dummies\`.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/houses.csv")
dummies = None
print(dummies)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/houses.csv")
dummies = pd.get_dummies(df["neighborhood"], dtype=int)
print(dummies.head())
`,
          tests: md`
assert dummies is not None and dummies.shape == (800, 5), f"Expected shape (800, 5), got {getattr(dummies, 'shape', None)}"
assert (dummies.sum(axis=1) == 1).all(), "Each row should have exactly one 1"
`,
          hints: ['`pd.get_dummies(df["neighborhood"], dtype=int)`'],
        },
        {
          id: 'eda2-ex3', title: 'Standardise by hand', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Standardise \`x\` to z-scores (\`z\`) using the **population** standard deviation (\`ddof=0\`), matching sklearn’s StandardScaler.`,
          starter: md`
import numpy as np
x = np.array([10.0, 20.0, 30.0, 40.0, 100.0])
z = x
print(z)
`,
          solution: md`
import numpy as np
x = np.array([10.0, 20.0, 30.0, 40.0, 100.0])
z = (x - x.mean()) / x.std(ddof=0)
print(z)
`,
          tests: md`
from sklearn.preprocessing import StandardScaler
assert np.allclose(z, StandardScaler().fit_transform(x.reshape(-1, 1)).ravel()), "Should match StandardScaler"
`,
          hints: ['NumPy’s `x.std()` already uses ddof=0.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which outlier method is more robust for skewed data?', options: ['z-score > 3', 'IQR fences', 'Mean ± 1 SD', 'Max value'], answer: 1, explanation: 'Quartiles aren’t pulled by extreme values.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which transform suits right-skewed positive data that contains zeros?', options: ['np.log', 'np.log1p', 'x²', 'One-hot'], answer: 1, explanation: 'log1p(x) = log(1 + x) is defined at 0.' },
        { id: 'q3', kind: 'mcq', difficulty: 'beginner', prompt: 'One-hot encoding is appropriate for…', options: ['Nominal categories like city', 'Continuous income', 'Dates', 'Ordinal sizes only'], answer: 0, explanation: 'Unordered categories → separate 0/1 columns.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'After standardisation a feature has…', options: ['Range [0, 1]', 'Mean 0 and SD 1', 'Only positive values', 'Median 1'], answer: 1, explanation: 'z = (x − μ)/σ.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'Fitting a scaler on all data before the train/test split causes…', options: ['Underfitting', 'Data leakage', 'Faster training', 'Nothing'], answer: 1, explanation: 'Test-set statistics leak into training.' },
      ],
      summary: [
        'Detect outliers with IQR, z-scores, plots and domain rules.',
        'Treat by keeping, correcting, capping, transforming or removing — and document it.',
        'log/log1p reduce right skew; scale with standard/min-max/robust scalers.',
        'One-hot encode nominal, ordinal-encode ordered categories; avoid leakage.',
      ],
      resources: [{ label: 'scikit-learn: Preprocessing data', url: 'https://scikit-learn.org/stable/modules/preprocessing.html' }, PDA],
    },
    {
      id: 'eda-feature-engineering',
      title: 'Feature Engineering Fundamentals',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Explain what a feature is and why engineered features improve models',
        'Create date/time, ratio, aggregate, binned and interaction features',
        'Build customer-level features from transaction data (RFM)',
        'Avoid leakage when engineering features',
      ],
      intro: md`
Models only see the columns you give them. **Feature engineering** — creating informative variables from raw data using domain knowledge — often improves results more than switching algorithms. “Days since last purchase” predicts churn far better than a raw list of order dates.
`,
      simple: md`
A **feature** is a piece of information you give a model. Raw data is often not in a useful shape:

- An order timestamp → *day of the week*, *is it a weekend?*, *month*.
- Total charges and tenure → *average monthly charge*.
- 300 individual transactions → *how recently*, *how often* and *how much* the customer buys.

You’re translating your understanding of the problem into columns.
`,
      technical: md`
### Common feature types
| Type | Examples |
|---|---|
| **Date/time** | year, month, day of week, hour, is_weekend, days_since_X, season, holidays |
| **Ratios & differences** | price per sqft, revenue per customer, debt/income, change vs last month |
| **Aggregates** | customer total spend, average basket, # orders (groupby + agg) |
| **Binning** | age groups, income bands (\`pd.cut\`, \`pd.qcut\`) |
| **Interactions** | \`bedrooms * bathrooms\`, product of two features |
| **Text** | length, word counts, contains keyword |
| **Flags** | is_missing, is_new_customer, above_threshold |
| **Lags & rolling (time series)** | value yesterday, 7-day rolling mean |

### RFM (Recency, Frequency, Monetary)
A classic marketing feature set built from transactions per customer:
- **Recency** — days since the last purchase (lower is better).
- **Frequency** — number of purchases.
- **Monetary** — total (or average) spend.

### Avoiding leakage
Features must use only information available **at prediction time**. Example of leakage: using “number of complaints in the month after cancellation” to predict cancellation. For time-based data compute features with a **cutoff date**.

### Evaluate features
Check correlation/relationship with the target, compare model performance with and without, and keep features interpretable when stakeholders need explanations.
`,
      terms: [
        ['Feature', 'An input variable used by a model.'],
        ['Feature engineering', 'Creating new informative features from raw data.'],
        ['Interaction feature', 'A combination of two features (e.g. their product).'],
        ['RFM', 'Recency, Frequency, Monetary — customer behaviour features.'],
        ['Lag feature', 'A previous time-step’s value used as a feature.'],
        ['Leakage', 'A feature containing information not available at prediction time.'],
      ],
      realWorld: md`
A ride-sharing company predicting trip demand improved its model substantially by adding engineered features: **hour of day**, **is_holiday**, **rain in the last hour**, and **demand at the same hour last week** (a lag). The raw timestamp alone carried almost none of this information in a form the model could use.
`,
      steps: [
        'Brainstorm with domain knowledge: what would a human expert look at?',
        'Create features with vectorised pandas operations.',
        'For transactions, aggregate to the entity level (customer, store) with groupby.',
        'Check each feature’s relationship with the target (groupby means, correlations).',
        'Double-check every feature for leakage relative to the prediction time.',
      ],
      code: [
        {
          title: 'Date, ratio and interaction features',
          code: md`
import pandas as pd
import numpy as np

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
sales["year"] = sales["order_date"].dt.year
sales["month"] = sales["order_date"].dt.month
sales["weekday"] = sales["order_date"].dt.day_name()
sales["is_weekend"] = sales["order_date"].dt.dayofweek >= 5
sales["is_q4"] = sales["month"].isin([10, 11, 12])
sales["discounted"] = sales["discount"] > 0
print(sales[["order_date", "weekday", "is_weekend", "is_q4"]].head(3))
print(sales.groupby("is_q4")["revenue"].mean().round(2))

houses = pd.read_csv("data/houses.csv")
houses["price_per_sqft"] = houses["price"] / houses["area_sqft"]
houses["rooms"] = houses["bedrooms"] + houses["bathrooms"]
houses["is_new"] = houses["age_years"] < 5
print(houses.groupby("neighborhood")["price_per_sqft"].median().round(1).sort_values())
`,
          explanation: [
            '…',
            '…',
            'Load sales with a real datetime column.',
            'Calendar features via the `.dt` accessor…',
            '…',
            'day name (Monday…),',
            '`dayofweek` is 0=Monday … 6=Sunday, so ≥ 5 means weekend.',
            'Flag the busy final quarter.',
            'A boolean feature from the discount column.',
            '…',
            'Does Q4 have a different average order value? A quick feature check.',
            'House data.',
            'Ratio feature: price per square foot (more comparable across sizes).',
            'A combined feature.',
            'A flag feature.',
            'Price per sqft by neighborhood reveals location value more clearly than raw price.',
          ],
        },
        {
          title: 'RFM features from transactions',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
cutoff = sales["order_date"].max() + pd.Timedelta(days=1)

rfm = sales.groupby("customer_id").agg(
    last_order=("order_date", "max"),
    frequency=("order_id", "count"),
    monetary=("revenue", "sum"),
)
rfm["recency_days"] = (cutoff - rfm["last_order"]).dt.days
rfm = rfm.drop(columns="last_order")
rfm["r_score"] = pd.qcut(rfm["recency_days"], 4, labels=[4, 3, 2, 1]).astype(int)
rfm["f_score"] = pd.qcut(rfm["frequency"].rank(method="first"), 4, labels=[1, 2, 3, 4]).astype(int)
rfm["m_score"] = pd.qcut(rfm["monetary"], 4, labels=[1, 2, 3, 4]).astype(int)
rfm["rfm_total"] = rfm[["r_score", "f_score", "m_score"]].sum(axis=1)
print(rfm.sort_values("rfm_total", ascending=False).head().round(1))
print(rfm.describe().round(1))
`,
          explanation: [
            '…',
            '…',
            'A reference date just after the last order (the “prediction time”).',
            'Aggregate per customer:',
            'most recent order date,',
            'number of orders,',
            'total spend.',
            'Recency = days between last order and the cutoff.',
            'No longer need the raw date.',
            'Quartile scores: recent customers (low recency) get the highest score 4.',
            'Frequency has many ties, so rank first to make the quartiles well defined.',
            'Monetary score.',
            'A simple combined score (3–12).',
            'Best customers by RFM score.',
            'Distribution of the features.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Leaking the future (features computed after the event you predict).', fix: 'Define a cutoff time and compute features only from earlier data.' },
        { mistake: 'Creating hundreds of features blindly.', fix: 'Start from domain hypotheses; evaluate features with validation.' },
        { mistake: 'Dividing by a column that can be zero.', fix: 'Guard ratios: `np.where(den > 0, num / den, np.nan)`.' },
      ],
      exercises: [
        {
          id: 'eda3-ex1', title: 'Weekend revenue share', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Using \`data/sales.csv\`, create an \`is_weekend\` feature and compute \`weekend_share\`: the fraction of total revenue from weekend orders.`,
          starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
weekend_share = 0
print(weekend_share)
`,
          solution: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
sales["is_weekend"] = sales["order_date"].dt.dayofweek >= 5
weekend_share = sales.loc[sales["is_weekend"], "revenue"].sum() / sales["revenue"].sum()
print(weekend_share)
`,
          tests: md`
_s = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
_e = _s.loc[_s.order_date.dt.dayofweek >= 5, "revenue"].sum() / _s.revenue.sum()
assert "is_weekend" in sales.columns, "Create the is_weekend column"
assert abs(weekend_share - _e) < 1e-9, f"Expected {_e:.4f}, got {weekend_share}"
`,
          hints: ['`dt.dayofweek >= 5` is Saturday/Sunday.', 'Weekend revenue / total revenue.'],
        },
        {
          id: 'eda3-ex2', title: 'Customer features', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`From \`data/sales.csv\`, build \`cust\` indexed by \`customer_id\` with columns \`n_orders\`, \`total_revenue\` and \`avg_units\`.`,
          starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv")
cust = None
print(cust)
`,
          solution: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv")
cust = sales.groupby("customer_id").agg(
    n_orders=("order_id", "count"),
    total_revenue=("revenue", "sum"),
    avg_units=("units", "mean"),
)
print(cust.head())
`,
          tests: md`
assert list(cust.columns) == ["n_orders", "total_revenue", "avg_units"]
assert cust["n_orders"].sum() == 1500 and abs(cust["total_revenue"].sum() - sales["revenue"].sum()) < 1e-6
`,
          hints: ['groupby customer_id with named aggregations.'],
        },
        {
          id: 'eda3-ex3', title: 'Spot the leak', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`
You want to predict on **January 1** whether a customer will churn in January. Which feature leaks? Answer with the letter.

A) tenure on Jan 1 B) support calls in December C) refund issued on Jan 20 D) contract type
`,
          solution: 'C', accepted: ['c', 'c)'],
          hints: ['Which information would not exist yet on January 1?'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What is feature engineering?', options: ['Choosing a model', 'Creating informative input variables from raw data', 'Deleting columns', 'Visualising results'], answer: 1, explanation: 'It translates domain knowledge into features.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'RFM stands for…', options: ['Revenue, Forecast, Margin', 'Recency, Frequency, Monetary', 'Rate, Factor, Mean', 'Region, Format, Media'], answer: 1, explanation: 'Classic customer behaviour features.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which is a ratio feature for houses?', options: ['neighborhood', 'price per square foot', 'house_id', 'is_new'], answer: 1, explanation: 'price / area.' },
        { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'Why compute features relative to a cutoff date?', options: ['To save memory', 'To ensure features only use information available at prediction time', 'To make dates numeric', 'It is required by pandas'], answer: 1, explanation: 'Prevents leakage from the future.' },
      ],
      summary: [
        'Features are model inputs; engineered features encode domain knowledge.',
        'Date parts, ratios, aggregates, bins, interactions, flags, lags.',
        'RFM summarises customer behaviour from transactions.',
        'Only use information available at prediction time.',
      ],
      resources: [{ label: 'Kaggle Learn — Feature Engineering', url: 'https://www.kaggle.com/learn/feature-engineering' }, PDA],
    },
    {
      id: 'eda-workflow',
      title: 'Exploratory Data Analysis: Patterns, Relationships & Conclusions',
      minutes: 50,
      difficulty: 'intermediate',
      widgets: ['correlation'],
      objectives: [
        'Follow a structured EDA workflow: questions → univariate → bivariate → multivariate',
        'Find patterns in distributions, groups and time',
        'Run correlation analysis and interpret it responsibly',
        'Write evidence-based conclusions with appropriate caveats',
      ],
      intro: md`
EDA is detective work. Before modelling or presenting, you interrogate the data: what’s typical, what’s unusual, what moves together, what changes over time. Good EDA answers questions, generates new hypotheses, and catches problems that would invalidate later analysis.
`,
      simple: md`
EDA is like getting to know a new city:
1. First the **big picture**: how big is it, what neighbourhoods exist? (*shape, columns, summary*)
2. Then each **street on its own**: what does each variable look like? (*univariate*)
3. Then **connections** between streets: which areas are linked? (*bivariate: two variables*)
4. Finally you write down **what you learned** — and what you’re still unsure about.
`,
      technical: md`
### Workflow
1. **Frame questions** (from stakeholders or the project goal).
2. **Univariate:** distributions of each variable — numeric (\`describe\`, histograms, box plots, skew), categorical (\`value_counts\`, bar charts).
3. **Bivariate:**
   - numeric × numeric → scatter plot, correlation;
   - categorical × numeric → grouped summaries (\`groupby().agg\`), box plots;
   - categorical × categorical → \`crosstab\` (with \`normalize\`), stacked bars.
4. **Multivariate:** correlation matrices/heatmaps, pivot tables, colour/facets in plots, segmenting by a third variable (to detect confounding/Simpson’s paradox).
5. **Time:** trends, seasonality, structural breaks (resample/rolling means).
6. **Conclusions:** state findings with numbers, uncertainty and limitations; list next steps.

### Simpson’s paradox
A trend can reverse when data is split by a third variable. Always check key relationships within important subgroups.

### Responsible interpretation
- EDA finds **associations**, not causes.
- Many comparisons → some “patterns” are chance. Confirm important findings on new data or with tests (Module 4).
- Report sample sizes for every group (“churn is 45% among 660 monthly customers”).
`,
      terms: [
        ['EDA', 'Exploratory Data Analysis: summarising and visualising to understand data.'],
        ['Univariate analysis', 'Examining one variable at a time.'],
        ['Bivariate analysis', 'Examining relationships between two variables.'],
        ['Multivariate analysis', 'Examining three or more variables together.'],
        ['Simpson’s paradox', 'A trend that reverses when data is split into groups.'],
        ['Seasonality', 'Regular repeating patterns over time (weekly, yearly).'],
      ],
      realWorld: md`
EDA of the telecom churn dataset (\`data/churn.csv\`) reveals: churn is about 33% overall; it is dramatically higher for **month-to-month** contracts; churners have **shorter tenure** and make **more support calls**; tech support subscribers churn less. These findings become (1) immediate business recommendations — incentivise annual contracts, improve support — and (2) features for the churn model you’ll build in Module 12.
`,
      steps: [
        'Write 3–5 questions you want the data to answer.',
        'Univariate: summarise and plot every important variable.',
        'Bivariate: relate each candidate driver to the target/outcome.',
        'Multivariate: check key relationships within subgroups; build a correlation matrix.',
        'Write conclusions: finding + evidence (numbers) + caveat + recommended action.',
      ],
      code: [
        {
          title: 'Structured EDA of the churn dataset',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("data/churn.csv")
df["churned"] = (df["churn"] == "Yes").astype(int)

print("Q1 overall churn rate:", round(df["churned"].mean(), 3), "n =", len(df))
print("\nQ2 churn by contract:")
print(df.groupby("contract")["churned"].agg(rate="mean", n="size").round(3))

print("\nQ3 numeric drivers (mean by churn):")
print(df.groupby("churn")[["tenure_months", "monthly_charges", "support_calls"]].mean().round(1))

print("\nQ4 within contract type, does tech support matter?")
print(df.pivot_table(values="churned", index="contract", columns="tech_support", aggfunc="mean").round(3))

fig, ax = plt.subplots(1, 3, figsize=(12, 3.2))
df.groupby("contract")["churned"].mean().plot.bar(ax=ax[0], color="#6366f1", title="Churn rate by contract")
df.boxplot(column="tenure_months", by="churn", ax=ax[1], grid=False)
ax[1].set_title("Tenure by churn"); fig.suptitle("")
df.groupby("support_calls")["churned"].mean().plot(ax=ax[2], marker="o", title="Churn rate vs support calls")
plt.tight_layout(); plt.show()

print("\ncorrelations with churn:")
print(df[["tenure_months", "monthly_charges", "support_calls", "total_charges", "churned"]].corr()["churned"].round(2).sort_values())
`,
          explanation: [
            '…',
            '…',
            'Load the data.',
            'A numeric 0/1 target makes rates easy (mean = rate).',
            '…',
            'Question 1: how big is the problem? (about one-third churn).',
            'Question 2: categorical × target…',
            '…rate and group size (always report n).',
            '…',
            'Question 3: numeric × target — compare means between churners and non-churners.',
            '…',
            '…',
            'Question 4: multivariate — the tech-support effect **within** each contract type (guards against confounding).',
            '…',
            'Three charts side by side:',
            'bar chart of churn rates,',
            'box plot of tenure by churn,',
            '…',
            'line chart of churn rate by number of support calls (a dose-response pattern).',
            '…',
            '…',
            'Correlation of each numeric variable with the 0/1 churn indicator, sorted.',
          ],
        },
        {
          title: 'Time patterns in the pandemic dataset',
          code: md`
import pandas as pd
import matplotlib.pyplot as plt

cv = pd.read_csv("data/pandemic_cases.csv", parse_dates=["date"])
cv["cases_per_100k"] = cv["new_cases"] / cv["population"] * 100_000
print("missing case reports:", cv["new_cases"].isna().sum())

daily = cv.pivot_table(index="date", columns="country", values="cases_per_100k")
weekly = daily.rolling(7, min_periods=5).mean()
weekly.plot(figsize=(9, 3.5), title="7-day average new cases per 100k")
plt.ylabel("cases / 100k"); plt.show()

print("peak date per country:\n", weekly.idxmax().dt.date)
dow = cv.groupby(cv["date"].dt.day_name())["cases_per_100k"].mean()
print("\nreporting by weekday:\n", dow.reindex(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).round(2))
`,
          explanation: [
            '…',
            '…',
            'Synthetic COVID-style data for 5 fictional countries.',
            'Normalise by population so countries are comparable.',
            'Note the reporting gaps.',
            'Reshape: one column per country, one row per date.',
            'A 7-day rolling mean smooths weekly reporting noise (pandas skips NaNs; `min_periods` tolerates gaps).',
            'Plot the waves.',
            '…',
            'Date of each country’s highest 7-day average.',
            'Average by weekday reveals weekend under-reporting — a data-collection artefact, not a real pattern!',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Plotting everything without questions.', fix: 'Start from explicit questions; let findings generate new ones.' },
        { mistake: 'Reporting group rates without sample sizes.', fix: 'Always show n per group; small groups are noisy.' },
        { mistake: 'Treating patterns as causal or confusing collection artefacts with real behaviour.', fix: 'Consider confounders and how data was recorded (e.g. weekend reporting).' },
        { mistake: 'Ignoring subgroup reversals (Simpson’s paradox).', fix: 'Check key relationships within important segments.' },
      ],
      exercises: [
        {
          id: 'eda4-ex1', title: 'Pass rate by attendance band', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`In \`data/students.csv\`, bin \`attendance_pct\` into bands with \`pd.cut(..., bins=[0, 75, 85, 95, 100])\` and compute \`pass_rate\`: the fraction with \`passed == "yes"\` per band (a Series).`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/students.csv")
pass_rate = None
print(pass_rate)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/students.csv")
df["band"] = pd.cut(df["attendance_pct"], bins=[0, 75, 85, 95, 100])
pass_rate = (df["passed"] == "yes").groupby(df["band"], observed=True).mean()
print(pass_rate)
`,
          tests: md`
_d = pd.read_csv("data/students.csv")
_b = pd.cut(_d.attendance_pct, bins=[0, 75, 85, 95, 100])
_e = (_d.passed == "yes").groupby(_b, observed=True).mean()
assert pass_rate is not None and len(pass_rate) == len(_e), "One value per attendance band"
assert (pass_rate.values - _e.values).__abs__().max() < 1e-9, f"Got {pass_rate}"
`,
          hints: ['Create the band column with `pd.cut`.', 'Group the boolean `passed == "yes"` by band and take the mean.'],
        },
        {
          id: 'eda4-ex2', title: 'Highest-revenue month', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Find the calendar **month number** (1–12) with the highest total revenue across both years in \`data/sales.csv\`. Store it in \`best_month\` (an int).`,
          starter: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
best_month = 0
print(best_month)
`,
          solution: md`
import pandas as pd
sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
by_month = sales.groupby(sales["order_date"].dt.month)["revenue"].sum()
best_month = int(by_month.idxmax())
print(by_month.round(0))
print(best_month)
`,
          tests: md`
_s = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
assert best_month == int(_s.groupby(_s.order_date.dt.month).revenue.sum().idxmax()), f"Got {best_month}"
`,
          hints: ['Group by `order_date.dt.month`.', '`.idxmax()` returns the month with the largest sum.'],
        },
        {
          id: 'eda4-ex3', title: 'Write a conclusion', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`EDA shows customers with 4+ support calls churn at 55% vs 25% for others. Can you conclude that support calls **cause** churn? (yes/no)`,
          solution: 'no', accepted: ['no'],
          hints: ['Unhappy customers may call more AND churn more — an association, possibly with a common cause.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which plot fits numeric × numeric bivariate analysis?', options: ['Bar chart', 'Scatter plot', 'Pie chart', 'Histogram'], answer: 1, explanation: 'Scatter plots show the relationship between two numeric variables.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why compare tech support’s effect within each contract type?', options: ['To make more charts', 'To check the relationship isn’t driven by a confounder (contract type)', 'Because pandas requires it', 'To remove outliers'], answer: 1, explanation: 'Segmenting controls for a third variable.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Reported cases are lower every weekend. The most likely explanation is…', options: ['The virus rests at weekends', 'A reporting artefact', 'Seasonality of the climate', 'Random noise only'], answer: 1, explanation: 'Data collection processes create patterns too.' },
        { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'Simpson’s paradox refers to…', options: ['A trend that reverses when data is split by a third variable', 'A normal distribution with two peaks', 'Overfitting', 'A biased sample'], answer: 0, explanation: 'Aggregated and subgroup trends can disagree.' },
        { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'A good EDA conclusion includes…', options: ['Only a chart', 'The finding, numeric evidence, caveats and a recommended action', 'The code only', 'A causal claim'], answer: 1, explanation: 'Actionable, evidence-based and honest about limitations.' },
      ],
      summary: [
        'EDA: questions → univariate → bivariate → multivariate → time → conclusions.',
        'Match summaries/plots to variable types.',
        'Check subgroups for confounding; report sample sizes.',
        'Conclusions = finding + evidence + caveat + action; association ≠ causation.',
      ],
      resources: [{ label: 'Kaggle — Data Visualization & EDA notebooks', url: 'https://www.kaggle.com/learn/data-visualization' }, PDA],
    },
  ],
};
