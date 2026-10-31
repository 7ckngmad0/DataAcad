import type { Module } from '../types.ts';
import { md } from './md.ts';
import { ethicsLesson } from './foundations.ts';

export const m01: Module = {
  id: 'intro',
  number: 1,
  title: 'Introduction to Data Science',
  short: 'Intro to DS',
  icon: 'compass',
  description:
    'What Data Science is, what data looks like, how a data project flows from question to decision, the roles in the field, the tools you will use, and how to work with data ethically and lawfully.',
  skills: ['Data literacy', 'DS lifecycle', 'Data types', 'Career roles', 'Tooling overview', 'Data ethics & privacy'],
  lessons: [
    {
      id: 'what-is-data-science',
      title: 'What is Data Science?',
      minutes: 25,
      difficulty: 'beginner',
      objectives: [
        'Define Data Science in your own words',
        'Explain the difference between data, information and insight',
        'Describe the seven stages of the Data Science lifecycle',
        'Recognise the three ingredients of Data Science: programming, statistics and domain knowledge',
      ],
      intro: md`
Every time Netflix recommends a show, your bank blocks a suspicious payment, or a map app predicts your arrival time, **Data Science** is at work.

Data Science is the practice of **turning raw data into useful knowledge and decisions**. It combines programming (to handle data at scale), mathematics and statistics (to reason about uncertainty) and *domain knowledge* (to ask the right questions and understand the answers).

In this lesson you will build a mental map of the whole field so that every later lesson has a place to “click into”.
`,
      simple: md`
Imagine you run a small coffee shop. You write down every sale in a notebook: the time, what was bought and the price. That notebook is **data**.

One evening you go through it and notice: *“We sell twice as many iced drinks after 2 pm.”* That observation is **information**.

You then decide: *“Let’s prepare extra ice and an extra barista every afternoon.”* That decision, backed by evidence, is an **insight** turned into **action**.

Data Science is doing exactly this — but with millions of rows, using code, and with careful methods to make sure the patterns you find are real and not luck.
`,
      technical: md`
A common definition: *Data Science is an interdisciplinary field that uses scientific methods, processes, algorithms and systems to extract knowledge and insights from structured and unstructured data.*

It sits at the intersection of three areas (often drawn as a Venn diagram):

| Ingredient | What it contributes | Examples |
|---|---|---|
| **Computer science / programming** | Collecting, storing, cleaning and processing data at scale | Python, SQL, pandas, cloud tools |
| **Mathematics & statistics** | Quantifying uncertainty, testing ideas, building models | probability, regression, hypothesis tests |
| **Domain expertise** | Asking meaningful questions and interpreting results | knowing why customers churn, how hospitals work |

Data Science projects follow a **lifecycle** (variants include CRISP-DM and OSEMN):

1. **Ask** – define the question and the success metric.
2. **Collect** – obtain data (databases, APIs, files, surveys, sensors).
3. **Clean** – handle missing values, duplicates, wrong types, errors.
4. **Explore** – summarise and visualise (Exploratory Data Analysis, EDA).
5. **Model** – build statistical or machine-learning models.
6. **Evaluate** – check accuracy, fairness and whether the question is answered.
7. **Communicate & deploy** – present findings, put models into production, monitor them.

The process is **iterative**: what you learn in later stages often sends you back to earlier ones.

Data Science answers four kinds of questions, in increasing difficulty:

- **Descriptive** – *What happened?* (sales fell 8% last quarter)
- **Diagnostic** – *Why did it happen?* (a competitor opened nearby)
- **Predictive** – *What will happen?* (next month's sales forecast)
- **Prescriptive** – *What should we do?* (which promotion maximises profit)
`,
      terms: [
        ['Data', 'Recorded facts or measurements, e.g. numbers, text, images, clicks.'],
        ['Information', 'Data that has been organised or summarised so it has meaning (e.g. “average sale is $4.20”).'],
        ['Insight', 'An understanding that can guide a decision (e.g. “afternoon iced-drink demand justifies an extra barista”).'],
        ['Dataset', 'A collection of related data, usually a table of rows (observations) and columns (variables).'],
        ['Data Science lifecycle', 'The repeating sequence: ask → collect → clean → explore → model → evaluate → communicate.'],
        ['EDA', 'Exploratory Data Analysis: summarising and visualising data to understand it before modelling.'],
        ['Model', 'A simplified mathematical description of a process, used to explain or predict (e.g. a line predicting price from size).'],
        ['Domain knowledge', 'Expertise about the field the data comes from (medicine, retail, finance...).'],
      ],
      realWorld: md`
**Hospital readmissions.** A hospital notices that 18% of heart-failure patients return within 30 days, which is costly and bad for patients.

- *Ask:* Which patients are at high risk of readmission, so nurses can follow up?
- *Collect:* Electronic health records — age, diagnoses, medications, length of stay, previous visits.
- *Clean:* Fix inconsistent medication names, handle missing lab results.
- *Explore:* Readmission is much higher for patients discharged on Fridays and those with more than 5 medications.
- *Model:* A logistic regression predicts each patient's readmission risk.
- *Evaluate:* On patients the model has never seen, it identifies 70% of readmissions among the top 20% highest-risk.
- *Communicate:* Nurses receive a daily list of high-risk patients for follow-up calls; readmissions drop to 14%.
`,
      steps: [
        'Start with a **question**, not with data or algorithms. A vague goal (“use AI”) produces vague results.',
        'Decide how you will **measure success** (e.g. “reduce readmissions by 3 percentage points”).',
        'Find the **data** that could answer the question and check its quality.',
        'Clean and **explore** it — most of the real work and many insights happen here.',
        'Only then **model**, **evaluate** honestly, and **communicate** in the language of the audience.',
      ],
      widgets: ['lifecycle'],
      code: [
        {
          title: 'Your first look at a dataset',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv")
print("Rows and columns:", sales.shape)
print("Total revenue: $", round(sales["revenue"].sum(), 2))
sales.head()
`,
          explanation: [
            '`import pandas as pd` loads **pandas**, the most popular Python library for tables. `pd` is the conventional short name.',
            '`pd.read_csv("data/sales.csv")` reads a CSV file (comma-separated values) into a table called a **DataFrame**.',
            '`sales.shape` gives *(number of rows, number of columns)*. This is **descriptive** analysis: what does the data contain?',
            '`sales["revenue"].sum()` selects one column and adds it up — information extracted from raw data.',
            '`sales.head()` shows the first 5 rows. Don’t worry about the details yet — Module 5 teaches pandas fully.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Jumping straight to machine learning before understanding the data.', fix: 'Spend time on cleaning and EDA first. Many questions are answered by a good chart.' },
        { mistake: 'Starting with “What can we do with this data?”', fix: 'Start with a concrete business or research question and a success metric.' },
        { mistake: 'Believing Data Science is only about algorithms.', fix: 'Communication, data quality and domain understanding usually decide whether a project succeeds.' },
      ],
      exercises: [
        {
          id: 'intro-1-ex1',
          title: 'Run your first line of Python',
          type: 'write',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`Use \`print()\` to display exactly the text \`Hello, Data Science!\``,
          starter: md`# Write your code below
`,
          solution: md`print("Hello, Data Science!")`,
          tests: md`assert _out.strip() == "Hello, Data Science!", f"Expected the output 'Hello, Data Science!' but got {_out.strip()!r}"`,
          hints: ['Text in Python goes inside quotes: `"like this"`.', 'Put the text inside the parentheses of `print( )`.'],
        },
        {
          id: 'intro-1-ex2',
          title: 'Count the rows',
          type: 'dataset',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`The file \`data/students.csv\` contains one row per student. Load it with pandas and store the **number of students** in a variable called \`n_students\`. *(Hint: \`len(df)\` gives the number of rows.)*`,
          starter: md`
import pandas as pd

df = pd.read_csv("data/students.csv")
n_students = ___
print(n_students)
`,
          solution: md`
import pandas as pd

df = pd.read_csv("data/students.csv")
n_students = len(df)
print(n_students)
`,
          tests: md`assert n_students == 120, f"n_students should be 120, got {n_students}"`,
          hints: ['Replace the `___` with an expression.', '`len(df)` returns how many rows a DataFrame has.'],
        },
        {
          id: 'intro-1-ex3',
          title: 'Which lifecycle stage?',
          type: 'predict',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`An analyst notices 2,000 duplicate customer records and removes them. Which lifecycle stage is this? (one word)`,
          solution: 'Clean',
          accepted: ['clean', 'cleaning', 'data cleaning'],
          hints: ['Which stage deals with errors, duplicates and missing values?'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which best describes Data Science?', options: ['Writing software for websites', 'Turning raw data into knowledge and decisions using programming, statistics and domain knowledge', 'Storing data in databases', 'Building computer hardware'], answer: 1, explanation: 'Data Science combines programming, statistics and domain knowledge to extract insight and support decisions.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'What usually comes **first** in a Data Science project?', options: ['Training a model', 'Choosing an algorithm', 'Defining the question and success metric', 'Building a dashboard'], answer: 2, explanation: 'Everything depends on the question. Without a clear question you cannot judge which data or model is useful.' },
        { id: 'q3', kind: 'mcq', difficulty: 'beginner', prompt: '“Next month we expect 1,240 orders.” Which type of analysis is this?', options: ['Descriptive', 'Diagnostic', 'Predictive', 'Prescriptive'], answer: 2, explanation: 'Statements about the future are predictive. “What happened” is descriptive; “why” is diagnostic; “what should we do” is prescriptive.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why is the lifecycle described as *iterative*?', options: ['Because you repeat the same model many times', 'Because findings in later stages often send you back to earlier stages', 'Because data is always collected daily', 'Because the steps can be done in any random order'], answer: 1, explanation: 'Evaluation may reveal missing data or a poorly defined question, so you loop back.' },
        { id: 'q5', kind: 'text', difficulty: 'beginner', prompt: 'What does the abbreviation **EDA** stand for?', accepted: ['exploratory data analysis'], explanation: 'EDA = Exploratory Data Analysis: summarising and visualising data to understand it.' },
      ],
      summary: [
        'Data Science turns **data → information → insight → action**.',
        'It combines **programming**, **math/statistics** and **domain knowledge**.',
        'Projects follow an iterative lifecycle: ask, collect, clean, explore, model, evaluate, communicate.',
        'Questions can be descriptive, diagnostic, predictive or prescriptive.',
      ],
      resources: [
        { label: 'CRISP-DM (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Cross-industry_standard_process_for_data_mining' },
        { label: 'Harvard Data Science Review', url: 'https://hdsr.mitpress.mit.edu/' },
        { label: 'Kaggle Learn – free micro-courses', url: 'https://www.kaggle.com/learn' },
      ],
    },
    {
      id: 'types-of-data',
      title: 'Types of Data: Structured, Unstructured, Numerical & Categorical',
      minutes: 30,
      difficulty: 'beginner',
      objectives: [
        'Distinguish structured, semi-structured and unstructured data',
        'Classify variables as numerical (discrete/continuous) or categorical (nominal/ordinal)',
        'Explain why the data type determines which analyses and charts are valid',
        'Identify rows (observations) and columns (variables/features) in a table',
      ],
      intro: md`
Before you can analyse data you must know **what kind** of data you have. Averaging zip codes or drawing a line chart of blood types produces nonsense. Knowing the data type tells you which summaries, charts and models make sense.
`,
      simple: md`
Think of a school register:

- Each **row** is one student (an *observation*).
- Each **column** is one fact about the students (a *variable*): name, age, class, grade.

Some columns contain **numbers you can do math with** (age, test score). Others contain **labels or groups** (class “A”, “B”, “C”). Some labels have an order (grade “Excellent > Good > Fair”), others don’t (favourite colour).

And some data doesn’t fit in a table at all — like the photos in the yearbook or the comments teachers wrote. That's **unstructured** data.
`,
      technical: md`
### By structure
| Type | Description | Examples |
|---|---|---|
| **Structured** | Fixed schema of rows and columns | spreadsheets, SQL tables, CSV files |
| **Semi-structured** | Self-describing tags/keys but flexible schema | JSON, XML, log files, emails (headers + body) |
| **Unstructured** | No predefined model | free text, images, audio, video |

Roughly 80% of the world’s data is unstructured, but most entry-level analysis work happens on structured data.

### By measurement (statistical data types)
- **Numerical (quantitative)** — arithmetic is meaningful.
  - *Discrete*: countable values, usually integers (number of children, page visits).
  - *Continuous*: any value in a range (height, temperature, time).
- **Categorical (qualitative)** — values are labels/groups.
  - *Nominal*: no natural order (country, payment method, blood type).
  - *Ordinal*: ordered categories, but distances between them are not defined (S < M < L; “poor < fair < good”).

A finer classification also distinguishes **interval** (differences meaningful, no true zero — °C) and **ratio** (true zero — kg, $) numeric scales.

### Tidy data
A dataset is **tidy** when (1) each variable is a column, (2) each observation is a row, (3) each value is a cell. Most tools (pandas, SQL, scikit-learn) expect tidy data.

### In Python/pandas
pandas stores each column with a **dtype**: \`int64\`, \`float64\` (numbers), \`object\`/\`string\` (text), \`bool\`, \`datetime64\`, \`category\`. A numeric-looking column stored as text (e.g. \`"1,450.00"\`) must be converted before you can do math.
`,
      terms: [
        ['Observation (row)', 'One unit being measured: a customer, a transaction, a day.'],
        ['Variable (column / feature)', 'A characteristic measured on every observation.'],
        ['Structured data', 'Data organised in a fixed table schema.'],
        ['Unstructured data', 'Data without a predefined structure: text, images, audio.'],
        ['Numerical – discrete', 'Countable numbers, e.g. number of purchases.'],
        ['Numerical – continuous', 'Measurable numbers that can take any value in a range, e.g. weight.'],
        ['Categorical – nominal', 'Unordered labels, e.g. city.'],
        ['Categorical – ordinal', 'Ordered labels, e.g. satisfaction level.'],
        ['dtype', 'The data type pandas assigns to a column (int64, float64, object, bool, datetime64...).'],
      ],
      realWorld: md`
An e-commerce company’s data includes:

- **Structured:** the \`orders\` table — order_id (identifier), order_date (datetime), quantity (discrete), price (continuous), payment_method (nominal), shipping_speed “standard < express < same-day” (ordinal).
- **Semi-structured:** JSON events from the mobile app: \`{"event": "add_to_cart", "product": 123, "ts": "..."}\`.
- **Unstructured:** product photos and customer review text.

An analyst calculating *average order value* uses the continuous \`price\` column; a chart of *orders by payment method* uses a bar chart of the nominal column; sentiment analysis of reviews needs NLP (Module 11).
`,
      steps: [
        'Look at a column and ask: **is it a number or a label?**',
        'If it is a number, ask: **is it counted (discrete) or measured (continuous)?**',
        'If it is a label, ask: **do the labels have a natural order?** (ordinal) or not (nominal).',
        'Beware of **numbers that are really labels**: zip codes, phone numbers, product IDs. Averaging them is meaningless.',
        'Check the type your tool assigned (in pandas: `df.dtypes`) and convert if needed.',
      ],
      widgets: ['data-type-sorter'],
      code: [
        {
          title: 'Inspect the data types of a real dataset',
          code: md`
import pandas as pd

students = pd.read_csv("data/students.csv")
print(students.dtypes)
print()
print("Unique genders:", students["gender"].unique())
print("Average study hours:", round(students["study_hours_week"].mean(), 2))
`,
          explanation: [
            'Load the students dataset into a DataFrame.',
            '`students.dtypes` lists each column with the type pandas inferred: `int64` (whole numbers), `float64` (decimals), `object` (text).',
            '`print()` with nothing inside prints an empty line for readability.',
            '`.unique()` lists the distinct values of a categorical column — `gender` is nominal.',
            '`.mean()` only makes sense for numerical columns; `study_hours_week` is continuous.',
          ],
        },
        {
          title: 'Semi-structured data: JSON',
          code: md`
import json

event = '{"user": 42, "action": "add_to_cart", "items": [{"sku": "A1", "qty": 2}]}'
data = json.loads(event)
print(type(data))
print(data["action"])
print(data["items"][0]["qty"])
`,
          explanation: [
            '`json` is Python’s built-in module for JSON, a common semi-structured format.',
            'This string looks like nested key-value pairs — typical of app events and web APIs.',
            '`json.loads()` (load **s**tring) converts JSON text into Python dictionaries and lists.',
            '`type(data)` shows it is a `dict` (dictionary).',
            'We access values by key: `data["action"]`.',
            'Nested data: `items` is a list; `[0]` takes the first item, then `["qty"]` its quantity.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Computing the average of an ID column, zip code or phone number.', fix: 'Identifiers are labels even when they contain digits. Treat them as categorical (or ignore them).' },
        { mistake: 'Treating ordinal data as if the gaps were equal (e.g. assuming “good − fair = fair − poor”).', fix: 'Use medians, counts or ordinal-aware methods; be explicit when you convert ordinal labels to numbers.' },
        { mistake: 'Not checking `dtypes` after loading — numbers stored as text silently break calculations.', fix: 'Always run `df.dtypes` (or `df.info()`) right after loading data.' },
      ],
      exercises: [
        {
          id: 'intro-2-ex1',
          title: 'Classify a variable',
          type: 'predict',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`A survey asks: *“How satisfied are you? (Very unsatisfied, Unsatisfied, Neutral, Satisfied, Very satisfied)”*. Is this variable **nominal** or **ordinal**?`,
          solution: 'ordinal',
          accepted: ['ordinal', 'categorical ordinal', 'ordinal categorical'],
          hints: ['Do the answer options have a natural order from worst to best?'],
        },
        {
          id: 'intro-2-ex2',
          title: 'Find the numeric columns',
          type: 'dataset',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`Load \`data/houses.csv\`. Create a list called \`numeric_cols\` containing the names of all **numeric** columns. Use \`df.select_dtypes(include="number").columns\` and convert it to a list with \`list(...)\`.`,
          starter: md`
import pandas as pd

df = pd.read_csv("data/houses.csv")
numeric_cols = ___
print(numeric_cols)
`,
          solution: md`
import pandas as pd

df = pd.read_csv("data/houses.csv")
numeric_cols = list(df.select_dtypes(include="number").columns)
print(numeric_cols)
`,
          tests: md`
assert isinstance(numeric_cols, list), "numeric_cols should be a list"
assert "neighborhood" not in numeric_cols, "neighborhood is text, not numeric"
assert set(numeric_cols) == {"house_id", "area_sqft", "bedrooms", "bathrooms", "age_years", "garage_spaces", "distance_to_center_km", "price"}, f"Unexpected columns: {numeric_cols}"
`,
          hints: ['`df.select_dtypes(include="number")` returns only numeric columns.', 'Use `.columns` to get their names and wrap it in `list( )`.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which of these is **unstructured** data?', options: ['A CSV of sales', 'A SQL table of customers', 'A folder of customer-review text and product photos', 'An Excel budget'], answer: 2, explanation: 'Free text and images have no predefined row/column schema.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'The number of items in a shopping cart is…', options: ['Continuous numerical', 'Discrete numerical', 'Nominal categorical', 'Ordinal categorical'], answer: 1, explanation: 'You count items (0, 1, 2...), so it is discrete.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'A column of postal codes like 1000, 6000, 8000 is best treated as…', options: ['Continuous numerical', 'Discrete numerical', 'Categorical (nominal)', 'Ordinal'], answer: 2, explanation: 'Postal codes identify places. Arithmetic on them (e.g. the average) has no meaning.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'In a tidy dataset, each **row** represents…', options: ['A variable', 'An observation', 'A data type', 'A chart'], answer: 1, explanation: 'Rows are observations; columns are variables.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'JSON from a web API is an example of…', options: ['Structured data', 'Semi-structured data', 'Unstructured data', 'Ordinal data'], answer: 1, explanation: 'JSON has keys/tags describing the data, but a flexible (non-tabular) structure.' },
        { id: 'q6', kind: 'text', difficulty: 'beginner', prompt: 'Which pandas attribute lists the data type of every column? (write it like `df.something`)', accepted: ['df.dtypes', 'dtypes'], explanation: '`df.dtypes` shows each column’s dtype; `df.info()` also shows them plus non-null counts.' },
      ],
      summary: [
        'Structured (tables), semi-structured (JSON/XML), unstructured (text, images, audio).',
        'Numerical = discrete or continuous; categorical = nominal or ordinal.',
        'Identifiers with digits are still categorical.',
        'Always check `df.dtypes` after loading data.',
      ],
      resources: [
        { label: 'Tidy Data — Hadley Wickham (paper)', url: 'https://vita.had.co.nz/papers/tidy-data.pdf' },
        { label: 'pandas: dtypes', url: 'https://pandas.pydata.org/docs/user_guide/basics.html#dtypes' },
      ],
    },
    {
      id: 'roles-and-applications',
      title: 'Data Roles & Real-World Applications',
      minutes: 20,
      difficulty: 'beginner',
      objectives: [
        'Compare the responsibilities of Data Analysts, Data Scientists and Data Engineers',
        'Name the core skills and tools for each role',
        'Describe Data Science applications across industries',
        'Plan which skills to prioritise for an internship',
      ],
      intro: md`
“Data jobs” is not one job. Companies hire different specialists who work together along the data pipeline. Understanding the roles helps you target the right internships and focus your learning.
`,
      simple: md`
Think of a restaurant:

- The **Data Engineer** builds the kitchen and the supply chain — making sure fresh ingredients (data) arrive reliably and are stored properly.
- The **Data Analyst** is like the manager reading last week’s sales reports to decide the menu — answering *“what happened and why?”*
- The **Data Scientist** is the chef experimenting with new recipes — building models that *predict* what customers will order and recommend dishes.
- The **ML Engineer** turns the chef’s best recipe into a reliable, fast production line that serves thousands of customers.
`,
      technical: md`
| | **Data Analyst** | **Data Scientist** | **Data Engineer** |
|---|---|---|---|
| Main question | What happened? Why? | What will happen? What should we do? | How do we reliably move and store data? |
| Typical output | Reports, dashboards, ad-hoc analyses | Models, experiments, forecasts | Pipelines, data warehouses, APIs |
| Core tools | SQL, Excel, Power BI/Tableau, Python (pandas) | Python, SQL, statistics, scikit-learn, notebooks | SQL, Python, Spark, Airflow, cloud (AWS/GCP/Azure) |
| Math level | Descriptive statistics | Statistics, probability, linear algebra, ML | Less math, more software engineering |

Related roles: **ML Engineer** (deploys and scales models), **Analytics Engineer** (models data in the warehouse, e.g. with dbt), **BI Developer**, **Research Scientist**.

**Entry path.** Many people start as **Data Analysts** (strong SQL + visualisation + communication) and move into Data Science as their statistics and ML skills grow. Internship interviews typically test SQL, Python/pandas, basic statistics, and how you explain a past project.

### Applications by industry
- **Retail & e-commerce:** recommendations, demand forecasting, pricing, customer segmentation.
- **Finance:** fraud detection, credit scoring, algorithmic trading, risk.
- **Healthcare:** diagnosis from images, readmission prediction, drug discovery.
- **Transport:** route optimisation, ETA prediction, ride-sharing pricing.
- **Marketing:** A/B testing, churn prediction, customer lifetime value.
- **Public sector:** epidemic tracking, traffic planning, fraud in benefits.
- **Sports:** player performance analytics, injury risk.
`,
      terms: [
        ['Data Analyst', 'Answers business questions with data; builds reports and dashboards.'],
        ['Data Scientist', 'Uses statistics and machine learning to predict and recommend.'],
        ['Data Engineer', 'Builds and maintains the systems that collect, store and move data.'],
        ['ML Engineer', 'Deploys machine-learning models into reliable production systems.'],
        ['Pipeline', 'An automated sequence of steps that moves and transforms data.'],
        ['A/B test', 'A controlled experiment comparing two versions (A and B) to see which performs better.'],
      ],
      realWorld: md`
**A ride-sharing app** uses all roles at once:

- Data Engineers stream millions of GPS pings per minute into a data lake.
- Data Analysts build a dashboard showing trips, cancellations and driver earnings by city.
- Data Scientists model *surge pricing* (predicting demand vs. supply) and *ETA*.
- ML Engineers serve the ETA model so every app request gets a prediction in < 100 ms.
`,
      steps: [
        'Read 10 job ads for “Data Analyst Intern” and “Data Science Intern” in your region.',
        'List the tools and skills that appear most often (usually: SQL, Python, Excel, statistics, a BI tool).',
        'Map them to this course: Module 2 & 5 (Python), 4 (statistics), 7 (visualisation), 8 (SQL), 9 (BI), 10 (ML).',
        'Plan 3 portfolio projects (Module 12) that demonstrate those skills on realistic data.',
      ],
      code: [
        {
          title: 'Which skills appear most in job ads?',
          code: md`
from collections import Counter

job_ads = [
    ["SQL", "Excel", "Power BI", "Python"],
    ["Python", "SQL", "Statistics", "Machine Learning"],
    ["SQL", "Tableau", "Excel"],
    ["Python", "pandas", "SQL", "Statistics"],
    ["Python", "Machine Learning", "SQL", "Cloud"],
]

counts = Counter(skill for ad in job_ads for skill in ad)
for skill, n in counts.most_common(5):
    print(f"{skill:18s} appears in {n} of {len(job_ads)} ads")
`,
          explanation: [
            '`Counter` (from the built-in `collections` module) counts how many times each item appears.',
            '`job_ads` is a **list of lists**: each inner list holds the skills from one ad.',
            'The expression `skill for ad in job_ads for skill in ad` walks through every skill in every ad (a generator expression — you’ll learn these in Module 2).',
            '`most_common(5)` returns the 5 most frequent skills with their counts.',
            'The f-string `f"{skill:18s}..."` pads the skill name to 18 characters so the output lines up.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Thinking you must master deep learning before applying for internships.', fix: 'Entry-level roles value solid SQL, Python, statistics and clear communication far more.' },
        { mistake: 'Ignoring data engineering and analyst roles.', fix: 'They are excellent entry points and build skills every data scientist needs.' },
      ],
      exercises: [
        {
          id: 'intro-3-ex1',
          title: 'Count skills',
          type: 'write',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`Given the list \`skills\`, create a variable \`sql_count\` with the number of times \`"SQL"\` appears. Lists have a \`.count(value)\` method.`,
          starter: md`
skills = ["SQL", "Python", "SQL", "Excel", "SQL", "Tableau", "Python"]
sql_count = 0  # change this line
print(sql_count)
`,
          solution: md`
skills = ["SQL", "Python", "SQL", "Excel", "SQL", "Tableau", "Python"]
sql_count = skills.count("SQL")
print(sql_count)
`,
          tests: md`assert sql_count == 3, f"Expected 3, got {sql_count}"`,
          hints: ['`my_list.count("x")` counts how many times "x" occurs.'],
        },
        {
          id: 'intro-3-ex2',
          title: 'Match the role',
          type: 'predict',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`A person builds a nightly pipeline that copies sales data from 40 stores into the central data warehouse. What is their most likely job title? (two words)`,
          solution: 'Data Engineer',
          accepted: ['data engineer', 'dataengineer'],
          hints: ['Which role builds the systems that move and store data?'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Who would most likely build a weekly sales dashboard in Power BI?', options: ['Data Engineer', 'Data Analyst', 'ML Engineer', 'Database administrator'], answer: 1, explanation: 'Reporting and dashboards are core Data Analyst responsibilities.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Predicting which customers will cancel next month is typical work for a…', options: ['Data Scientist', 'Data Engineer', 'Web designer', 'Network engineer'], answer: 0, explanation: 'Predictive modelling (churn prediction) is classic Data Science.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which skill is shared by almost all three roles (analyst, scientist, engineer)?', options: ['Deep learning', 'SQL', 'Photoshop', 'Tableau only'], answer: 1, explanation: 'SQL is the common language for querying data across all data roles.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'Fraud detection in banking is an example of…', options: ['A prediction/classification problem', 'Unstructured storage', 'Web development', 'Data entry'], answer: 0, explanation: 'Models classify transactions as fraudulent or legitimate.' },
      ],
      summary: [
        'Analysts explain the past, scientists predict and recommend, engineers build data infrastructure.',
        'SQL, Python and communication are valuable in every role.',
        'Data Science is used in every industry: retail, finance, healthcare, transport and more.',
      ],
      resources: [
        { label: 'Google Data Analytics Certificate (overview)', url: 'https://grow.google/certificates/data-analytics/' },
        { label: 'Kaggle — real datasets and competitions', url: 'https://www.kaggle.com/' },
      ],
    },
    {
      id: 'datasets-and-tools',
      title: 'Datasets & the Data Science Toolkit',
      minutes: 25,
      difficulty: 'beginner',
      objectives: [
        'Explain where datasets come from and how to judge their quality',
        'Read a CSV file and describe its shape, columns and first rows',
        'Know what each core tool is for: Python, Jupyter, pandas, NumPy, matplotlib, SQL, BI tools, Git',
        'Use this app’s playground and datasets',
      ],
      intro: md`
A **dataset** is the raw material of every analysis, and **tools** are how you work with it. This lesson gives you a tour of both so the rest of the course feels familiar.
`,
      simple: md`
A dataset is like a big spreadsheet. A good one is **relevant** (answers your question), **accurate**, **complete enough**, **recent** and **documented** (someone explains what each column means).

Your toolkit is like a workshop: **Python** is your multi-tool, **pandas** is the table saw for tabular data, **matplotlib/seaborn** are your paintbrushes for charts, **SQL** is how you ask a database for exactly the data you need, and **Jupyter notebooks** are your lab notebook where code, results and notes live together.
`,
      technical: md`
### Where data comes from
- **Internal databases** (company sales, users, logs) — queried with SQL.
- **Files:** CSV, Excel, JSON, Parquet.
- **APIs:** web services returning JSON (weather, finance, social media).
- **Public open data:** government portals, Kaggle, UCI ML Repository, World Bank.
- **Web scraping** (respect terms of service and robots.txt).
- **Surveys, experiments and sensors (IoT).**

### Data quality dimensions
**Accuracy** (correct values), **completeness** (few missing values), **consistency** (same thing written the same way), **timeliness** (up-to-date), **validity** (values in allowed ranges/formats), **uniqueness** (no duplicates).

### The toolkit
| Tool | Purpose |
|---|---|
| **Python** | General programming language — the main language of data science |
| **Jupyter Notebook / JupyterLab / Google Colab** | Interactive documents mixing code, output, charts and text |
| **NumPy** | Fast numerical arrays and math |
| **pandas** | Tables (DataFrames): load, clean, transform, aggregate |
| **matplotlib / seaborn** | Charts and statistical visualisation |
| **scikit-learn** | Machine learning |
| **SQL** (PostgreSQL, MySQL, SQLite...) | Query relational databases |
| **Excel / Google Sheets** | Quick analysis, still everywhere in business |
| **Power BI / Tableau** | Interactive dashboards for business users |
| **Git & GitHub** | Version control and sharing your portfolio |

### In this app
Every code box runs **real Python 3** (via Pyodide/WebAssembly) in your browser. The practice datasets are available as \`data/<file>.csv\`. See the **Coding Playground → Datasets** tab for descriptions and downloads. For heavy or GPU work you will later use Jupyter or Google Colab on your own machine.
`,
      terms: [
        ['CSV', 'Comma-Separated Values: a plain-text table where each line is a row and commas separate columns.'],
        ['API', 'Application Programming Interface: a way for programs to request data from a service.'],
        ['Data quality', 'How fit data is for its purpose: accuracy, completeness, consistency, timeliness, validity, uniqueness.'],
        ['Jupyter Notebook', 'An interactive document combining code cells, outputs and Markdown text.'],
        ['Library / package', 'Reusable code you import, e.g. pandas, NumPy.'],
        ['Data dictionary', 'Documentation describing each column: meaning, type, units, allowed values.'],
      ],
      realWorld: md`
A city government publishes **open data** on bicycle-share trips: a CSV per month with start/end station, time and duration, plus a *data dictionary*. A student downloads a year of data, discovers 3% of trips have negative durations (a data-quality issue caused by daylight-saving time changes), removes them, and shows that weekend usage doubled after new bike lanes opened — a nice portfolio project.
`,
      steps: [
        'Find the dataset and its documentation (data dictionary).',
        'Load it and check **shape** (rows × columns).',
        'Look at the **first rows** and **column types**.',
        'Check **missing values** and obvious errors.',
        'Write down the questions this dataset can (and cannot) answer.',
      ],
      code: [
        {
          title: 'First-look checklist for any dataset',
          code: md`
import pandas as pd

df = pd.read_csv("data/messy_customers.csv")

print("Shape:", df.shape)
print("\nColumns:", list(df.columns))
print("\nMissing values per column:")
print(df.isna().sum())
print("\nDuplicate rows:", df.duplicated().sum())
df.head()
`,
          explanation: [
            'Load a deliberately messy dataset (you will clean it fully in Module 6).',
            '`df.shape` → (rows, columns).',
            '`"\\n"` inside a string starts a new line, adding spacing to the output.',
            '`list(df.columns)` shows the column names.',
            '`df.isna()` marks missing cells as True; `.sum()` counts them per column (True counts as 1).',
            '`df.duplicated().sum()` counts rows that are exact copies of an earlier row.',
            '`df.head()` displays the first 5 rows so you can eyeball the values.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Trusting a dataset without reading its documentation.', fix: 'Find out how and when it was collected, the units, and what missing values mean.' },
        { mistake: 'Editing raw data files by hand.', fix: 'Keep raw data untouched; do all cleaning in code so it is reproducible.' },
      ],
      exercises: [
        {
          id: 'intro-4-ex1',
          title: 'Count missing values',
          type: 'dataset',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`Load \`data/messy_customers.csv\` and store the **total** number of missing cells in the whole table in \`total_missing\`. *Tip: \`df.isna().sum()\` gives one count per column; add \`.sum()\` again to get the grand total.*`,
          starter: md`
import pandas as pd

df = pd.read_csv("data/messy_customers.csv")
total_missing = ___
print(total_missing)
`,
          solution: md`
import pandas as pd

df = pd.read_csv("data/messy_customers.csv")
total_missing = df.isna().sum().sum()
print(total_missing)
`,
          tests: md`assert int(total_missing) == int(pd.read_csv("data/messy_customers.csv").isna().sum().sum()), "Not quite: count all missing cells across all columns."`,
          hints: ['`df.isna()` returns True/False for every cell.', 'Summing twice: first per column, then across columns.'],
        },
        {
          id: 'intro-4-ex2',
          title: 'Number of columns',
          type: 'dataset',
          lang: 'python',
          difficulty: 'beginner',
          prompt: md`Load \`data/sales.csv\` and store the number of **columns** in \`n_cols\`. Remember \`df.shape\` is a tuple \`(rows, columns)\` — index \`[1]\` is the second element.`,
          starter: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv")
n_cols = ___
`,
          solution: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv")
n_cols = sales.shape[1]
`,
          tests: md`assert n_cols == 10, f"sales.csv has 10 columns, got {n_cols}"`,
          hints: ['`sales.shape[0]` is the row count; what is `sales.shape[1]`?'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which tool is primarily used for working with tables (DataFrames) in Python?', options: ['matplotlib', 'pandas', 'Git', 'Tableau'], answer: 1, explanation: 'pandas provides the DataFrame for loading, cleaning and analysing tables.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'A dataset where the same city appears as “Manila”, “manila ” and “MANILA” has a problem with…', options: ['Timeliness', 'Consistency', 'Uniqueness', 'Volume'], answer: 1, explanation: 'The same value written different ways is a consistency problem.' },
        { id: 'q3', kind: 'mcq', difficulty: 'beginner', prompt: 'What is a Jupyter Notebook?', options: ['A database', 'A document mixing runnable code, outputs and text', 'A charting library', 'A programming language'], answer: 1, explanation: 'Notebooks combine code cells, their outputs and Markdown notes.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why should you avoid editing raw data files by hand?', options: ['It is slower', 'Changes are not reproducible or documented', 'Excel cannot open CSVs', 'Python cannot read edited files'], answer: 1, explanation: 'Cleaning in code creates a reproducible, reviewable record of every change.' },
        { id: 'q5', kind: 'text', difficulty: 'beginner', prompt: 'What does CSV stand for?', accepted: ['comma separated values', 'comma-separated values'], explanation: 'Comma-Separated Values — plain text tables.' },
      ],
      summary: [
        'Data comes from databases, files, APIs, open portals, scraping, surveys and sensors.',
        'Judge data quality: accuracy, completeness, consistency, timeliness, validity, uniqueness.',
        'Core tools: Python, Jupyter, pandas, NumPy, matplotlib/seaborn, scikit-learn, SQL, BI tools, Git.',
        'First look at any dataset: shape, columns, types, missing values, duplicates, first rows.',
      ],
      resources: [
        { label: 'UCI Machine Learning Repository', url: 'https://archive.ics.uci.edu/' },
        { label: 'data.gov — open government data', url: 'https://data.gov/' },
        { label: 'Google Colab (free notebooks)', url: 'https://colab.research.google.com/' },
      ],
    },
    ethicsLesson,
  ],
};
