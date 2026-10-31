import type { Module } from '../types.ts';
import { md } from './md.ts';

export const m12: Module = {
  id: 'portfolio',
  number: 12,
  title: 'Real-World Projects & Portfolio Development',
  short: 'Portfolio',
  icon: 'portfolio',
  description:
    'How to run a project end to end and present it professionally: project structure, reproducibility, Git & GitHub, READMEs, case-study write-ups, and preparing for internship applications and interviews. Then build the 11 guided projects in the Projects section.',
  skills: ['End-to-end workflow', 'Reproducibility', 'Git & GitHub', 'Project write-ups', 'Interview preparation'],
  lessons: [
    {
      id: 'portfolio-workflow',
      title: 'Running a Project End to End: Structure, Reproducibility & Git',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Apply a project workflow from question to communicated result',
        'Organise a project folder that others can understand and rerun',
        'Make work reproducible: environments, seeds, raw vs processed data, functions',
        'Use Git and GitHub to version and publish your work',
      ],
      intro: md`
Employers don’t just want to see that you can fit a model — they want evidence that you can deliver a **complete, trustworthy piece of work** that someone else could pick up. This lesson turns everything you have learned into a professional workflow you will use for every project in the Projects section.
`,
      simple: md`
A good project is like a good recipe book: anyone can open it, follow the steps and get the same dish.

- Keep the **raw ingredients** (original data) untouched.
- Write the **steps** as code and notebooks in order.
- Write down the **tools and versions** you used.
- Save every version of your work with **Git**, like “track changes” for code, and publish it on **GitHub** so employers can see it.
`,
      technical: md`
### Workflow (the lifecycle from Module 1, in practice)
1. **Frame:** question, stakeholder, decision, success metric, baseline.
2. **Data:** source, licence, data dictionary; profile and clean (Module 6).
3. **Explore:** EDA with documented findings.
4. **Model/analyse:** baseline first; validated comparisons (Module 10).
5. **Communicate:** report/dashboard with recommendations (Module 9).
6. **Package:** reproducible repo with README.

### Recommended structure
\`\`\`text
churn-prediction/
├── README.md            ← problem, results, how to run
├── requirements.txt     ← pinned package versions
├── data/
│   ├── raw/             ← original files (never edited)
│   └── processed/       ← outputs of cleaning code
├── notebooks/
│   ├── 01_eda.ipynb
│   └── 02_modeling.ipynb
├── src/
│   ├── clean.py         ← reusable functions
│   └── features.py
├── reports/
│   ├── figures/
│   └── report.md
└── .gitignore           ← excludes .venv, large data, secrets
\`\`\`

### Reproducibility checklist
- Virtual environment + \`requirements.txt\` (\`pip freeze > requirements.txt\`).
- Fixed random seeds (\`random_state=42\`).
- Raw → processed via code; no manual edits.
- Notebooks run top-to-bottom (Restart & Run All).
- Reusable logic in functions/modules; no hard-coded absolute paths.
- Secrets in environment variables, never committed.

### Git essentials
\`git init\` → \`git add .\` → \`git commit -m "Add EDA notebook"\` → create a GitHub repo → \`git remote add origin <url>\` → \`git push -u origin main\`. Commit small, meaningful steps; use branches for experiments; add a \`.gitignore\`. Large datasets: link to the source or use Git LFS rather than committing them.
`,
      terms: [
        ['Reproducibility', 'Others can rerun your work and get the same results.'],
        ['requirements.txt', 'File listing the packages (and versions) a project needs.'],
        ['Git', 'Version-control system tracking changes to files.'],
        ['Commit', 'A saved snapshot of changes with a message.'],
        ['GitHub', 'Website hosting Git repositories; your public portfolio.'],
        ['README', 'The front page of a repository explaining the project.'],
        ['.gitignore', 'List of files Git should not track (environments, secrets, big data).'],
      ],
      realWorld: md`
A hiring manager reviewing internship applicants opens two GitHub repos on the same churn problem. Repo A has one notebook named \`Untitled3.ipynb\` that crashes on cell 4. Repo B has a README with the business problem, a results table, a chart, and “how to run” instructions; the notebook runs top to bottom. Repo B’s author gets the interview — even though both models had similar accuracy.
`,
      steps: [
        'Create the folder structure and a virtual environment.',
        'Put raw data in data/raw and write cleaning code that outputs data/processed.',
        'Develop in numbered notebooks; move reusable code into src/.',
        'Commit to Git at each milestone; push to GitHub.',
        'Finish with a README, a report and Restart & Run All.',
      ],
      code: [
        {
          title: 'Make code reusable: a cleaning module with a reproducible entry point',
          code: md`
import pandas as pd
import numpy as np

RANDOM_STATE = 42

def load_raw(path):
    """Load the raw churn data without modifying the file."""
    return pd.read_csv(path)

def clean(df):
    """Return a cleaned copy: target as 0/1, an engineered feature, consistent types."""
    out = df.copy()
    out["y"] = (out["churn"] == "Yes").astype(int)
    out["charge_per_tenure_month"] = out["total_charges"] / out["tenure_months"].clip(lower=1)
    for col in ["contract", "internet_service", "tech_support", "paperless_billing"]:
        out[col] = out[col].astype("category")
    return out.drop(columns=["churn"])

def main():
    raw = load_raw("data/churn.csv")
    data = clean(raw)
    sample = data.sample(5, random_state=RANDOM_STATE)
    print(data.dtypes)
    print(sample[["customer_id", "contract", "y", "charge_per_tenure_month"]])
    return data

if __name__ == "__main__":
    processed = main()
`,
          explanation: [
            'In a real project this would live in `src/clean.py`.',
            'One constant for the random seed, reused everywhere → reproducible results.',
            '`load_raw` only reads; it never edits the raw file.',
            '`clean` works on a **copy** and documents what it does in its docstring.',
            'Target encoded as 0/1.',
            'An engineered feature; `clip(lower=1)` avoids division by zero for brand-new customers.',
            'Consistent dtypes for categorical columns.',
            'Drop the original text target.',
            '`main()` is the entry point: raw → clean → output (in a project you would also save `data/processed/churn_clean.parquet`).',
            'A seeded sample shows the same rows every run.',
            'The `if __name__ == "__main__":` guard runs `main()` only when the file is executed directly — importing `clean` from a notebook won’t trigger it.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Committing the virtual environment, API keys or huge datasets.', fix: 'Use .gitignore; store secrets in environment variables; link to data sources.' },
        { mistake: 'Notebooks that only work when run in a special order.', fix: 'Restart & Run All before every push.' },
        { mistake: 'Absolute paths like `C:\\Users\\me\\Desktop\\data.csv`.', fix: 'Use relative paths from the project root.' },
        { mistake: 'One giant commit at the end.', fix: 'Commit small, described steps as you go.' },
      ],
      exercises: [
        {
          id: 'pf1-ex1', title: 'A pure cleaning function', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Write \`clean_city(df)\` that returns a **new** DataFrame (the input must stay unchanged) where \`city\` is stripped and title-cased.`,
          starter: md`
import pandas as pd

def clean_city(df):
    df["city"] = df["city"].str.strip().str.title()
    return df

raw = pd.DataFrame({"city": [" manila", "CEBU "]})
print(clean_city(raw), raw, sep="\n")
`,
          solution: md`
import pandas as pd

def clean_city(df):
    out = df.copy()
    out["city"] = out["city"].str.strip().str.title()
    return out

raw = pd.DataFrame({"city": [" manila", "CEBU "]})
print(clean_city(raw), raw, sep="\n")
`,
          tests: md`
_r = pd.DataFrame({"city": [" manila", "CEBU "]})
_o = clean_city(_r)
assert _o["city"].tolist() == ["Manila", "Cebu"]
assert _r["city"].tolist() == [" manila", "CEBU "], "The input DataFrame must not be modified (work on a copy)"
`,
          hints: ['Start with `out = df.copy()` and modify `out`.'],
        },
        {
          id: 'pf1-ex2', title: 'Git command order', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`Which Git command saves a snapshot of the staged changes with a message? (just the two words, e.g. \`git xxx\`)`,
          solution: 'git commit', accepted: ['git commit', 'commit'],
          hints: ['add stages; ... saves; push uploads.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Where should original data files go?', options: ['Edited in place in data/', 'data/raw — never modified', 'Inside notebooks', 'Deleted after loading'], answer: 1, explanation: 'Raw data stays untouched; code produces processed data.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'What does requirements.txt provide?', options: ['The project report', 'The list of packages and versions needed to run the project', 'The dataset', 'Git history'], answer: 1, explanation: 'Others can recreate your environment.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which belongs in .gitignore?', options: ['README.md', 'src/clean.py', '.venv/ and .env', 'requirements.txt'], answer: 2, explanation: 'Environments and secrets should not be committed.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why set `random_state` everywhere?', options: ['Faster training', 'So results are reproducible', 'It improves accuracy', 'GitHub requires it'], answer: 1, explanation: 'Same seed → same splits and models.' },
      ],
      summary: [
        'Follow the lifecycle: frame → data → explore → model → communicate → package.',
        'Standard folder structure; raw data read-only; code produces processed data.',
        'Reproducibility: environments, seeds, functions, Restart & Run All, no secrets.',
        'Version with Git, publish on GitHub with a clear README.',
      ],
      resources: [{ label: 'Cookiecutter Data Science (project template)', url: 'https://cookiecutter-data-science.drivendata.org/' }, { label: 'GitHub Skills — Introduction to GitHub', url: 'https://skills.github.com/' }],
    },
    {
      id: 'portfolio-presenting',
      title: 'Presenting Projects, Building a Portfolio & Preparing for Internships',
      minutes: 35,
      difficulty: 'beginner',
      objectives: [
        'Write a portfolio README and project case study that hiring managers read',
        'Choose a balanced set of portfolio projects',
        'Describe projects on a CV with impact-focused bullets',
        'Prepare for common internship interview formats (SQL, Python, statistics, project walk-through)',
      ],
      intro: md`
A portfolio is your evidence. For internships and entry-level roles, 3–4 well-presented projects showing the full workflow often matter more than certificates. This lesson shows how to present them and how to prepare for the interviews they lead to.
`,
      simple: md`
Imagine a recruiter with 30 seconds per candidate. In that time your project should answer:
1. **What problem** did you solve, and for whom?
2. **What did you find or build?** (one number, one chart)
3. **How** did you do it? (tools, methods)
4. **Can I trust it?** (clean code, clear README)

Make the answers impossible to miss: put them at the top of the README.
`,
      technical: md`
### Portfolio mix (aim for 3–4 strong projects)
| Project type | Shows | From this course |
|---|---|---|
| Analysis + dashboard | SQL, pandas, visualisation, business sense | Retail Sales Dashboard |
| EDA + insights | cleaning, statistics, storytelling | Pandemic / Real-estate EDA |
| Supervised ML | modelling, validation, metrics | Churn or House Price Prediction |
| Something distinctive | curiosity, initiative | your own dataset (sports, local data, a hobby) |

Use **real public data** for at least one project (Kaggle, government portals) and pick a topic you can talk about with enthusiasm.

### README template
1. **Title + one-line summary** (“Predicting telecom churn to target retention offers — +\$X expected profit”).
2. **Business problem** (2–3 sentences).
3. **Key results** (a table/metric and the best chart).
4. **Approach** (data → cleaning → EDA → model → evaluation).
5. **How to run** (environment, commands).
6. **Limitations & next steps.**

### CV bullets: action + method + result
- ✗ “Did a churn project using Python.”
- ✓ “Built a churn model (logistic regression, ROC-AUC 0.82) on 1,200 customers and designed a profit-optimal targeting threshold estimated to save \$X per campaign.”

### Interview preparation
- **SQL:** joins, GROUP BY/HAVING, window functions (Module 8) — practise writing queries without autocomplete.
- **Python/pandas:** filtering, groupby, merges, cleaning tasks.
- **Statistics:** p-values, confidence intervals, A/B testing, distributions (Module 4).
- **ML concepts:** bias–variance, overfitting, metrics choice, leakage (Module 10).
- **Project walk-through:** STAR (Situation, Task, Action, Result); know every decision and why; be honest about limitations.
- **Case questions:** “Sign-ups dropped 10% yesterday — how would you investigate?” → clarify, check data quality, segment, form hypotheses (metric trees from Module 9).

### Also helps
A tidy LinkedIn and GitHub profile, short write-ups/blog posts of your projects, Kaggle notebooks, contributing to open data projects, and networking at local data meetups.
`,
      terms: [
        ['Portfolio', 'A curated set of projects demonstrating your skills.'],
        ['Case study', 'A write-up telling the story of a project: problem, approach, results.'],
        ['Impact bullet', 'A CV line combining action, method and quantified result.'],
        ['STAR method', 'Situation, Task, Action, Result — a structure for interview answers.'],
        ['Technical screen', 'An interview stage testing SQL/Python/statistics skills.'],
      ],
      realWorld: md`
An applicant with no prior data job landed a data-analyst internship by presenting two projects: an interactive Tableau Public dashboard of their city’s open transport data, and a churn model repo with a crisp README. In the interview they spent 15 minutes walking through trade-offs (why ROC-AUC, why a lower threshold, what they’d do with more data) — exactly what the hiring manager wanted to hear.
`,
      steps: [
        'Choose 3–4 projects covering analysis/BI, EDA, and ML (plus one personal topic).',
        'Polish each repo: README with results first, clean notebooks, report.',
        'Write impact-focused CV bullets and a short LinkedIn summary.',
        'Practise SQL, pandas and statistics questions weekly (Practice section).',
        'Rehearse a 5-minute project walk-through using STAR.',
      ],
      code: [
        {
          title: 'Generate a results table for your README',
          code: md`
import pandas as pd

results = pd.DataFrame({
    "model": ["Baseline (most frequent)", "Logistic regression", "Gradient boosting"],
    "ROC-AUC": [0.50, 0.81, 0.83],
    "Recall @ chosen threshold": [0.00, 0.74, 0.77],
    "Expected profit per campaign ($)": [0, 9800, 10900],
})

def to_markdown_table(df):
    header = "| " + " | ".join(df.columns) + " |"
    sep = "|" + "|".join("---" for _ in df.columns) + "|"
    rows = ["| " + " | ".join(str(v) for v in row) + " |" for row in df.itertuples(index=False)]
    return "\n".join([header, sep, *rows])

print(to_markdown_table(results))
`,
          explanation: [
            'A small DataFrame summarising your model comparison (example numbers — use your own results).',
            'Always include a baseline row so readers see the improvement.',
            'Metrics that matter to the business (recall at the chosen threshold, profit).',
            '…',
            'A helper that turns any DataFrame into a Markdown table: the header row…',
            '…the separator row Markdown needs…',
            '…and one line per row (`itertuples` iterates rows as tuples).',
            'Join everything with newlines.',
            'Paste the printed table straight into your README’s “Key results” section.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Ten half-finished tutorial projects (Titanic, Iris) with no write-up.', fix: 'Three to four polished, original projects with business framing.' },
        { mistake: 'READMEs that start with installation steps.', fix: 'Lead with the problem and the results.' },
        { mistake: 'Overclaiming (“my model will save the company millions”).', fix: 'State assumptions and limitations; interviewers respect honesty.' },
        { mistake: 'Not being able to explain your own code or choices.', fix: 'Rehearse the walk-through; know why you chose each method and metric.' },
      ],
      exercises: [
        {
          id: 'pf2-ex1', title: 'Write an impact bullet', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`
Write \`cv_bullet(action, method, result)\` returning \`f"{action} using {method}, {result}."\` — e.g. \`cv_bullet("Built a churn model", "logistic regression", "reaching ROC-AUC 0.82")\` → \`"Built a churn model using logistic regression, reaching ROC-AUC 0.82."\`
`,
          starter: md`
def cv_bullet(action, method, result):
    return action

print(cv_bullet("Built a churn model", "logistic regression", "reaching ROC-AUC 0.82"))
`,
          solution: md`
def cv_bullet(action, method, result):
    return f"{action} using {method}, {result}."

print(cv_bullet("Built a churn model", "logistic regression", "reaching ROC-AUC 0.82"))
`,
          tests: md`assert cv_bullet("Built a churn model", "logistic regression", "reaching ROC-AUC 0.82") == "Built a churn model using logistic regression, reaching ROC-AUC 0.82."`,
          hints: ['Use the exact f-string format given, including the final period.'],
        },
        {
          id: 'pf2-ex2', title: 'Markdown results table', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Write \`to_markdown_table(df)\` that converts a DataFrame to a Markdown table: header row, a separator row of \`---\` cells, then one row per record (see the example above).`,
          starter: md`
import pandas as pd

def to_markdown_table(df):
    return ""

print(to_markdown_table(pd.DataFrame({"model": ["A", "B"], "AUC": [0.7, 0.8]})))
`,
          solution: md`
import pandas as pd

def to_markdown_table(df):
    header = "| " + " | ".join(df.columns) + " |"
    sep = "|" + "|".join("---" for _ in df.columns) + "|"
    rows = ["| " + " | ".join(str(v) for v in row) + " |" for row in df.itertuples(index=False)]
    return "\n".join([header, sep, *rows])

print(to_markdown_table(pd.DataFrame({"model": ["A", "B"], "AUC": [0.7, 0.8]})))
`,
          tests: md`
_t = to_markdown_table(pd.DataFrame({"model": ["A", "B"], "AUC": [0.7, 0.8]}))
assert _t.splitlines() == ["| model | AUC |", "|---|---|", "| A | 0.7 |", "| B | 0.8 |"], f"Got:\n{_t}"
`,
          hints: ['Build three parts: header, separator, rows; join with "\\n".'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What should appear first in a project README?', options: ['Installation commands', 'The problem and key results', 'A list of libraries', 'The licence'], answer: 1, explanation: 'Reviewers decide in seconds whether to keep reading.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Which CV bullet is strongest?', options: ['Used Python for data science', 'Did a sales dashboard', 'Built a Power BI dashboard of 1,500 orders that cut monthly reporting time from 2 days to 0', 'Know pandas'], answer: 2, explanation: 'Action + method + quantified result.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'In a project walk-through, interviewers most want to hear…', options: ['Every line of code', 'Your decisions, trade-offs and what you would do differently', 'Only the final accuracy', 'Library version numbers'], answer: 1, explanation: 'They assess judgement and understanding.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'STAR stands for…', options: ['Statistics, Tables, Analysis, Results', 'Situation, Task, Action, Result', 'SQL, Tableau, Airflow, R', 'Start, Test, Assess, Repeat'], answer: 1, explanation: 'A structure for behavioural and project answers.' },
      ],
      summary: [
        '3–4 polished projects covering BI/analysis, EDA and ML, plus one personal topic.',
        'README: problem and results first, then approach, how to run, limitations.',
        'CV bullets: action + method + quantified result.',
        'Prepare SQL, pandas, statistics, ML concepts and a STAR project walk-through.',
      ],
      resources: [{ label: 'Kaggle Datasets', url: 'https://www.kaggle.com/datasets' }, { label: 'Tableau Public gallery (inspiration)', url: 'https://public.tableau.com/app/discover' }],
    },
  ],
};
