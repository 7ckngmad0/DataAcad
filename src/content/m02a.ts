import type { Lesson } from '../types.ts';
import { md } from './md.ts';

const PY_DOCS = { label: 'Official Python Tutorial', url: 'https://docs.python.org/3/tutorial/' };

export const m02a: Lesson[] = [
  {
    id: 'py-setup-variables',
    title: 'Setting Up Python, Variables & Data Types',
    minutes: 35,
    difficulty: 'beginner',
    objectives: [
      'Install Python and a code editor (or use a notebook) on your own computer',
      'Create variables and follow Python naming rules',
      'Use the core data types: int, float, str, bool and None',
      'Check types with type() and convert between types',
    ],
    intro: md`
Python is the most popular language for Data Science because it reads almost like English, has a huge ecosystem of data libraries, and runs everywhere. In this lesson you will set up Python on your computer (you can also keep using the in-browser editor here) and learn the most basic building block of every program: **variables**.
`,
    simple: md`
A **variable** is a labelled box where you store a value so you can use it later.

\`price = 4.5\` means: *“make a box called price and put 4.5 inside it.”*

Every value has a **type**, which tells Python what kind of thing it is:
- \`42\` is an **integer** (whole number),
- \`4.5\` is a **float** (decimal number),
- \`"coffee"\` is a **string** (text),
- \`True\` / \`False\` are **booleans** (yes/no),
- \`None\` means *“no value”* (an empty box).

The type matters: you can multiply numbers, but multiplying text gives a different result (\`"ha" * 3\` is \`"hahaha"\`!).
`,
    technical: md`
### Installing Python (on your computer)
1. **Option A (recommended for beginners): Anaconda** — installs Python plus Jupyter, pandas, NumPy, matplotlib and scikit-learn in one go. Download from anaconda.com, then launch *Jupyter Notebook* or *JupyterLab*.
2. **Option B: python.org + VS Code** — install Python 3.12+ from python.org (Windows: tick *“Add python.exe to PATH”*), install VS Code with the *Python* and *Jupyter* extensions, then in a terminal run \`pip install pandas numpy matplotlib seaborn scikit-learn jupyter\`.
3. **Option C: Google Colab** — free notebooks in the browser, no installation.

Verify with \`python --version\` in a terminal. It is good practice to use a **virtual environment** per project (\`python -m venv .venv\`) so package versions don’t clash.

### Variables and assignment
\`name = value\` binds a name to an object. Python is **dynamically typed**: the type belongs to the value, not the variable, so a name can later refer to a value of a different type.

**Naming rules:** letters, digits and underscores; cannot start with a digit; case-sensitive (\`Age\` ≠ \`age\`); cannot be a keyword (\`if\`, \`for\`, \`class\`...). **Convention (PEP 8):** \`snake_case\` for variables and functions, e.g. \`monthly_revenue\`.

### Core built-in types
| Type | Example | Notes |
|---|---|---|
| \`int\` | \`7\`, \`-3\`, \`1_000_000\` | arbitrary precision |
| \`float\` | \`3.14\`, \`2.5e-3\` | 64-bit; may have rounding error (\`0.1 + 0.2 != 0.3\`) |
| \`str\` | \`"hi"\`, \`'hi'\` | immutable text |
| \`bool\` | \`True\`, \`False\` | subclass of int (\`True == 1\`) |
| \`NoneType\` | \`None\` | absence of a value |

### Type conversion (casting)
\`int("42")\` → 42, \`float("3.5")\` → 3.5, \`str(10)\` → "10", \`bool(0)\` → False. Invalid conversions raise \`ValueError\` (e.g. \`int("3.5")\`, \`int("abc")\`).
`,
    terms: [
      ['Variable', 'A name that refers to a value stored in memory.'],
      ['Assignment', 'Binding a value to a name with `=`, e.g. `x = 5`.'],
      ['Data type', 'The kind of value: int, float, str, bool, None, list, dict...'],
      ['Dynamic typing', 'Types are checked at run time and belong to values, not variable names.'],
      ['Casting', 'Converting a value to another type, e.g. `int("5")`.'],
      ['Virtual environment', 'An isolated folder of Python packages for one project.'],
      ['PEP 8', 'Python’s official style guide (snake_case names, 4-space indents...).'],
    ],
    realWorld: md`
A café owner tracks a day of sales in a script:

\`\`\`python
shop_name = "Bean There"      # str
cups_sold = 184               # int
avg_price = 3.75              # float
is_open_sunday = False        # bool
\`\`\`

From these, \`revenue = cups_sold * avg_price\` gives 690.0. Data scientists do exactly this, but the values come from files and databases instead of being typed by hand.
`,
    steps: [
      'Pick a meaningful name in snake_case (e.g. `total_sales`, not `ts` or `x1`).',
      'Assign a value with `=`. Read it as “becomes”, not “equals”.',
      'Use the variable in expressions: `total = price * quantity`.',
      'Inspect it with `print(total)` and `type(total)`.',
      'Convert types when needed: text read from a file or `input()` is always a string, so use `int()` / `float()` before doing math.',
    ],
    code: [
      {
        title: 'Variables and types',
        code: md`
shop_name = "Bean There"
cups_sold = 184
avg_price = 3.75
is_open_sunday = False
manager = None

revenue = cups_sold * avg_price
print(shop_name, "earned", revenue)
print(type(cups_sold), type(avg_price), type(shop_name), type(is_open_sunday), type(manager))
`,
        explanation: [
          '`shop_name` stores text — a **str** — written in quotes.',
          '`cups_sold` stores a whole number — an **int**.',
          '`avg_price` stores a decimal — a **float**.',
          '`is_open_sunday` stores a **bool** (`True` or `False`, capitalised).',
          '`manager = None` means “no value yet”.',
          '`revenue = cups_sold * avg_price` multiplies an int by a float; the result is a float (690.0).',
          '`print()` can take several values separated by commas; it puts spaces between them.',
          '`type()` reveals the type of each value.',
        ],
      },
      {
        title: 'Converting types',
        code: md`
text_quantity = "12"          # e.g. read from a file
quantity = int(text_quantity)
print(quantity + 3)           # 15, not "123"

print("12" + "3")             # string concatenation -> "123"
print(float("19.99") * 2)
print(str(2026) + " report")
print(int(7.9))               # truncates toward zero -> 7
print(round(7.9))             # rounds -> 8
print(bool(0), bool(5), bool(""), bool("hi"))
`,
        explanation: [
          'Data read from files or forms arrives as **text**, even if it looks like a number.',
          '`int(...)` converts the string `"12"` into the integer 12.',
          'Now math works: 12 + 3 = 15. (`#` starts a comment — Python ignores it.)',
          'Adding two **strings** joins them instead — a classic beginner surprise.',
          '`float("19.99")` → 19.99, doubled → 39.98.',
          '`str(2026)` turns a number into text so it can be joined with another string.',
          '`int()` on a float cuts off the decimals (it does **not** round).',
          '`round()` rounds to the nearest integer.',
          '`bool()` of zero or an empty string is `False`; other values are `True` (“truthiness”).',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Writing `print("Total: " + 5)` → `TypeError: can only concatenate str (not "int") to str`.', fix: 'Convert first: `"Total: " + str(5)`, or better, use an f-string: `f"Total: {5}"`.' },
      { mistake: 'Using `true`/`false` in lowercase.', fix: 'Python booleans are capitalised: `True`, `False`, and `None`.' },
      { mistake: 'Starting a variable name with a digit (`2nd_place = ...`) or using spaces.', fix: 'Use letters/underscores: `second_place`.' },
      { mistake: 'Expecting `0.1 + 0.2 == 0.3` to be True.', fix: 'Floats are approximate. Compare with `round(x, 2)` or `math.isclose(a, b)`.' },
    ],
    exercises: [
      {
        id: 'py1-ex1', title: 'Compute revenue', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Create variables \`units = 25\` and \`unit_price = 3.2\`, then a variable \`revenue\` equal to units × price. Print it.`,
        starter: md`# your code here
`,
        solution: md`
units = 25
unit_price = 3.2
revenue = units * unit_price
print(revenue)
`,
        tests: md`
assert "units" in dir() and units == 25, "Create units = 25"
assert "unit_price" in dir() and unit_price == 3.2, "Create unit_price = 3.2"
assert round(revenue, 6) == 80.0, f"revenue should be 80.0, got {revenue}"
`,
        hints: ['Multiplication uses `*`.', 'Define the two inputs first, then `revenue = units * unit_price`.'],
      },
      {
        id: 'py1-ex2', title: 'Fix the TypeError', type: 'debug', lang: 'python', difficulty: 'beginner',
        prompt: md`This code crashes. Fix it so that \`total\` is the **number** 15 (the sum of the two quantities).`,
        starter: md`
qty_a = "10"
qty_b = 5
total = qty_a + qty_b
print(total)
`,
        solution: md`
qty_a = "10"
qty_b = 5
total = int(qty_a) + qty_b
print(total)
`,
        tests: md`assert total == 15 and isinstance(total, int), f"total should be the integer 15, got {total!r}"`,
        hints: ['One of the values is a string.', 'Convert `qty_a` with `int()` before adding.'],
      },
      {
        id: 'py1-ex3', title: 'Predict the type', type: 'predict', lang: 'python', difficulty: 'beginner',
        prompt: md`What does \`print(type(7 / 2).__name__)\` print? (the type name only)`,
        solution: 'float', accepted: ['float'],
        hints: ['In Python 3, `/` always performs true division.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What is the type of `3.0`?', options: ['int', 'float', 'str', 'bool'], answer: 1, explanation: 'Any number with a decimal point is a float, even 3.0.' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Which variable name is valid in Python?', options: ['2total', 'total-sales', 'total_sales', 'class'], answer: 2, explanation: 'Names cannot start with a digit, contain hyphens, or be keywords like `class`.' },
      { id: 'q3', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'print("5" + "5")', accepted: ['55'], explanation: 'Adding strings concatenates them: "5" + "5" = "55".' },
      { id: 'q4', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'print(int(9.99))', accepted: ['9'], explanation: '`int()` truncates toward zero; it does not round.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does `int("3.5")` do?', options: ['Returns 3', 'Returns 4', 'Raises ValueError', 'Returns 3.5'], answer: 2, explanation: '`int()` can only parse strings that look like whole numbers. Use `int(float("3.5"))` instead.' },
      { id: 'q6', kind: 'mcq', difficulty: 'beginner', prompt: 'Which value represents “no value” in Python?', options: ['0', '""', 'None', 'False'], answer: 2, explanation: '`None` is Python’s special “nothing” value.' },
    ],
    summary: [
      'Install via Anaconda, python.org + VS Code, or use Google Colab.',
      'Variables are names bound to values with `=`; use snake_case.',
      'Core types: int, float, str, bool, None. Check with `type()`.',
      'Convert with `int()`, `float()`, `str()`, `bool()` — text from files must be converted before math.',
    ],
    resources: [PY_DOCS, { label: 'Anaconda Distribution', url: 'https://www.anaconda.com/download' }, { label: 'PEP 8 style guide', url: 'https://peps.python.org/pep-0008/' }],
  },
  {
    id: 'py-strings',
    title: 'Strings: Working with Text',
    minutes: 35,
    difficulty: 'beginner',
    objectives: [
      'Index and slice strings',
      'Use common string methods: lower, upper, strip, replace, split, join, startswith, find',
      'Format output with f-strings, including number formatting',
      'Clean messy text data — a daily Data Science task',
    ],
    intro: md`
Text is everywhere in data: names, addresses, product descriptions, survey answers, tweets. Messy text (\`"  Manila "\` vs \`"manila"\`) is one of the most common data-quality problems. Strings and their methods are your first cleaning tools.
`,
    simple: md`
A string is a sequence of characters, like beads on a string. Each bead has a position number (**index**) starting from **0**.

\`\`\`text
 P  y  t  h  o  n
 0  1  2  3  4  5
-6 -5 -4 -3 -2 -1
\`\`\`

You can grab one bead (\`word[0]\` → \`"P"\`), a slice (\`word[0:3]\` → \`"Pyt"\`), or count from the end with negative numbers (\`word[-1]\` → \`"n"\`).

String **methods** are built-in actions: \`"hello".upper()\` → \`"HELLO"\`.
`,
    technical: md`
- Strings are **immutable**: methods return a *new* string; the original is unchanged. You must reassign: \`s = s.strip()\`.
- **Indexing:** \`s[i]\`; **slicing:** \`s[start:stop:step]\` — \`stop\` is *excluded*. \`s[::-1]\` reverses.
- **Length:** \`len(s)\`. **Membership:** \`"py" in s\`.
- **Common methods:**

| Method | Result |
|---|---|
| \`s.lower()\`, \`s.upper()\`, \`s.title()\` | change case |
| \`s.strip()\`, \`s.lstrip()\`, \`s.rstrip()\` | remove surrounding whitespace |
| \`s.replace(old, new)\` | replace all occurrences |
| \`s.split(sep)\` | list of parts |
| \`sep.join(list)\` | glue a list of strings |
| \`s.startswith(x)\`, \`s.endswith(x)\` | True/False |
| \`s.find(x)\` | index of first match or -1 |
| \`s.count(x)\` | occurrences |
| \`s.isdigit()\`, \`s.isalpha()\` | character checks |

- **f-strings** (formatted string literals): \`f"{name} sold {qty} items"\`. Format specs: \`{x:.2f}\` (2 decimals), \`{x:,}\` (thousands separator), \`{x:.1%}\` (percentage), \`{s:>10}\` (right-align in 10 chars).
- **Escape sequences:** \`\n\` newline, \`\t\` tab, \`\\\` backslash. Triple quotes \`"""..."""\` allow multi-line strings.
`,
    terms: [
      ['String', 'An immutable sequence of characters, written in quotes.'],
      ['Index', 'A character’s position, starting at 0 (negative indices count from the end).'],
      ['Slice', 'A sub-string `s[start:stop]`; `stop` is not included.'],
      ['Method', 'A function attached to an object, called with a dot: `s.upper()`.'],
      ['Immutable', 'Cannot be changed in place; operations create new objects.'],
      ['f-string', 'A string prefixed with `f` that evaluates `{expressions}` inside it.'],
    ],
    realWorld: md`
A survey export contains city names typed by users: \`"  manila"\`, \`"MANILA "\`, \`"Manila City"\`. Before you can count responses per city you normalise them:

\`city.strip().lower().replace(" city", "").title()\` → \`"Manila"\` for all three.

This exact pattern (applied to whole columns with pandas \`.str\` methods in Module 5) is used daily by analysts.
`,
    steps: [
      'Remove surrounding spaces with `.strip()`.',
      'Standardise case with `.lower()` (or `.title()` for display).',
      'Fix known variants with `.replace()`.',
      'Split compound fields with `.split()` (e.g. "Lopez, Ana" → last and first name).',
      'Build clean output messages with f-strings.',
    ],
    code: [
      {
        title: 'Indexing, slicing and methods',
        code: md`
word = "DataScience"
print(word[0], word[-1])      # first and last characters
print(word[0:4])              # "Data"
print(word[4:])               # "Science"
print(word[::-1])             # reversed
print(len(word))

messy = "   Manila CITY  "
clean = messy.strip().lower().replace(" city", "").title()
print(f"[{messy}] -> [{clean}]")
`,
        explanation: [
          'Create a string.',
          '`word[0]` is the first character; `word[-1]` the last.',
          '`word[0:4]` takes indexes 0, 1, 2, 3 (stop index 4 is excluded) → "Data".',
          'Omitting the stop (`word[4:]`) goes to the end.',
          'A step of -1 walks backwards, reversing the string.',
          '`len()` counts characters: 11.',
          'A messy value with extra spaces and odd capitalisation.',
          '**Method chaining**: each method returns a new string, so we can call the next one directly. strip → "Manila CITY", lower → "manila city", replace → "manila", title → "Manila".',
          'The brackets in the f-string make the surrounding spaces visible.',
        ],
      },
      {
        title: 'split, join and f-string formatting',
        code: md`
record = "Lopez,Ana,ana.lopez@mail.com,1450.5"
last, first, email, spend = record.split(",")
spend = float(spend)

print(f"{first} {last}")
print(f"Domain: {email.split('@')[1]}")
print(f"Monthly spend: \${spend:,.2f}")
print(f"Share of budget: {spend / 5000:.1%}")

tags = ["python", "sql", "stats"]
print(" | ".join(tags))
`,
        explanation: [
          'A comma-separated record, like one line of a CSV file.',
          '`split(",")` returns a list of 4 strings; **unpacking** assigns them to 4 variables at once.',
          'Convert the spend text into a float so we can calculate with it.',
          'f-strings insert variables inside `{}`.',
          'Expressions work inside `{}`: split the email at "@" and take part `[1]` (the domain).',
          '`:,.2f` → thousands separator + 2 decimals: $1,450.50. (The `$` before `{` is just a literal dollar sign.)',
          '`:.1%` multiplies by 100 and adds % with 1 decimal: 29.0%.',
          'A list of strings…',
          '`" | ".join(list)` glues them with a separator — the opposite of split.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Calling `s.upper()` and expecting `s` to change.', fix: 'Strings are immutable — reassign: `s = s.upper()`.' },
      { mistake: 'Off-by-one slicing: expecting `s[0:3]` to include index 3.', fix: 'The stop index is excluded: `s[0:3]` gives 3 characters (0, 1, 2).' },
      { mistake: 'Mixing quote types: `\'It\'s\'` breaks the string.', fix: 'Use double quotes outside: `"It\'s"`, or escape: `\'It\\\'s\'`.' },
      { mistake: 'Forgetting the `f` prefix: `"Total: {x}"` prints the braces literally.', fix: 'Write `f"Total: {x}"`.' },
    ],
    exercises: [
      {
        id: 'py2-ex1', title: 'Clean a product name', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Clean \`raw = "  wireless MOUSE  "\` so that \`clean\` equals \`"Wireless Mouse"\` (no surrounding spaces, title case).`,
        starter: md`
raw = "  wireless MOUSE  "
clean = raw
print(f"[{clean}]")
`,
        solution: md`
raw = "  wireless MOUSE  "
clean = raw.strip().title()
print(f"[{clean}]")
`,
        tests: md`assert clean == "Wireless Mouse", f"Expected 'Wireless Mouse', got {clean!r}"`,
        hints: ['`.strip()` removes spaces at both ends.', '`.title()` capitalises the first letter of each word.'],
      },
      {
        id: 'py2-ex2', title: 'Extract the domain', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Write code that sets \`domain\` to the part of \`email\` after the \`@\`, in lowercase. For \`"Ana.Lopez@Gmail.COM"\` the result must be \`"gmail.com"\`.`,
        starter: md`
email = "Ana.Lopez@Gmail.COM"
domain = ___
print(domain)
`,
        solution: md`
email = "Ana.Lopez@Gmail.COM"
domain = email.split("@")[1].lower()
print(domain)
`,
        tests: md`assert domain == "gmail.com", f"Expected 'gmail.com', got {domain!r}"`,
        hints: ['`email.split("@")` returns a list of two parts.', 'Take index `[1]` and call `.lower()`.'],
      },
      {
        id: 'py2-ex3', title: 'Format a report line', type: 'fill', lang: 'python', difficulty: 'intermediate',
        prompt: md`Fill in the f-string so that \`line\` is exactly \`Revenue: $12,345.68 (growth 7.5%)\`.`,
        starter: md`
revenue = 12345.678
growth = 0.075
line = f"Revenue: \${revenue:___} (growth {growth:___})"
print(line)
`,
        solution: md`
revenue = 12345.678
growth = 0.075
line = f"Revenue: \${revenue:,.2f} (growth {growth:.1%})"
print(line)
`,
        tests: md`assert line == "Revenue: $12,345.68 (growth 7.5%)", f"Got {line!r}"`,
        hints: ['Thousands separator and 2 decimals: `,.2f`.', 'Percentage with one decimal: `.1%`.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 's = "python"\nprint(s[1:4])', accepted: ['yth'], explanation: 'Indexes 1, 2, 3 → "y", "t", "h". The stop index 4 is excluded.' },
      { id: 'q2', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'print("data"[-1])', accepted: ['a'], explanation: 'Index -1 is the last character.' },
      { id: 'q3', kind: 'mcq', difficulty: 'beginner', prompt: 'After `s = " hi "` and `s.strip()`, what is `s`?', options: ['"hi"', '" hi "', 'None', 'An error'], answer: 1, explanation: 'strip() returns a new string; since we did not reassign, s is unchanged.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does `"a,b,,c".split(",")` return?', options: ["['a', 'b', 'c']", "['a', 'b', '', 'c']", "['a,b,,c']", "('a', 'b', 'c')"], answer: 1, explanation: 'Consecutive separators produce an empty string between them.' },
      { id: 'q5', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'x = 0.4567\nprint(f"{x:.1%}")', accepted: ['45.7%'], explanation: '`.1%` multiplies by 100 and shows one decimal place.' },
      { id: 'q6', kind: 'mcq', difficulty: 'beginner', prompt: 'Which joins `["a", "b", "c"]` into "a-b-c"?', options: ['["a","b","c"].join("-")', '"-".join(["a","b","c"])', 'join("-", ["a","b","c"])', '"-".split(["a","b","c"])'], answer: 1, explanation: '`join` is a method of the separator string.' },
    ],
    summary: [
      'Strings are immutable sequences; index from 0, slice with `[start:stop]` (stop excluded).',
      'Key methods: strip, lower/upper/title, replace, split, join, startswith, find, count.',
      'f-strings format output: `{x:,.2f}`, `{p:.1%}`.',
      'Text cleaning = strip + normalise case + replace variants.',
    ],
    resources: [{ label: 'Python docs: string methods', url: 'https://docs.python.org/3/library/stdtypes.html#string-methods' }, { label: 'Format specification mini-language', url: 'https://docs.python.org/3/library/string.html#formatspec' }],
  },
  {
    id: 'py-numbers-operators',
    title: 'Numbers, Booleans & Operators',
    minutes: 30,
    difficulty: 'beginner',
    objectives: [
      'Use arithmetic operators including //, % and **',
      'Apply operator precedence correctly',
      'Write comparisons and combine them with and, or, not',
      'Use augmented assignment and built-in math functions',
    ],
    intro: md`
Most Data Science calculations — growth rates, averages, percentages, conversions — come down to arithmetic and comparisons. Getting operators and precedence right avoids silent bugs that produce plausible-looking but wrong numbers.
`,
    simple: md`
Python is a powerful calculator:

- \`+ - * /\` work as you expect.
- \`//\` is **floor division** (how many whole times: \`17 // 5 = 3\`).
- \`%\` is the **remainder** (\`17 % 5 = 2\`).
- \`**\` is a **power** (\`2 ** 3 = 8\`).

Comparisons like \`age >= 18\` answer yes/no questions with \`True\` or \`False\`. You can combine questions: \`age >= 18 and has_id\`.
`,
    technical: md`
### Arithmetic
| Op | Meaning | Example |
|---|---|---|
| \`+\` \`-\` \`*\` | add, subtract, multiply | \`7 * 3 = 21\` |
| \`/\` | true division (always float) | \`7 / 2 = 3.5\` |
| \`//\` | floor division | \`7 // 2 = 3\`, \`-7 // 2 = -4\` |
| \`%\` | modulo (remainder) | \`7 % 2 = 1\` |
| \`**\` | exponent | \`2 ** 10 = 1024\` |

**Precedence (high → low):** \`**\` → unary \`-\` → \`* / // %\` → \`+ -\` → comparisons → \`not\` → \`and\` → \`or\`. Use parentheses to make intent explicit: \`(a + b) / 2\`.

### Comparisons and booleans
\`== != < <= > >=\` return bool. Chained comparisons work: \`0 <= score <= 100\`.
Logical operators: \`and\`, \`or\`, \`not\`. They **short-circuit**: in \`a and b\`, \`b\` is not evaluated if \`a\` is falsy.

**Truthiness:** \`0\`, \`0.0\`, \`""\`, \`[]\`, \`{}\`, \`None\` are falsy; almost everything else is truthy.

### Augmented assignment
\`total += 5\` is shorthand for \`total = total + 5\` (also \`-=\`, \`*=\`, \`/=\`).

### Useful built-ins & the math module
\`abs()\`, \`round(x, n)\`, \`min()\`, \`max()\`, \`sum()\`, \`pow()\`. \`import math\` gives \`math.sqrt\`, \`math.log\`, \`math.exp\`, \`math.pi\`, \`math.isclose\`.

Note: \`round()\` uses *banker’s rounding* for exact halves: \`round(2.5) == 2\`, \`round(3.5) == 4\`.
`,
    terms: [
      ['Operator', 'A symbol that performs an operation: +, *, ==, and...'],
      ['Floor division', '`//` — division rounded down to a whole number.'],
      ['Modulo', '`%` — the remainder after division. Useful for even/odd checks.'],
      ['Precedence', 'The order in which operators are evaluated.'],
      ['Boolean expression', 'An expression that evaluates to True or False.'],
      ['Short-circuit', '`and`/`or` stop evaluating as soon as the result is known.'],
      ['Truthy / falsy', 'Values treated as True / False in conditions.'],
    ],
    realWorld: md`
**Growth rate.** Revenue went from 82,000 to 95,000. The growth rate is \`(new - old) / old\` = 0.1585 → 15.9%. Writing \`new - old / old\` (no parentheses) gives 94,999 — a silent precedence bug that has appeared in real reports.

**Business rule.** A customer is *eligible for a loyalty discount* if they spent at least 5,000 **and** have been a member for over 12 months, **or** they are a VIP: \`(spend >= 5000 and months > 12) or is_vip\`.
`,
    steps: [
      'Translate the formula from words into Python, adding parentheses around every sub-expression.',
      'Check intermediate values with print().',
      'For yes/no logic, write each condition separately, then combine with and/or.',
      'Test edge cases (zero, negative numbers, exact thresholds like `>=` vs `>`).',
    ],
    code: [
      {
        title: 'Arithmetic and precedence',
        code: md`
old, new = 82000, 95000
growth = (new - old) / old
wrong = new - old / old
print(f"growth = {growth:.1%}, wrong = {wrong}")

minutes = 135
print(minutes // 60, "h", minutes % 60, "min")
print(2 ** 10, 10 ** -2)
print(-7 // 2, -7 % 2)
`,
        explanation: [
          'Assign two variables at once (tuple unpacking).',
          'Parentheses force the subtraction first: (95000-82000)/82000 ≈ 0.1585.',
          'Without them, division happens first: 95000 - (82000/82000) = 94999.0. Plausible-looking but wrong!',
          'Format growth as a percentage.',
          'Convert 135 minutes into hours and minutes.',
          '`//` gives whole hours (2) and `%` the leftover minutes (15).',
          '`**` raises to a power: 1024 and 0.01.',
          'Floor division rounds **down** (toward −∞): −7 // 2 = −4, and −7 % 2 = 1 so that (−4)·2 + 1 = −7.',
        ],
      },
      {
        title: 'Comparisons and logic',
        code: md`
spend, months, is_vip = 6200, 8, False
eligible = (spend >= 5000 and months > 12) or is_vip
print("Eligible:", eligible)

score = 87
print(0 <= score <= 100)          # chained comparison
print(score % 2 == 0)             # even?

total = 0
for amount in [120, 80, 45]:
    total += amount
print("Total:", total)
print(0.1 + 0.2 == 0.3, round(0.1 + 0.2, 2) == 0.3)
`,
        explanation: [
          'Three customer attributes.',
          'Inner `and`: 6200 >= 5000 is True, but 8 > 12 is False → False. Then `or is_vip` (False) → False.',
          'Prints the boolean result.',
          'A score to validate.',
          'Chained comparison: equivalent to `0 <= score and score <= 100`.',
          'Modulo 2 is 0 for even numbers.',
          'An accumulator starts at 0…',
          '…a `for` loop (Lesson 7) visits each amount…',
          '…and `+=` adds it to the running total → 245.',
          'Floating-point gotcha: 0.1 + 0.2 is 0.30000000000000004, so compare after rounding.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Using `=` (assignment) instead of `==` (comparison) in a condition.', fix: '`if x == 5:` compares; `x = 5` assigns.' },
      { mistake: 'Forgetting parentheses in formulas like averages: `a + b / 2`.', fix: 'Write `(a + b) / 2`.' },
      { mistake: 'Writing `if x > 0 and < 10`.', fix: 'Each side needs a full comparison: `x > 0 and x < 10`, or chain: `0 < x < 10`.' },
      { mistake: 'Using `^` for powers (it is bitwise XOR in Python).', fix: 'Use `**`: `2 ** 3`.' },
    ],
    exercises: [
      {
        id: 'py3-ex1', title: 'Percentage change', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Users went from \`before = 1250\` to \`after = 1100\`. Compute the percentage change as a fraction in \`pct_change\` (it should be negative: −0.12).`,
        starter: md`
before = 1250
after = 1100
pct_change = after - before / before
print(pct_change)
`,
        solution: md`
before = 1250
after = 1100
pct_change = (after - before) / before
print(pct_change)
`,
        tests: md`assert abs(pct_change - (-0.12)) < 1e-9, f"Expected -0.12, got {pct_change}"`,
        hints: ['Precedence: division happens before subtraction.', 'Wrap `after - before` in parentheses.'],
      },
      {
        id: 'py3-ex2', title: 'Is it a leap year?', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`A year is a leap year if it is divisible by 4 **and** not by 100, **or** it is divisible by 400. Set \`is_leap\` to the correct boolean for \`year\`. Your expression must work for any year (the checker tests several).`,
        starter: md`
year = 2024
is_leap = False
print(is_leap)
`,
        solution: md`
year = 2024
is_leap = (year % 4 == 0 and year % 100 != 0) or year % 400 == 0
print(is_leap)
`,
        tests: md`
f = lambda year: (year % 4 == 0 and year % 100 != 0) or year % 400 == 0
assert is_leap == f(year), "Wrong result for the given year"
assert is_leap is True, "2024 is a leap year"
`,
        hints: ['“Divisible by 4” means `year % 4 == 0`.', 'Combine: `(A and B) or C`.'],
      },
      {
        id: 'py3-ex3', title: 'Predict floor division', type: 'predict', lang: 'python', difficulty: 'intermediate',
        prompt: md`What does \`print(17 // 5, 17 % 5)\` print?`,
        solution: '3 2', accepted: ['3 2', '3, 2'],
        hints: ['5 fits into 17 three times; what is left over?'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'What is the value of `2 + 3 * 4`?', accepted: ['14'], explanation: 'Multiplication first: 3*4 = 12, then + 2 = 14.' },
      { id: 'q2', kind: 'text', difficulty: 'beginner', prompt: 'What is `10 % 3`?', accepted: ['1'], explanation: '10 = 3·3 + 1, so the remainder is 1.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'What is `True and False or True`?', options: ['True', 'False', 'Error', 'None'], answer: 0, explanation: '`and` binds tighter: (True and False) = False, then False or True = True.' },
      { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'Which operator computes 2 to the power of 8?', options: ['2 ^ 8', '2 ** 8', 'pow2(8)', '2 // 8'], answer: 1, explanation: '`**` is exponentiation; `^` is bitwise XOR.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which value is **falsy**?', options: ['"0"', '[0]', '0.0', '" "'], answer: 2, explanation: '0.0 is falsy. Non-empty strings (even "0" or " ") and non-empty lists are truthy.' },
      { id: 'q6', kind: 'text', difficulty: 'intermediate', prompt: 'What does `print(7 / 2)` show?', accepted: ['3.5'], explanation: '`/` is true division and returns a float.' },
    ],
    summary: [
      'Arithmetic: + − * / // % **. `/` always returns a float.',
      'Precedence: ** → * / // % → + − → comparisons → not → and → or. Use parentheses.',
      'Comparisons return bools; combine with and/or/not; chained comparisons are allowed.',
      'Floats are approximate — round or use `math.isclose` before comparing.',
    ],
    resources: [{ label: 'Python docs: numeric types', url: 'https://docs.python.org/3/library/stdtypes.html#numeric-types-int-float-complex' }, { label: 'Operator precedence table', url: 'https://docs.python.org/3/reference/expressions.html#operator-precedence' }],
  },
  {
    id: 'py-lists-tuples',
    title: 'Lists & Tuples',
    minutes: 35,
    difficulty: 'beginner',
    objectives: [
      'Create, index and slice lists',
      'Add, remove, sort and search list items',
      'Understand mutability and the difference between lists and tuples',
      'Unpack tuples and use nested lists',
    ],
    intro: md`
A single variable holds one value; a **list** holds many — a column of prices, a set of customer names, the daily temperatures for a month. Lists are the simplest collection in Python and the mental model behind NumPy arrays and pandas columns.
`,
    simple: md`
A **list** is like a numbered shopping list you can edit: add items, cross items off, reorder them.

\`prices = [4.5, 3.0, 5.25]\`

A **tuple** is like a printed receipt: you can read it, but you can’t change it.

\`point = (14.6, 121.0)\`  ← latitude and longitude that shouldn’t change.
`,
    technical: md`
### Lists — ordered, mutable, allow duplicates
- Create: \`[]\`, \`[1, 2, 3]\`, \`list(range(5))\`. Items can be any type, including other lists.
- Index/slice exactly like strings: \`lst[0]\`, \`lst[-1]\`, \`lst[1:3]\`.
- **Modify:** \`lst[0] = 10\`, \`append(x)\` (add one to the end), \`extend(iterable)\` (add many), \`insert(i, x)\`, \`remove(x)\` (first match), \`pop(i)\` (remove and return; last by default), \`del lst[i]\`, \`clear()\`.
- **Query:** \`len(lst)\`, \`x in lst\`, \`lst.index(x)\`, \`lst.count(x)\`, \`min\`, \`max\`, \`sum\`.
- **Order:** \`lst.sort()\` sorts **in place** and returns \`None\`; \`sorted(lst)\` returns a **new** list. \`reverse=True\` for descending; \`key=\` for custom order.
- **Copying:** \`b = a\` makes both names point to the *same* list. Use \`a.copy()\` or \`a[:]\` for a (shallow) copy.

### Tuples — ordered, **immutable**
- Create: \`(1, 2)\`, \`1, 2\`, single element \`(5,)\` (the comma makes the tuple).
- Use for fixed records (coordinates, RGB colours, a database row) and for returning multiple values from functions.
- **Unpacking:** \`lat, lon = point\`; extended: \`first, *rest = [1, 2, 3, 4]\`.
- Tuples can be dictionary keys; lists cannot (only immutable/hashable objects can).
`,
    terms: [
      ['List', 'An ordered, mutable collection: `[1, 2, 3]`.'],
      ['Tuple', 'An ordered, immutable collection: `(1, 2, 3)`.'],
      ['Mutable', 'Can be changed after creation (lists, dicts, sets).'],
      ['In place', 'Modifying the existing object rather than creating a new one (e.g. `list.sort()`).'],
      ['Unpacking', 'Assigning items of a sequence to several variables at once.'],
      ['Nested list', 'A list whose items are lists — e.g. a simple table.'],
    ],
    realWorld: md`
Daily website visitors for a week: \`visits = [1200, 1350, 980, 1500, 1720, 2100, 1900]\`.

- Busiest day value: \`max(visits)\`; average: \`sum(visits) / len(visits)\` ≈ 1535.7.
- Weekend: \`visits[-2:]\` → \`[2100, 1900]\`.
- Top 3 days: \`sorted(visits, reverse=True)[:3]\`.

A row from a database is naturally a tuple: \`("C1001", "Ana", 34, "Manila")\`.
`,
    steps: [
      'Create the list with square brackets.',
      'Read items by index; slice for ranges.',
      'Modify with append/insert/remove/pop or index assignment.',
      'Summarise with len, sum, min, max; sort with sorted().',
      'Use a tuple when the group of values should never change.',
    ],
    code: [
      {
        title: 'Working with a list of daily visits',
        code: md`
visits = [1200, 1350, 980, 1500, 1720, 2100, 1900]

print("Days:", len(visits))
print("Average:", round(sum(visits) / len(visits), 1))
print("Max:", max(visits), "on day", visits.index(max(visits)) + 1)
print("Weekend:", visits[-2:])
print("Top 3:", sorted(visits, reverse=True)[:3])

visits.append(2250)        # next Monday arrives
visits[2] = 1000           # correct a data-entry error
print(visits)
`,
        explanation: [
          'A list of 7 integers.',
          '`len()` counts items.',
          'Average = total / count, rounded to 1 decimal → 1535.7.',
          '`visits.index(value)` finds the position of the maximum; +1 converts the 0-based index to a day number (6).',
          'Negative slice: the last 2 items.',
          '`sorted(..., reverse=True)` returns a new list in descending order; `[:3]` takes the first three.',
          '`append` adds one item to the end — the list is now 8 long.',
          'Index assignment replaces the 3rd item (index 2).',
          'Print the modified list.',
        ],
      },
      {
        title: 'Tuples, unpacking, nesting and the copy trap',
        code: md`
location = (14.5995, 120.9842)
lat, lon = location
print(f"lat={lat}, lon={lon}")

first, *middle, last = [10, 20, 30, 40, 50]
print(first, middle, last)

table = [["Ana", 88], ["Ben", 92], ["Carla", 79]]
print(table[1][0], "scored", table[1][1])

a = [1, 2, 3]
b = a           # same list, two names!
c = a.copy()    # independent copy
a.append(4)
print("b:", b, " c:", c)
`,
        explanation: [
          'A tuple of coordinates (immutable).',
          'Unpack both values into two variables.',
          'Show them.',
          'Extended unpacking: `*middle` collects everything between first and last.',
          'Prints `10 [20, 30, 40] 50`.',
          'A nested list — each inner list is a row: [name, score].',
          '`table[1]` is the second row; `[0]` its name, `[1]` its score.',
          'Create a list…',
          '`b = a` does **not** copy — both names point to the same object.',
          '`.copy()` creates a new, independent list.',
          'Modify `a`…',
          '…`b` changes too, `c` does not. This aliasing causes many beginner bugs.',
        ],
      },
    ],
    mistakes: [
      { mistake: '`sorted_list = my_list.sort()` → sorted_list is None.', fix: 'Either `my_list.sort()` (in place) or `sorted_list = sorted(my_list)`.' },
      { mistake: 'Accessing `lst[len(lst)]` → IndexError.', fix: 'The last valid index is `len(lst) - 1` (or just use `lst[-1]`).' },
      { mistake: 'Using `append` to add several items: `lst.append([4, 5])` adds one nested list.', fix: 'Use `lst.extend([4, 5])`.' },
      { mistake: 'Assuming `b = a` copies a list.', fix: 'Use `a.copy()` or `list(a)`.' },
    ],
    exercises: [
      {
        id: 'py4-ex1', title: 'Summarise temperatures', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`From \`temps\`, compute \`avg_temp\` (mean) and \`temp_range\` (max − min).`,
        starter: md`
temps = [31.5, 33.0, 29.8, 34.2, 32.1, 30.4]
avg_temp = 0
temp_range = 0
print(avg_temp, temp_range)
`,
        solution: md`
temps = [31.5, 33.0, 29.8, 34.2, 32.1, 30.4]
avg_temp = sum(temps) / len(temps)
temp_range = max(temps) - min(temps)
print(avg_temp, temp_range)
`,
        tests: md`
assert abs(avg_temp - 31.8333333) < 1e-4, f"avg_temp should be about 31.83, got {avg_temp}"
assert abs(temp_range - 4.4) < 1e-9, f"temp_range should be 4.4, got {temp_range}"
`,
        hints: ['Mean = `sum(temps) / len(temps)`.', 'Range = `max(temps) - min(temps)`.'],
      },
      {
        id: 'py4-ex2', title: 'Fix the sorting bug', type: 'debug', lang: 'python', difficulty: 'beginner',
        prompt: md`\`top_two\` should contain the two highest scores \`[95, 91]\`, but it raises an error. Fix it.`,
        starter: md`
scores = [78, 91, 85, 95, 66]
ranked = scores.sort(reverse=True)
top_two = ranked[:2]
print(top_two)
`,
        solution: md`
scores = [78, 91, 85, 95, 66]
ranked = sorted(scores, reverse=True)
top_two = ranked[:2]
print(top_two)
`,
        tests: md`assert top_two == [95, 91], f"Expected [95, 91], got {top_two}"`,
        hints: ['What does `list.sort()` return?', 'Use `sorted(scores, reverse=True)` which returns a new list.'],
      },
      {
        id: 'py4-ex3', title: 'Predict the aliasing', type: 'predict', lang: 'python', difficulty: 'intermediate',
        prompt: md`
What does this print?

\`\`\`python
x = [1, 2]
y = x
y.append(3)
print(len(x))
\`\`\`
`,
        solution: '3', accepted: ['3'],
        hints: ['`y = x` does not create a copy.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'nums = [5, 10, 15, 20]\nprint(nums[1:3])', accepted: ['[10, 15]', '[10,15]'], explanation: 'Indexes 1 and 2 (stop index 3 excluded).' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Which statement about tuples is true?', options: ['They are mutable', 'They cannot contain duplicates', 'They are immutable', 'They are unordered'], answer: 2, explanation: 'Tuples are ordered and immutable; duplicates are allowed.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'What is `[1, 2] + [3]`?', options: ['[1, 2, [3]]', '[1, 2, 3]', '[4, 2]', 'Error'], answer: 1, explanation: '`+` concatenates lists.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'How do you create a tuple with a single element 5?', options: ['(5)', '[5]', '(5,)', 'tuple 5'], answer: 2, explanation: 'The trailing comma makes it a tuple; `(5)` is just the number 5.' },
      { id: 'q5', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'a = [3, 1, 2]\nb = sorted(a)\nprint(a[0])', accepted: ['3'], explanation: '`sorted()` returns a new list; `a` is unchanged.' },
      { id: 'q6', kind: 'mcq', difficulty: 'beginner', prompt: 'Which method removes **and returns** the last item of a list?', options: ['remove()', 'pop()', 'del', 'clear()'], answer: 1, explanation: '`pop()` removes and returns the last item (or the item at a given index).' },
    ],
    summary: [
      'Lists are ordered and mutable; tuples are ordered and immutable.',
      'Index and slice like strings; modify lists with append, extend, insert, remove, pop.',
      '`sort()` works in place (returns None); `sorted()` returns a new list.',
      'Assignment does not copy — use `.copy()`.',
    ],
    resources: [{ label: 'Python tutorial: lists', url: 'https://docs.python.org/3/tutorial/datastructures.html' }],
  },
  {
    id: 'py-sets-dicts',
    title: 'Sets & Dictionaries',
    minutes: 35,
    difficulty: 'beginner',
    objectives: [
      'Use sets to remove duplicates and compare groups',
      'Create, read, update and loop over dictionaries',
      'Use .get(), .items() and nested dictionaries',
      'Count occurrences with a dictionary',
    ],
    intro: md`
**Dictionaries** map keys to values — like a real dictionary maps words to definitions. They are the most important data structure for data work after lists: JSON from APIs is dictionaries, a pandas DataFrame can be built from a dictionary, and counting categories is a dictionary pattern. **Sets** are collections of unique items, perfect for de-duplication and comparisons.
`,
    simple: md`
A **dictionary** is a phone book: you look up a *name* (the key) to get a *number* (the value).

\`ages = {"Ana": 23, "Ben": 31}\` → \`ages["Ana"]\` gives 23.

A **set** is a bag that never holds the same thing twice: \`{"red", "blue", "red"}\` is just \`{"red", "blue"}\`. Sets make it easy to answer questions like *“which customers bought both product A and product B?”*
`,
    technical: md`
### Sets — unordered, unique, mutable
- Create: \`{1, 2, 3}\` or \`set(iterable)\`. **Empty set is \`set()\`** — \`{}\` is an empty dict!
- Add/remove: \`add(x)\`, \`discard(x)\` (no error if missing), \`remove(x)\` (KeyError if missing).
- Fast membership test: \`x in s\` (average O(1), much faster than a list for large data).
- Set algebra: union \`a | b\`, intersection \`a & b\`, difference \`a - b\`, symmetric difference \`a ^ b\`.

### Dictionaries — key → value, insertion-ordered (Python 3.7+)
- Create: \`{"a": 1}\`, \`dict(a=1)\`, \`dict(zip(keys, values))\`.
- Keys must be **hashable** (str, int, float, tuple); values can be anything.
- Read: \`d[key]\` (KeyError if missing) or \`d.get(key, default)\`.
- Write: \`d[key] = value\` (adds or overwrites); \`d.update(other)\`; delete: \`del d[key]\`, \`d.pop(key)\`.
- Views: \`d.keys()\`, \`d.values()\`, \`d.items()\` (key/value pairs for looping).
- \`key in d\` checks keys (not values).
- Nested structures: \`customer["address"]["city"]\` — exactly how JSON looks.

### Counting pattern
\`\`\`python
counts = {}
for item in data:
    counts[item] = counts.get(item, 0) + 1
\`\`\`
(\`collections.Counter\` does this in one line.)
`,
    terms: [
      ['Set', 'An unordered collection of unique items.'],
      ['Dictionary (dict)', 'A mapping from unique keys to values.'],
      ['Key', 'The lookup label in a dict; must be hashable (immutable).'],
      ['Hashable', 'An object whose value cannot change, so it can be a dict key or set item.'],
      ['Intersection', 'Items present in both sets (`a & b`).'],
      ['Union', 'Items present in either set (`a | b`).'],
    ],
    realWorld: md`
**Market-basket question:** which customers bought *both* the laptop and the mouse?

\`laptop_buyers & mouse_buyers\` — one line with sets.

**API data:** a weather API returns \`{"city": "Cebu", "temp_c": 31.2, "forecast": [{"day": "Mon", "rain_mm": 4}]}\`. You navigate it with keys and indexes: \`data["forecast"][0]["rain_mm"]\`.
`,
    steps: [
      'Choose a set when you only care about *which* unique items exist.',
      'Choose a dict when each item has an associated value you look up by name.',
      'Use `.get(key, default)` when a key might be missing.',
      'Loop with `for key, value in d.items():`.',
      'Count with `d[k] = d.get(k, 0) + 1` (or `Counter`).',
    ],
    code: [
      {
        title: 'Sets: de-duplicate and compare',
        code: md`
emails = ["ana@x.com", "ben@x.com", "ana@x.com", "cara@x.com", "ben@x.com"]
unique = set(emails)
print(len(emails), "emails,", len(unique), "unique")

laptop = {"ana", "ben", "dev", "ema"}
mouse = {"ben", "ema", "felix"}
print("Both:", laptop & mouse)
print("Either:", laptop | mouse)
print("Laptop only:", laptop - mouse)
print("felix" in mouse)
`,
        explanation: [
          'A list with duplicates.',
          '`set()` keeps only unique values.',
          '5 emails, 3 unique.',
          'Customers who bought a laptop…',
          '…and customers who bought a mouse.',
          '`&` intersection: customers in both sets (ben, ema). Set print order may vary — sets are unordered.',
          '`|` union: anyone who bought at least one.',
          '`-` difference: laptop buyers who did not buy a mouse.',
          'Membership check — very fast for sets.',
        ],
      },
      {
        title: 'Dictionaries: lookup, update, loop, count',
        code: md`
prices = {"coffee": 3.5, "tea": 2.8, "cake": 4.25}
print(prices["tea"])
print(prices.get("juice", "not on menu"))

prices["juice"] = 3.9          # add
prices["coffee"] = 3.75        # update
for item, price in prices.items():
    print(f"{item:<8}{price:>6.2f}")

orders = ["coffee", "tea", "coffee", "cake", "coffee", "tea"]
counts = {}
for o in orders:
    counts[o] = counts.get(o, 0) + 1
print(counts)

customer = {"name": "Ana", "address": {"city": "Cebu", "zip": "6000"}, "orders": [101, 102]}
print(customer["address"]["city"], len(customer["orders"]))
`,
        explanation: [
          'A dict mapping item names to prices.',
          'Look up a value by key.',
          '`.get()` returns the default instead of raising KeyError for a missing key.',
          'Assigning to a new key adds it…',
          '…assigning to an existing key overwrites it.',
          '`.items()` yields (key, value) pairs; unpack them in the loop.',
          '`:<8` left-aligns in 8 characters, `:>6.2f` right-aligns a 2-decimal number — a neat table.',
          'A list of orders to count.',
          'Start with an empty dict.',
          'For each order…',
          '…get the current count (0 if new) and add 1.',
          '`{\'coffee\': 3, \'tea\': 2, \'cake\': 1}`.',
          'A nested dict — just like JSON from an API.',
          'Chain keys to go deeper; `len()` of the nested list.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Creating an empty set with `{}`.', fix: '`{}` is an empty dict. Use `set()`.' },
      { mistake: '`d["missing"]` raises KeyError.', fix: 'Check `if key in d` or use `d.get(key, default)`.' },
      { mistake: 'Using a list as a dict key → TypeError: unhashable type.', fix: 'Use a tuple instead: `d[(lat, lon)] = ...`.' },
      { mistake: 'Expecting sets to keep order or allow indexing (`s[0]`).', fix: 'Sets are unordered; convert with `sorted(s)` if you need order.' },
    ],
    exercises: [
      {
        id: 'py5-ex1', title: 'Count categories', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Build a dictionary \`counts\` mapping each payment method in \`payments\` to how many times it appears.`,
        starter: md`
payments = ["card", "cash", "card", "transfer", "card", "cash"]
counts = {}
# loop here
print(counts)
`,
        solution: md`
payments = ["card", "cash", "card", "transfer", "card", "cash"]
counts = {}
for p in payments:
    counts[p] = counts.get(p, 0) + 1
print(counts)
`,
        tests: md`assert counts == {"card": 3, "cash": 2, "transfer": 1}, f"Got {counts}"`,
        hints: ['Loop over `payments`.', 'Inside: `counts[p] = counts.get(p, 0) + 1`.'],
      },
      {
        id: 'py5-ex2', title: 'Customers in both lists', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Set \`loyal\` to the **set** of customers who appear in both \`jan\` and \`feb\`.`,
        starter: md`
jan = ["ana", "ben", "carla", "dev", "ana"]
feb = ["ben", "dev", "ema", "ben"]
loyal = set()
print(loyal)
`,
        solution: md`
jan = ["ana", "ben", "carla", "dev", "ana"]
feb = ["ben", "dev", "ema", "ben"]
loyal = set(jan) & set(feb)
print(loyal)
`,
        tests: md`assert loyal == {"ben", "dev"}, f"Expected {{'ben', 'dev'}}, got {loyal}"`,
        hints: ['Convert each list to a set first.', 'Intersection operator: `&`.'],
      },
      {
        id: 'py5-ex3', title: 'Read nested JSON-like data', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`From \`weather\`, set \`total_rain\` to the sum of \`rain_mm\` over all days in the forecast.`,
        starter: md`
weather = {
    "city": "Cebu",
    "forecast": [
        {"day": "Mon", "rain_mm": 4.0},
        {"day": "Tue", "rain_mm": 12.5},
        {"day": "Wed", "rain_mm": 0.0},
    ],
}
total_rain = 0
print(total_rain)
`,
        solution: md`
weather = {
    "city": "Cebu",
    "forecast": [
        {"day": "Mon", "rain_mm": 4.0},
        {"day": "Tue", "rain_mm": 12.5},
        {"day": "Wed", "rain_mm": 0.0},
    ],
}
total_rain = 0
for day in weather["forecast"]:
    total_rain += day["rain_mm"]
print(total_rain)
`,
        tests: md`assert abs(total_rain - 16.5) < 1e-9, f"Expected 16.5, got {total_rain}"`,
        hints: ['`weather["forecast"]` is a list of dicts.', 'Loop over it and add each `day["rain_mm"]`.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'print(len({1, 2, 2, 3, 3, 3}))', accepted: ['3'], explanation: 'A set keeps unique values: {1, 2, 3}.' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'What does `d.get("x", 0)` return if "x" is not a key?', options: ['KeyError', 'None', '0', '"x"'], answer: 2, explanation: '`.get()` returns the given default when the key is missing.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which can be a dictionary key?', options: ['[1, 2]', '{"a": 1}', '(1, 2)', '{1, 2}'], answer: 2, explanation: 'Keys must be hashable. Tuples (of immutables) are; lists, dicts and sets are not.' },
      { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'What is `type({})`?', options: ['set', 'dict', 'list', 'tuple'], answer: 1, explanation: 'Empty braces create an empty dict. Use set() for an empty set.' },
      { id: 'q5', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(a - b))', accepted: ['[1]'], explanation: 'Difference: items in a but not in b.' },
      { id: 'q6', kind: 'mcq', difficulty: 'intermediate', prompt: 'How do you loop over both keys and values of dict `d`?', options: ['for k, v in d:', 'for k, v in d.items():', 'for k, v in d.values():', 'for (k: v) in d:'], answer: 1, explanation: '`.items()` yields (key, value) pairs.' },
    ],
    summary: [
      'Sets store unique items and support union |, intersection &, difference −.',
      'Dicts map keys to values; read with `d[k]` or `d.get(k, default)`.',
      'Loop with `.items()`; nested dicts/lists mirror JSON.',
      'Counting pattern: `d[k] = d.get(k, 0) + 1`.',
    ],
    resources: [{ label: 'Python tutorial: dictionaries & sets', url: 'https://docs.python.org/3/tutorial/datastructures.html#dictionaries' }, { label: 'collections.Counter', url: 'https://docs.python.org/3/library/collections.html#collections.Counter' }],
  },
  {
    id: 'py-conditionals',
    title: 'Conditional Statements (if / elif / else)',
    minutes: 25,
    difficulty: 'beginner',
    objectives: [
      'Write if, elif and else blocks with correct indentation',
      'Translate business rules into conditions',
      'Use nested conditions and the one-line conditional expression',
      'Avoid common logic errors such as wrong condition order',
    ],
    intro: md`
Programs need to make decisions: *flag this transaction if the amount is unusual*, *give a discount if the customer is a member*, *label a student “pass” or “fail”*. Conditional statements let code choose a path based on data.
`,
    simple: md`
\`if\` statements work like everyday decisions:

*If it is raining, take an umbrella. Otherwise, if it is sunny, wear sunglasses. Otherwise, just go.*

\`\`\`python
if raining:
    take_umbrella()
elif sunny:
    wear_sunglasses()
else:
    just_go()
\`\`\`

Python checks the conditions from top to bottom and runs **only the first** block whose condition is true. The indented lines (4 spaces) belong to that block.
`,
    technical: md`
\`\`\`python
if condition_1:
    ...            # runs if condition_1 is truthy
elif condition_2:  # zero or more elif branches
    ...
else:              # optional; runs if nothing above matched
    ...
\`\`\`
- **Indentation defines blocks** (PEP 8: 4 spaces). Inconsistent indentation → \`IndentationError\`.
- Conditions can be any expression; truthiness applies (\`if my_list:\` means “if not empty”).
- **Order matters** with ranges: test the most specific / highest threshold first.
- **Conditional expression (ternary):** \`label = "pass" if score >= 60 else "fail"\`.
- Combine with \`and\`, \`or\`, \`not\`, and membership \`in\`: \`if city in {"Manila", "Cebu"}:\`.
- \`pass\` is a placeholder for an empty block.
- Python 3.10+ also has structural pattern matching (\`match\`/\`case\`), useful for complex branching; if/elif covers most data work.
`,
    terms: [
      ['Condition', 'An expression evaluated as True/False to decide which code runs.'],
      ['Branch', 'One possible path (if, elif or else block).'],
      ['Indentation', 'Leading spaces that group statements into a block.'],
      ['Conditional expression', 'One-line if: `a if condition else b`.'],
      ['Nested condition', 'An if statement inside another if block.'],
    ],
    realWorld: md`
**Credit-card fraud rule engine (simplified):**

- If the amount is over $5,000 **and** the country differs from the card’s home country → *block*.
- Else if the amount is over 3× the customer’s average → *ask for verification*.
- Else → *approve*.

Before machine-learning models, banks ran thousands of rules like these — and they are still used alongside models.
`,
    steps: [
      'Write the rule in plain words first.',
      'List the outcomes (branches) and the condition for each.',
      'Order conditions from most specific to most general.',
      'Translate to if/elif/else and indent the bodies.',
      'Test with values on and around every threshold.',
    ],
    code: [
      {
        title: 'Grading with if / elif / else',
        code: md`
def letter_grade(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 70:
        return "C"
    elif score >= 60:
        return "D"
    else:
        return "F"

for s in [95, 90, 84, 61, 42]:
    print(s, "->", letter_grade(s))

status = "pass" if 84 >= 60 else "fail"
print(status)
`,
        explanation: [
          'We wrap the logic in a function (Lesson 8) so we can test many scores.',
          'Highest threshold first: 90 and above → "A".',
          '`return` immediately sends back the value and leaves the function.',
          '`elif` is only checked if the previous conditions were False — so here we know score < 90.',
          'Likewise for C and D…',
          '…',
          '…',
          '…',
          '`else` catches everything else (below 60).',
          '…',
          'Test several scores, including the boundary value 90.',
          'Prints e.g. `95 -> A`.',
          'Conditional expression: a compact if/else that produces a value.',
          'Prints `pass`.',
        ],
      },
      {
        title: 'A simple fraud rule',
        code: md`
def review(amount, country, home_country, avg_amount):
    if amount > 5000 and country != home_country:
        return "BLOCK"
    elif amount > 3 * avg_amount:
        return "VERIFY"
    else:
        return "APPROVE"

transactions = [
    (6200, "US", "PH", 300),
    (1200, "PH", "PH", 250),
    (90, "PH", "PH", 120),
]
for t in transactions:
    print(t, review(*t))
`,
        explanation: [
          'The function takes four inputs.',
          'Both conditions must be true to block.',
          '…',
          'Otherwise, is the amount unusually large for this customer?',
          '…',
          'Everything else is approved.',
          '…',
          'A list of transaction tuples.',
          'Large foreign transaction → BLOCK.',
          '1200 > 3 × 250 = 750 → VERIFY.',
          'Small normal transaction → APPROVE.',
          '…',
          '`review(*t)` **unpacks** the tuple into the 4 arguments.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Wrong order: checking `score >= 60` before `score >= 90` labels everyone ≥ 60 as "D".', fix: 'Test the highest threshold first (or use explicit ranges).' },
      { mistake: 'Forgetting the colon `:` after the condition.', fix: '`if x > 5:` — the colon is required.' },
      { mistake: 'Writing `if x == 1 or 2:` (always True).', fix: '`if x == 1 or x == 2:` or `if x in (1, 2):`.' },
      { mistake: 'Mixing tabs and spaces.', fix: 'Configure your editor to insert 4 spaces.' },
    ],
    exercises: [
      {
        id: 'py6-ex1', title: 'BMI category', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Write a function \`bmi_category(bmi)\` returning \`"Underweight"\` (< 18.5), \`"Normal"\` (18.5 to < 25), \`"Overweight"\` (25 to < 30) or \`"Obese"\` (≥ 30).`,
        starter: md`
def bmi_category(bmi):
    # your code here
    return ""

print(bmi_category(22))
`,
        solution: md`
def bmi_category(bmi):
    if bmi < 18.5:
        return "Underweight"
    elif bmi < 25:
        return "Normal"
    elif bmi < 30:
        return "Overweight"
    else:
        return "Obese"

print(bmi_category(22))
`,
        tests: md`
cases = {17: "Underweight", 18.5: "Normal", 24.9: "Normal", 25: "Overweight", 29.99: "Overweight", 30: "Obese", 41: "Obese"}
for v, exp in cases.items():
    got = bmi_category(v)
    assert got == exp, f"bmi_category({v}) should be {exp!r}, got {got!r}"
`,
        hints: ['Start from the lowest threshold with `<`, so each elif only needs one comparison.', 'Boundaries: 18.5 is Normal, 25 is Overweight, 30 is Obese.'],
      },
      {
        id: 'py6-ex2', title: 'Fix the condition', type: 'debug', lang: 'python', difficulty: 'beginner',
        prompt: md`\`is_weekend(day)\` should return True only for \`"Sat"\` and \`"Sun"\`, but it returns True for every day. Fix it.`,
        starter: md`
def is_weekend(day):
    if day == "Sat" or "Sun":
        return True
    return False

print(is_weekend("Mon"))
`,
        solution: md`
def is_weekend(day):
    if day in ("Sat", "Sun"):
        return True
    return False

print(is_weekend("Mon"))
`,
        tests: md`
for d in ["Mon", "Tue", "Wed", "Thu", "Fri"]:
    assert is_weekend(d) is False, f"{d} is not a weekend day"
assert is_weekend("Sat") and is_weekend("Sun"), "Sat and Sun are weekend days"
`,
        hints: ['`"Sun"` on its own is a non-empty string — always truthy.', 'Compare both: `day == "Sat" or day == "Sun"`, or use `in`.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'x = 15\nif x > 20:\n    print("big")\nelif x > 10:\n    print("medium")\nelse:\n    print("small")', accepted: ['medium'], explanation: '15 > 20 is False; 15 > 10 is True → "medium".' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'How many branches of an if/elif/else chain can run?', options: ['All true ones', 'At most one', 'Exactly two', 'At least one if/elif'], answer: 1, explanation: 'Python runs only the first branch whose condition is true (or else).' },
      { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'items = []\nprint("has items" if items else "empty")', accepted: ['empty'], explanation: 'An empty list is falsy.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why is `if x == 1 or 2:` a bug?', options: ['`or` is invalid', 'It is always True because `2` is truthy', 'It is always False', 'It raises an error'], answer: 1, explanation: 'It parses as `(x == 1) or 2`, and `2` is truthy.' },
      { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'What defines which lines belong to an if block?', options: ['Curly braces', 'Indentation', 'Semicolons', 'The word end'], answer: 1, explanation: 'Python uses indentation to define blocks.' },
    ],
    summary: [
      'if / elif / else runs the first matching branch only.',
      'Indentation (4 spaces) defines blocks; conditions end with a colon.',
      'Order thresholds carefully; test boundary values.',
      'One-liner: `a if cond else b`.',
    ],
    resources: [{ label: 'Python tutorial: if statements', url: 'https://docs.python.org/3/tutorial/controlflow.html#if-statements' }],
  },
];
