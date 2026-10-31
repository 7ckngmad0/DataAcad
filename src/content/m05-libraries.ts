import type { Module } from '../types.ts';
import { md } from './md.ts';

const NP = { label: 'NumPy: the absolute basics for beginners', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html' };
const PD10 = { label: '10 minutes to pandas', url: 'https://pandas.pydata.org/docs/user_guide/10min.html' };
const PDA = { label: 'Python for Data Analysis, 3rd ed. (free online)', url: 'https://wesmckinney.com/book/' };

export const m05: Module = {
  id: 'libraries',
  number: 5,
  title: 'Python Libraries for Data Science',
  short: 'NumPy & pandas',
  icon: 'library',
  description:
    'The core toolkit: NumPy arrays and vectorised math, pandas DataFrames for loading, selecting, cleaning, grouping, merging and exporting data, and Jupyter notebooks for documenting analysis.',
  skills: ['NumPy arrays', 'Broadcasting', 'pandas Series/DataFrames', 'Selecting & filtering', 'Missing values', 'groupby', 'merge/join', 'Jupyter'],
  lessons: [
    {
      id: 'np-arrays',
      title: 'NumPy Arrays: Creation, Indexing & Slicing',
      minutes: 40,
      difficulty: 'beginner',
      objectives: [
        'Explain why NumPy arrays are faster than Python lists for numbers',
        'Create arrays with array, arange, linspace, zeros, ones and random generators',
        'Inspect shape, ndim, dtype and size; reshape arrays',
        'Index, slice and boolean-filter 1-D and 2-D arrays',
      ],
      intro: md`
NumPy (Numerical Python) is the foundation of the entire Python data stack: pandas, scikit-learn, matplotlib and TensorFlow are all built on NumPy arrays. An **array** is a grid of numbers of a single type, stored compactly in memory so that math on millions of values runs at C speed.
`,
      simple: md`
A Python list is like a box of assorted items — flexible but slow to process. A NumPy array is like an egg carton: every slot holds the same kind of thing, in neat rows, so a machine can process the whole carton at once.

\`np.array([1, 2, 3]) * 2\` → \`[2, 4, 6]\` — no loop needed. Doing \`[1, 2, 3] * 2\` with a list gives \`[1, 2, 3, 1, 2, 3]\` instead!
`,
      technical: md`
### Creating arrays
| Function | Example | Result |
|---|---|---|
| \`np.array(list)\` | \`np.array([[1, 2], [3, 4]])\` | 2×2 array |
| \`np.arange(start, stop, step)\` | \`np.arange(0, 10, 2)\` | [0 2 4 6 8] |
| \`np.linspace(a, b, n)\` | \`np.linspace(0, 1, 5)\` | 5 evenly spaced values incl. both ends |
| \`np.zeros(shape)\`, \`np.ones(shape)\`, \`np.full(shape, v)\` | \`np.zeros((2, 3))\` | filled arrays |
| \`np.eye(n)\` | identity matrix | |
| \`rng = np.random.default_rng(seed)\` | \`rng.normal(0, 1, 5)\`, \`rng.integers(1, 7, 10)\` | random numbers (modern API) |

### Attributes
\`a.shape\` (tuple of dimensions), \`a.ndim\`, \`a.size\` (number of elements), \`a.dtype\` (\`int64\`, \`float64\`, \`bool\`...). Convert with \`a.astype(float)\`.

### Reshaping
\`a.reshape(3, 4)\` (total size must match; \`-1\` lets NumPy infer one dimension), \`a.ravel()\`/\`a.flatten()\` to 1-D, \`a.T\` transpose. Combine with \`np.concatenate\`, \`np.vstack\`, \`np.hstack\`, \`np.column_stack\`.

### Indexing & slicing
- 1-D: like lists — \`a[0]\`, \`a[-1]\`, \`a[2:5]\`, \`a[::2]\`.
- 2-D: \`a[row, col]\`, \`a[0, :]\` (first row), \`a[:, 1]\` (second column), \`a[1:3, 0:2]\` (sub-block).
- **Boolean indexing:** \`a[a > 5]\`; combine with \`&\`, \`|\`, \`~\` and parentheses: \`a[(a > 2) & (a < 8)]\`.
- **Fancy indexing:** \`a[[0, 3, 4]]\`.
- ⚠️ **Slices are views**: modifying a slice modifies the original. Use \`.copy()\` to get an independent array.
`,
      terms: [
        ['ndarray', 'NumPy’s n-dimensional array object.'],
        ['shape', 'Tuple giving the size of each dimension, e.g. (100, 3).'],
        ['dtype', 'The single data type of all elements (int64, float64, bool...).'],
        ['axis', 'A dimension of the array: axis 0 = rows, axis 1 = columns.'],
        ['Vectorisation', 'Operating on whole arrays at once instead of looping in Python.'],
        ['Boolean mask', 'An array of True/False used to select elements.'],
        ['View', 'An array that shares memory with another; changes affect both.'],
      ],
      realWorld: md`
A weather station records hourly temperatures for a year: 8,760 values. As a NumPy array reshaped to \`(365, 24)\`, the daily maximum is \`temps.max(axis=1)\`, the hottest hour of the day on average is \`temps.mean(axis=0).argmax()\`, and freezing hours are \`(temps < 0).sum()\` — each a single, fast line.
`,
      steps: [
        'Import with `import numpy as np`.',
        'Create the array from a list, a range or a random generator.',
        'Check `.shape` and `.dtype` immediately.',
        'Select what you need with slicing or boolean masks.',
        'Reshape when the data has a natural grid structure (days × hours).',
      ],
      code: [
        {
          title: 'Creating and inspecting arrays',
          code: md`
import numpy as np

a = np.array([3, 8, 1, 9, 4, 7])
print(a, a.dtype, a.shape)
print(np.arange(0, 1, 0.25), np.linspace(0, 1, 5))
print(np.zeros((2, 3)))

rng = np.random.default_rng(seed=0)
temps = rng.normal(loc=28, scale=3, size=(7, 24)).round(1)
print("shape:", temps.shape, "ndim:", temps.ndim, "size:", temps.size)

grid = np.arange(12).reshape(3, 4)
print(grid)
print(grid.reshape(-1, 6).shape, grid.T.shape)

lst = [1, 2, 3]
print(lst * 2, np.array(lst) * 2)
`,
          explanation: [
            'Import NumPy with its conventional alias.',
            'An array from a list.',
            'All elements share one dtype (int64); shape (6,) means 1-D with 6 elements.',
            '`arange` uses a step (stop excluded); `linspace` gives n points including both ends.',
            'A 2×3 array of zeros (float by default).',
            'A seeded random generator — reproducible results.',
            'A week of hourly temperatures: shape (7, 24).',
            'Attributes describe the array.',
            '0..11 reshaped into 3 rows × 4 columns.',
            '…',
            '-1 lets NumPy infer the size (2 × 6); `.T` transposes to 4 × 3.',
            'A plain list…',
            '…`* 2` repeats a list but doubles each element of an array.',
          ],
        },
        {
          title: 'Indexing, slicing and boolean masks',
          code: md`
import numpy as np

grid = np.array([[10, 20, 30, 40],
                 [50, 60, 70, 80],
                 [90, 100, 110, 120]])

print(grid[1, 2])          # row 1, column 2
print(grid[0, :])          # first row
print(grid[:, -1])         # last column
print(grid[1:, 1:3])       # sub-block

mask = grid > 65
print(mask)
print(grid[mask])
print(grid[(grid > 25) & (grid < 95)])

view = grid[0, :2]
view[0] = -1
print(grid[0])             # original changed!
safe = grid[1, :2].copy()
safe[0] = 999
print(grid[1])             # unchanged
`,
          explanation: [
            '…',
            'A 3 × 4 array.',
            '…',
            '…',
            'Single element: row 1, column 2 → 70.',
            '`:` means “all”: the whole first row.',
            'All rows, last column → [40 80 120].',
            'Rows 1 onward, columns 1–2 → [[60 70] [100 110]].',
            'A comparison creates a boolean mask of the same shape.',
            '…',
            'Using the mask selects matching elements (flattened).',
            'Combine conditions with `&` and parentheses.',
            'A slice is a **view** into the original data…',
            '…so modifying it…',
            '…changes `grid` too.',
            '`.copy()` makes an independent array…',
            '…',
            '…so the original is untouched.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Using `and`/`or` with arrays: `a[(a > 1) and (a < 5)]` → ValueError.', fix: 'Use `&`, `|`, `~` with parentheses around each condition.' },
        { mistake: 'Forgetting that slices are views and corrupting the original data.', fix: 'Call `.copy()` when you intend to modify a subset independently.' },
        { mistake: 'Mixing types: `np.array([1, "2", 3])` becomes an array of strings.', fix: 'Clean/convert data before creating numeric arrays.' },
        { mistake: 'Reshaping to an incompatible size: 12 elements into (5, 3).', fix: 'The product of the new shape must equal `a.size`.' },
      ],
      exercises: [
        {
          id: 'np1-ex1', title: 'Create and reshape', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Create \`m\`: the numbers 1 to 12 as a **3 × 4** array (row 0 = 1, 2, 3, 4).`,
          starter: md`
import numpy as np
m = None
print(m)
`,
          solution: md`
import numpy as np
m = np.arange(1, 13).reshape(3, 4)
print(m)
`,
          tests: md`
assert isinstance(m, np.ndarray) and m.shape == (3, 4), f"m should be a 3x4 array, got {getattr(m, 'shape', m)}"
assert m[0].tolist() == [1, 2, 3, 4] and m[2, 3] == 12
`,
          hints: ['`np.arange(1, 13)` gives 1..12.', 'Then `.reshape(3, 4)`.'],
        },
        {
          id: 'np1-ex2', title: 'Select a column and filter', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`\`scores\` has one row per student and columns [math, science, english]. Set \`science\` to the science column, and \`strong\` to the science scores **≥ 80**.`,
          starter: md`
import numpy as np
scores = np.array([[78, 85, 90], [62, 71, 58], [95, 88, 92], [70, 79, 81]])
science = None
strong = None
print(science, strong)
`,
          solution: md`
import numpy as np
scores = np.array([[78, 85, 90], [62, 71, 58], [95, 88, 92], [70, 79, 81]])
science = scores[:, 1]
strong = science[science >= 80]
print(science, strong)
`,
          tests: md`
assert science.tolist() == [85, 71, 88, 79], f"science column wrong: {science}"
assert strong.tolist() == [85, 88], f"strong should be [85, 88], got {strong}"
`,
          hints: ['All rows, column index 1: `scores[:, 1]`.', 'Boolean mask: `science[science >= 80]`.'],
        },
        {
          id: 'np1-ex3', title: 'Fix the boolean filter', type: 'debug', lang: 'python', difficulty: 'intermediate',
          prompt: md`This should select values strictly between 10 and 50, but it raises a \`ValueError\`. Fix it.`,
          starter: md`
import numpy as np
v = np.array([5, 12, 47, 50, 61, 30])
between = v[(v > 10) and (v < 50)]
print(between)
`,
          solution: md`
import numpy as np
v = np.array([5, 12, 47, 50, 61, 30])
between = v[(v > 10) & (v < 50)]
print(between)
`,
          tests: md`assert between.tolist() == [12, 47, 30], f"Got {between}"`,
          hints: ['`and` works on single booleans, not arrays.', 'Use the element-wise operator `&`.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'import numpy as np\nprint(np.arange(2, 11, 3))', accepted: ['[2 5 8]'], explanation: 'Start 2, step 3, stop before 11 → 2, 5, 8 (NumPy prints without commas).' },
        { id: 'q2', kind: 'text', difficulty: 'beginner', prompt: 'An array has shape (4, 5). How many elements does it have?', accepted: ['20'], explanation: '4 × 5 = 20 (`a.size`).' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'In a 2-D array, `a[:, 0]` selects…', options: ['The first row', 'The first column', 'The first element', 'All but the first column'], answer: 1, explanation: 'All rows (`:`), column 0.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why are NumPy operations faster than Python loops?', options: ['They use more memory', 'They run compiled code on contiguous same-type data', 'They skip some elements', 'They use the GPU automatically'], answer: 1, explanation: 'Vectorised operations loop in optimised C over homogeneous data.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'After `b = a[:3]; b[0] = 100`, what happens to `a[0]`?', options: ['Unchanged', 'Becomes 100', 'Error', 'Becomes 0'], answer: 1, explanation: 'Basic slices are views of the same data.' },
      ],
      summary: [
        'NumPy arrays: homogeneous, fast, vectorised.',
        'Create with array, arange, linspace, zeros/ones, default_rng.',
        'Know shape, ndim, size, dtype; reshape with -1 for inference.',
        'Index with [row, col], slices and boolean masks (&, |, ~); slices are views.',
      ],
      resources: [NP, PDA],
    },
    {
      id: 'np-operations',
      title: 'NumPy Operations, Broadcasting & Statistical Functions',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Perform element-wise arithmetic and universal functions (ufuncs)',
        'Understand and apply broadcasting rules',
        'Aggregate along axes: sum, mean, std, min, max, argmax, percentile',
        'Use np.where, np.clip, cumulative functions and NaN-aware statistics',
      ],
      intro: md`
The real power of NumPy is computing on entire arrays at once. Standardising features, converting currencies for a whole column, or computing per-store averages become single expressions. **Broadcasting** — NumPy’s rule for combining arrays of different shapes — is what makes those expressions so short.
`,
      simple: md`
Element-wise math works slot by slot: \`[1, 2, 3] + [10, 20, 30] = [11, 22, 33]\`.

**Broadcasting** stretches a smaller array to match a bigger one. Adding a single number to an array adds it to *every* element. Subtracting a row of column averages from a table subtracts each column’s own average from that column — like applying a different discount to each product column in one go.

**Axis** tells NumPy which direction to collapse: \`axis=0\` goes *down* the rows (one result per column), \`axis=1\` goes *across* the columns (one result per row).
`,
      technical: md`
### Element-wise operations & ufuncs
\`+ - * / ** // %\` and comparisons work element-wise. Universal functions: \`np.sqrt\`, \`np.exp\`, \`np.log\`, \`np.abs\`, \`np.round\`, \`np.sin\`... Matrix product is \`@\` (Module 3).

### Broadcasting rules
Compare shapes from the **right**. Two dimensions are compatible if they are **equal or one of them is 1**. Missing dimensions count as 1.
- \`(3, 4) + (4,)\` → OK: the row vector is repeated for each of 3 rows.
- \`(3, 4) + (3, 1)\` → OK: the column vector is repeated across 4 columns.
- \`(3, 4) + (3,)\` → **error** (4 vs 3). Use \`v[:, np.newaxis]\` or \`v.reshape(-1, 1)\`.

### Aggregations
\`a.sum()\`, \`a.mean()\`, \`a.std(ddof=...)\`, \`a.var()\`, \`a.min()\`, \`a.max()\`, \`a.argmin()\`/\`argmax()\` (position), \`np.median\`, \`np.percentile(a, q)\`, \`np.quantile\`, \`a.cumsum()\`, \`np.diff\`. Pass \`axis=0\` (per column) or \`axis=1\` (per row).

Missing values: \`np.nan\` propagates (\`np.mean([1, np.nan]) → nan\`); use \`np.nanmean\`, \`np.nansum\`, \`np.isnan\`.

### Handy tools
- \`np.where(cond, x, y)\` — vectorised if/else.
- \`np.clip(a, lo, hi)\` — cap values.
- \`np.unique(a, return_counts=True)\`.
- \`np.sort\`, \`np.argsort\` (indices that would sort).
- \`np.corrcoef\`, \`np.cov\`.
`,
      terms: [
        ['Element-wise', 'Operation applied to each pair of corresponding elements.'],
        ['ufunc', 'Universal function: fast element-wise function like np.sqrt.'],
        ['Broadcasting', 'Rules that let arrays of different shapes be combined.'],
        ['axis=0', 'Operate down the rows → one result per column.'],
        ['axis=1', 'Operate across columns → one result per row.'],
        ['np.where', 'Vectorised conditional selection.'],
        ['NaN', 'Not a Number — the floating-point marker for missing values.'],
      ],
      realWorld: md`
**Standardising features for machine learning.** A matrix \`X\` of 10,000 customers × 6 features (age, income, ...) is standardised with one line: \`(X - X.mean(axis=0)) / X.std(axis=0)\`. Broadcasting subtracts each column’s mean and divides by each column’s SD — exactly what scikit-learn’s \`StandardScaler\` does internally.
`,
      steps: [
        'Write the operation as if on single numbers.',
        'Replace the numbers with arrays — check shapes for broadcasting.',
        'Choose the axis for aggregations (per column = axis 0, per row = axis 1).',
        'Use NaN-aware functions if data has missing values.',
        'Use np.where/clip instead of loops for conditional logic.',
      ],
      code: [
        {
          title: 'Element-wise math, broadcasting and axes',
          code: md`
import numpy as np

sales = np.array([[120, 80, 45],     # store A: product 1, 2, 3
                  [200, 60, 30],     # store B
                  [150, 90, 75]])    # store C
prices = np.array([2.5, 4.0, 10.0])

revenue = sales * prices             # (3,3) * (3,) broadcasts across rows
print(revenue)
print("per store:", revenue.sum(axis=1))
print("per product:", revenue.sum(axis=0))
print("best store index:", revenue.sum(axis=1).argmax())

store_bonus = np.array([[1.0], [1.1], [0.9]])   # shape (3, 1)
print(revenue * store_bonus)

X = np.array([[25, 30000], [40, 52000], [33, 41000], [51, 87000]], dtype=float)
Z = (X - X.mean(axis=0)) / X.std(axis=0)
print(Z.round(2), Z.mean(axis=0).round(6), Z.std(axis=0))
`,
          explanation: [
            '…',
            'Units sold: rows are stores, columns are products.',
            '…',
            '…',
            'Price per product: shape (3,).',
            '…',
            'Broadcasting: the price row is applied to every store row.',
            '…',
            '`axis=1` sums across columns → total revenue per store.',
            '`axis=0` sums down rows → revenue per product.',
            '`argmax` gives the position of the largest total.',
            'A column vector (3, 1): one multiplier per store.',
            'Broadcast across columns: each store row is scaled by its own factor.',
            'A small feature matrix: age and income.',
            'Standardise each column: subtract its mean and divide by its SD (shapes (4,2) and (2,)).',
            'Each column now has mean 0 and SD 1.',
          ],
        },
        {
          title: 'np.where, clip, cumulative sums and NaN-aware stats',
          code: md`
import numpy as np

temps = np.array([29.5, 31.2, np.nan, 35.8, 27.9, 33.1, np.nan])
print("mean:", np.mean(temps), " nanmean:", round(np.nanmean(temps), 2))
print("missing:", np.isnan(temps).sum())

filled = np.where(np.isnan(temps), np.nanmean(temps), temps)
labels = np.where(filled > 32, "hot", "ok")
print(filled.round(1), labels)

print(np.clip([-5, 3, 12, 25], 0, 10))

daily = np.array([3, 5, 2, 8, 6])
print("cumulative:", daily.cumsum(), " day-over-day:", np.diff(daily))

values, counts = np.unique(["card", "cash", "card", "card", "ewallet"], return_counts=True)
print(dict(zip(values, counts)))
print("90th percentile:", np.percentile(daily, 90))
`,
          explanation: [
            '…',
            'Temperatures with missing readings (NaN).',
            '`np.mean` returns nan because NaN propagates; `np.nanmean` ignores missing values.',
            '`np.isnan` creates a mask; summing it counts missing values (2).',
            'Vectorised if/else: replace NaNs with the mean, keep other values.',
            'Another `np.where`: label hot days.',
            '…',
            '`clip` caps values to the range [0, 10] → [0 3 10 10].',
            'Daily sign-ups.',
            '`cumsum` gives the running total; `diff` gives changes between days.',
            '`unique` with counts — a quick frequency table.',
            '…',
            'Percentiles with linear interpolation.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Confusing axis=0 and axis=1.', fix: 'axis=0 collapses rows (result per column); axis=1 collapses columns (result per row). Check the result’s shape.' },
        { mistake: '“operands could not be broadcast together with shapes (3,4) (3,)”.', fix: 'Reshape the vector to (3, 1) with `v[:, None]`.' },
        { mistake: 'Using np.mean on data with NaN and getting nan.', fix: 'Use `np.nanmean` or clean the data first.' },
        { mistake: 'Writing Python loops over large arrays.', fix: 'Look for a vectorised expression or ufunc first.' },
      ],
      exercises: [
        {
          id: 'np2-ex1', title: 'Row and column totals', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Given \`visits\` (rows = weeks, columns = Mon–Sun), compute \`per_week\` (total per row) and \`per_day\` (average per column).`,
          starter: md`
import numpy as np
visits = np.array([[120, 130, 125, 140, 180, 220, 210],
                   [118, 135, 128, 150, 190, 240, 230]])
per_week = None
per_day = None
print(per_week, per_day)
`,
          solution: md`
import numpy as np
visits = np.array([[120, 130, 125, 140, 180, 220, 210],
                   [118, 135, 128, 150, 190, 240, 230]])
per_week = visits.sum(axis=1)
per_day = visits.mean(axis=0)
print(per_week, per_day)
`,
          tests: md`
assert per_week.tolist() == [1125, 1191], f"per_week wrong: {per_week}"
assert np.allclose(per_day, [119, 132.5, 126.5, 145, 185, 230, 220]), f"per_day wrong: {per_day}"
`,
          hints: ['Per row → `axis=1`.', 'Per column → `axis=0`.'],
        },
        {
          id: 'np2-ex2', title: 'Min-max scale every column', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Scale each **column** of \`X\` to the range [0, 1]: $(x - \min) / (\max - \min)$ using broadcasting. Store it in \`scaled\`.`,
          starter: md`
import numpy as np
X = np.array([[1, 200], [3, 400], [5, 1000], [2, 600]], dtype=float)
scaled = X
print(scaled)
`,
          solution: md`
import numpy as np
X = np.array([[1, 200], [3, 400], [5, 1000], [2, 600]], dtype=float)
mn, mx = X.min(axis=0), X.max(axis=0)
scaled = (X - mn) / (mx - mn)
print(scaled)
`,
          tests: md`
assert np.allclose(scaled.min(axis=0), 0) and np.allclose(scaled.max(axis=0), 1), "Each column should range from 0 to 1"
assert np.allclose(scaled[:, 0], [0, 0.5, 1, 0.25])
`,
          hints: ['Column minimums: `X.min(axis=0)` (shape (2,)).', 'Broadcasting does the rest.'],
        },
        {
          id: 'np2-ex3', title: 'Vectorised labels', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Use \`np.where\` to create \`status\`: \`"late"\` where \`days > 5\`, otherwise \`"on time"\`.`,
          starter: md`
import numpy as np
days = np.array([2, 7, 4, 9, 5, 1])
status = None
print(status)
`,
          solution: md`
import numpy as np
days = np.array([2, 7, 4, 9, 5, 1])
status = np.where(days > 5, "late", "on time")
print(status)
`,
          tests: md`assert list(status) == ["on time", "late", "on time", "late", "on time", "on time"], f"Got {status}"`,
          hints: ['`np.where(condition, value_if_true, value_if_false)`'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'Can arrays with shapes (5, 3) and (3,) be added?', options: ['Yes, result (5, 3)', 'No', 'Yes, result (3,)', 'Only with np.add'], answer: 0, explanation: 'Trailing dimensions match (3 and 3); the vector is broadcast across rows.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Can arrays with shapes (5, 3) and (5,) be added?', options: ['Yes', 'No — reshape to (5, 1) first', 'Yes, result (5, 5)', 'Only element 0'], answer: 1, explanation: 'Comparing from the right: 3 vs 5 are incompatible.' },
        { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'import numpy as np\na = np.array([[1, 2], [3, 4]])\nprint(a.sum(axis=0))', accepted: ['[4 6]'], explanation: 'Summing down rows gives column totals: 1+3, 2+4.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'What is `np.mean([1, 2, np.nan])`?', options: ['1.5', 'nan', '1.0', 'Error'], answer: 1, explanation: 'NaN propagates; use np.nanmean → 1.5.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: '`np.argmax(a)` returns…', options: ['The maximum value', 'The index of the maximum value', 'A sorted array', 'A boolean mask'], answer: 1, explanation: 'argmax = position of the max.' },
      ],
      summary: [
        'Arithmetic and ufuncs are element-wise and vectorised.',
        'Broadcasting: compare shapes from the right; dims must match or be 1.',
        'Aggregate with sum/mean/std/... and choose axis carefully.',
        'np.where, clip, cumsum, diff, unique and nan-functions replace most loops.',
      ],
      resources: [{ label: 'NumPy broadcasting guide', url: 'https://numpy.org/doc/stable/user/basics.broadcasting.html' }, NP],
    },
    {
      id: 'pd-basics',
      title: 'pandas: Series, DataFrames, Reading & Inspecting Data',
      minutes: 40,
      difficulty: 'beginner',
      objectives: [
        'Create Series and DataFrames and understand the index',
        'Read CSV (and know how to read Excel) files with key options',
        'Inspect data with head, tail, info, describe, shape, dtypes, value_counts',
        'Select single columns and create new columns',
      ],
      intro: md`
pandas is the library you will use more than any other. A **DataFrame** is a table with labelled rows and columns — like a spreadsheet you control with code. Every analysis starts the same way: load the data and inspect it.
`,
      simple: md`
- A **Series** is a single labelled column of data — like one column of a spreadsheet, with row labels.
- A **DataFrame** is a table: many Series side by side sharing the same row labels (the **index**).

\`pd.read_csv("file.csv")\` loads a whole spreadsheet in one line. Then \`df.head()\` shows the first rows, \`df.info()\` shows column types and missing values, and \`df.describe()\` gives summary statistics — your three first questions about any dataset.
`,
      technical: md`
### Series and DataFrame
\`\`\`python
s = pd.Series([4.5, 3.0, 5.25], index=["coffee", "tea", "cake"], name="price")
df = pd.DataFrame({"item": ["coffee", "tea"], "price": [4.5, 3.0]})
\`\`\`
- Each column of a DataFrame is a Series; \`df["price"]\` returns one.
- The **index** labels rows (default 0..n−1). \`df.set_index("item")\`, \`df.reset_index()\`.
- Vectorised operations work on whole columns: \`df["price"] * 1.12\`.

### Reading data
- \`pd.read_csv(path, sep=",", parse_dates=["date"], dtype={"zip": str}, na_values=["N/A"], usecols=[...], nrows=1000)\`
- \`pd.read_excel("file.xlsx", sheet_name="Sales")\` (needs \`openpyxl\` installed locally).
- Others: \`read_json\`, \`read_sql\`, \`read_parquet\`, \`read_html\`.

### Inspecting
| Method | Tells you |
|---|---|
| \`df.shape\` | (rows, columns) |
| \`df.head(n)\`, \`df.tail(n)\`, \`df.sample(n)\` | example rows |
| \`df.info()\` | dtypes, non-null counts, memory |
| \`df.dtypes\`, \`df.columns\` | column types/names |
| \`df.describe()\` | count, mean, std, min, quartiles, max (numeric); \`include="all"\` adds categorical |
| \`df["col"].value_counts(normalize=True)\` | frequencies |
| \`df["col"].nunique()\`, \`.unique()\` | distinct values |
| \`df.isna().sum()\` | missing values per column |

### New columns
\`df["revenue_vat"] = df["revenue"] * 1.12\`, or \`df.assign(...)\`. Rename with \`df.rename(columns={...})\`.
`,
      terms: [
        ['Series', 'A one-dimensional labelled array (one column).'],
        ['DataFrame', 'A two-dimensional labelled table of columns.'],
        ['Index', 'Row labels of a Series/DataFrame.'],
        ['read_csv', 'Function to load a CSV file into a DataFrame.'],
        ['info()', 'Summary of columns, dtypes and non-null counts.'],
        ['describe()', 'Summary statistics for each column.'],
        ['value_counts()', 'Counts of each distinct value in a Series.'],
      ],
      realWorld: md`
On day one of an internship you receive \`sales.csv\` with 1,500 rows. In five minutes with pandas you can tell your manager: the date range covered, total revenue, the number of products and regions, the most common category, and whether there are missing values — before anyone opens Excel.
`,
      steps: [
        '`import pandas as pd` and `df = pd.read_csv(...)`.',
        'Look: `df.shape`, `df.head()`.',
        'Types and missing values: `df.info()`.',
        'Numbers: `df.describe()`; categories: `value_counts()`.',
        'Write down surprises (wrong types, odd values) to clean later.',
      ],
      code: [
        {
          title: 'Series and DataFrames from scratch',
          code: md`
import pandas as pd

prices = pd.Series([4.5, 3.0, 5.25], index=["coffee", "tea", "cake"], name="price")
print(prices)
print(prices["tea"], prices.mean())

df = pd.DataFrame({
    "item": ["coffee", "tea", "cake", "juice"],
    "price": [4.5, 3.0, 5.25, 3.9],
    "sold": [120, 45, 30, 60],
})
df["revenue"] = df["price"] * df["sold"]
print(df)
print(type(df["price"]), df.shape)
`,
          explanation: [
            '…',
            'A Series with custom index labels.',
            'Prints values with their labels.',
            'Access by label; Series have statistical methods.',
            'A DataFrame from a dictionary: keys become column names…',
            '…',
            '…',
            '…',
            '…',
            'Vectorised column arithmetic creates a new column.',
            'Display the table.',
            'Each column is a Series; shape is (4, 4).',
          ],
        },
        {
          title: 'Load and inspect a real dataset',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])
print(sales.shape)
sales.info()
print(sales.describe().round(2))
print(sales["category"].value_counts())
print(sales["region"].value_counts(normalize=True).round(3))
print("Date range:", sales["order_date"].min().date(), "to", sales["order_date"].max().date())
print("Products:", sales["product"].nunique())
sales.head()
`,
          explanation: [
            '…',
            '`parse_dates` converts the order_date column to real datetime values.',
            '1,500 rows × 10 columns.',
            '`info()` lists dtypes and non-null counts (no missing values here).',
            '`describe()` summarises numeric columns.',
            'Frequency of each category.',
            'Proportions instead of counts.',
            'Because the column is a datetime, min/max give real dates.',
            'Number of distinct products.',
            'Show the first 5 rows.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Writing `df.column name` for columns with spaces or using attribute access for new columns.', fix: 'Use brackets: `df["column name"]`, and always create columns with `df["new"] = ...`.' },
        { mistake: 'Leaving dates as strings (object dtype).', fix: 'Use `parse_dates=[...]` or `pd.to_datetime()`.' },
        { mistake: 'Losing leading zeros in codes (e.g. zip "0123" → 123).', fix: 'Read them as strings: `dtype={"zip": str}`.' },
        { mistake: 'Printing a 1-million-row DataFrame.', fix: 'Use `head()`, `sample()`, `info()` and `describe()`.' },
      ],
      exercises: [
        {
          id: 'pd1-ex1', title: 'Build a DataFrame', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Create a DataFrame \`df\` with columns \`city\` (Manila, Cebu, Davao) and \`population_m\` (13.5, 3.0, 1.8), then add a column \`big\` that is True where population_m > 2.`,
          starter: md`
import pandas as pd
df = None
print(df)
`,
          solution: md`
import pandas as pd
df = pd.DataFrame({"city": ["Manila", "Cebu", "Davao"], "population_m": [13.5, 3.0, 1.8]})
df["big"] = df["population_m"] > 2
print(df)
`,
          tests: md`
assert isinstance(df, pd.DataFrame) and list(df.columns) == ["city", "population_m", "big"], f"Columns should be city, population_m, big"
assert df["big"].tolist() == [True, True, False]
`,
          hints: ['`pd.DataFrame({...})` with lists as values.', '`df["big"] = df["population_m"] > 2`'],
        },
        {
          id: 'pd1-ex2', title: 'Inspect the churn data', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`Load \`data/churn.csv\`. Set \`n_rows\` to the number of rows, \`n_contracts\` to the number of distinct \`contract\` values, and \`top_internet\` to the most common \`internet_service\` value.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
n_rows = 0
n_contracts = 0
top_internet = ""
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
n_rows = len(df)
n_contracts = df["contract"].nunique()
top_internet = df["internet_service"].value_counts().idxmax()
`,
          tests: md`
assert n_rows == 1200
assert n_contracts == 3
assert top_internet == pd.read_csv("data/churn.csv")["internet_service"].mode()[0], f"Got {top_internet}"
`,
          hints: ['`len(df)`, `.nunique()`', '`value_counts().idxmax()` returns the most frequent label.'],
        },
        {
          id: 'pd1-ex3', title: 'Read with options', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Read only the columns \`date\`, \`category\` and \`amount\` from \`data/expenses.csv\`, with \`date\` parsed as datetime. Store it in \`exp\`.`,
          starter: md`
import pandas as pd
exp = pd.read_csv("data/expenses.csv")
print(exp.dtypes)
`,
          solution: md`
import pandas as pd
exp = pd.read_csv("data/expenses.csv", usecols=["date", "category", "amount"], parse_dates=["date"])
print(exp.dtypes)
`,
          tests: md`
assert list(exp.columns) == ["date", "category", "amount"], f"Columns: {list(exp.columns)}"
assert pd.api.types.is_datetime64_any_dtype(exp["date"]), "date should be datetime"
`,
          hints: ['`usecols=[...]` selects columns.', '`parse_dates=["date"]`.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What does `df["price"]` return?', options: ['A DataFrame', 'A Series', 'A list', 'A NumPy matrix'], answer: 1, explanation: 'A single column is a Series.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Which method shows column dtypes and non-null counts?', options: ['describe()', 'info()', 'head()', 'value_counts()'], answer: 1, explanation: 'info() is the quick structural overview.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'A column of dates loaded with default `read_csv` has dtype…', options: ['datetime64', 'object (strings)', 'int64', 'category'], answer: 1, explanation: 'Use parse_dates or pd.to_datetime to convert.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: '`df["region"].value_counts(normalize=True)` returns…', options: ['Counts', 'Proportions', 'Unique values', 'Missing values'], answer: 1, explanation: 'normalize=True gives relative frequencies.' },
        { id: 'q5', kind: 'text', difficulty: 'beginner', prompt: 'Which attribute gives (rows, columns)? Write it like `df.xxx`.', accepted: ['df.shape', 'shape'], explanation: 'df.shape' },
      ],
      summary: [
        'Series = labelled column; DataFrame = table of Series sharing an index.',
        'read_csv with parse_dates, dtype, usecols, na_values.',
        'Inspect with shape, head, info, describe, value_counts, nunique, isna().sum().',
        'Create columns with vectorised expressions.',
      ],
      resources: [PD10, PDA],
    },
    {
      id: 'pd-select-filter',
      title: 'pandas: Selecting, Filtering & Sorting',
      minutes: 40,
      difficulty: 'beginner',
      objectives: [
        'Select columns and rows with [], loc and iloc',
        'Filter rows with boolean conditions, isin, between and query',
        'Sort by one or several columns and pick top-n rows',
        'Avoid SettingWithCopyWarning with .loc and .copy()',
      ],
      intro: md`
Most analysis questions start with “show me only...”: only orders from the North region, only customers who churned, the top 10 products by revenue. Selecting and filtering is the pandas skill you will use every single day.
`,
      simple: md`
- Pick **columns** by name: \`df[["product", "revenue"]]\`.
- Pick **rows by condition**: \`df[df["revenue"] > 500]\` — “keep rows where revenue is above 500”.
- \`loc\` picks by **labels** (names); \`iloc\` picks by **positions** (numbers), like coordinates on a map.
- Sort with \`sort_values("revenue", ascending=False)\` to put the biggest first.
`,
      technical: md`
### Column selection
\`df["col"]\` → Series; \`df[["a", "b"]]\` → DataFrame (note the double brackets).

### loc and iloc
| | Selects by | Slice end |
|---|---|---|
| \`df.loc[rows, cols]\` | labels / boolean masks | **inclusive** |
| \`df.iloc[rows, cols]\` | integer positions | exclusive |

Examples: \`df.loc[df["region"] == "North", ["product", "revenue"]]\`, \`df.iloc[:5, :3]\`, \`df.loc[10:15]\` (labels 10..15 inclusive).

### Boolean filtering
- Combine with \`&\` (and), \`|\` (or), \`~\` (not); **wrap each condition in parentheses**.
- \`df["region"].isin(["North", "East"])\`, \`df["units"].between(2, 5)\`, \`df["product"].str.contains("Desk")\`, \`df["col"].isna()\`.
- \`df.query("revenue > 500 and region == 'North'")\` — readable string syntax.

### Sorting & top-n
\`df.sort_values("revenue", ascending=False)\`, multiple keys: \`sort_values(["region", "revenue"], ascending=[True, False])\`, \`df.nlargest(10, "revenue")\`, \`sort_index()\`.

### Modifying safely
Assign with \`.loc\`: \`df.loc[df["units"] > 10, "bulk"] = True\`. When you filter and then modify the result, call \`.copy()\` first to avoid the **SettingWithCopyWarning** (you might be editing a temporary view).
`,
      terms: [
        ['loc', 'Label-based selection: rows and columns by name or boolean mask.'],
        ['iloc', 'Position-based selection by integer location.'],
        ['Boolean mask', 'A Series of True/False selecting rows.'],
        ['isin', 'Tests membership in a list of values.'],
        ['query', 'Filter rows using a string expression.'],
        ['nlargest', 'Top n rows by a column.'],
        ['SettingWithCopyWarning', 'Warning that you may be modifying a copy instead of the original.'],
      ],
      realWorld: md`
A regional manager asks: *“Which Electronics orders over \$300 in the North in December 2025 had a discount? Biggest first.”* That is one filter with four conditions plus a sort — a question that would take minutes of clicking in Excel but one readable line in pandas.
`,
      steps: [
        'Write the question as conditions on columns.',
        'Build each condition as a boolean Series.',
        'Combine with &, | and parentheses; apply with df[mask] or df.loc[mask, cols].',
        'Sort and/or take the top n.',
        'Check the row count of the result makes sense.',
      ],
      code: [
        {
          title: 'Selecting with [], loc and iloc',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])

print(sales[["order_id", "product", "revenue"]].head(3))
print(sales.iloc[0])                    # first row as a Series
print(sales.iloc[:3, 1:4])              # positions: rows 0-2, columns 1-3
print(sales.loc[0:2, ["region", "revenue"]])   # labels 0..2 INCLUSIVE

north = sales.loc[sales["region"] == "North", ["order_date", "product", "revenue"]]
print(len(north), "North orders")
`,
          explanation: [
            '…',
            'Load the sales data.',
            'Double brackets select several columns → DataFrame.',
            '`iloc[0]` is the first row by position.',
            'Rows 0–2 and columns at positions 1–3 (end excluded).',
            '`loc` with labels: rows 0, 1 **and 2** (inclusive), two named columns.',
            '`loc[mask, columns]`: filter rows and choose columns at once.',
            'Count the result.',
          ],
        },
        {
          title: 'Filtering and sorting',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])

big_elec = sales[(sales["category"] == "Electronics") & (sales["revenue"] > 300)]
print("big electronics orders:", len(big_elec))

dec_2025 = sales[(sales["order_date"].dt.year == 2025) & (sales["order_date"].dt.month == 12)]
print("Dec 2025 orders:", len(dec_2025))

east_west = sales[sales["region"].isin(["East", "West"]) & sales["units"].between(2, 3)]
print("East/West with 2-3 units:", len(east_west))

print(sales.query("discount > 0 and region == 'North'").shape)

top5 = sales.sort_values("revenue", ascending=False).head(5)
print(top5[["order_date", "product", "units", "revenue"]])
print(sales.nlargest(3, "revenue")["revenue"].tolist())
`,
          explanation: [
            '…',
            '…',
            'Two conditions combined with `&`, each in parentheses.',
            'Count matching rows.',
            'The `.dt` accessor extracts date parts from a datetime column.',
            '…',
            '`isin` for several allowed values; `between` is inclusive on both ends.',
            '…',
            '`query` expresses the filter as a string; shape of the result.',
            'Sort descending and take the top 5.',
            'Show selected columns.',
            '`nlargest` is a shortcut for the same idea.',
          ],
        },
      ],
      mistakes: [
        { mistake: '`df[df["a"] > 1 & df["b"] < 5]` → error or wrong result.', fix: 'Parenthesise each condition: `df[(df["a"] > 1) & (df["b"] < 5)]`.' },
        { mistake: 'Using `and`/`or` instead of `&`/`|`.', fix: 'pandas needs element-wise operators.' },
        { mistake: 'Forgetting that `loc` slices include the end label but `iloc` slices exclude it.', fix: 'Remember: loc = labels inclusive, iloc = positions exclusive.' },
        { mistake: '`df[df.x > 0]["y"] = 1` (chained assignment) does nothing reliably.', fix: '`df.loc[df["x"] > 0, "y"] = 1`.' },
      ],
      exercises: [
        {
          id: 'pd2-ex1', title: 'Filter churned customers', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`From \`data/churn.csv\`, create \`risky\`: customers who churned (\`churn == "Yes"\`) **and** made more than 3 \`support_calls\`.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
risky = df
print(len(risky))
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
risky = df[(df["churn"] == "Yes") & (df["support_calls"] > 3)]
print(len(risky))
`,
          tests: md`
_e = df[(df.churn == "Yes") & (df.support_calls > 3)]
assert len(risky) == len(_e) and set(risky["customer_id"]) == set(_e["customer_id"]), f"Expected {len(_e)} rows, got {len(risky)}"
`,
          hints: ['Two conditions, `&`, parentheses.'],
        },
        {
          id: 'pd2-ex2', title: 'Top 3 most expensive houses in Downtown', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`From \`data/houses.csv\`, set \`top3\` to the \`house_id\` values (as a list) of the 3 most expensive houses in the \`Downtown\` neighborhood, most expensive first.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/houses.csv")
top3 = []
print(top3)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/houses.csv")
top3 = (df[df["neighborhood"] == "Downtown"]
        .sort_values("price", ascending=False)
        .head(3)["house_id"].tolist())
print(top3)
`,
          tests: md`
_e = df[df.neighborhood == "Downtown"].nlargest(3, "price")["house_id"].tolist()
assert top3 == _e, f"Expected {_e}, got {top3}"
`,
          hints: ['Filter first, then `sort_values("price", ascending=False)`.', '`.head(3)["house_id"].tolist()`'],
        },
        {
          id: 'pd2-ex3', title: 'loc vs iloc', type: 'predict', lang: 'python', difficulty: 'intermediate',
          prompt: md`For a DataFrame with the default index 0..99, how many rows does \`df.loc[10:20]\` return?`,
          solution: '11', accepted: ['11'],
          hints: ['loc label slices include the end label.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which selects two columns as a DataFrame?', options: ['df["a", "b"]', 'df[["a", "b"]]', 'df.a.b', 'df.loc["a", "b"]'], answer: 1, explanation: 'A list of column names inside the brackets.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'How many rows does `df.iloc[10:20]` return (default index)?', options: ['10', '11', '20', '9'], answer: 0, explanation: 'iloc slices exclude the end position.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which is correct for “region is North or East”?', options: ['df[df.region == "North" or "East"]', 'df[df["region"].isin(["North", "East"])]', 'df[df["region"] == ["North", "East"]]', 'df.query(region in North, East)'], answer: 1, explanation: '`isin` checks membership.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'How do you safely set a value for filtered rows?', options: ['df[df.x > 0]["y"] = 1', 'df.loc[df["x"] > 0, "y"] = 1', 'df.y[df.x > 0] == 1', 'df.set(y=1)'], answer: 1, explanation: 'A single .loc assignment avoids chained indexing.' },
        { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'To sort largest revenue first you use…', options: ['sort_values("revenue")', 'sort_values("revenue", ascending=False)', 'sort("revenue", desc)', 'order_by("revenue")'], answer: 1, explanation: 'ascending=False sorts descending.' },
      ],
      summary: [
        'Columns: df["a"] / df[["a", "b"]]; rows & columns: loc (labels, inclusive) and iloc (positions).',
        'Filter with boolean masks, &, |, ~, isin, between, str.contains, query.',
        'Sort with sort_values / nlargest.',
        'Assign with .loc; .copy() filtered subsets before modifying.',
      ],
      resources: [{ label: 'pandas: Indexing and selecting data', url: 'https://pandas.pydata.org/docs/user_guide/indexing.html' }, PD10],
    },
    {
      id: 'pd-missing-duplicates',
      title: 'pandas: Missing Values, Duplicates & Data Types',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Detect missing values with isna and measure their extent',
        'Handle missing data with dropna and fillna (including group-wise filling)',
        'Find and remove duplicate rows',
        'Convert data types with astype, to_numeric and to_datetime',
      ],
      intro: md`
Real datasets are never clean. Missing values, duplicate records and numbers stored as text will silently break your analysis if you don’t handle them. pandas gives you precise tools for each problem; Module 6 then turns these tools into a full cleaning workflow.
`,
      simple: md`
- **Missing values** (shown as \`NaN\` or \`None\`) are empty cells. You can **drop** rows that have them, or **fill** them with a sensible value (like the median).
- **Duplicates** are rows recorded twice — they double-count sales or customers.
- **Wrong types**: a price stored as the text \`"1,450.00"\` can’t be added up. Convert it to a number first.
`,
      technical: md`
### Missing values
- Detect: \`df.isna()\`, \`df.isna().sum()\`, \`df.isna().mean()\` (fraction), \`df[df["col"].isna()]\`.
- Drop: \`df.dropna()\` (any NaN in row), \`dropna(subset=["col"])\`, \`dropna(thresh=k)\` (keep rows with at least k non-NaN).
- Fill: \`fillna(0)\`, \`fillna(df["col"].median())\`, \`fillna({"a": 0, "b": "unknown"})\`, \`ffill()\`/\`bfill()\` (time series), \`interpolate()\`.
- **Group-wise fill:** \`df["price"] = df["price"].fillna(df.groupby("neighborhood")["price"].transform("median"))\`.
- Most aggregations skip NaN by default (\`mean\`, \`sum\`).
- Missing values may hide as sentinels: \`-999\`, \`""\`, \`"N/A"\`, \`"unknown"\` → use \`na_values=\` when reading or \`replace()\`.

### Duplicates
\`df.duplicated()\` (True for repeats after the first), \`.sum()\` to count, \`df.drop_duplicates()\`, \`drop_duplicates(subset=["customer_id"], keep="last")\`.

### Data types
- \`df["qty"].astype(int)\`, \`.astype("category")\` (saves memory for repeated labels).
- \`pd.to_numeric(s, errors="coerce")\` converts and turns unparseable values into NaN.
- \`pd.to_datetime(s, errors="coerce", format="%Y-%m-%d")\`.
- Text cleanup: \`s.str.strip().str.lower()\`, \`s.str.replace(",", "")\`.
`,
      terms: [
        ['NaN', 'Not a Number: pandas’ standard missing value marker for numbers.'],
        ['dropna', 'Removes rows/columns with missing values.'],
        ['fillna', 'Replaces missing values with a given value or method.'],
        ['Imputation', 'Filling in missing values with estimates.'],
        ['duplicated', 'Marks rows that repeat earlier rows.'],
        ['astype', 'Converts a column to a given dtype.'],
        ['errors="coerce"', 'Convert what you can; invalid values become NaN.'],
      ],
      realWorld: md`
A hospital dataset has 8% missing blood-pressure readings. Dropping those rows would remove mostly emergency patients (who were treated before measurements were taken), **biasing** the analysis toward healthier patients. Instead the team imputes by patient group and adds a flag column \`bp_missing\` so a model can learn whether missingness itself is informative.
`,
      steps: [
        'Measure missingness per column (`isna().mean()`).',
        'Ask *why* values are missing before choosing a strategy.',
        'Drop rows only when few are affected and missingness is random; otherwise impute (median/mode/group-wise).',
        'Count and drop exact duplicates (and check duplicates on key columns).',
        'Convert types with to_numeric / to_datetime using errors="coerce", then re-check NaNs.',
      ],
      code: [
        {
          title: 'Diagnosing and fixing a messy table',
          code: md`
import pandas as pd

df = pd.read_csv("data/messy_customers.csv")
print(df.dtypes, "\n")
print("missing per column:\n", df.isna().sum(), "\n")
print("duplicate rows:", df.duplicated().sum())

df = df.drop_duplicates()
df["monthly_spend"] = pd.to_numeric(df["monthly_spend"].astype(str).str.replace(",", ""), errors="coerce")
df["age"] = pd.to_numeric(df["age"], errors="coerce")
df["signup_date"] = pd.to_datetime(df["signup_date"], errors="coerce", format="%Y-%m-%d")
print(df.dtypes, "\n")
print("missing after conversion:\n", df.isna().sum())
`,
          explanation: [
            '…',
            'Load the deliberately messy customer table.',
            'age and monthly_spend are `object` (text) because of values like "thirty" and "1,450.00".',
            'Missing values per column.',
            'Exact duplicate rows (3 were added on purpose).',
            'Remove them.',
            'Remove thousands separators, then convert to numbers; unparseable values become NaN.',
            '"thirty" can’t be parsed → NaN (better than a wrong number).',
            'Dates in the wrong format become NaT (missing datetime) so we can review them.',
            'Now the columns have proper numeric/datetime types.',
            'New missing values reveal the problematic entries.',
          ],
        },
        {
          title: 'Filling strategies',
          code: md`
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "store": ["A", "A", "A", "B", "B", "B"],
    "day": [1, 2, 3, 1, 2, 3],
    "sales": [100, np.nan, 120, 300, 310, np.nan],
    "promo": ["yes", None, "no", "no", None, "yes"],
})
print(df.fillna({"sales": df["sales"].median(), "promo": "unknown"}))
print(df.assign(sales=df.groupby("store")["sales"].transform(lambda s: s.fillna(s.mean()))))
print(df.assign(sales=df.groupby("store")["sales"].ffill()))
print("rows with any NaN dropped:", len(df.dropna()))
`,
          explanation: [
            '…',
            '…',
            'A tiny dataset with gaps for two stores.',
            '…',
            '…',
            '…',
            '…',
            '…',
            'Global fill: median for numbers, a placeholder label for text. Note store B’s gap gets a value close to store A’s — not ideal.',
            'Group-wise: each store’s gap is filled with **that store’s** mean (110 and 305).',
            'Forward fill within each store: use the previous day’s value (common for time series).',
            'Dropping instead would lose half the rows.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Dropping all rows with any missing value without checking how many you lose.', fix: 'Check `isna().mean()` and the row count before and after.' },
        { mistake: 'Filling missing numbers with 0 when 0 is a meaningful value.', fix: 'Use the median, a group statistic, or a flag column.' },
        { mistake: '`df["x"].astype(float)` crashes on bad values.', fix: 'Use `pd.to_numeric(df["x"], errors="coerce")` and inspect the new NaNs.' },
        { mistake: '`df.fillna(0)` without reassigning.', fix: 'Most methods return a new DataFrame: `df = df.fillna(...)`.' },
      ],
      exercises: [
        {
          id: 'pd3-ex1', title: 'Fill with the median', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Fill the missing values in \`df["score"]\` with the column’s median (assign the result back).`,
          starter: md`
import pandas as pd
import numpy as np
df = pd.DataFrame({"score": [70, np.nan, 85, 90, np.nan, 60]})
print(df)
`,
          solution: md`
import pandas as pd
import numpy as np
df = pd.DataFrame({"score": [70, np.nan, 85, 90, np.nan, 60]})
df["score"] = df["score"].fillna(df["score"].median())
print(df)
`,
          tests: md`
assert df["score"].isna().sum() == 0, "There should be no missing values left"
assert df["score"].tolist() == [70, 77.5, 85, 90, 77.5, 60], f"Got {df['score'].tolist()}"
`,
          hints: ['Median of 70, 85, 90, 60 is 77.5.', '`df["score"] = df["score"].fillna(...)`'],
        },
        {
          id: 'pd3-ex2', title: 'Clean the messy spend column', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`Load \`data/messy_customers.csv\`, drop exact duplicates, and convert \`monthly_spend\` to a **float** column (remove commas; unparseable → NaN). Store the result in \`df\`.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/messy_customers.csv")
print(df["monthly_spend"].dtype)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/messy_customers.csv").drop_duplicates()
df["monthly_spend"] = pd.to_numeric(df["monthly_spend"].astype(str).str.replace(",", ""), errors="coerce")
print(df["monthly_spend"].dtype)
`,
          tests: md`
assert df.duplicated().sum() == 0, "Duplicates remain"
assert len(df) == 60, f"Expected 60 rows after removing duplicates, got {len(df)}"
assert df["monthly_spend"].dtype == float, f"monthly_spend dtype is {df['monthly_spend'].dtype}"
assert abs(df.loc[df.customer_id == 13, "monthly_spend"].iloc[0] - 1450.0) < 1e-9, "'1,450.00' should become 1450.0"
`,
          hints: ['`.drop_duplicates()` first.', '`.astype(str).str.replace(",", "")` then `pd.to_numeric(..., errors="coerce")`.'],
        },
        {
          id: 'pd3-ex3', title: 'Group-wise imputation', type: 'write', lang: 'python', difficulty: 'advanced',
          prompt: md`Fill missing \`price\` values with the **median price of the same neighborhood** using \`groupby(...).transform("median")\`.`,
          starter: md`
import pandas as pd
import numpy as np
df = pd.DataFrame({
    "hood": ["A", "A", "A", "B", "B", "B"],
    "price": [100, 120, np.nan, 300, np.nan, 340],
})
print(df)
`,
          solution: md`
import pandas as pd
import numpy as np
df = pd.DataFrame({
    "hood": ["A", "A", "A", "B", "B", "B"],
    "price": [100, 120, np.nan, 300, np.nan, 340],
})
df["price"] = df["price"].fillna(df.groupby("hood")["price"].transform("median"))
print(df)
`,
          tests: md`assert df["price"].tolist() == [100, 120, 110, 300, 320, 340], f"Got {df['price'].tolist()}"`,
          hints: ['`df.groupby("hood")["price"].transform("median")` returns a Series aligned with df.', 'Pass it to fillna.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which counts missing values per column?', options: ['df.count()', 'df.isna().sum()', 'df.dropna()', 'df.nunique()'], answer: 1, explanation: 'isna() then sum() counts True values per column.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: '`pd.to_numeric(["5", "x"], errors="coerce")` returns…', options: ['[5, "x"]', 'Error', '[5.0, NaN]', '[5, 0]'], answer: 2, explanation: 'Invalid entries become NaN.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why might dropping rows with missing values bias results?', options: ['It never does', 'If missingness is related to the outcome, the remaining rows are not representative', 'Because pandas reorders rows', 'Because means change dtype'], answer: 1, explanation: 'Data missing not at random can skew conclusions.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: '`df.duplicated()` marks…', options: ['Every copy including the first', 'Repeats after the first occurrence', 'Only missing rows', 'Columns'], answer: 1, explanation: 'By default keep="first", so the first occurrence is False.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which fill method suits daily stock prices with a missing day?', options: ['fillna(0)', 'Forward fill (ffill)', 'Fill with the overall mean', 'Drop the column'], answer: 1, explanation: 'The last known value is a reasonable estimate for time series.' },
      ],
      summary: [
        'Detect: isna().sum()/mean(); find hidden sentinels.',
        'Handle: dropna (carefully) or fillna (median, mode, group-wise, ffill).',
        'Duplicates: duplicated().sum(), drop_duplicates(subset=...).',
        'Types: astype, to_numeric/to_datetime with errors="coerce".',
      ],
      resources: [{ label: 'pandas: Working with missing data', url: 'https://pandas.pydata.org/docs/user_guide/missing_data.html' }, PDA],
    },
    {
      id: 'pd-groupby',
      title: 'pandas: Grouping, Aggregation & Pivot Tables',
      minutes: 45,
      difficulty: 'intermediate',
      objectives: [
        'Apply the split-apply-combine pattern with groupby',
        'Aggregate with single and multiple functions, including named aggregations',
        'Use transform to add group statistics to each row',
        'Build pivot tables and crosstabs',
      ],
      intro: md`
“Revenue by region”, “average score by class”, “churn rate by contract type”, “monthly sales per category” — most business questions are **grouped summaries**. \`groupby\` is the most important pandas method for analysis, equivalent to SQL’s \`GROUP BY\` and Excel’s pivot tables.
`,
      simple: md`
\`groupby\` works in three steps — **split, apply, combine**:

1. **Split** the rows into groups (e.g. one pile per region).
2. **Apply** a calculation to each pile (sum the revenue).
3. **Combine** the results into a new table (one row per region).

\`sales.groupby("region")["revenue"].sum()\` does all three.
`,
      technical: md`
### Basic aggregation
\`df.groupby("key")["col"].agg_func()\` where agg_func is \`sum, mean, median, count, size, min, max, std, nunique, first, last\`.
- \`count()\` counts non-null values; \`size()\` counts rows.
- Multiple keys: \`groupby(["region", "category"])\` → MultiIndex; \`.reset_index()\` flattens it; \`.unstack()\` pivots the inner level into columns.

### Multiple / named aggregations
\`\`\`python
df.groupby("region").agg(
    orders=("order_id", "count"),
    revenue=("revenue", "sum"),
    avg_units=("units", "mean"),
)
\`\`\`

### transform vs agg
- \`agg\` returns **one row per group**.
- \`transform\` returns a result **aligned to the original rows** — e.g. each order’s share of its region’s revenue: \`df["revenue"] / df.groupby("region")["revenue"].transform("sum")\`.
- \`filter\` keeps whole groups satisfying a condition.

### Time grouping
\`df.groupby(df["date"].dt.to_period("M"))\` or \`df.resample("ME", on="date")\` for monthly totals.

### Pivot tables & crosstab
\`pd.pivot_table(df, values="revenue", index="region", columns="category", aggfunc="sum", margins=True, fill_value=0)\`; \`pd.crosstab(a, b, normalize="index")\` for counts/proportions.
`,
      terms: [
        ['Split-apply-combine', 'Group rows, compute per group, combine results.'],
        ['Aggregation', 'Reducing many values to one (sum, mean...).'],
        ['Named aggregation', '`agg(new_name=("col", "func"))` syntax for tidy output.'],
        ['transform', 'Group computation returned with the original row alignment.'],
        ['MultiIndex', 'An index with several levels (from grouping by multiple keys).'],
        ['Pivot table', 'A cross-tabulated summary with rows, columns and an aggregate.'],
      ],
      realWorld: md`
A retail chain’s weekly meeting uses one pivot table: revenue by **region × category** with totals. From it the team spots that Furniture in the South is falling while Office Supplies grows everywhere, and reallocates marketing budget. That table is 1 line of pandas, refreshed automatically every week.
`,
      steps: [
        'Decide the grouping key(s) and the metric(s).',
        'Choose the aggregation function(s).',
        'Use named aggregations for clear column names.',
        'reset_index() if you need a flat table; sort the result.',
        'Use transform when you need group stats next to each row.',
      ],
      code: [
        {
          title: 'groupby with single and named aggregations',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])

print(sales.groupby("region")["revenue"].sum().sort_values(ascending=False).round(2))

summary = (sales.groupby("category")
           .agg(orders=("order_id", "count"),
                revenue=("revenue", "sum"),
                avg_order=("revenue", "mean"),
                products=("product", "nunique"))
           .sort_values("revenue", ascending=False)
           .round(2))
print(summary)

by_two = sales.groupby(["region", "category"])["revenue"].sum().unstack().round(0)
print(by_two)
`,
          explanation: [
            '…',
            '…',
            'Total revenue per region, largest first.',
            'Named aggregations: each output column is (input column, function)…',
            '…number of orders,',
            '…total revenue,',
            '…average order value,',
            '…distinct products sold.',
            'Sort by revenue…',
            '…and round.',
            '…',
            'Two grouping keys produce a MultiIndex; `unstack()` turns categories into columns — a pivot.',
            '…',
          ],
        },
        {
          title: 'transform, monthly trends and pivot tables',
          code: md`
import pandas as pd

sales = pd.read_csv("data/sales.csv", parse_dates=["order_date"])

sales["region_total"] = sales.groupby("region")["revenue"].transform("sum")
sales["share_of_region"] = sales["revenue"] / sales["region_total"]
print(sales[["region", "revenue", "share_of_region"]].head(3))

monthly = sales.groupby(sales["order_date"].dt.to_period("M"))["revenue"].sum()
print(monthly.tail(4).round(0))

pivot = pd.pivot_table(sales, values="revenue", index="region", columns="category",
                       aggfunc="sum", margins=True, margins_name="Total").round(0)
print(pivot)

print(pd.crosstab(sales["region"], sales["discount"] > 0, normalize="index").round(3))
`,
          explanation: [
            '…',
            '…',
            '`transform("sum")` gives each row its region’s total (same length as sales).',
            'Each order’s share of its region’s revenue.',
            '…',
            'Group by calendar month using a Period.',
            'Last four months of revenue.',
            'Pivot table: regions as rows, categories as columns, summed revenue…',
            '…with a Total row and column (`margins=True`).',
            '…',
            'crosstab: the proportion of discounted orders in each region (rows sum to 1).',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Forgetting to select a column, so every numeric column (including IDs) is aggregated.', fix: 'Select the metric: `groupby("g")["revenue"].sum()`, or use named aggregations.' },
        { mistake: 'Using `count()` when you mean the number of rows (count skips NaN).', fix: 'Use `size()` for row counts.' },
        { mistake: 'Trying to assign an `agg` result back as a column (length mismatch).', fix: 'Use `transform` for per-row group statistics.' },
      ],
      exercises: [
        {
          id: 'pd4-ex1', title: 'Spending by category', type: 'dataset', lang: 'python', difficulty: 'beginner',
          prompt: md`From \`data/expenses.csv\`, create \`by_cat\`: total \`amount\` per \`category\`, sorted **descending**.`,
          starter: md`
import pandas as pd
exp = pd.read_csv("data/expenses.csv")
by_cat = None
print(by_cat)
`,
          solution: md`
import pandas as pd
exp = pd.read_csv("data/expenses.csv")
by_cat = exp.groupby("category")["amount"].sum().sort_values(ascending=False)
print(by_cat)
`,
          tests: md`
_e = exp.groupby("category")["amount"].sum().sort_values(ascending=False)
assert by_cat is not None and list(by_cat.index) == list(_e.index), "Wrong order or categories"
assert (by_cat - _e).abs().max() < 1e-6
`,
          hints: ['`groupby("category")["amount"].sum()`', 'Then `.sort_values(ascending=False)`.'],
        },
        {
          id: 'pd4-ex2', title: 'Churn rate by contract', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`From \`data/churn.csv\`, compute \`rate\`: the churn rate (fraction of "Yes") for each \`contract\` type, as a Series indexed by contract.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
rate = None
print(rate)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/churn.csv")
df["churned"] = (df["churn"] == "Yes").astype(int)
rate = df.groupby("contract")["churned"].mean()
print(rate)
`,
          tests: md`
_d = pd.read_csv("data/churn.csv")
_e = (_d["churn"] == "Yes").groupby(_d["contract"]).mean()
assert rate is not None and set(rate.index) == set(_e.index)
assert (rate.sort_index() - _e.sort_index()).abs().max() < 1e-9, f"Got {rate}"
`,
          hints: ['Turn churn into 1/0 first.', 'The mean of a 0/1 column is the rate.'],
        },
        {
          id: 'pd4-ex3', title: 'Named aggregation report', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`From \`data/students.csv\`, create \`report\` grouped by \`passed\` with columns \`n\` (number of students), \`avg_hours\` (mean study_hours_week) and \`avg_attendance\` (mean attendance_pct).`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/students.csv")
report = None
print(report)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/students.csv")
report = df.groupby("passed").agg(
    n=("student_id", "count"),
    avg_hours=("study_hours_week", "mean"),
    avg_attendance=("attendance_pct", "mean"),
)
print(report)
`,
          tests: md`
assert list(report.columns) == ["n", "avg_hours", "avg_attendance"], f"Columns: {list(report.columns)}"
assert report["n"].sum() == 120
assert report.loc["yes", "avg_hours"] > report.loc["no", "avg_hours"]
`,
          hints: ['`.agg(n=("student_id", "count"), ...)`'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: '`df.groupby("city")["sales"].mean()` returns…', options: ['One row per original row', 'One value per city', 'A single number', 'The original DataFrame'], answer: 1, explanation: 'One aggregated value per group.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does `transform("mean")` return?', options: ['One value per group', 'A Series aligned with the original rows', 'A pivot table', 'A boolean mask'], answer: 1, explanation: 'Each row gets its group’s mean.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: '`size()` vs `count()` in a groupby:', options: ['They are identical', 'size counts rows; count counts non-null values', 'count counts rows; size counts NaN', 'size is only for strings'], answer: 1, explanation: 'count excludes missing values.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which builds a region × category table of summed revenue?', options: ['df.pivot_table(values="revenue", index="region", columns="category", aggfunc="sum")', 'df.groupby("revenue")', 'df.sort_values(["region", "category"])', 'df.crosstab(revenue)'], answer: 0, explanation: 'pivot_table with index, columns, values and aggfunc.' },
        { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'groupby is equivalent to which SQL clause?', options: ['WHERE', 'ORDER BY', 'GROUP BY', 'JOIN'], answer: 2, explanation: 'Module 8 covers GROUP BY.' },
      ],
      summary: [
        'groupby = split-apply-combine; select the metric column.',
        'agg with named aggregations for tidy reports.',
        'transform for per-row group stats; filter for whole groups.',
        'pivot_table and crosstab for cross-tab summaries.',
      ],
      resources: [{ label: 'pandas: Group by user guide', url: 'https://pandas.pydata.org/docs/user_guide/groupby.html' }, PDA],
    },
    {
      id: 'pd-merge-transform',
      title: 'pandas: Merging, Joining, Transforming & Exporting',
      minutes: 45,
      difficulty: 'intermediate',
      objectives: [
        'Combine tables with merge (inner, left, right, outer) and concat',
        'Detect join problems (duplicated keys, unmatched rows) with indicator and validate',
        'Transform data with apply, map, replace, cut, string and date methods',
        'Reshape with melt/pivot and export results to CSV/Excel/JSON',
      ],
      intro: md`
Data rarely arrives in one table: customers in one file, orders in another, products in a third. Combining them correctly — and transforming columns into analysis-ready features — is core analyst work. Finally, you’ll export results for others to use.
`,
      simple: md`
**Merging** is like matching two class lists by student ID: one list has names, the other has grades. Joining on the ID gives one list with both.

- **Inner join:** keep only students on **both** lists.
- **Left join:** keep **everyone** on the left list, filling blanks where there’s no match.
- **Outer join:** keep everyone from either list.

**concat** stacks tables on top of each other (like adding January’s rows under December’s).
`,
      technical: md`
### merge
\`pd.merge(left, right, on="key", how="inner")\` (or \`left.merge(right, ...)\`).
- \`how\`: \`"inner"\` (intersection), \`"left"\`, \`"right"\`, \`"outer"\` (union).
- Different key names: \`left_on="cust_id", right_on="id"\`. Multiple keys: \`on=["store", "date"]\`.
- \`indicator=True\` adds a \`_merge\` column (\`both\`, \`left_only\`, \`right_only\`).
- \`validate="one_to_one" | "one_to_many" | "many_to_one"\` raises if keys are unexpectedly duplicated — prevents row explosions.
- Overlapping column names get suffixes \`_x\`, \`_y\` (customise with \`suffixes=\`).

### concat
\`pd.concat([df_jan, df_feb], ignore_index=True)\` stacks rows; \`axis=1\` places side by side by index.

### Transforming columns
- \`map(dict)\` — recode values; \`replace({...})\`.
- \`apply(func)\` — custom function per value (or per row with \`axis=1\`; slower — prefer vectorised operations).
- \`pd.cut(x, bins, labels)\` — numeric → bins (age groups); \`pd.qcut\` — quantile bins.
- \`.str\` methods (\`lower\`, \`strip\`, \`contains\`, \`split\`, \`extract\`), \`.dt\` methods (\`year\`, \`month\`, \`day_name()\`, \`dayofweek\`).
- \`np.where\` / \`np.select\` for conditional columns.

### Reshaping
\`melt\` (wide → long), \`pivot\` (long → wide), \`stack\`/\`unstack\`.

### Exporting
\`df.to_csv("out.csv", index=False)\`, \`to_excel("out.xlsx", index=False)\` (openpyxl), \`to_json("out.json", orient="records")\`, \`to_parquet\`.
`,
      terms: [
        ['Join key', 'Column(s) used to match rows between tables.'],
        ['Inner join', 'Keeps only rows with matching keys in both tables.'],
        ['Left join', 'Keeps all left rows; unmatched right columns become NaN.'],
        ['Outer join', 'Keeps all rows from both tables.'],
        ['concat', 'Stacks DataFrames vertically or horizontally.'],
        ['pd.cut', 'Bins continuous values into intervals.'],
        ['melt', 'Reshapes wide data into long format.'],
      ],
      realWorld: md`
An analyst joins \`orders\` (1.2M rows) to \`customers\` (80k rows) on \`customer_id\` with a left join. The result unexpectedly has 1.4M rows: the customers table had duplicate IDs from a CRM migration, so some orders matched twice and revenue was overstated by 15%. Using \`validate="many_to_one"\` would have raised an error immediately. Always check row counts before and after a merge!
`,
      steps: [
        'Identify the key and check it is unique where it should be.',
        'Choose the join type based on which rows must be kept.',
        'Merge with validate= and indicator=True; check row counts and `_merge` values.',
        'Transform columns (map, cut, str/dt methods) into analysis-ready features.',
        'Export with index=False.',
      ],
      code: [
        {
          title: 'Join types, indicator and validation',
          code: md`
import pandas as pd

customers = pd.DataFrame({"customer_id": [1, 2, 3, 4], "name": ["Ana", "Ben", "Carla", "Dev"], "city": ["Cebu", "Manila", "Davao", "Cebu"]})
orders = pd.DataFrame({"order_id": [101, 102, 103, 104, 105], "customer_id": [1, 1, 2, 5, 3], "amount": [50, 20, 75, 40, 10]})

inner = orders.merge(customers, on="customer_id", how="inner")
left = orders.merge(customers, on="customer_id", how="left", indicator=True)
print(inner, "\n")
print(left[["order_id", "customer_id", "name", "_merge"]], "\n")

per_customer = customers.merge(orders.groupby("customer_id", as_index=False)["amount"].sum(), on="customer_id", how="left")
per_customer["amount"] = per_customer["amount"].fillna(0)
print(per_customer, "\n")

dupes = pd.concat([customers, customers.iloc[[0]]])
try:
    orders.merge(dupes, on="customer_id", validate="many_to_one")
except pd.errors.MergeError as e:
    print("Caught:", e)
`,
          explanation: [
            '…',
            'Four customers.',
            'Five orders; customer 5 doesn’t exist (a data problem) and Dev (4) has no orders.',
            'Inner join keeps only orders whose customer exists → 4 rows.',
            'Left join keeps all 5 orders; `_merge` shows order 104 is `left_only`.',
            '…',
            '…',
            'Total spend per customer: aggregate orders first, then left-join onto customers so Dev appears…',
            '…with 0 instead of NaN.',
            '…',
            'Simulate a duplicated customer key…',
            '`validate="many_to_one"` checks the right side has unique keys…',
            '…and raises a MergeError instead of silently duplicating orders.',
            '…',
          ],
        },
        {
          title: 'Transforming, reshaping and exporting',
          code: md`
import pandas as pd
import numpy as np

mall = pd.read_csv("data/mall_customers.csv")
mall["age_group"] = pd.cut(mall["age"], bins=[17, 25, 35, 50, 70], labels=["18-25", "26-35", "36-50", "51-70"])
mall["gender_code"] = mall["gender"].map({"Female": "F", "Male": "M"})
mall["segment"] = np.select(
    [mall["spending_score"] >= 70, mall["spending_score"] >= 40],
    ["high", "medium"], default="low")
print(mall.head())
print(mall.groupby("age_group", observed=True)["spending_score"].mean().round(1))

wide = pd.DataFrame({"store": ["A", "B"], "jan": [100, 80], "feb": [120, 95]})
long = wide.melt(id_vars="store", var_name="month", value_name="sales")
print(long)
print(long.pivot(index="store", columns="month", values="sales"))

mall.to_csv("mall_enriched.csv", index=False)
print(open("mall_enriched.csv").readline())
`,
          explanation: [
            '…',
            '…',
            'Load the mall customers data.',
            '`pd.cut` bins ages into labelled groups (intervals are right-inclusive: 17 < age ≤ 25 etc.).',
            '`map` recodes values with a dictionary.',
            '`np.select` builds a column from several conditions, checked in order…',
            '…',
            '…with a default for everything else.',
            '…',
            'Average spending score per age group (`observed=True` keeps only categories present).',
            'A wide table: one column per month.',
            '`melt` converts it to long format: one row per store-month.',
            '…',
            '`pivot` goes back to wide.',
            'Export without the index column.',
            'Read the header line back to verify.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Not checking row counts after a merge → silent duplication.', fix: 'Compare `len()` before/after and use `validate=`.' },
        { mistake: 'Using an inner join and silently losing unmatched rows.', fix: 'Use `indicator=True` to see what was dropped; choose the join type deliberately.' },
        { mistake: 'Merging on keys with different dtypes (int vs string) → no matches.', fix: 'Convert keys to the same dtype first.' },
        { mistake: 'Exporting with the index, creating an “Unnamed: 0” column later.', fix: 'Use `index=False`.' },
      ],
      exercises: [
        {
          id: 'pd5-ex1', title: 'Left join and fill', type: 'write', lang: 'python', difficulty: 'intermediate',
          prompt: md`Create \`result\`: **all** products with their total \`qty\` sold (sum over \`sales\`), using 0 for products that never sold. Columns: \`product\`, \`name\`, \`qty\`.`,
          starter: md`
import pandas as pd
products = pd.DataFrame({"product": ["P1", "P2", "P3"], "name": ["Pen", "Ink", "Pad"]})
sales = pd.DataFrame({"product": ["P1", "P1", "P3"], "qty": [5, 2, 4]})
result = None
print(result)
`,
          solution: md`
import pandas as pd
products = pd.DataFrame({"product": ["P1", "P2", "P3"], "name": ["Pen", "Ink", "Pad"]})
sales = pd.DataFrame({"product": ["P1", "P1", "P3"], "qty": [5, 2, 4]})
totals = sales.groupby("product", as_index=False)["qty"].sum()
result = products.merge(totals, on="product", how="left")
result["qty"] = result["qty"].fillna(0)
print(result)
`,
          tests: md`
assert list(result.columns) == ["product", "name", "qty"], f"Columns: {list(result.columns)}"
assert result.set_index("product")["qty"].to_dict() == {"P1": 7, "P2": 0, "P3": 4}
`,
          hints: ['Aggregate sales per product first.', 'Left-join onto products, then fillna(0).'],
        },
        {
          id: 'pd5-ex2', title: 'Bin and recode', type: 'dataset', lang: 'python', difficulty: 'intermediate',
          prompt: md`In \`data/houses.csv\`, add a column \`size_band\` using \`pd.cut\` on \`area_sqft\` with bins \`[0, 1000, 2000, 5000]\` and labels \`["small", "medium", "large"]\`. Then store the number of **large** houses in \`n_large\`.`,
          starter: md`
import pandas as pd
df = pd.read_csv("data/houses.csv")
n_large = 0
print(n_large)
`,
          solution: md`
import pandas as pd
df = pd.read_csv("data/houses.csv")
df["size_band"] = pd.cut(df["area_sqft"], bins=[0, 1000, 2000, 5000], labels=["small", "medium", "large"])
n_large = int((df["size_band"] == "large").sum())
print(n_large)
`,
          tests: md`
assert "size_band" in df.columns, "Add the size_band column"
assert n_large == int((pd.read_csv("data/houses.csv")["area_sqft"] > 2000).sum()), f"Got {n_large}"
`,
          hints: ['`pd.cut(df["area_sqft"], bins=[...], labels=[...])`', 'Count with `(df["size_band"] == "large").sum()`.'],
        },
        {
          id: 'pd5-ex3', title: 'Fix the exploding merge', type: 'debug', lang: 'python', difficulty: 'advanced',
          prompt: md`\`total\` should be the true total order amount (\`165\`), but the merge duplicates rows because the \`regions\` table repeats a key. De-duplicate \`regions\` before merging so \`total\` is correct.`,
          starter: md`
import pandas as pd
orders = pd.DataFrame({"store": ["S1", "S2", "S1"], "amount": [50, 75, 40]})
regions = pd.DataFrame({"store": ["S1", "S2", "S1"], "region": ["North", "South", "North"]})
merged = orders.merge(regions, on="store", how="left")
total = merged["amount"].sum()
print(len(merged), total)
`,
          solution: md`
import pandas as pd
orders = pd.DataFrame({"store": ["S1", "S2", "S1"], "amount": [50, 75, 40]})
regions = pd.DataFrame({"store": ["S1", "S2", "S1"], "region": ["North", "South", "North"]})
regions = regions.drop_duplicates(subset="store")
merged = orders.merge(regions, on="store", how="left", validate="many_to_one")
total = merged["amount"].sum()
print(len(merged), total)
`,
          tests: md`
assert len(merged) == 3, f"merged should keep 3 rows, has {len(merged)}"
assert total == 165, f"total should be 165, got {total}"
`,
          hints: ['Check `regions["store"].duplicated()`.', '`regions.drop_duplicates(subset="store")` before merging.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which join keeps all rows from the left table?', options: ['inner', 'left', 'right', 'cross'], answer: 1, explanation: 'Left join keeps every left row.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'After a left join, the result has more rows than the left table. The likely cause is…', options: ['Missing values', 'Duplicate keys in the right table', 'Wrong dtypes', 'An outer join'], answer: 1, explanation: 'Each duplicate match creates an extra row.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'To stack January and February DataFrames with the same columns use…', options: ['pd.merge', 'pd.concat', 'df.join', 'df.melt'], answer: 1, explanation: 'concat stacks rows.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: '`melt` converts…', options: ['Long to wide', 'Wide to long', 'Strings to numbers', 'CSV to Excel'], answer: 1, explanation: 'melt unpivots columns into rows.' },
        { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'Why use `index=False` in `to_csv`?', options: ['It is faster', 'To avoid writing the row index as an extra column', 'Required for Excel', 'To keep headers'], answer: 1, explanation: 'Otherwise you get an “Unnamed: 0” column when reading back.' },
      ],
      summary: [
        'merge with how = inner/left/right/outer; check counts, use indicator and validate.',
        'concat stacks tables.',
        'Transform with map, replace, cut/qcut, np.select, .str and .dt.',
        'Reshape with melt/pivot; export with to_csv(index=False).',
      ],
      resources: [{ label: 'pandas: Merge, join, concatenate', url: 'https://pandas.pydata.org/docs/user_guide/merging.html' }, PDA],
    },
    {
      id: 'jupyter',
      title: 'Jupyter Notebooks: Interactive, Documented Analysis',
      minutes: 25,
      difficulty: 'beginner',
      objectives: [
        'Navigate the Jupyter interface: kernel, code cells, Markdown cells, outputs',
        'Run cells, restart the kernel and understand execution order',
        'Document an analysis with Markdown headings, text and formulas',
        'Follow notebook best practices for reproducible analysis',
      ],
      intro: md`
Jupyter notebooks are the standard working environment of data scientists. They mix runnable code, its output (tables, charts) and explanatory text in one document — perfect for exploring data and telling the story of an analysis. This app’s **Coding Playground → Notebook** tab works the same way, so you can practise right here.
`,
      simple: md`
A notebook is like a lab notebook where every experiment can be re-run:
- **Code cells** hold Python; press **Shift+Enter** to run one and see the result right below it.
- **Markdown cells** hold formatted text: headings, bullet points, links, even math.
- The **kernel** is the Python “engine” running in the background. It remembers variables between cells — so the *order* you run cells in matters!
`,
      technical: md`
### Interface essentials
- Launch: \`jupyter lab\` or \`jupyter notebook\` in a terminal (Anaconda includes both), or use Google Colab / VS Code’s notebook editor. Files end in \`.ipynb\` (JSON under the hood).
- **Command mode** (Esc) vs **edit mode** (Enter). Shortcuts: \`Shift+Enter\` run & move, \`Ctrl+Enter\` run in place, \`A\`/\`B\` insert cell above/below, \`M\` Markdown, \`Y\` code, \`D D\` delete.
- The execution counter \`[5]\` shows the order cells ran in.
- The last expression in a cell is displayed automatically (DataFrames render as tables).

### Kernel & state
- Variables persist across cells. Running cells out of order can produce results that can’t be reproduced.
- **Kernel → Restart & Run All** checks that the notebook works top-to-bottom. Do this before sharing.
- Interrupt a long-running cell with the stop button.

### Markdown
\`# Heading\`, \`**bold**\`, \`*italic*\`, \`- bullet\`, \`[link](url)\`, inline math \`$\bar{x}$\`, tables, and code spans.

### Magics (classic Jupyter/IPython)
\`%timeit expr\` (time code), \`%matplotlib inline\`, \`!pip install package\` (shell command), \`%who\` (list variables).

### Best practices
1. Title + purpose at the top (Markdown).
2. Imports and settings in the first cell.
3. Load data once; clean → explore → model in sections with headings.
4. Explain *why* in Markdown, not just *what* the code does.
5. Keep cells short; move reusable code into functions or \`.py\` modules.
6. Restart & Run All before sharing; clear secrets; commit to Git (consider \`nbstripout\` for outputs).
`,
      terms: [
        ['Notebook', 'An .ipynb document of code cells, outputs and Markdown cells.'],
        ['Kernel', 'The background process that executes code and holds variables.'],
        ['Code cell', 'A cell containing executable code.'],
        ['Markdown cell', 'A cell containing formatted text.'],
        ['Execution count', 'The [n] number showing the order cells were run.'],
        ['Restart & Run All', 'Re-executes the notebook from scratch to verify reproducibility.'],
        ['Magic command', 'IPython commands starting with % or !.'],
      ],
      realWorld: md`
A data scientist shares an analysis notebook with a colleague, who opens it and gets \`NameError: name 'clean_df' is not defined\`. The author had defined \`clean_df\` in a cell they later deleted — their kernel still remembered it. A quick **Restart & Run All** before sharing would have caught the problem. Reproducibility is a professional skill interviewers look for in portfolio notebooks.
`,
      steps: [
        'Open Coding Playground → Notebook (or Jupyter/Colab on your computer).',
        'Write a Markdown title and a one-sentence goal.',
        'Add code cells: imports, load data, explore — one idea per cell.',
        'Add Markdown cells explaining each finding.',
        'Restart the kernel and run all cells to confirm everything works in order.',
      ],
      code: [
        {
          title: 'A notebook-style mini analysis (run it, then try it as cells in the Notebook tab)',
          code: md`
# --- Cell 1: setup ---------------------------------------------
import pandas as pd
import matplotlib.pyplot as plt

# --- Cell 2: load ----------------------------------------------
students = pd.read_csv("data/students.csv")

# --- Cell 3: question - does study time relate to passing? -----
summary = students.groupby("passed")["study_hours_week"].describe()[["count", "mean", "50%"]]
print(summary.round(1))

# --- Cell 4: visualise -----------------------------------------
students.boxplot(column="study_hours_week", by="passed", grid=False)
plt.suptitle("")
plt.title("Weekly study hours by pass/fail")
plt.ylabel("hours")
plt.show()

# --- Cell 5: the last expression is displayed automatically ----
students[["study_hours_week", "attendance_pct", "average"]].corr().round(2)
`,
          explanation: [
            'In a notebook, each commented block would be its own cell.',
            'Imports go first, in one cell.',
            '…',
            '…',
            'Load the data once.',
            '…',
            'A Markdown cell above this would state the question in plain words.',
            'Compare study hours for students who passed vs failed.',
            '…',
            '…',
            'A box plot answers the question visually (pandas’ `boxplot` with `by=`).',
            'Remove pandas’ automatic super-title.',
            '…',
            '…',
            '…',
            '…',
            'Like Jupyter, this app displays the value of the last line — here a correlation table.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Running cells out of order and sharing a notebook that fails from top to bottom.', fix: 'Restart & Run All before sharing.' },
        { mistake: 'One giant cell with 200 lines.', fix: 'Split into small cells grouped under Markdown headings.' },
        { mistake: 'No explanation — just code.', fix: 'Use Markdown to state questions, decisions and conclusions.' },
        { mistake: 'Leaving API keys or passwords in notebook cells.', fix: 'Use environment variables; never commit secrets.' },
      ],
      exercises: [
        {
          id: 'jup-ex1', title: 'Shared state between cells', type: 'predict', lang: 'python', difficulty: 'beginner',
          prompt: md`
In a notebook you run **cell A** (\`x = 10\`), then **cell B** (\`x = x * 2\`), then **cell B again**, then **cell C** (\`print(x)\`). What is printed?
`,
          solution: '40', accepted: ['40'],
          hints: ['The kernel remembers x between runs: 10 → 20 → 40.'],
        },
        {
          id: 'jup-ex2', title: 'Display the last expression', type: 'write', lang: 'python', difficulty: 'beginner',
          prompt: md`Like a notebook cell: load \`data/stock_prices.csv\` into \`stock\`, compute \`max_close\` (the highest closing price), and end the cell with \`stock.tail(3)\` so the last rows are displayed.`,
          starter: md`
import pandas as pd
`,
          solution: md`
import pandas as pd
stock = pd.read_csv("data/stock_prices.csv")
max_close = stock["close"].max()
stock.tail(3)
`,
          tests: md`
assert "stock" in dir() and len(stock) == 783, "Load data/stock_prices.csv into stock"
assert max_close == stock["close"].max(), "max_close should be the highest close"
`,
          hints: ['`stock["close"].max()`', 'The last line `stock.tail(3)` is shown automatically.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What does the kernel do?', options: ['Formats Markdown', 'Executes code and stores variables', 'Saves files to the cloud', 'Draws charts only'], answer: 1, explanation: 'The kernel is the running Python process.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Which shortcut runs the current cell and moves to the next?', options: ['Ctrl+S', 'Shift+Enter', 'Alt+F4', 'Tab'], answer: 1, explanation: 'Shift+Enter runs and advances.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why use “Restart & Run All” before sharing?', options: ['It makes the notebook faster', 'It verifies the notebook runs correctly from top to bottom with no hidden state', 'It deletes outputs permanently', 'It is required to save'], answer: 1, explanation: 'It removes dependence on out-of-order execution.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'Where do you write explanations and headings?', options: ['Code cells as print()', 'Markdown cells', 'The kernel', 'Terminal'], answer: 1, explanation: 'Markdown cells render formatted text.' },
      ],
      summary: [
        'Notebooks mix code, output and Markdown; the kernel keeps state.',
        'Execution order matters — Restart & Run All before sharing.',
        'Document questions, decisions and conclusions in Markdown.',
        'Practise in the Playground’s Notebook tab, Jupyter, VS Code or Colab.',
      ],
      resources: [{ label: 'Project Jupyter', url: 'https://jupyter.org/' }, { label: 'Google Colab', url: 'https://colab.research.google.com/' }],
    },
  ],
};
