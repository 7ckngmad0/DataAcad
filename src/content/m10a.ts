import type { Lesson } from '../types.ts';
import { md } from './md.ts';

export const SKL = { label: 'scikit-learn User Guide', url: 'https://scikit-learn.org/stable/user_guide.html' };
export const ISLP = { label: 'An Introduction to Statistical Learning (free book, Python edition)', url: 'https://www.statlearning.com/' };

export const m10a: Lesson[] = [
  {
    id: 'ml-fundamentals',
    title: 'What is Machine Learning? Supervised, Unsupervised & Reinforcement Learning',
    minutes: 45,
    difficulty: 'intermediate',
    objectives: [
      'Define machine learning and contrast it with rule-based programming',
      'Distinguish supervised (regression, classification), unsupervised and reinforcement learning',
      'Identify features and labels, and split data into training and test sets',
      'Run the complete scikit-learn workflow: split → fit → predict → evaluate, against a baseline',
    ],
    intro: md`
Machine learning (ML) lets computers learn patterns from examples instead of being given explicit rules. It powers spam filters, recommendations, credit scoring and demand forecasts. This lesson builds the vocabulary and the **workflow** you will reuse for every model in this module.
`,
    simple: md`
Traditional programming: you write the rules (“if the email contains *free money*, mark it spam”).

Machine learning: you show the computer thousands of emails **already labelled** spam or not-spam, and it **figures out the rules itself**.

- **Features** are the inputs (words in the email, sender, time).
- The **label** is the answer you want to predict (spam: yes/no).
- We **train** on most of the examples and **test** on examples the model has never seen — like studying with practice questions and then taking a real exam with new questions.
`,
    technical: md`
### Types of learning
| Type | Data | Goal | Examples |
|---|---|---|---|
| **Supervised** | features $X$ + labels $y$ | learn $f(X) \approx y$ | price prediction (**regression**), churn yes/no (**classification**) |
| **Unsupervised** | features only | find structure | customer segments (clustering), dimensionality reduction, anomaly detection |
| **Reinforcement** | an agent acting in an environment | maximise cumulative reward | game-playing agents, robotics, recommendation policies |

- **Regression** predicts a number; **classification** predicts a category (binary or multi-class).
- **Semi-/self-supervised** learning (used to pre-train large language models) sits between these.

### Notation
$X \in \mathbb{R}^{n \times p}$ (n samples, p features), $y \in \mathbb{R}^n$. A model with parameters $\theta$ predicts $\hat{y} = f_\theta(x)$; **training** chooses $\theta$ to minimise a **loss** on training data (e.g. MSE, log-loss) — usually by optimisation (Module 3).

### Train/test split & generalisation
The goal is **generalisation**: good performance on *new* data. Hold out a **test set** (typically 20–30%) that the model never sees during training or tuning. For classification use \`stratify=y\` to keep class proportions. Use \`random_state\` for reproducibility.

### The scikit-learn API (every model)
\`\`\`python
model = SomeModel(hyperparameters)
model.fit(X_train, y_train)        # learn parameters
y_pred = model.predict(X_test)     # use them
model.score(X_test, y_test)        # default metric (R² or accuracy)
\`\`\`
Transformers (scalers, encoders) use \`fit\` / \`transform\`; **pipelines** chain them (Lesson 9).

### Always compare to a baseline
A model is only useful if it beats a trivial strategy: predict the mean (regression) or the most frequent class (classification) — \`DummyRegressor\`, \`DummyClassifier\`.

### When not to use ML
If simple rules work, data is tiny or unrepresentative, decisions must be fully explainable by law, or errors are catastrophic without human oversight.
`,
    terms: [
      ['Machine learning', 'Algorithms that learn patterns from data to make predictions or decisions.'],
      ['Feature', 'An input variable (column of X).'],
      ['Label / target', 'The value to predict (y).'],
      ['Regression', 'Supervised learning predicting a continuous number.'],
      ['Classification', 'Supervised learning predicting a category.'],
      ['Training set / test set', 'Data used to fit the model / held-out data used only for final evaluation.'],
      ['Generalisation', 'How well a model performs on unseen data.'],
      ['Baseline', 'A trivial reference model that any useful model must beat.'],
    ],
    realWorld: md`
A bank receives 10,000 loan applications a month. Historical applications labelled “repaid / defaulted” train a classification model on features such as income, debt ratio and payment history. The model scores new applications; low-risk ones are approved automatically and borderline ones go to a human underwriter. The bank evaluates the model on a **held-out recent period**, checks it beats the old scorecard (the baseline), and monitors it for fairness and drift.
`,
    steps: [
      'Define the target (y) and the prediction moment; decide regression vs classification.',
      'Choose features available at prediction time (no leakage).',
      'Split into training and test sets (stratified for classification).',
      'Fit a baseline, then a real model, on the training set only.',
      'Evaluate both on the test set and compare.',
    ],
    code: [
      {
        title: 'The complete supervised workflow (regression)',
        code: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

houses = pd.read_csv("data/houses.csv")
features = ["area_sqft", "bedrooms", "bathrooms", "age_years", "garage_spaces", "distance_to_center_km"]
X = houses[features]
y = houses["price"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("train:", X_train.shape, " test:", X_test.shape)

baseline = DummyRegressor(strategy="mean").fit(X_train, y_train)
model = LinearRegression().fit(X_train, y_train)

for name, m in [("baseline (mean)", baseline), ("linear regression", model)]:
    mae = mean_absolute_error(y_test, m.predict(X_test))
    print(f"{name:18s} MAE = \${mae:,.0f}   R² = {m.score(X_test, y_test):.3f}")

new_house = pd.DataFrame([[1800, 3, 2, 10, 1, 5.0]], columns=features)
print("Predicted price for a new house: $", round(model.predict(new_house)[0], -3))
`,
        explanation: [
          'Import pandas, the train/test splitter, a baseline model, a real model and an error metric.',
          'Load the house data.',
          'Choose the **features** — numeric columns known before a sale.',
          '`X` = feature matrix (800 × 6); `y` = **label** (price).',
          '`train_test_split` holds out 20% of rows as a test set; `random_state=42` makes the split reproducible.',
          'Shapes confirm 640 training and 160 test rows.',
          'The **baseline** always predicts the mean training price.',
          '`LinearRegression().fit(...)` learns one weight per feature from the training data only.',
          'Evaluate both models on the **test set**: MAE = average absolute error in dollars; `.score` returns R² for regressors.',
          'The real model’s error is far below the baseline’s — evidence it learned something useful.',
          'A new house as a one-row DataFrame with the same columns…',
          '…`predict` returns its estimated price.',
        ],
      },
      {
        title: 'Classification and unsupervised learning in a few lines',
        code: md`
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.dummy import DummyClassifier
from sklearn.cluster import KMeans

X, y = load_iris(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)

clf = DecisionTreeClassifier(max_depth=3, random_state=0).fit(X_tr, y_tr)
dummy = DummyClassifier(strategy="most_frequent").fit(X_tr, y_tr)
print("tree accuracy:", round(clf.score(X_te, y_te), 3), " baseline:", round(dummy.score(X_te, y_te), 3))
print("predicted species for first 5 test flowers:", clf.predict(X_te[:5]), "true:", y_te[:5])

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
print("cluster sizes (no labels used):", [int((km.labels_ == k).sum()) for k in range(3)])
`,
        explanation: [
          'Iris is a classic built-in dataset: 150 flowers, 4 measurements, 3 species.',
          'Split 70/30; `stratify=y` keeps the same species proportions in train and test.',
          'A decision tree **classifier** (Lesson 4) learns rules from labelled flowers.',
          'Baseline classifier: always predict the most common class (≈ 33% accuracy here).',
          'The tree reaches ~95%+ accuracy on unseen flowers — far better than the baseline.',
          'Predictions vs true labels for a few test rows.',
          '**Unsupervised**: k-means groups the flowers into 3 clusters using only the measurements — no species labels at all.',
          'Cluster sizes; they roughly match the true species, discovered without supervision.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Evaluating on the training data and reporting excellent results.', fix: 'Always report performance on held-out data.' },
      { mistake: 'Skipping the baseline.', fix: 'Compare with DummyRegressor/DummyClassifier; “85% accuracy” means nothing if 85% of rows are one class.' },
      { mistake: 'Using features that won’t exist at prediction time (leakage).', fix: 'Only use information available at the moment you predict.' },
      { mistake: 'Not stratifying an imbalanced classification split.', fix: 'Pass `stratify=y`.' },
    ],
    exercises: [
      {
        id: 'ml1-ex1', title: 'Regression or classification?', type: 'predict', lang: 'python', difficulty: 'beginner',
        prompt: md`Predicting how many minutes a food delivery will take is a ______ problem. (regression / classification)`,
        solution: 'regression', accepted: ['regression'],
        hints: ['Is the target a number or a category?'],
      },
      {
        id: 'ml1-ex2', title: 'Split the data', type: 'dataset', lang: 'python', difficulty: 'beginner',
        prompt: md`
Load \`data/churn.csv\`. Set \`X\` to the columns \`tenure_months\`, \`monthly_charges\`, \`support_calls\`, and \`y\` to \`churn == "Yes"\`. Split into \`X_train, X_test, y_train, y_test\` with 25% test, \`stratify=y\` and \`random_state=1\`.
`,
        starter: md`
import pandas as pd
from sklearn.model_selection import train_test_split
df = pd.read_csv("data/churn.csv")
`,
        solution: md`
import pandas as pd
from sklearn.model_selection import train_test_split
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "support_calls"]]
y = df["churn"] == "Yes"
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=1)
print(X_train.shape, X_test.shape, y_train.mean().round(3), y_test.mean().round(3))
`,
        tests: md`
assert list(X.columns) == ["tenure_months", "monthly_charges", "support_calls"], "Wrong feature columns"
assert len(X_test) == 300 and len(X_train) == 900, f"Expected 900/300 rows, got {len(X_train)}/{len(X_test)}"
assert abs(y_train.mean() - y_test.mean()) < 0.01, "Use stratify=y so churn rates match"
`,
        hints: ['`y = df["churn"] == "Yes"` creates a boolean label.', '`train_test_split(X, y, test_size=0.25, stratify=y, random_state=1)`'],
      },
      {
        id: 'ml1-ex3', title: 'Beat the baseline', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`
Using the split from the starter, fit a \`DummyClassifier(strategy="most_frequent")\` and a \`LogisticRegression(max_iter=1000)\`. Store their test accuracies in \`base_acc\` and \`model_acc\`.
`,
        starter: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "support_calls"]]
y = df["churn"] == "Yes"
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=1)
base_acc = 0
model_acc = 0
`,
        solution: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "support_calls"]]
y = df["churn"] == "Yes"
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=1)
base_acc = DummyClassifier(strategy="most_frequent").fit(X_train, y_train).score(X_test, y_test)
model_acc = LogisticRegression(max_iter=1000).fit(X_train, y_train).score(X_test, y_test)
print(round(base_acc, 3), round(model_acc, 3))
`,
        tests: md`
assert abs(base_acc - (1 - y_test.mean())) < 1e-9, "Baseline accuracy should equal the share of the majority class"
_m = LogisticRegression(max_iter=1000).fit(X_train, y_train).score(X_test, y_test)
assert abs(model_acc - _m) < 1e-9, f"Expected logistic accuracy {_m:.3f}, got {model_acc}"
assert model_acc > base_acc, "The model should beat the baseline"
`,
        hints: ['`.fit(...).score(X_test, y_test)` returns accuracy for classifiers.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Grouping customers into segments without predefined labels is…', options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Regression'], answer: 1, explanation: 'No labels → unsupervised (clustering).' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Why keep a separate test set?', options: ['To train faster', 'To estimate performance on unseen data', 'To store backups', 'Because sklearn requires it'], answer: 1, explanation: 'It measures generalisation honestly.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: '90% of transactions are legitimate. A model has 90% accuracy. This is…', options: ['Excellent', 'Possibly no better than always predicting “legitimate”', 'Overfitting', 'Impossible'], answer: 1, explanation: 'Compare with the majority-class baseline.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'An agent learning to play a game by receiving points is an example of…', options: ['Supervised learning', 'Clustering', 'Reinforcement learning', 'PCA'], answer: 2, explanation: 'It learns from rewards through interaction.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'In scikit-learn, `fit` …', options: ['Makes predictions', 'Learns the model’s parameters from data', 'Splits data', 'Plots results'], answer: 1, explanation: 'fit learns; predict applies.' },
      { id: 'q6', kind: 'mcq', difficulty: 'advanced', prompt: 'Which feature would leak when predicting whether a patient will be readmitted?', options: ['Age at discharge', 'Number of prior visits', 'Readmission ward assigned', 'Diagnosis at discharge'], answer: 2, explanation: 'It only exists if the readmission happens.' },
    ],
    summary: [
      'ML learns patterns from data; supervised (regression/classification), unsupervised, reinforcement.',
      'Features X, label y; split train/test (stratify for classes); avoid leakage.',
      'scikit-learn: fit → predict → score, same API for every model.',
      'Always beat a baseline on held-out data.',
    ],
    resources: [SKL, ISLP, { label: 'Google — Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' }],
  },
  {
    id: 'ml-linear-regression',
    title: 'Linear Regression & Multiple Linear Regression',
    minutes: 50,
    difficulty: 'intermediate',
    widgets: ['regression'],
    objectives: [
      'Explain simple and multiple linear regression and least squares',
      'Interpret coefficients, the intercept and R²',
      'Include categorical features with one-hot encoding',
      'Check assumptions with residual plots and recognise multicollinearity',
    ],
    intro: md`
Linear regression is the most widely used predictive model and the foundation of many others. It’s fast, interpretable (“each extra square foot adds \$145”), and a strong baseline. Understanding it deeply makes every other model easier to learn.
`,
    simple: md`
Linear regression draws the **best straight line** through a cloud of points. “Best” means the line with the smallest total squared distance to the points (try beating it in the demo above!).

With one feature: *price = intercept + slope × size*.
With several features: *price = intercept + w₁·size + w₂·bathrooms + w₃·age + …*. Each weight tells you how much the price changes when that feature increases by one unit, **holding the others constant**.
`,
    technical: md`
### Model
$$\hat{y} = \beta_0 + \beta_1 x_1 + \dots + \beta_p x_p = \beta_0 + \mathbf{x}^\top\boldsymbol{\beta}$$

### Least squares
Choose $\beta$ to minimise the residual sum of squares $\text{RSS} = \sum_i (y_i - \hat{y}_i)^2$. Closed form (normal equation): $\hat{\boldsymbol\beta} = (X^\top X)^{-1}X^\top \mathbf{y}$ (Module 3). For one feature: $\beta_1 = \frac{\text{cov}(x, y)}{\text{var}(x)}$, $\beta_0 = \bar{y} - \beta_1\bar{x}$.

### Interpretation
- $\beta_j$: expected change in $y$ for a one-unit increase in $x_j$, **all other features fixed**.
- $\beta_0$: prediction when all features are 0 (often not meaningful on its own).
- **R²** $= 1 - \frac{\text{RSS}}{\text{TSS}}$: share of variance explained (1 = perfect, 0 = no better than the mean; can be negative on test data).
- Standardise features to compare coefficient magnitudes.

### Categorical features
One-hot encode them (\`pd.get_dummies(drop_first=True)\` or \`OneHotEncoder\`); each coefficient is the difference vs the dropped reference category.

### Assumptions (for valid inference)
1. **Linearity** of the relationship.
2. **Independent** errors.
3. **Constant variance** of residuals (homoscedasticity).
4. Roughly **normal** residuals (matters for confidence intervals/p-values).
5. No severe **multicollinearity** (highly correlated features make coefficients unstable; check correlations or VIF).

**Residual plot** (residuals vs predictions): look for random scatter around 0; a funnel → non-constant variance (try log(y)); a curve → non-linearity (add features like $x^2$ or use another model).

### Extensions
Polynomial features, interactions, and **regularised** regression: Ridge (L2), Lasso (L1, can zero out features), Elastic Net.
`,
    terms: [
      ['Linear regression', 'Predicts y as a weighted sum of features plus an intercept.'],
      ['Coefficient (weight)', 'Change in prediction per one-unit change in a feature, others fixed.'],
      ['Intercept', 'Predicted value when all features are zero.'],
      ['Residual', 'Actual minus predicted value.'],
      ['Least squares', 'Fitting method minimising the sum of squared residuals.'],
      ['R²', 'Proportion of variance in y explained by the model.'],
      ['Multicollinearity', 'Strong correlation between features, making coefficients unstable.'],
      ['Regularisation', 'Penalising large coefficients (Ridge, Lasso) to reduce overfitting.'],
    ],
    realWorld: md`
Real-estate platforms use regression-style models to estimate home values. Beyond prediction, the coefficients answer questions buyers and planners ask: *how much is an extra bathroom worth? how much do prices fall per km from the centre?* With \`data/houses.csv\` you’ll estimate exactly these effects — and check whether a log-price model fits better.
`,
    steps: [
      'Explore relationships between y and each feature (scatter plots, correlations).',
      'Encode categoricals; split train/test.',
      'Fit LinearRegression; read intercept and coefficients.',
      'Evaluate with R², MAE/RMSE on the test set.',
      'Check residual plots; improve with transforms or extra features if patterns appear.',
    ],
    code: [
      {
        title: 'Simple vs multiple regression and interpreting coefficients',
        code: md`
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

houses = pd.read_csv("data/houses.csv")
X_all = pd.get_dummies(houses.drop(columns=["house_id", "price"]), columns=["neighborhood"], drop_first=True, dtype=int)
y = houses["price"]
X_tr, X_te, y_tr, y_te = train_test_split(X_all, y, test_size=0.2, random_state=0)

simple = LinearRegression().fit(X_tr[["area_sqft"]], y_tr)
print(f"Simple: price ≈ {simple.intercept_:,.0f} + {simple.coef_[0]:.1f} × area")
print("  test R² =", round(r2_score(y_te, simple.predict(X_te[["area_sqft"]])), 3))

multi = LinearRegression().fit(X_tr, y_tr)
pred = multi.predict(X_te)
print(f"Multiple: test R² = {r2_score(y_te, pred):.3f}, MAE = \${mean_absolute_error(y_te, pred):,.0f}")
coefs = pd.Series(multi.coef_, index=X_tr.columns).round(0)
print(coefs.sort_values())
print("Reference neighborhood (dropped):", sorted(houses["neighborhood"].unique())[0])
`,
        explanation: [
          'Imports: pandas/NumPy, the model, the splitter and two metrics.',
          'Load houses.',
          'Features = everything except the ID and the target; `get_dummies(..., drop_first=True)` one-hot encodes neighborhood, dropping one category as the **reference**.',
          'Target = price; split 80/20.',
          '**Simple** regression with one feature (area).',
          'Intercept and slope: roughly “each extra sqft adds ~\$150–170”.',
          'R² on test data: area alone explains a good share of the variation.',
          '**Multiple** regression with all features.',
          'Higher test R² and a lower MAE: the extra features help.',
          'Coefficients as a labelled Series: e.g. a garage space adds ~\$10k; each km from the centre subtracts a few thousand; neighborhood coefficients are differences vs the reference neighborhood.',
          'Which neighborhood is the reference (alphabetically first, dropped by `drop_first`).',
        ],
      },
      {
        title: 'Residual analysis and a log-target model',
        code: md`
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

houses = pd.read_csv("data/houses.csv")
X = pd.get_dummies(houses.drop(columns=["house_id", "price"]), drop_first=True, dtype=int)
y = houses["price"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)

raw = LinearRegression().fit(X_tr, y_tr)
logm = LinearRegression().fit(X_tr, np.log(y_tr))
pred_raw = raw.predict(X_te)
pred_log = np.exp(logm.predict(X_te))

fig, ax = plt.subplots(1, 2, figsize=(11, 3.5))
for a, p, title in [(ax[0], pred_raw, "raw price model"), (ax[1], pred_log, "log-price model")]:
    a.scatter(p, y_te - p, alpha=0.5, s=12)
    a.axhline(0, color="red")
    a.set_title(f"Residuals: {title}"); a.set_xlabel("predicted price"); a.set_ylabel("residual")
plt.tight_layout(); plt.show()

for name, p in [("raw", pred_raw), ("log", pred_log)]:
    print(f"{name}: R²={r2_score(y_te, p):.3f}  MAE=\${mean_absolute_error(y_te, p):,.0f}")
corr = houses[["area_sqft", "bedrooms", "bathrooms"]].corr().round(2)
print("Feature correlations (multicollinearity check):\n", corr)
`,
        explanation: [
          'Imports including matplotlib for residual plots.',
          'Prepare features (one-hot neighborhood) and split as before.',
          'Model 1 predicts raw price.',
          'Model 2 predicts **log(price)**: prices are multiplicative (a nicer neighborhood multiplies value), which a log model captures as additive effects.',
          'Convert log predictions back to dollars with `np.exp`.',
          'Residual plots: residual = actual − predicted against predicted.',
          'A red line at 0; ideally residuals scatter randomly around it. A funnel shape (wider spread for expensive houses) signals non-constant variance — the log model reduces it.',
          'Compare test R² and MAE of both models in dollars.',
          'Bedrooms, bathrooms and area are correlated (bigger houses have more rooms) — some multicollinearity, so read their individual coefficients with care.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Interpreting a coefficient as causal (“adding a bathroom will raise the price by \$9k”).', fix: 'Coefficients are associations holding other features fixed; causal claims need experiments or careful design.' },
      { mistake: 'Comparing raw coefficients of features on different scales.', fix: 'Standardise features first to compare importance.' },
      { mistake: 'Including all dummy columns plus an intercept (dummy-variable trap).', fix: 'Drop one category (`drop_first=True`).' },
      { mistake: 'Ignoring curved or funnel-shaped residuals.', fix: 'Transform y (log), add non-linear features, or try another model.' },
    ],
    exercises: [
      {
        id: 'ml2-ex1', title: 'Fit a simple regression', type: 'dataset', lang: 'python', difficulty: 'beginner',
        prompt: md`Fit \`LinearRegression\` predicting \`average\` from \`study_hours_week\` in \`data/students.csv\` (use all rows). Store the slope in \`slope\` and the intercept in \`intercept\`.`,
        starter: md`
import pandas as pd
from sklearn.linear_model import LinearRegression
df = pd.read_csv("data/students.csv")
slope = 0
intercept = 0
`,
        solution: md`
import pandas as pd
from sklearn.linear_model import LinearRegression
df = pd.read_csv("data/students.csv")
m = LinearRegression().fit(df[["study_hours_week"]], df["average"])
slope = m.coef_[0]
intercept = m.intercept_
print(slope, intercept)
`,
        tests: md`
import numpy as np
_b1, _b0 = np.polyfit(df["study_hours_week"], df["average"], 1)
assert abs(slope - _b1) < 1e-6 and abs(intercept - _b0) < 1e-6, f"Expected slope {_b1:.3f}, intercept {_b0:.3f}"
`,
        hints: ['X must be 2-D: `df[["study_hours_week"]]` (double brackets).', '`m.coef_[0]` and `m.intercept_`.'],
      },
      {
        id: 'ml2-ex2', title: 'Slope by hand', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Implement \`fit_line(x, y)\` returning \`(b0, b1)\` using $b_1 = \text{cov}(x,y)/\text{var}(x)$ and $b_0 = \bar{y} - b_1\bar{x}$ (NumPy arrays in, floats out).`,
        starter: md`
import numpy as np

def fit_line(x, y):
    return 0.0, 0.0

print(fit_line(np.array([1, 2, 3, 4.0]), np.array([3, 5, 7, 9.0])))
`,
        solution: md`
import numpy as np

def fit_line(x, y):
    b1 = np.sum((x - x.mean()) * (y - y.mean())) / np.sum((x - x.mean()) ** 2)
    b0 = y.mean() - b1 * x.mean()
    return float(b0), float(b1)

print(fit_line(np.array([1, 2, 3, 4.0]), np.array([3, 5, 7, 9.0])))
`,
        tests: md`
assert np.allclose(fit_line(np.array([1, 2, 3, 4.0]), np.array([3, 5, 7, 9.0])), (1, 2))
_x = np.array([2, 4, 5, 9, 11.0]); _y = np.array([3, 8, 7, 15, 20.0])
assert np.allclose(fit_line(_x, _y)[::-1], np.polyfit(_x, _y, 1)), "Should match np.polyfit"
`,
        hints: ['Numerator: sum of products of deviations; denominator: sum of squared x deviations (the n−1 cancels).'],
      },
      {
        id: 'ml2-ex3', title: 'Multiple regression R²', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`
Predict \`price\` in \`data/houses.csv\` from \`area_sqft\`, \`bathrooms\`, \`garage_spaces\`, \`age_years\` and \`distance_to_center_km\`. Use \`train_test_split(test_size=0.25, random_state=7)\`, fit \`LinearRegression\` and store the **test** R² in \`test_r2\`.
`,
        starter: md`
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
df = pd.read_csv("data/houses.csv")
test_r2 = 0
`,
        solution: md`
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
df = pd.read_csv("data/houses.csv")
cols = ["area_sqft", "bathrooms", "garage_spaces", "age_years", "distance_to_center_km"]
X_tr, X_te, y_tr, y_te = train_test_split(df[cols], df["price"], test_size=0.25, random_state=7)
test_r2 = LinearRegression().fit(X_tr, y_tr).score(X_te, y_te)
print(round(test_r2, 3))
`,
        tests: md`
_c = ["area_sqft", "bathrooms", "garage_spaces", "age_years", "distance_to_center_km"]
_a, _b, _c1, _d = train_test_split(df[_c], df["price"], test_size=0.25, random_state=7)
_e = LinearRegression().fit(_a, _c1).score(_b, _d)
assert abs(test_r2 - _e) < 1e-9, f"Expected test R² {_e:.3f}, got {test_r2}"
`,
        hints: ['Split first, fit on training data, `.score` on test data.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Least squares chooses the line that minimises…', options: ['The sum of residuals', 'The sum of squared residuals', 'The number of points above the line', 'The slope'], answer: 1, explanation: 'Squared residuals (RSS).' },
      { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'A coefficient of 9,000 for `bathrooms` means…', options: ['Bathrooms cause +$9,000', 'Holding other features fixed, one extra bathroom is associated with $9,000 higher predicted price', 'Price is $9,000 per house', 'R² is 0.9'], answer: 1, explanation: 'An association, conditional on the other features.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'R² = 0.80 means…', options: ['80% of predictions are correct', 'The model explains 80% of the variance of y', 'Error is 20%', 'Slope is 0.8'], answer: 1, explanation: 'Proportion of variance explained.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'A residual plot shows a funnel that widens for large predictions. A good remedy is…', options: ['Remove the intercept', 'Model log(y)', 'Add more rows only', 'Ignore it'], answer: 1, explanation: 'Log transforms often stabilise variance for multiplicative data.' },
      { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'Why drop one dummy column when one-hot encoding with an intercept?', options: ['To save memory', 'The dummies would sum to 1 and be perfectly collinear with the intercept', 'sklearn requires it', 'To improve R²'], answer: 1, explanation: 'This is the dummy-variable trap.' },
    ],
    summary: [
      'ŷ = β₀ + Σβⱼxⱼ fitted by least squares.',
      'Coefficients = effect per unit, others fixed (association, not causation).',
      'Evaluate with test R², MAE/RMSE; encode categoricals with a reference level.',
      'Check residuals; use log transforms, extra features or regularisation when needed.',
    ],
    resources: [ISLP, { label: 'scikit-learn: Linear models', url: 'https://scikit-learn.org/stable/modules/linear_model.html' }],
  },
  {
    id: 'ml-logistic-regression',
    title: 'Logistic Regression (Classification)',
    minutes: 45,
    difficulty: 'intermediate',
    objectives: [
      'Explain how logistic regression turns a linear score into a probability with the sigmoid',
      'Interpret coefficients as changes in log-odds and odds ratios',
      'Use predict_proba and choose a decision threshold',
      'Build a churn classifier with scaling and one-hot encoding',
    ],
    intro: md`
Logistic regression is the go-to first model for **yes/no** questions: will this customer churn? is this transaction fraud? will this patient be readmitted? Despite its name, it’s a classification model. It outputs **probabilities**, is fast and interpretable, and is a standard baseline in industry.
`,
    simple: md`
Linear regression can predict any number — even 1.7 or −0.4 — which makes no sense as a probability. Logistic regression first computes a score like linear regression, then squeezes it through an **S-shaped curve (sigmoid)** so the result is always between 0 and 1.

A result of 0.82 means “82% chance of churn”. You then pick a **threshold** (often 0.5): above it, predict “yes”.
`,
    technical: md`
### Model
$$z = \beta_0 + \mathbf{x}^\top\boldsymbol\beta, \qquad p = P(y=1 \mid \mathbf{x}) = \sigma(z) = \frac{1}{1 + e^{-z}}$$
Equivalently the **log-odds** are linear: $\log\frac{p}{1-p} = \beta_0 + \mathbf{x}^\top\boldsymbol\beta$.

### Training
Maximise the likelihood ⇔ minimise **log-loss** (binary cross-entropy):
$$L = -\frac{1}{n}\sum_i \big[y_i\log p_i + (1-y_i)\log(1-p_i)\big]$$
No closed form → solved by iterative optimisation (gradient-based). scikit-learn applies **L2 regularisation** by default (\`C\` = inverse strength; smaller C = stronger regularisation).

### Interpretation
- $\beta_j$ = change in log-odds per unit of $x_j$; $e^{\beta_j}$ = **odds ratio** (e.g. 1.5 → odds × 1.5 per unit).
- Standardise numeric features to compare coefficients.

### Probabilities and thresholds
\`predict_proba(X)[:, 1]\` gives $P(y=1)$; \`predict\` uses 0.5. Choose the threshold based on costs: missing a fraud may cost far more than a false alarm → lower threshold (higher recall). See Lesson 8.

### Practicalities
- Scale features (\`StandardScaler\`) — helps optimisation and regularisation treat features fairly.
- One-hot encode categoricals.
- Class imbalance: \`class_weight="balanced"\` or adjust threshold.
- Multi-class: scikit-learn handles it automatically (multinomial/softmax).
- Decision boundary is **linear** in the features; add interactions/polynomials for curved boundaries.
`,
    terms: [
      ['Logistic regression', 'Linear model for classification that outputs probabilities via the sigmoid.'],
      ['Sigmoid', 'σ(z) = 1/(1+e^(−z)), mapping any number to (0, 1).'],
      ['Odds', 'p / (1 − p).'],
      ['Log-odds (logit)', 'log(p / (1 − p)); linear in features in logistic regression.'],
      ['Odds ratio', 'e^β: multiplicative change in odds per unit increase in a feature.'],
      ['Log-loss', 'Loss function for probabilistic classifiers; penalises confident wrong predictions.'],
      ['Decision threshold', 'Probability cut-off for predicting the positive class.'],
    ],
    realWorld: md`
Telecoms run churn models monthly: every customer gets a churn probability; the top 10% highest-risk customers receive retention offers. Because logistic regression coefficients are interpretable (“each support call multiplies churn odds by ~1.4”), the retention team also learns *why* customers leave — something many black-box models can’t explain as easily.
`,
    steps: [
      'Define the positive class (e.g. churn = 1).',
      'Prepare features: one-hot categoricals, scale numerics (a pipeline is ideal).',
      'Split with stratification; fit LogisticRegression on training data.',
      'Evaluate probabilities and classes on test data (accuracy, precision, recall, ROC-AUC).',
      'Interpret odds ratios and choose a threshold that fits business costs.',
    ],
    code: [
      {
        title: 'A churn classifier with interpretable odds ratios',
        code: md`
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, roc_auc_score

df = pd.read_csv("data/churn.csv")
y = (df["churn"] == "Yes").astype(int)
num = ["tenure_months", "monthly_charges", "support_calls"]
cat = ["contract", "internet_service", "tech_support", "paperless_billing"]
X = df[num + cat]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

prep = ColumnTransformer([("num", StandardScaler(), num),
                          ("cat", OneHotEncoder(drop="first"), cat)])
model = Pipeline([("prep", prep), ("clf", LogisticRegression(max_iter=1000))]).fit(X_tr, y_tr)

proba = model.predict_proba(X_te)[:, 1]
print("accuracy:", round(accuracy_score(y_te, model.predict(X_te)), 3), " ROC-AUC:", round(roc_auc_score(y_te, proba), 3))

names = model.named_steps["prep"].get_feature_names_out()
odds = pd.Series(np.exp(model.named_steps["clf"].coef_[0]), index=names).round(2).sort_values()
print("Odds ratios (per 1 SD for numeric features):\n", odds)

customer = pd.DataFrame([{"tenure_months": 3, "monthly_charges": 95, "support_calls": 5, "contract": "Month-to-month",
                          "internet_service": "Fiber", "tech_support": "No", "paperless_billing": "Yes"}])
print("Churn probability for a new customer:", round(model.predict_proba(customer)[0, 1], 3))
`,
        explanation: [
          'Imports: splitter, preprocessing tools, a Pipeline, the model and metrics.',
          'Load data; the target is 1 for churn, 0 otherwise.',
          'Separate numeric and categorical feature lists.',
          'Split 75/25, stratified so both sets have the same churn rate.',
          '`ColumnTransformer` scales numeric columns and one-hot encodes categorical ones (dropping one level each) — learned **only** from training data when fitted.',
          'A `Pipeline` chains preprocessing and the classifier, so `fit` and `predict` apply both steps consistently.',
          '`predict_proba(...)[:, 1]` = probability of churn for each test customer.',
          'Accuracy uses the 0.5 threshold; ROC-AUC (Lesson 8) measures ranking quality across all thresholds.',
          'Recover the transformed feature names…',
          '…and exponentiate coefficients into **odds ratios**: > 1 increases churn odds (e.g. month-to-month vs the reference, support calls), < 1 decreases them (e.g. two-year contract, tenure).',
          'Score a hypothetical new customer: short tenure, many support calls, monthly contract → high churn probability.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Using linear regression for a 0/1 target.', fix: 'Use logistic regression (probabilities stay in [0, 1]).' },
      { mistake: 'Always using the 0.5 threshold.', fix: 'Choose the threshold from the business costs of false positives vs false negatives.' },
      { mistake: 'Interpreting coefficients as changes in probability.', fix: 'They change log-odds; exponentiate for odds ratios.' },
      { mistake: '“ConvergenceWarning” from unscaled features.', fix: 'Standardise features and/or increase `max_iter`.' },
    ],
    exercises: [
      {
        id: 'ml3-ex1', title: 'Fit and predict probabilities', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`
Fit \`LogisticRegression(max_iter=1000)\` on the training split in the starter. Store the predicted churn **probabilities** for the test set in \`p\` (1-D array) and the test ROC-AUC in \`auc\`.
`,
        starter: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "support_calls"]]
y = (df["churn"] == "Yes").astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=3)
p = None
auc = 0
`,
        solution: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
df = pd.read_csv("data/churn.csv")
X = df[["tenure_months", "monthly_charges", "support_calls"]]
y = (df["churn"] == "Yes").astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=3)
clf = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
p = clf.predict_proba(X_te)[:, 1]
auc = roc_auc_score(y_te, p)
print(round(auc, 3))
`,
        tests: md`
import numpy as np
assert p is not None and np.ndim(p) == 1 and len(p) == len(X_te), "p should be a 1-D array of test probabilities"
assert ((p >= 0) & (p <= 1)).all(), "Probabilities must be in [0, 1]"
_e = roc_auc_score(y_te, LogisticRegression(max_iter=1000).fit(X_tr, y_tr).predict_proba(X_te)[:, 1])
assert abs(auc - _e) < 1e-9 and auc > 0.6, f"Expected AUC {_e:.3f}, got {auc}"
`,
        hints: ['`predict_proba(X_te)[:, 1]` selects the positive-class column.', '`roc_auc_score(y_te, p)` uses probabilities, not 0/1 predictions.'],
      },
      {
        id: 'ml3-ex2', title: 'Apply a custom threshold', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Write \`classify(probs, threshold)\` returning a NumPy array of 1s and 0s: 1 where the probability is **greater than or equal to** the threshold.`,
        starter: md`
import numpy as np

def classify(probs, threshold):
    return probs

print(classify(np.array([0.1, 0.35, 0.5, 0.9]), 0.35))
`,
        solution: md`
import numpy as np

def classify(probs, threshold):
    return (np.asarray(probs) >= threshold).astype(int)

print(classify(np.array([0.1, 0.35, 0.5, 0.9]), 0.35))
`,
        tests: md`
assert classify(np.array([0.1, 0.35, 0.5, 0.9]), 0.35).tolist() == [0, 1, 1, 1]
assert classify(np.array([0.1, 0.35, 0.5, 0.9]), 0.6).tolist() == [0, 0, 0, 1]
`,
        hints: ['A comparison gives booleans; `.astype(int)` turns them into 0/1.'],
      },
      {
        id: 'ml3-ex3', title: 'Read an odds ratio', type: 'predict', lang: 'python', difficulty: 'intermediate',
        prompt: md`A feature has coefficient β = 0.693 in a logistic regression. By what factor do the odds multiply per one-unit increase? (round to a whole number)`,
        solution: '2', accepted: ['2', '2.0', '2x', 'x2'],
        hints: ['Odds ratio = e^β, and ln(2) ≈ 0.693.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Logistic regression is used for…', options: ['Predicting continuous values', 'Classification (probabilities of classes)', 'Clustering', 'Dimensionality reduction'], answer: 1, explanation: 'Despite the name, it is a classifier.' },
      { id: 'q2', kind: 'text', difficulty: 'intermediate', prompt: 'If the linear score z = 0, what probability does logistic regression output?', accepted: ['0.5', '.5', '50%'], explanation: 'σ(0) = 0.5.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Lowering the threshold from 0.5 to 0.3 will usually…', options: ['Catch more positives (higher recall) with more false positives', 'Reduce false positives', 'Not change predictions', 'Increase accuracy always'], answer: 0, explanation: 'More cases cross a lower threshold.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'What loss does logistic regression minimise?', options: ['MSE', 'Log-loss (cross-entropy)', 'Hinge loss', 'MAE'], answer: 1, explanation: 'Equivalent to maximising the likelihood.' },
      { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'In scikit-learn’s LogisticRegression, decreasing C…', options: ['Weakens regularisation', 'Strengthens regularisation (smaller coefficients)', 'Changes the threshold', 'Removes the intercept'], answer: 1, explanation: 'C is the inverse of regularisation strength.' },
    ],
    summary: [
      'p = σ(β₀ + xᵀβ); log-odds are linear in the features.',
      'Trained by minimising log-loss; regularised by default (C).',
      'Coefficients → odds ratios via e^β; scale features for comparability.',
      'Use predict_proba and choose thresholds from business costs.',
    ],
    resources: [ISLP, { label: 'scikit-learn: Logistic regression', url: 'https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression' }],
  },
  {
    id: 'ml-trees-forests',
    title: 'Decision Trees & Random Forests',
    minutes: 45,
    difficulty: 'intermediate',
    objectives: [
      'Explain how decision trees split data using impurity (Gini, entropy) or variance',
      'Control tree complexity with max_depth and min_samples_leaf',
      'Explain bagging and how random forests reduce variance',
      'Use feature importances responsibly',
    ],
    intro: md`
Decision trees ask a sequence of yes/no questions, like a game of 20 Questions, and are easy to explain to anyone. **Random forests** combine hundreds of trees and are among the most reliable “out-of-the-box” models for tabular data — a staple in industry and competitions.
`,
    simple: md`
A decision tree for loan approval might ask:
1. *Is income above \$40k?* If no → high risk.
2. If yes: *Has the person missed payments before?* If yes → medium risk; if no → low risk.

The computer chooses the questions that **best separate** the outcomes. A single tree can memorise the training data (too many questions), so a **random forest** grows many different trees on random samples and lets them **vote** — like asking a crowd instead of one person.
`,
    technical: md`
### How a tree is built (CART)
At each node, try candidate splits $x_j \le t$ and pick the one that most reduces **impurity**:
- Classification: **Gini** $= 1 - \sum_k p_k^2$ or **entropy** $= -\sum_k p_k\log_2 p_k$.
- Regression: variance / MSE within child nodes.

Recursively split until a stopping rule. Leaves predict the majority class (or mean value).

### Controlling complexity
Unlimited trees **overfit** (one leaf per training point). Regularise with \`max_depth\`, \`min_samples_leaf\`, \`min_samples_split\`, \`max_leaf_nodes\` or cost-complexity pruning (\`ccp_alpha\`). Trees need **no feature scaling** and handle non-linear relationships and interactions naturally; they are unstable (small data changes → different trees).

### Random forests
- **Bagging** (bootstrap aggregating): train each tree on a bootstrap sample of rows.
- **Feature randomness:** each split considers only a random subset of features (\`max_features\`), de-correlating trees.
- Predictions are averaged (regression) or voted (classification) → much lower variance than one tree.
- Key hyperparameters: \`n_estimators\` (more = more stable, slower), \`max_depth\`, \`min_samples_leaf\`, \`max_features\`.
- **Out-of-bag (OOB) score**: each tree is evaluated on rows it didn’t see — a free validation estimate (\`oob_score=True\`).

### Feature importance
\`feature_importances_\` (impurity-based) can favour high-cardinality numeric features. **Permutation importance** (shuffle a feature on test data and measure the drop in score) is more reliable. Importance ≠ causation.

**Gradient boosting** (XGBoost, LightGBM, sklearn’s \`HistGradientBoosting\`) builds trees sequentially to correct previous errors — often the strongest tabular models.
`,
    terms: [
      ['Decision tree', 'Model making predictions through a hierarchy of feature-based splits.'],
      ['Node / leaf', 'A split point / a terminal node holding a prediction.'],
      ['Gini impurity', 'Probability of misclassifying a random sample by node class proportions.'],
      ['Entropy', 'Information-theoretic impurity measure.'],
      ['Bagging', 'Training models on bootstrap samples and averaging them.'],
      ['Random forest', 'Bagged trees with random feature subsets at each split.'],
      ['Feature importance', 'Measure of how much a feature contributes to predictions.'],
      ['Gradient boosting', 'Sequentially adding trees that fix previous errors.'],
    ],
    realWorld: md`
A hospital uses a shallow decision tree (depth 3) to triage patients because doctors can read and verify every rule. For predicting equipment failures in a factory, engineers instead use a random forest on hundreds of sensor features — less explainable, but much more accurate, with permutation importance highlighting the sensors worth inspecting.
`,
    steps: [
      'Start with a shallow tree to understand the main splits.',
      'Increase depth while checking test/validation performance (avoid overfitting).',
      'Train a random forest (e.g. 200–500 trees) and compare.',
      'Tune max_depth / min_samples_leaf / max_features with cross-validation.',
      'Explain with permutation importance and (for single trees) the tree diagram.',
    ],
    code: [
      {
        title: 'A readable tree, overfitting with depth, and a random forest',
        code: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier

df = pd.read_csv("data/churn.csv")
X = pd.get_dummies(df.drop(columns=["customer_id", "churn"]), drop_first=True, dtype=int)
y = (df["churn"] == "Yes").astype(int)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

small = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X_tr, y_tr)
print(export_text(small, feature_names=list(X.columns)))

for depth in [2, 4, 8, None]:
    t = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_tr, y_tr)
    print(f"depth={str(depth):4s} train acc={t.score(X_tr, y_tr):.3f}  test acc={t.score(X_te, y_te):.3f}")

rf = RandomForestClassifier(n_estimators=300, min_samples_leaf=3, oob_score=True, random_state=0, n_jobs=1)
rf.fit(X_tr, y_tr)
print(f"forest: train={rf.score(X_tr, y_tr):.3f} OOB={rf.oob_score_:.3f} test={rf.score(X_te, y_te):.3f}")
`,
        explanation: [
          'Imports: a tree, a text exporter and a random forest.',
          'Features: all columns except the ID and the target, one-hot encoded (trees don’t need scaling).',
          'Target and a stratified split.',
          'A depth-2 tree is small enough to read…',
          '…`export_text` prints its rules: typically the first split is on contract type or tenure — the strongest churn drivers found in EDA.',
          'Grow trees of increasing depth (None = unlimited)…',
          '…training accuracy keeps rising to ~1.0, but test accuracy peaks and then falls: **overfitting**.',
          'A forest of 300 trees; `min_samples_leaf=3` keeps leaves from memorising single customers; `oob_score=True` gives a built-in validation estimate.',
          'Fit the forest.',
          'OOB and test accuracy are close to each other and typically above any single deep tree.',
        ],
      },
      {
        title: 'Feature importance: impurity vs permutation',
        code: md`
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance

houses = pd.read_csv("data/houses.csv")
X = pd.get_dummies(houses.drop(columns=["house_id", "price"]), dtype=int)
y = houses["price"]
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.25, random_state=0)

rf = RandomForestRegressor(n_estimators=200, min_samples_leaf=2, random_state=0, n_jobs=1).fit(X_tr, y_tr)
print("test R²:", round(rf.score(X_te, y_te), 3))

imp = pd.DataFrame({
    "impurity": rf.feature_importances_,
    "permutation": permutation_importance(rf, X_te, y_te, n_repeats=5, random_state=0).importances_mean,
}, index=X.columns)
print((imp / imp.sum()).round(3).sort_values("permutation", ascending=False))
`,
        explanation: [
          'A random forest **regressor** for prices, plus permutation importance.',
          'One-hot encode all neighborhoods (no drop needed for trees).',
          'Split.',
          'Fit 200 trees with small leaves.',
          'Test R² — compare with linear regression from Lesson 2.',
          'Two importance measures side by side: impurity-based (from training) and permutation-based (score drop when a feature is shuffled on **test** data, averaged over 5 repeats).',
          'Normalised importances: area dominates, followed by location features. If the two measures disagree, trust permutation importance more.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Leaving `max_depth=None` on a single tree and trusting training accuracy.', fix: 'Limit depth/leaf size and evaluate on held-out data.' },
      { mistake: 'Treating feature importances as causal effects.', fix: 'They describe the model’s reliance on features; use permutation importance and domain judgement.' },
      { mistake: 'Scaling features for trees.', fix: 'Not needed (harmless but pointless); trees split on thresholds.' },
    ],
    exercises: [
      {
        id: 'ml4-ex1', title: 'Gini impurity', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Write \`gini(labels)\` returning the Gini impurity $1 - \sum_k p_k^2$ of a list of class labels.`,
        starter: md`
def gini(labels):
    return 0

print(gini(["yes", "yes", "no", "no"]))
`,
        solution: md`
from collections import Counter

def gini(labels):
    n = len(labels)
    return 1 - sum((c / n) ** 2 for c in Counter(labels).values())

print(gini(["yes", "yes", "no", "no"]))
`,
        tests: md`
assert abs(gini(["yes", "yes", "no", "no"]) - 0.5) < 1e-9, "50/50 split -> 0.5"
assert gini(["a", "a", "a"]) == 0, "A pure node has impurity 0"
assert abs(gini(["a", "b", "c"]) - 2 / 3) < 1e-9
`,
        hints: ['Count each class, convert to proportions p_k, sum their squares, subtract from 1.'],
      },
      {
        id: 'ml4-ex2', title: 'Find the best depth', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`
Using the starter split, train \`DecisionTreeClassifier(max_depth=d, random_state=0)\` for d in 1–10 and set \`best_depth\` to the depth with the highest **test** accuracy (smallest depth if tied).
`,
        starter: md`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
best_depth = 0
`,
        solution: md`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
scores = {d: DecisionTreeClassifier(max_depth=d, random_state=0).fit(X_tr, y_tr).score(X_te, y_te) for d in range(1, 11)}
best_depth = max(scores, key=lambda d: (scores[d], -d))
print(scores, best_depth)
`,
        tests: md`
_s = {d: DecisionTreeClassifier(max_depth=d, random_state=0).fit(X_tr, y_tr).score(X_te, y_te) for d in range(1, 11)}
_b = max(_s, key=lambda d: (_s[d], -d))
assert best_depth == _b, f"Expected depth {_b}, got {best_depth}"
`,
        hints: ['Loop over `range(1, 11)` and record test accuracy for each depth.', 'Pick the depth with the max score; break ties toward smaller depth.'],
      },
      {
        id: 'ml4-ex3', title: 'Forest vs tree', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`
On the same breast-cancer split, fit an unlimited-depth \`DecisionTreeClassifier(random_state=0)\` and a \`RandomForestClassifier(n_estimators=200, random_state=0)\`. Store test accuracies in \`tree_acc\` and \`forest_acc\`.
`,
        starter: md`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
tree_acc = 0
forest_acc = 0
`,
        solution: md`
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
tree_acc = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr).score(X_te, y_te)
forest_acc = RandomForestClassifier(n_estimators=200, random_state=0).fit(X_tr, y_tr).score(X_te, y_te)
print(round(tree_acc, 3), round(forest_acc, 3))
`,
        tests: md`
_t = DecisionTreeClassifier(random_state=0).fit(X_tr, y_tr).score(X_te, y_te)
_f = RandomForestClassifier(n_estimators=200, random_state=0).fit(X_tr, y_tr).score(X_te, y_te)
assert abs(tree_acc - _t) < 1e-9 and abs(forest_acc - _f) < 1e-9, "Accuracies don't match the specified models"
assert forest_acc >= tree_acc, "The forest should do at least as well as one deep tree here"
`,
        hints: ['`.fit(X_tr, y_tr).score(X_te, y_te)` for each model.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What does a decision tree leaf contain?', options: ['A split rule', 'A prediction (class or value)', 'The full dataset', 'A learning rate'], answer: 1, explanation: 'Leaves predict.' },
      { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'A tree with unlimited depth has train accuracy 1.00 and test accuracy 0.78. This is…', options: ['Underfitting', 'Overfitting', 'Perfect generalisation', 'Data leakage'], answer: 1, explanation: 'It memorised the training data.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Random forests reduce variance mainly by…', options: ['Using deeper trees', 'Averaging many de-correlated trees trained on bootstrap samples', 'Scaling features', 'Using one feature only'], answer: 1, explanation: 'Bagging + random feature subsets.' },
      { id: 'q4', kind: 'text', difficulty: 'intermediate', prompt: 'What is the Gini impurity of a node with 50% class A and 50% class B?', accepted: ['0.5', '.5', '1/2'], explanation: '1 − (0.25 + 0.25) = 0.5.' },
      { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'Why prefer permutation importance over impurity importance?', options: ['It is faster', 'Impurity importance is biased toward high-cardinality features and computed on training data', 'It works only for trees', 'It shows causation'], answer: 1, explanation: 'Permutation importance measures the score drop on held-out data.' },
    ],
    summary: [
      'Trees split to reduce impurity (Gini/entropy) or variance; readable but prone to overfitting.',
      'Control with max_depth, min_samples_leaf, pruning.',
      'Random forests = bagging + feature randomness → strong, stable models; OOB score for free validation.',
      'Use permutation importance; importance ≠ causation; boosting is the next step.',
    ],
    resources: [ISLP, { label: 'scikit-learn: Ensembles', url: 'https://scikit-learn.org/stable/modules/ensemble.html' }],
  },
  {
    id: 'ml-knn-svm',
    title: 'K-Nearest Neighbors & Support Vector Machines',
    minutes: 40,
    difficulty: 'intermediate',
    objectives: [
      'Explain k-NN and the effect of k on bias and variance',
      'Explain why distance-based models require feature scaling',
      'Explain the maximum-margin idea behind SVMs, the C parameter and kernels',
      'Train and compare k-NN and SVM classifiers in pipelines',
    ],
    intro: md`
k-NN and SVMs approach classification geometrically: data points live in a feature space, and new points are classified by **who their neighbours are** (k-NN) or **which side of a boundary** they fall on (SVM). Both are important classic algorithms and teach key ideas: distance, scaling, margins and kernels.
`,
    simple: md`
**k-Nearest Neighbors:** “Tell me who your friends are and I’ll tell you who you are.” To classify a new point, find the *k* most similar training points and take a vote. k = 1 trusts a single neighbour (jumpy); k = 50 averages many (smooth).

**SVM:** draw the boundary between two groups that stays **as far as possible** from both — like building a road between two villages with the widest possible verge on each side. If the groups aren’t separable by a straight line, a **kernel** lets the SVM draw curved boundaries.
`,
    technical: md`
### k-Nearest Neighbors
- Prediction: majority vote (classification) or average (regression) of the $k$ nearest training points, usually by **Euclidean distance** $\lVert\mathbf{x} - \mathbf{x}_i\rVert$.
- **No training step** (a “lazy learner”): it stores the data; prediction cost grows with dataset size.
- Small $k$ → low bias, high variance (overfits); large $k$ → smoother, higher bias. Choose $k$ by cross-validation; odd $k$ avoids ties in binary problems.
- \`weights="distance"\` gives closer neighbours more say.
- Suffers from the **curse of dimensionality**: in many dimensions, all points become nearly equally far apart.

### Support Vector Machines
- Linear SVM finds the hyperplane $\mathbf{w}^\top\mathbf{x} + b = 0$ maximising the **margin** between classes; the points on the margin are **support vectors**.
- **Soft margin:** parameter $C$ trades margin width vs training errors — large $C$ = fewer training errors, narrower margin (risk of overfitting); small $C$ = wider margin, more regularisation.
- **Kernel trick:** implicitly map data to a higher-dimensional space: \`kernel="rbf"\` (Gaussian, most common), \`"poly"\`. RBF’s \`gamma\` controls how far a single point’s influence reaches (large gamma = wiggly boundary).
- \`SVC(probability=True)\` gives probabilities (slower); \`LinearSVC\` scales to larger data. SVMs work well on medium-sized, high-dimensional data (e.g. text).

### Scaling is essential for both
Distances and margins depend on feature scale: income in dollars would swamp age in years. Put a \`StandardScaler\` in a pipeline.
`,
    terms: [
      ['k-NN', 'Predicts from the k closest training examples.'],
      ['Euclidean distance', 'Straight-line distance between points.'],
      ['Lazy learner', 'An algorithm that defers computation to prediction time.'],
      ['Curse of dimensionality', 'Distances lose meaning as the number of features grows.'],
      ['SVM', 'Classifier finding the maximum-margin separating boundary.'],
      ['Support vectors', 'Training points lying on or inside the margin; they define the boundary.'],
      ['C (SVM)', 'Penalty for margin violations; larger C = less regularisation.'],
      ['Kernel', 'Function enabling non-linear boundaries via implicit feature mapping.'],
    ],
    realWorld: md`
**k-NN** powers simple recommendation features (“customers similar to you bought…”) and is used for imputing missing values from similar records (\`KNNImputer\`). **SVMs** were for years the state of the art for text classification and handwriting recognition, and are still used in bioinformatics on datasets with many features but few samples.
`,
    steps: [
      'Scale features (StandardScaler) inside a pipeline.',
      'k-NN: try several k values with cross-validation; pick the best.',
      'SVM: start with an RBF kernel; tune C and gamma.',
      'Compare against logistic regression / random forest on the same split.',
      'Consider prediction speed and data size before deploying k-NN.',
    ],
    code: [
      {
        title: 'Why scaling matters, and choosing k',
        code: md`
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
print("feature ranges differ hugely:", X.min(axis=0)[[4, 12]], X.max(axis=0)[[4, 12]])

raw = KNeighborsClassifier(n_neighbors=5).fit(X_tr, y_tr)
scaled = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=5)).fit(X_tr, y_tr)
print("k=5 without scaling:", round(raw.score(X_te, y_te), 3), " with scaling:", round(scaled.score(X_te, y_te), 3))

for k in [1, 3, 5, 11, 21, 41]:
    pipe = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=k))
    cv = cross_val_score(pipe, X_tr, y_tr, cv=5).mean()
    print(f"k={k:2d}  5-fold CV accuracy={cv:.3f}")
`,
        explanation: [
          'The built-in wine dataset: 178 wines, 13 chemical measurements, 3 cultivars.',
          'Stratified split.',
          'Magnesium is in the hundreds and proline in the thousands, while other features are below 1 — without scaling, distances are dominated by a couple of features.',
          'k-NN on raw features…',
          '…versus a pipeline that standardises first: accuracy jumps dramatically.',
          'Try several k values…',
          '…evaluate each with 5-fold cross-validation on the training set (Lesson 9) rather than the test set…',
          '…very small k is noisy and very large k over-smooths; a middle value usually wins.',
        ],
      },
      {
        title: 'Linear vs RBF SVM and the effect of C',
        code: md`
import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split

X, y = make_moons(n_samples=400, noise=0.25, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)
models = {"linear, C=1": SVC(kernel="linear", C=1), "RBF, C=1": SVC(kernel="rbf", C=1),
          "RBF, C=1000": SVC(kernel="rbf", C=1000, gamma=5)}

xx, yy = np.meshgrid(np.linspace(-2, 3, 200), np.linspace(-1.5, 2, 200))
fig, axes = plt.subplots(1, 3, figsize=(13, 3.6))
for ax, (name, svc) in zip(axes, models.items()):
    pipe = make_pipeline(StandardScaler(), svc).fit(X_tr, y_tr)
    zz = pipe.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
    ax.contourf(xx, yy, zz, alpha=0.25, cmap="coolwarm")
    ax.scatter(X_tr[:, 0], X_tr[:, 1], c=y_tr, cmap="coolwarm", s=10)
    ax.set_title(f"{name}: train {pipe.score(X_tr, y_tr):.2f} / test {pipe.score(X_te, y_te):.2f}")
plt.tight_layout(); plt.show()
`,
        explanation: [
          'Imports, including a synthetic “two moons” dataset that no straight line can separate.',
          'Generate 400 noisy points and split them.',
          'Three SVMs: a linear kernel, an RBF kernel with moderate C, and an RBF with very large C and gamma (very flexible).',
          'A grid of points covering the plot to visualise each decision boundary.',
          'For each model: scale + fit in a pipeline…',
          '…predict every grid point and reshape into an image of the regions…',
          '…shade the predicted regions…',
          '…overlay the training points…',
          '…and show train/test accuracy. Linear underfits the curved shape; RBF with C=1 fits well; C=1000 with large gamma draws a wiggly boundary that overfits (train ≫ test).',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Running k-NN or SVM on unscaled features.', fix: 'Always include StandardScaler in a pipeline.' },
      { mistake: 'Choosing k or C by looking at test accuracy repeatedly.', fix: 'Tune with cross-validation on the training data; keep the test set for the end.' },
      { mistake: 'Using k-NN on millions of rows with real-time needs.', fix: 'Prediction is slow; use approximate neighbour search or another model.' },
    ],
    exercises: [
      {
        id: 'ml5-ex1', title: 'k-NN from scratch', type: 'write', lang: 'python', difficulty: 'advanced',
        prompt: md`Implement \`knn_predict(X_train, y_train, x, k)\` that returns the majority label among the \`k\` training points closest (Euclidean) to the single point \`x\`. Use NumPy.`,
        starter: md`
import numpy as np
from collections import Counter

def knn_predict(X_train, y_train, x, k):
    return None

X = np.array([[1, 1], [1, 2], [2, 2], [8, 8], [8, 9], [9, 8]])
y = np.array(["a", "a", "a", "b", "b", "b"])
print(knn_predict(X, y, np.array([2, 1]), 3))
`,
        solution: md`
import numpy as np
from collections import Counter

def knn_predict(X_train, y_train, x, k):
    dist = np.sqrt(((X_train - x) ** 2).sum(axis=1))
    nearest = np.argsort(dist)[:k]
    return Counter(y_train[nearest]).most_common(1)[0][0]

X = np.array([[1, 1], [1, 2], [2, 2], [8, 8], [8, 9], [9, 8]])
y = np.array(["a", "a", "a", "b", "b", "b"])
print(knn_predict(X, y, np.array([2, 1]), 3))
`,
        tests: md`
assert knn_predict(X, y, np.array([2, 1]), 3) == "a"
assert knn_predict(X, y, np.array([7, 7]), 3) == "b"
assert knn_predict(X, y, np.array([5, 5.2]), 1) == "b", "Closest single point to (5, 5.2) is (8, 8)? check distances"
`,
        hints: ['Distances to every training row: `np.sqrt(((X_train - x)**2).sum(axis=1))`.', '`np.argsort(dist)[:k]` gives the nearest indices; vote with Counter.'],
      },
      {
        id: 'ml5-ex2', title: 'Scale inside a pipeline', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`
On the wine data split in the starter, build \`pipe\` = \`make_pipeline(StandardScaler(), SVC(kernel="rbf", C=1))\`, fit it, and store the test accuracy in \`acc\`.
`,
        starter: md`
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
pipe = SVC(kernel="rbf", C=1)
acc = 0
`,
        solution: md`
from sklearn.datasets import load_wine
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
X, y = load_wine(return_X_y=True)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf", C=1)).fit(X_tr, y_tr)
acc = pipe.score(X_te, y_te)
print(round(acc, 3))
`,
        tests: md`
assert hasattr(pipe, "steps") and type(pipe.steps[0][1]).__name__ == "StandardScaler", "pipe must be a pipeline starting with StandardScaler"
assert acc > 0.9, f"With scaling the SVM should exceed 0.9 accuracy, got {acc}"
`,
        hints: ['`make_pipeline(StandardScaler(), SVC(...))` then `.fit(X_tr, y_tr)`.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'k-NN with k = 1 tends to…', options: ['Underfit', 'Overfit (very sensitive to noise)', 'Ignore the data', 'Always be best'], answer: 1, explanation: 'One neighbour = high variance.' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Why must features be scaled for k-NN?', options: ['To speed up loading', 'Because distances are dominated by large-scale features', 'Because k must be odd', 'It is not needed'], answer: 1, explanation: 'Unscaled features distort distances.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Support vectors are…', options: ['All training points', 'The points on/inside the margin that define the boundary', 'The model’s weights', 'The kernels'], answer: 1, explanation: 'Only these points determine the SVM boundary.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Increasing C in an SVM generally…', options: ['Widens the margin (more regularisation)', 'Penalises training errors more, narrowing the margin (risk of overfitting)', 'Changes the kernel', 'Removes support vectors'], answer: 1, explanation: 'Large C = less regularisation.' },
      { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'The kernel trick allows SVMs to…', options: ['Train without data', 'Learn non-linear boundaries by implicitly mapping to higher dimensions', 'Skip scaling', 'Output probabilities only'], answer: 1, explanation: 'Kernels compute similarities in a transformed space.' },
    ],
    summary: [
      'k-NN votes among the k nearest points; tune k; lazy and slow at prediction for big data.',
      'SVMs maximise the margin; C trades margin vs errors; kernels (RBF) give non-linear boundaries.',
      'Both require feature scaling — use pipelines.',
      'Tune hyperparameters with cross-validation, not the test set.',
    ],
    resources: [{ label: 'scikit-learn: Nearest neighbors', url: 'https://scikit-learn.org/stable/modules/neighbors.html' }, { label: 'scikit-learn: SVMs', url: 'https://scikit-learn.org/stable/modules/svm.html' }],
  },
];
