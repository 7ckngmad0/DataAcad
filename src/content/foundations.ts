// Foundation lessons added after the curriculum audit: debugging (Module 2) and data ethics (Module 1).
import type { Lesson } from '../types.ts';
import { md } from './md.ts';

export const debuggingLesson: Lesson = {
  id: 'py-debugging',
  title: 'Reading Error Messages & Debugging Your Code',
  minutes: 40,
  difficulty: 'beginner',
  objectives: [
    'Read a Python traceback from the bottom up and find the line that failed',
    'Recognise the most common errors (SyntaxError, NameError, TypeError, IndexError, KeyError, ValueError, AttributeError) and their usual causes',
    'Find logic bugs (wrong answers, no error) with print-debugging and small test cases',
    'Follow a calm, repeatable debugging routine instead of guessing',
  ],
  intro: md`
Every programmer, including senior data scientists, writes code that breaks **every day**. The difference is that experienced people *read the error message* and know what it is telling them. An error is not a failure: it is Python pointing at the exact line and telling you what it didn't understand. This lesson turns red error text from scary into useful.
`,
  simple: md`
When Python hits a problem it stops and prints a **traceback**. Read it **from the bottom up**:

1. The **last line** says *what* went wrong: the error type and a message, e.g. \`KeyError: 'revenu'\`.
2. Just above it is the **line of your code** where it happened, with its line number.
3. Lines further up show *how* the program got there (which function called which).

Two kinds of bugs exist:
- **Errors**: Python stops and tells you. These are the easy ones.
- **Logic bugs**: the code runs but gives the **wrong answer**. To find these, print intermediate values and test with tiny inputs where you know the right answer.
`,
  technical: md`
### Anatomy of a traceback
\`\`\`text
Traceback (most recent call last):
  File "<exercise>", line 6, in <module>
    print(average(scores))
  File "<exercise>", line 3, in average
    return total / len(values)
ZeroDivisionError: division by zero
\`\`\`
Bottom line: the **type** (\`ZeroDivisionError\`) and the **message**. The frame above it is where it happened (line 3, inside \`average\`). The frame above that is who called it (line 6). Fix the cause, which here is an empty list, not the symptom.

### The usual suspects
| Error | Typical cause | Typical fix |
| --- | --- | --- |
| \`SyntaxError\` | missing \`:\` \`)\` or quote, wrong indentation | look at the marked line **and the one before it** |
| \`IndentationError\` | mixed or inconsistent indentation | use 4 spaces consistently |
| \`NameError\` | typo in a variable name, or used before assignment | check the spelling; run the cell that defines it |
| \`TypeError\` | wrong type, e.g. \`"Total: " + 5\`, or wrong number of arguments | convert with \`str()\`/\`int()\`, check the function signature |
| \`IndexError\` | list index out of range (off-by-one) | remember indexes go from 0 to \`len - 1\` |
| \`KeyError\` | dict key or DataFrame column doesn't exist | print \`d.keys()\` / \`df.columns\`; watch spelling, case and spaces |
| \`ValueError\` | right type, bad value: \`int("12.5")\`, \`int("thirty")\` | clean or validate the input first |
| \`AttributeError\` | method doesn't exist on that type, often on \`None\` | check the type with \`type(x)\`; did a function forget to \`return\`? |
| \`ZeroDivisionError\` | dividing by zero (often an empty list) | guard: \`if values:\` |

### A debugging routine
1. **Reproduce** the problem reliably.
2. **Read** the last line of the traceback, then the line it points to.
3. **Inspect**: \`print(repr(x), type(x))\` just before the failing line. \`repr\` shows hidden spaces and quotes.
4. **Shrink** the input to the smallest case that still fails.
5. **Hypothesise one cause, change one thing**, re-run.
6. For logic bugs, check a case you can compute by hand, and add an \`assert\` so the bug can’t come back.

Searching the exact last line of a traceback online (or asking the AI tutor) is a legitimate professional skill. Just make sure you understand the fix.
`,
  terms: [
    ['Bug', 'A mistake in code that makes it crash or produce wrong results.'],
    ['Traceback', 'The report Python prints when an error stops the program, showing where and why.'],
    ['Exception', 'An error object raised at runtime, such as KeyError or TypeError.'],
    ['Logic bug', 'Code that runs without errors but computes the wrong result.'],
    ['Off-by-one error', 'Being one step too far or too short, often with indexes or ranges.'],
    ['Print-debugging', 'Printing intermediate values to see what the program is actually doing.'],
    ['repr()', 'Shows a value the way Python sees it, making hidden spaces and types visible.'],
  ],
  realWorld: md`
A dashboard showed revenue down 40% overnight and executives were alarmed. No error appeared anywhere: it was a **logic bug**. An analyst printed the row count at each step of the pipeline and saw it drop from 120,000 to 72,000 at a merge. The new data file had trailing spaces in its \`region\` values (\`"North "\`), so half the rows no longer matched. \`print(repr(df["region"].unique()))\` revealed it in seconds. One \`.str.strip()\` fixed it, and an \`assert len(merged) == len(orders)\` was added so the pipeline now stops loudly if it ever happens again.
`,
  steps: [
    'Run the code and read the **last line** of the traceback: error type and message.',
    'Go to the line number it reports; also look at the line just before it.',
    'Print the variables involved, with `repr()` and `type()`.',
    'Form one hypothesis, change one thing, re-run.',
    'For wrong answers without errors, test with a tiny input you can check by hand.',
    'Add an `assert` that would have caught the bug.',
  ],
  code: [
    {
      title: 'Read the traceback from the bottom up',
      expectsError: true,
      code: md`
def average(values):
    total = sum(values)
    return total / len(values)

print(average([80, 90, 100]))
print(average([]))
`,
      explanation: [
        'A small helper function.',
        'Add the values up.',
        'Divide by how many there are. This fails when the list is empty.',
        'Works: prints 90.0.',
        'Crashes. Read the output bottom-up: ZeroDivisionError, raised at line 3 inside average, called from line 6.',
      ],
    },
    {
      title: 'Catch the common errors and print what they say',
      code: md`
tests = {
    "TypeError": lambda: "Total: " + 5,
    "IndexError": lambda: [10, 20, 30][3],
    "KeyError": lambda: {"revenue": 100}["revenu"],
    "ValueError": lambda: int("thirty"),
    "AttributeError": lambda: None.upper(),
}
for expected, broken in tests.items():
    try:
        broken()
    except Exception as e:
        print(f"{type(e).__name__:<15} {e}")
`,
      explanation: [
        'A dictionary of small snippets, each of which raises a different error.',
        'Adding text and a number: Python won’t guess, so convert with `str(5)`.',
        'Index 3 doesn’t exist in a 3-item list (valid indexes are 0, 1, 2).',
        'A typo in the key: "revenu" is not "revenue".',
        'The type is right (a string) but the value cannot become an int.',
        '`None` has no `.upper()`: a sign that something returned nothing.',
        'End of the dictionary.',
        'Run each snippet…',
        '…inside try…',
        '…so that one crash doesn’t stop the others…',
        '…and catch any exception…',
        '…then print its type name and message. These are exactly the last lines you’ll see in tracebacks.',
      ],
    },
    {
      title: 'Find a logic bug with print-debugging and repr()',
      code: md`
regions = ["North", "South ", "north", "East"]
sales = [100, 200, 300, 400]
north_total = 0
for region, amount in zip(regions, sales):
    print(repr(region), region == "North")
    if region == "North":
        north_total += amount
print("North total:", north_total)
`,
      explanation: [
        'Messy labels, as they often arrive from real files.',
        'Matching sales amounts.',
        'We expect 100 + 300 = 400 for North.',
        'Loop over pairs of (region, amount).',
        'The debugging line: `repr` shows the trailing space in "South " and the lowercase "north".',
        'This comparison is exact, so "north" does not match.',
        'Only matching rows are added.',
        'Prints 100, not 400. The fix: compare `region.strip().lower() == "north"`.',
      ],
    },
  ],
  mistakes: [
    { mistake: 'Reading only the first line of a traceback.', fix: 'Start at the last line (what went wrong), then the line number just above it (where).' },
    { mistake: 'Changing several things at once, hoping one works.', fix: 'Change one thing per run, so you know what fixed it.' },
    { mistake: 'Hiding errors with a bare `except: pass`.', fix: 'Catch specific exceptions and handle or report them; silent failures cause wrong results later.' },
    { mistake: 'Printing a value without `repr()` when strings look identical.', fix: '`print(repr(x))` reveals trailing spaces, newlines and quotes.' },
    { mistake: 'Assuming code is correct because there was no error.', fix: 'Check results on a tiny case you can verify by hand; add assertions.' },
  ],
  exercises: [
    {
      id: 'dbg-ex1', title: 'Name that error', type: 'predict', lang: 'python', difficulty: 'beginner',
      prompt: md`
Which error type does the **last line** of the traceback show when you run this? (just the error name)
\`\`\`python
prices = {"apple": 1.2, "banana": 0.5}
print(prices["Apple"])
\`\`\`
`,
      solution: 'KeyError', accepted: ['KeyError', 'key error'],
      hints: ['Dictionary keys are case-sensitive.', 'Looking up a key that does not exist raises a …Error.'],
    },
    {
      id: 'dbg-ex2', title: 'Fix the TypeError', type: 'debug', lang: 'python', difficulty: 'beginner',
      prompt: md`Run this code and read the error. Fix it so that \`message\` is exactly \`"You have 3 new orders"\`.`,
      starter: md`
count = 3
message = "You have " + count + " new orders"
print(message)
`,
      solution: md`
count = 3
message = "You have " + str(count) + " new orders"
print(message)
`,
      tests: md`assert message == "You have 3 new orders", f"message is {message!r}"`,
      hints: ['The error says you can only concatenate str (not "int") to str.', 'Convert the number with `str(count)`, or use an f-string: `f"You have {count} new orders"`.'],
    },
    {
      id: 'dbg-ex3', title: 'Fix the off-by-one', type: 'debug', lang: 'python', difficulty: 'beginner',
      prompt: md`This loop should add up **every** score into \`total\` (expected 320). It crashes with an \`IndexError\`. Read the traceback, find the cause and fix it.`,
      starter: md`
scores = [70, 80, 90, 80]
total = 0
for i in range(1, len(scores) + 1):
    total += scores[i]
print(total)
`,
      solution: md`
scores = [70, 80, 90, 80]
total = 0
for i in range(len(scores)):
    total += scores[i]
print(total)
`,
      tests: md`assert total == 320, f"total should be 320, got {total}"`,
      hints: ['Valid indexes for a list of 4 items are 0, 1, 2, 3.', '`range(len(scores))` gives exactly those. Even simpler: `for s in scores:`.'],
    },
    {
      id: 'dbg-ex4', title: 'The silent logic bug', type: 'debug', lang: 'python', difficulty: 'intermediate',
      prompt: md`No error, but the answer is wrong: \`north_total\` should be **400** (both North rows). Use \`print(repr(region))\` to see what is going on, then fix the comparison so messy labels still match.`,
      starter: md`
regions = ["North", "South ", " north", "East"]
sales = [100, 200, 300, 400]
north_total = 0
for region, amount in zip(regions, sales):
    if region == "North":
        north_total += amount
print(north_total)
`,
      solution: md`
regions = ["North", "South ", " north", "East"]
sales = [100, 200, 300, 400]
north_total = 0
for region, amount in zip(regions, sales):
    if region.strip().lower() == "north":
        north_total += amount
print(north_total)
`,
      tests: md`assert north_total == 400, f"north_total should be 400, got {north_total}"`,
      hints: ['`repr(" north")` shows a leading space; the case differs too.', 'Normalise before comparing: `region.strip().lower()`.'],
    },
    {
      id: 'dbg-ex5', title: 'Why is it None?', type: 'debug', lang: 'python', difficulty: 'intermediate',
      prompt: md`This raises \`AttributeError: 'NoneType' object has no attribute 'upper'\`. The bug is **not** on the line that crashes. Find the real cause and fix it so \`shout\` is \`"HELLO, ANA"\`.`,
      starter: md`
def greet(name):
    text = f"Hello, {name}"
    print(text)

shout = greet("Ana").upper()
print(shout)
`,
      solution: md`
def greet(name):
    text = f"Hello, {name}"
    return text

shout = greet("Ana").upper()
print(shout)
`,
      tests: md`assert shout == "HELLO, ANA", f"shout is {shout!r}"`,
      hints: ['What does a function return if it has no `return` statement?', '`print` shows a value; `return` hands it back to the caller.'],
    },
  ],
  quiz: [
    { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Where should you start reading a Python traceback?', options: ['The first line, "Traceback (most recent call last)"', 'The last line: the error type and message', 'The middle', 'It doesn’t matter'], answer: 1, explanation: 'The last line says what went wrong; the frame just above it shows where.' },
    { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: '`df["Revenue"]` raises `KeyError: \'Revenue\'`, but you can see a revenue column when you print the DataFrame. Most likely cause?', options: ['pandas is broken', 'The column name differs slightly, e.g. "revenue" or "Revenue " with a space', 'The DataFrame is empty', 'You need to restart Python'], answer: 1, explanation: 'Print `df.columns.tolist()` to see the exact names, including case and spaces.' },
    { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: '`result = clean(data).dropna()` raises `AttributeError: \'NoneType\' object has no attribute \'dropna\'`. Where is the bug most likely?', options: ['In dropna', 'Inside clean(): it probably forgot to return the DataFrame', 'In the data file', 'In pandas'], answer: 1, explanation: 'A function without `return` returns None, and the crash appears one step later.' },
    { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Your average looks too low but there is no error. Best first step?', options: ['Rewrite it from scratch', 'Test the code on a tiny input whose answer you know, printing intermediate values', 'Add try/except around it', 'Ignore it if it runs'], answer: 1, explanation: 'Logic bugs are found by comparing actual and expected results on small, checkable cases.' },
    { id: 'q5', kind: 'text', difficulty: 'beginner', prompt: 'Which error does `int("12.5")` raise? (just the error name)', accepted: ['ValueError'], explanation: 'The argument is a string (the right type) but its value is not a valid integer literal.' },
    { id: 'q6', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why is `except: pass` around a data-loading step dangerous?', options: ['It is slow', 'It hides every error, so the pipeline continues with missing or wrong data and fails later in a confusing way', 'It is a SyntaxError', 'It stops the program'], answer: 1, explanation: 'Catch specific exceptions and handle or log them.' },
  ],
  summary: [
    'Read tracebacks bottom-up: error type and message first, then the line that failed.',
    'Know the usual suspects: SyntaxError, NameError, TypeError, IndexError, KeyError, ValueError, AttributeError.',
    'An AttributeError on None often means a function forgot to return.',
    'Find logic bugs with tiny known cases, `print(repr(x))` and assertions.',
    'Change one thing at a time; never silence errors with a bare `except: pass`.',
  ],
  resources: [
    { label: 'Python docs: Errors and Exceptions', url: 'https://docs.python.org/3/tutorial/errors.html' },
    { label: 'Real Python: Understanding the Python Traceback', url: 'https://realpython.com/python-traceback/' },
    { label: 'Python Tutor: visualise code execution step by step', url: 'https://pythontutor.com/' },
  ],
};

export const ethicsLesson: Lesson = {
  id: 'data-ethics',
  title: 'Data Ethics, Privacy & Responsible Data Science',
  minutes: 35,
  difficulty: 'beginner',
  objectives: [
    'Explain why ethics is part of every stage of the data science lifecycle',
    'Distinguish personal data, anonymisation and pseudonymisation, and know why removing names is not enough',
    'Recognise sources of bias in data and models, and measure a simple fairness gap',
    'Apply core principles: consent, data minimisation, transparency and accountability',
  ],
  intro: md`
Data science decisions affect real people: who gets a loan, which neighbourhoods get more police patrols, which job applicants are shortlisted. A model can be accurate **and** harmful. Data scientists are trusted with sensitive information, and laws such as the EU’s **GDPR** and the Philippines’ **Data Privacy Act of 2012** make some responsibilities legal requirements. Ethics isn’t a final checklist: it is a habit you apply from the first question to the final dashboard.
`,
  simple: md`
Ask four questions about every project:
1. **Should we?** Is the goal fair, and would the people in the data agree with how it’s used?
2. **What do we really need?** Collect and keep only the data the question requires (*data minimisation*).
3. **Who could be hurt?** Check whether results differ unfairly between groups (gender, age, region…).
4. **Can we explain it?** Could you explain the decision to the person it affects?

Removing names does **not** make data anonymous: age + postcode + gender can identify most people.
`,
  technical: md`
### Privacy
- **Personal data**: any information relating to an identifiable person (name, email, phone, location, device ID, and often combinations of harmless-looking fields).
- **Quasi-identifiers**: fields that identify people *in combination* (birth date + postcode + gender identified about 87% of Americans in Latanya Sweeney’s classic study).
- **Pseudonymisation**: replace identifiers with tokens, e.g. a salted hash. The data is still personal: whoever holds the key or salt can re-identify it.
- **Anonymisation**: irreversibly prevent re-identification, e.g. by generalising (age → age band), suppressing rare combinations, or aggregating. **k-anonymity**: every combination of quasi-identifiers appears at least *k* times.
- **Principles** (GDPR / Data Privacy Act): lawful basis and **consent**, **purpose limitation**, **data minimisation**, accuracy, storage limitation, security, and individuals’ rights (access, correction, deletion).

### Bias and fairness
Bias enters through:
- **historical bias**: the data reflects past discrimination;
- **sampling bias**: some groups are under-represented;
- **measurement bias**: proxies, e.g. "arrests" used as a proxy for "crime";
- **feedback loops**: the model’s decisions shape tomorrow’s data.

A simple check is to compare outcome rates between groups. The **disparate impact ratio** = (rate for the less-favoured group) ÷ (rate for the most-favoured group). The US "four-fifths rule" flags ratios below **0.8** for review. Fairness has several competing definitions (equal selection rates, equal error rates…), and they cannot all be satisfied at once, so choosing one is a value judgement to make explicitly, with stakeholders.

### Responsible practice
Document data sources and limitations (datasheets, model cards), keep humans in the loop for high-stakes decisions, secure data (access control, no personal data in public notebooks or Git repos), and be honest in visualisations and reports.
`,
  terms: [
    ['Personal data', 'Any information that relates to an identified or identifiable person.'],
    ['Quasi-identifier', 'A field that is not unique alone but can identify people in combination with others.'],
    ['Pseudonymisation', 'Replacing identifiers with tokens; reversible by someone holding extra information.'],
    ['Anonymisation', 'Irreversibly removing the ability to identify individuals.'],
    ['Data minimisation', 'Collecting and keeping only the data needed for a specific purpose.'],
    ['Algorithmic bias', 'Systematic, unfair differences in a model’s outcomes between groups.'],
    ['Disparate impact ratio', 'The outcome rate of one group divided by that of another; below 0.8 is a common warning sign.'],
    ['Informed consent', 'People agreeing to the use of their data with a clear understanding of what it will be used for.'],
  ],
  realWorld: md`
- **Hiring:** a large tech company scrapped an experimental CV-screening model after discovering it downgraded CVs containing the word "women’s" (as in "women’s chess club"). It had learned from ten years of mostly male hires: **historical bias**.
- **Re-identification:** in 2006 a streaming company released "anonymised" movie ratings for a competition. Researchers re-identified users by matching ratings and dates with public reviews on another site. Removing names was not anonymisation.
- **Healthcare:** a widely used US algorithm used *past healthcare spending* as a proxy for *health need*. Because less money had historically been spent on Black patients, it under-estimated their needs: **measurement bias** through a proxy.
`,
  steps: [
    'Write down who is affected by the project and how it could harm them.',
    'List the personal data you plan to use and remove what the question does not need.',
    'Pseudonymise identifiers and generalise quasi-identifiers before analysis.',
    'Compare key outcome rates across relevant groups (e.g. the disparate impact ratio).',
    'Document limitations and decisions, and keep humans in the loop for high-stakes uses.',
  ],
  code: [
    {
      title: 'Check a loan model’s approval rates for a fairness gap',
      code: md`
import pandas as pd
df = pd.DataFrame({
    "group":    ["A"] * 10 + ["B"] * 10,
    "approved": [1, 1, 1, 0, 1, 1, 1, 0, 1, 1,   1, 0, 0, 1, 0, 1, 0, 0, 1, 0],
})
rates = df.groupby("group")["approved"].mean()
print(rates)
ratio = rates.min() / rates.max()
print(f"Disparate impact ratio: {ratio:.2f}", "-> review needed" if ratio < 0.8 else "-> OK")
`,
      explanation: [
        'pandas for grouping.',
        'A tiny table of model decisions…',
        '…ten applicants from group A and ten from group B…',
        '…where 1 = approved.',
        'End of the table.',
        'The mean of a 0/1 column is the approval rate per group.',
        'Group A: 0.8, group B: 0.4.',
        'Lower rate ÷ higher rate = 0.5.',
        'Well below 0.8: this model needs investigation before anyone relies on it.',
      ],
    },
    {
      title: 'Pseudonymise and generalise before sharing',
      code: md`
import hashlib
import pandas as pd
people = pd.DataFrame({
    "email": ["ana@mail.com", "ben@mail.com", "cara@mail.com"],
    "age": [23, 37, 41],
    "city": ["Manila", "Cebu", "Manila"],
    "spend": [120.5, 80.0, 310.2],
})
SALT = "keep-this-secret"
people["user_id"] = people["email"].map(lambda e: hashlib.sha256((SALT + e).encode()).hexdigest()[:10])
people["age_band"] = pd.cut(people["age"], bins=[0, 29, 39, 49, 120], labels=["<30", "30-39", "40-49", "50+"])
shared = people.drop(columns=["email", "age"])
shared
`,
      explanation: [
        'hashlib makes one-way fingerprints of text.',
        'pandas for the table.',
        'A small table containing personal data…',
        'emails (direct identifiers)…',
        'exact ages (quasi-identifiers)…',
        'cities…',
        '…and the value we actually want to analyse.',
        'End of the table.',
        'A secret salt stops anyone re-creating the tokens by hashing known emails. Store it securely, never in a shared notebook.',
        'Replace each email with a short salted hash: the same person always gets the same ID, so joins still work.',
        'Generalise exact ages into bands, making individuals harder to single out.',
        'Share only what the analysis needs: no email, no exact age.',
        'Display the safer table. It is pseudonymised, not anonymised: whoever has the salt could re-identify people.',
      ],
    },
  ],
  mistakes: [
    { mistake: 'Believing that removing names and emails makes data anonymous.', fix: 'Also handle quasi-identifiers (age, postcode, dates): generalise, aggregate or suppress rare combinations.' },
    { mistake: 'Collecting every field “just in case”.', fix: 'Practise data minimisation: collect only what the question needs, and delete it when you are done.' },
    { mistake: 'Removing the sensitive column (e.g. gender) and assuming the model is now fair.', fix: 'Other features act as proxies. Measure outcomes by group instead of assuming.' },
    { mistake: 'Publishing notebooks or Git repos that contain real personal data or API keys.', fix: 'Use synthetic or anonymised samples in public work; keep secrets in environment variables.' },
    { mistake: 'Reporting only overall accuracy.', fix: 'Report performance and outcome rates per group as well.' },
  ],
  exercises: [
    {
      id: 'eth-ex1', title: 'Measure the fairness gap', type: 'fill', lang: 'python', difficulty: 'beginner',
      prompt: md`Fill in the blanks to compute each group’s approval rate and the **disparate impact ratio** (lowest rate ÷ highest rate). Store the ratio, rounded to 2 decimals, in \`ratio\`.`,
      starter: md`
import pandas as pd
df = pd.DataFrame({
    "group": ["X"] * 8 + ["Y"] * 8,
    "approved": [1, 1, 0, 1, 1, 1, 0, 1,   1, 0, 1, 0, 1, 1, 0, 1],
})
rates = df.groupby("group")["approved"].___()
ratio = round(rates.min() / rates.___(), 2)
print(rates, ratio)
`,
      solution: md`
import pandas as pd
df = pd.DataFrame({
    "group": ["X"] * 8 + ["Y"] * 8,
    "approved": [1, 1, 0, 1, 1, 1, 0, 1,   1, 0, 1, 0, 1, 1, 0, 1],
})
rates = df.groupby("group")["approved"].mean()
ratio = round(rates.min() / rates.max(), 2)
print(rates, ratio)
`,
      tests: md`assert ratio == 0.83, f"ratio should be 0.83 (0.625 / 0.75), got {ratio}"`,
      hints: ['The average of a 0/1 column is the share of 1s.', 'Divide the smallest rate by the largest: `.max()`.'],
    },
    {
      id: 'eth-ex2', title: 'Is it anonymous?', type: 'predict', lang: 'python', difficulty: 'beginner',
      prompt: md`A hospital removes patient names and ID numbers but keeps **exact date of birth, postcode and gender** before publishing a dataset. Is the dataset anonymous? Answer **yes** or **no**.`,
      solution: 'no', accepted: ['no', 'n'],
      hints: ['Think about quasi-identifiers: could a combination of these fields point to one person?'],
    },
    {
      id: 'eth-ex3', title: 'Which principle?', type: 'predict', lang: 'python', difficulty: 'beginner',
      prompt: md`A food-delivery app asks for access to users’ **contacts and photos**, although it only needs a delivery address. Which data-protection principle does this violate? (two words: data ___)`,
      solution: 'data minimisation', accepted: ['data minimisation', 'data minimization', 'minimisation', 'minimization'],
      hints: ['The principle says to collect only what is necessary for the purpose.'],
    },
  ],
  quiz: [
    { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'A team removes the "gender" column so their hiring model “can’t be biased”. Why might it still be biased?', options: ['It can’t be; the column is gone', 'Other features (hobbies, school, career gaps) can act as proxies for gender', 'Models are always biased', 'Because the data is too small'], answer: 1, explanation: 'Proxies leak sensitive information. Measure outcomes by group rather than assuming fairness.' },
    { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Replacing emails with salted hashes is best described as…', options: ['Anonymisation', 'Pseudonymisation', 'Encryption of the whole dataset', 'Data minimisation'], answer: 1, explanation: 'The data can still be linked back to people by someone holding the salt, so it remains personal data.' },
    { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Approval rates: group A 60%, group B 42%. What is the disparate impact ratio, and is it a warning sign under the four-fifths rule?', options: ['0.70, yes', '1.43, no', '0.42, yes', '0.18, no'], answer: 0, explanation: '0.42 ÷ 0.60 = 0.70, which is below 0.8, so the model should be reviewed.' },
    { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'A predictive-policing model sends more patrols to areas with more past arrests, which produces more arrests there. This is an example of…', options: ['Sampling bias only', 'A feedback loop', 'Overfitting', 'Data minimisation'], answer: 1, explanation: 'The model’s decisions generate the data it is later retrained on, reinforcing the original pattern.' },
    { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'Which belongs in a public portfolio GitHub repo?', options: ['The real customer CSV from your internship', 'Your API key in a config file', 'A synthetic or properly anonymised sample plus a description of the real data', 'Screenshots of colleagues’ emails'], answer: 2, explanation: 'Never publish personal data or secrets; describe real data and share safe samples.' },
  ],
  summary: [
    'Ethics applies at every stage: question, data collection, modelling, communication.',
    'Removing names is not anonymisation; quasi-identifiers can re-identify people.',
    'Pseudonymised data is still personal data; anonymisation must be irreversible.',
    'Bias comes from history, sampling, measurement and feedback loops; measure outcomes by group.',
    'Follow consent, purpose limitation, data minimisation, security and transparency.',
  ],
  resources: [
    { label: 'National Privacy Commission (Philippines): Data Privacy Act', url: 'https://privacy.gov.ph/data-privacy-act/' },
    { label: 'GDPR: the seven principles (ICO guide)', url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/data-protection-principles/a-guide-to-the-data-protection-principles/' },
    { label: 'Google: Fairness in machine learning (crash course)', url: 'https://developers.google.com/machine-learning/crash-course/fairness' },
  ],
};
