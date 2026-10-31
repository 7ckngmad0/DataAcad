import type { Lesson } from '../types.ts';
import { md } from './md.ts';

export const m02b: Lesson[] = [
  {
    id: 'py-loops',
    title: 'Loops: for, while, break & continue',
    minutes: 40,
    difficulty: 'beginner',
    objectives: [
      'Iterate over lists, strings, dicts and ranges with for',
      'Use enumerate() and zip() for cleaner loops',
      'Write while loops with a correct stopping condition',
      'Control loops with break and continue, and use accumulator patterns',
    ],
    intro: md`
Loops repeat work: process every row, compute every total, retry until a condition is met. Even though pandas and NumPy let you avoid many explicit loops (vectorisation, Module 5), understanding loops is essential — they are how you think about “do this for each item”.
`,
    simple: md`
A **for loop** says: *for each item in this collection, do something.*

“For each student in the class, print their name.”

A **while loop** says: *keep doing something as long as a condition is true.*

“While the kettle isn’t boiling, keep waiting.”

\`break\` means *stop the loop now*. \`continue\` means *skip the rest of this round and go to the next item*.
`,
    technical: md`
### for loops
\`\`\`python
for item in iterable:
    body
\`\`\`
Works with any **iterable**: list, tuple, string, set, dict (iterates keys), \`range\`, file lines, and more.

- \`range(stop)\`, \`range(start, stop)\`, \`range(start, stop, step)\` — stop excluded.
- \`enumerate(seq, start=0)\` yields \`(index, item)\`.
- \`zip(a, b)\` pairs items from several sequences (stops at the shortest).
- Loop over a dict with \`.items()\` for key/value pairs.

### while loops
\`\`\`python
while condition:
    body   # must eventually make condition False!
\`\`\`
Use when you don’t know the number of iterations in advance (simulations, retrying, convergence in optimisation).

### Loop control
- \`break\` exits the innermost loop immediately.
- \`continue\` jumps to the next iteration.
- A loop’s optional \`else\` block runs if the loop finished **without** \`break\` (useful for searches).

### Patterns
- **Accumulator:** \`total = 0; for x in xs: total += x\`.
- **Filter-collect:** \`result = []; for x in xs: if cond: result.append(x)\`.
- **Running max/min**, **counting**, **nested loops** (rows × columns).

Performance note: Python loops are slow on millions of numbers; NumPy/pandas vectorised operations are typically 10–100× faster.
`,
    terms: [
      ['Iteration', 'One pass through the loop body.'],
      ['Iterable', 'Any object you can loop over (list, string, range, dict...).'],
      ['range()', 'Generates a sequence of integers, e.g. `range(5)` → 0..4.'],
      ['enumerate()', 'Gives the index along with each item.'],
      ['zip()', 'Walks through several sequences in parallel.'],
      ['Infinite loop', 'A while loop whose condition never becomes False.'],
      ['Accumulator', 'A variable that collects a running result inside a loop.'],
    ],
    realWorld: md`
**Savings goal simulation:** a student saves 1,500 per month at 0.5% monthly interest. *How many months until they reach 50,000?* You don’t know the answer in advance, so a \`while\` loop is natural: keep adding a month until the balance ≥ 50,000. Banks and analysts run this kind of simulation for loans, investments and inventory planning.
`,
    steps: [
      'Decide what you repeat over (a collection → `for`; a condition → `while`).',
      'Initialise accumulators **before** the loop.',
      'Write the body; update accumulators inside it.',
      'For while loops, make sure each iteration moves toward the stopping condition.',
      'Use break/continue for early exits and skips; print inside the loop to debug.',
    ],
    code: [
      {
        title: 'for, range, enumerate and zip',
        code: md`
products = ["Mouse", "Keyboard", "Monitor"]
prices = [25.0, 89.0, 249.0]
qty = [3, 1, 2]

for i, name in enumerate(products, start=1):
    print(i, name)

total = 0
for name, price, q in zip(products, prices, qty):
    line = price * q
    total += line
    print(f"{name:<10} {q} x {price:>6.2f} = {line:>7.2f}")
print(f"{'TOTAL':<10} {total:>21.2f}")

for n in range(0, 20, 5):
    print(n, end=" ")
`,
        explanation: [
          'Three parallel lists describing an order.',
          '…',
          '…',
          '`enumerate(..., start=1)` gives a counter starting at 1 plus the item.',
          'Prints `1 Mouse`, `2 Keyboard`, `3 Monitor`.',
          'Accumulator initialised before the loop.',
          '`zip` walks the three lists together, one tuple at a time.',
          'Line total for this product.',
          'Add it to the running total.',
          'Aligned output with f-string widths.',
          'After the loop: the grand total (75 + 89 + 498 = 662).',
          '`range(0, 20, 5)` → 0, 5, 10, 15 (20 excluded).',
          '`end=" "` prints on one line instead of a new line each time.',
        ],
      },
      {
        title: 'while, break and continue',
        code: md`
balance, months = 0.0, 0
while balance < 50000:
    balance = balance * 1.005 + 1500
    months += 1
print(f"Goal reached after {months} months: {balance:,.2f}")

readings = [21.5, -999, 22.1, 23.0, None, 80.2, 22.8]
clean = []
for r in readings:
    if r is None or r == -999:
        continue              # skip missing-value codes
    if r > 60:
        print("Sensor fault detected:", r)
        break                 # stop processing
    clean.append(r)
print(clean)
`,
        explanation: [
          'Start with zero balance and zero months.',
          'Repeat **while** the goal is not yet reached.',
          'Apply 0.5% interest, then add the monthly deposit.',
          'Count the month — this moves us toward the stopping condition.',
          'After the loop ends: 31 months.',
          'Sensor readings: -999 and None are “missing” codes; 80.2 is impossible.',
          'Collect valid readings here.',
          'Loop over each reading…',
          '`is None` is the correct way to test for None.',
          '`continue` skips to the next reading.',
          'A reading above 60 means the sensor broke…',
          '…report it…',
          '…and `break` stops the whole loop; 22.8 is never processed.',
          'Otherwise keep the reading.',
          '`[21.5, 22.1, 23.0]`.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'A while loop that never updates its variable → infinite loop.', fix: 'Make sure the body changes something in the condition. In this app, press Stop if a cell runs forever.' },
      { mistake: '`for i in range(len(lst)): print(lst[i])` everywhere.', fix: 'Loop directly `for x in lst:` or use `enumerate` when you need the index.' },
      { mistake: 'Re-initialising the accumulator inside the loop (`total = 0` in the body).', fix: 'Initialise before the loop.' },
      { mistake: 'Modifying a list while looping over it (removing items).', fix: 'Build a new list instead (or loop over a copy).' },
    ],
    exercises: [
      {
        id: 'py7-ex1', title: 'Sum of even numbers', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Using a loop, compute \`even_sum\`: the sum of all **even** numbers from 1 to 100 inclusive.`,
        starter: md`
even_sum = 0
# loop here
print(even_sum)
`,
        solution: md`
even_sum = 0
for n in range(1, 101):
    if n % 2 == 0:
        even_sum += n
print(even_sum)
`,
        tests: md`assert even_sum == 2550, f"Expected 2550, got {even_sum}"`,
        hints: ['`range(1, 101)` includes 100.', 'Even means `n % 2 == 0`.'],
      },
      {
        id: 'py7-ex2', title: 'First value above threshold', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Find the **index** of the first day where \`sales\` exceeded 500 and store it in \`first_day\`. If no day exceeds 500, \`first_day\` should be \`-1\`. Use a loop with \`break\`.`,
        starter: md`
sales = [320, 410, 380, 515, 620, 290]
first_day = -1
print(first_day)
`,
        solution: md`
sales = [320, 410, 380, 515, 620, 290]
first_day = -1
for i, s in enumerate(sales):
    if s > 500:
        first_day = i
        break
print(first_day)
`,
        tests: md`assert first_day == 3, f"Expected index 3, got {first_day}"`,
        hints: ['Use `enumerate(sales)` to get index and value.', 'Assign the index and `break` as soon as you find it.'],
      },
      {
        id: 'py7-ex3', title: 'Fix the infinite loop', type: 'debug', lang: 'python', difficulty: 'beginner',
        prompt: md`This countdown should print 5, 4, 3, 2, 1 and then \`Liftoff!\`, ending with \`n == 0\`. It skips numbers and ends at the wrong value. Fix it. *(Careful: if you write \`n + 1\` instead of updating \`n\`, the loop never ends — press **Stop** if that happens.)*`,
        starter: md`
n = 5
while n > 0:
    print(n)
    n -= 2
print("Liftoff!")
`,
        solution: md`
n = 5
while n > 0:
    print(n)
    n -= 1
print("Liftoff!")
`,
        tests: md`
assert n == 0, f"n should end at 0, got {n}"
assert _out.split() == ["5", "4", "3", "2", "1", "Liftoff!"], f"Unexpected output: {_out!r}"
`,
        hints: ['How much should n go down each time?', 'Decrease n by one: `n -= 1`.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'How many times does the body run?', code: 'for i in range(2, 10, 3):\n    print(i)', accepted: ['3'], explanation: 'range(2, 10, 3) → 2, 5, 8.' },
      { id: 'q2', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'total = 0\nfor x in [1, 2, 3, 4, 5]:\n    if x == 4:\n        break\n    total += x\nprint(total)', accepted: ['6'], explanation: '1 + 2 + 3 = 6; the loop stops when x is 4.' },
      { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'out = []\nfor x in range(5):\n    if x % 2:\n        continue\n    out.append(x)\nprint(out)', accepted: ['[0, 2, 4]', '[0,2,4]'], explanation: 'Odd numbers (x % 2 == 1, truthy) are skipped.' },
      { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'When is a `while` loop more natural than `for`?', options: ['When looping over a list', 'When the number of iterations is not known in advance', 'Never', 'When using range'], answer: 1, explanation: 'while repeats until a condition changes, e.g. until a goal is reached.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does `list(zip([1, 2, 3], ["a", "b"]))` return?', options: ["[(1, 'a'), (2, 'b'), (3, None)]", "[(1, 'a'), (2, 'b')]", 'Error', "[1, 'a', 2, 'b']"], answer: 1, explanation: 'zip stops at the shortest input.' },
    ],
    summary: [
      '`for` iterates over items; `while` repeats while a condition holds.',
      'Use `range`, `enumerate`, `zip` and `.items()` for clean loops.',
      '`break` exits, `continue` skips; ensure while loops terminate.',
      'Accumulator and filter-collect are the core loop patterns.',
    ],
    resources: [{ label: 'Python tutorial: for & range', url: 'https://docs.python.org/3/tutorial/controlflow.html#for-statements' }],
  },
  {
    id: 'py-functions',
    title: 'Functions, Parameters & Return Values',
    minutes: 40,
    difficulty: 'beginner',
    objectives: [
      'Define functions with def, parameters and return values',
      'Use default and keyword arguments',
      'Return multiple values and understand variable scope',
      'Write docstrings and small, testable functions',
    ],
    intro: md`
Functions package a piece of logic under a name so you can reuse it, test it and reason about it. Every serious analysis is built from small functions: \`clean_phone_number()\`, \`compute_churn_rate()\`, \`plot_monthly_sales()\`. Libraries like pandas are just huge collections of well-designed functions.
`,
    simple: md`
A function is a **recipe**. You give it ingredients (**arguments**), it follows the steps, and it hands you back a dish (**return value**).

\`\`\`python
def make_tea(sugar=1):
    return f"tea with {sugar} sugar"
\`\`\`

Now \`make_tea(2)\` gives you \`"tea with 2 sugar"\`, and \`make_tea()\` uses the default of 1. Write the recipe once, use it a thousand times.
`,
    technical: md`
\`\`\`python
def function_name(param1, param2=default):
    """Docstring: what it does, args, returns."""
    ...
    return value
\`\`\`
- **Parameters** are the names in the definition; **arguments** are the values passed in a call.
- **Positional** arguments match by order; **keyword** arguments by name: \`f(price=10, qty=2)\`.
- **Default values** make parameters optional. Never use a mutable default like \`[]\` (it is shared between calls) — use \`None\` and create the list inside.
- Without \`return\`, a function returns \`None\`. \`return a, b\` returns a **tuple** you can unpack.
- **Scope:** variables created inside a function are *local* and vanish after it returns. Functions can read global variables, but should receive data via parameters instead.
- \`*args\` collects extra positional arguments into a tuple; \`**kwargs\` collects extra keyword arguments into a dict.
- **Pure functions** (output depends only on inputs, no side effects) are easiest to test.
- **Type hints** (optional): \`def mean(xs: list[float]) -> float:\`.
`,
    terms: [
      ['Function', 'A named, reusable block of code.'],
      ['Parameter', 'A variable in the function definition that receives a value.'],
      ['Argument', 'The actual value passed when calling a function.'],
      ['Return value', 'The result a function sends back with `return`.'],
      ['Default argument', 'A parameter value used when the caller omits it.'],
      ['Scope', 'Where a variable is visible (local inside a function vs global).'],
      ['Docstring', 'A string right after `def` documenting the function.'],
    ],
    realWorld: md`
An analyst calculates the **conversion rate** (purchases ÷ visitors) for 30 marketing campaigns. Instead of copying the formula 30 times (and introducing typos), they write:

\`\`\`python
def conversion_rate(purchases, visitors):
    if visitors == 0:
        return 0.0
    return purchases / visitors
\`\`\`
and apply it everywhere — including to pandas columns later. Fixing a bug in one place fixes it everywhere.
`,
    steps: [
      'Name the function with a verb: `compute_`, `clean_`, `load_`, `plot_`.',
      'Decide inputs (parameters) and the output (return value).',
      'Write the body; handle edge cases (empty lists, zero division).',
      'Add a docstring.',
      'Test it with a few calls whose answers you know.',
    ],
    code: [
      {
        title: 'Defining and calling functions',
        code: md`
def conversion_rate(purchases, visitors):
    """Return purchases / visitors, or 0.0 when there are no visitors."""
    if visitors == 0:
        return 0.0
    return purchases / visitors

def describe(values):
    """Return (min, max, mean) of a non-empty list of numbers."""
    return min(values), max(values), sum(values) / len(values)

print(f"{conversion_rate(45, 1500):.2%}")
print(conversion_rate(5, 0))
low, high, avg = describe([12, 7, 30, 21])
print(low, high, avg)
help(conversion_rate)
`,
        explanation: [
          '`def` starts a function definition; `purchases` and `visitors` are parameters.',
          'The docstring documents what the function does.',
          'Edge case: avoid dividing by zero.',
          '`return` ends the function early with 0.0.',
          'Normal case.',
          '…',
          'A second function…',
          '…that returns **three** values (packed into a tuple).',
          '…',
          '…',
          'Call with arguments 45 and 1500 → 3.00%.',
          'The edge case returns 0.0 instead of crashing.',
          'Unpack the returned tuple into three variables.',
          '7 30 17.5',
          '`help()` prints the docstring — documentation for free.',
        ],
      },
      {
        title: 'Defaults, keyword arguments and scope',
        code: md`
def apply_discount(price, rate=0.10, min_price=0):
    discounted = price * (1 - rate)
    return max(discounted, min_price)

print(apply_discount(200))                    # default rate 10%
print(apply_discount(200, 0.25))              # positional
print(apply_discount(price=50, rate=0.9, min_price=10))  # keywords

def add_item(item, basket=None):
    if basket is None:
        basket = []
    basket.append(item)
    return basket

print(add_item("tea"), add_item("cake"))      # independent baskets

def mean(*numbers):
    return sum(numbers) / len(numbers)
print(mean(4, 8, 15, 16, 23, 42))
`,
          explanation: [
            '`rate` and `min_price` have defaults, so they are optional.',
            '`discounted` is a **local** variable — it does not exist outside the function.',
            '`max()` ensures the price never drops below `min_price`.',
            'Only `price` given → 10% off → 180.0.',
            'Second positional argument sets `rate` → 150.0.',
            'Keyword arguments are explicit and order-independent → 50 × 0.1 = 5, but floored at 10.',
            'Safe pattern for a mutable default…',
            '…use `None`, then…',
            '…create a fresh list inside the function.',
            '…',
            '…',
            'Each call gets its own list: `[\'tea\'] [\'cake\']`.',
            '`*numbers` collects any number of positional arguments into a tuple.',
            '…',
            'Mean of six numbers → 18.0.',
          ],
      },
    ],
    mistakes: [
      { mistake: 'Printing inside a function instead of returning, then trying to use the result (`x = f()` gives None).', fix: 'Return the value; print outside the function.' },
      { mistake: 'Using a mutable default: `def f(items=[])`.', fix: 'Use `items=None` and create the list inside.' },
      { mistake: 'Forgetting to call the function: `print(conversion_rate)` prints `<function ...>`.', fix: 'Add parentheses and arguments: `conversion_rate(45, 1500)`.' },
      { mistake: 'Relying on global variables inside functions.', fix: 'Pass everything the function needs as parameters.' },
    ],
    exercises: [
      {
        id: 'py8-ex1', title: 'Write a celsius converter', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Write \`c_to_f(celsius)\` that returns the temperature in Fahrenheit: $F = C \times 9/5 + 32$.`,
        starter: md`
def c_to_f(celsius):
    pass

print(c_to_f(100))
`,
        solution: md`
def c_to_f(celsius):
    return celsius * 9 / 5 + 32

print(c_to_f(100))
`,
        tests: md`
assert c_to_f(0) == 32, "0°C should be 32°F"
assert c_to_f(100) == 212, "100°C should be 212°F"
assert abs(c_to_f(-40) - (-40)) < 1e-9, "-40°C should be -40°F"
`,
        hints: ['Replace `pass` with a `return` statement.', '`return celsius * 9 / 5 + 32`'],
      },
      {
        id: 'py8-ex2', title: 'Safe average with a default', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Write \`safe_mean(values, default=0.0)\` that returns the mean of a list, or \`default\` if the list is empty.`,
        starter: md`
def safe_mean(values, default=0.0):
    return sum(values) / len(values)

print(safe_mean([]))
`,
        solution: md`
def safe_mean(values, default=0.0):
    if not values:
        return default
    return sum(values) / len(values)

print(safe_mean([]))
`,
        tests: md`
assert safe_mean([2, 4, 6]) == 4
assert safe_mean([]) == 0.0, "Empty list should return the default 0.0"
assert safe_mean([], default=None) is None, "Should return the default passed in"
`,
        hints: ['An empty list is falsy: `if not values:`.', 'Return `default` in that case.'],
      },
      {
        id: 'py8-ex3', title: 'Return vs print', type: 'predict', lang: 'python', difficulty: 'beginner',
        prompt: md`
What is printed on the **last** line?

\`\`\`python
def double(x):
    print(x * 2)

result = double(5)
print(result)
\`\`\`
`,
        solution: 'None', accepted: ['none'],
        hints: ['The function prints but has no return statement.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What does a function without a `return` statement return?', options: ['0', 'An empty string', 'None', 'An error'], answer: 2, explanation: 'Python returns None by default.' },
      { id: 'q2', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'def f(a, b=3):\n    return a * b\nprint(f(4))', accepted: ['12'], explanation: 'b uses its default 3 → 4 × 3 = 12.' },
      { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'def f(a, b=3):\n    return a - b\nprint(f(b=1, a=10))', accepted: ['9'], explanation: 'Keyword arguments match by name: 10 − 1 = 9.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why avoid `def f(items=[])`?', options: ['Syntax error', 'The same list is reused across calls', 'Lists cannot be parameters', 'It is slower'], answer: 1, explanation: 'Default values are evaluated once; a mutable default is shared by every call.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'What does `return a, b` return?', options: ['Only a', 'A list [a, b]', 'A tuple (a, b)', 'An error'], answer: 2, explanation: 'Comma-separated values form a tuple.' },
    ],
    summary: [
      'Define with `def name(params):`, document with a docstring, send results with `return`.',
      'Defaults make parameters optional; keyword arguments improve clarity.',
      'Local variables live only inside the function; pass data via parameters.',
      'Never use mutable defaults; return values instead of printing them.',
    ],
    resources: [{ label: 'Python tutorial: defining functions', url: 'https://docs.python.org/3/tutorial/controlflow.html#defining-functions' }],
  },
  {
    id: 'py-lambda-comprehensions',
    title: 'Lambda Functions & Comprehensions',
    minutes: 35,
    difficulty: 'intermediate',
    objectives: [
      'Write lambda functions and use them as sort keys',
      'Use map() and filter()',
      'Write list, dict and set comprehensions with conditions',
      'Choose between a loop, a comprehension and a named function',
    ],
    intro: md`
Comprehensions and lambdas let you express “transform/filter every item” in a single readable line. They are idiomatic Python and appear constantly in data code — and the same *transform-each-element* thinking powers pandas’ \`.apply()\` and \`.map()\`.
`,
    simple: md`
A **list comprehension** is a compact recipe for building a new list:

\`[price * 1.12 for price in prices]\` → *“make a list of each price times 1.12.”*

Add a filter: \`[p for p in prices if p > 100]\` → *“only the prices above 100.”*

A **lambda** is a tiny, unnamed function written in one line: \`lambda x: x * 2\`. Handy when you need a quick function only once, e.g. to tell \`sorted()\` how to sort.
`,
    technical: md`
### Comprehensions
\`\`\`python
[expression for item in iterable if condition]        # list
{key_expr: value_expr for item in iterable}           # dict
{expression for item in iterable}                     # set
(expression for item in iterable)                     # generator (lazy)
\`\`\`
- Conditional expression in the output: \`["high" if x > 50 else "low" for x in xs]\`.
- Nested: \`[cell for row in matrix for cell in row]\` (flatten) — read left to right like nested loops.
- Generators (\`sum(x*x for x in xs)\`) don’t build the whole list in memory.

### Lambda
\`lambda params: expression\` — a function with a single expression and an implicit return.
- Use as the \`key\` for \`sorted\`, \`min\`, \`max\`: \`sorted(rows, key=lambda r: r["revenue"], reverse=True)\`.
- \`map(func, iterable)\` applies a function to each item; \`filter(func, iterable)\` keeps items where func returns truthy. Both return lazy iterators → wrap in \`list()\`.
- Prefer comprehensions over map/filter with lambdas for readability; use \`def\` for anything longer than one simple expression.

In pandas you will see: \`df["name"].apply(lambda s: s.strip().title())\`.
`,
    terms: [
      ['List comprehension', 'Concise syntax to build a list from an iterable.'],
      ['Lambda', 'An anonymous one-expression function.'],
      ['Key function', 'A function that tells sorted()/max() what value to compare.'],
      ['map()', 'Applies a function to every item.'],
      ['filter()', 'Keeps items for which a function returns True.'],
      ['Generator expression', 'Like a list comprehension in parentheses, but evaluated lazily.'],
    ],
    realWorld: md`
A list of product records needs: VAT-inclusive prices, only in-stock items, sorted by margin. With comprehensions and a lambda this is three readable lines instead of fifteen lines of loops — and it reads like the business requirement.
`,
    steps: [
      'Write the loop version first if you are unsure.',
      'Identify the output expression, the loop variable, the iterable, and any filter.',
      'Rewrite as `[output for var in iterable if filter]`.',
      'For custom sorting, pass `key=lambda item: <value to sort by>`.',
      'If the comprehension gets hard to read, go back to a loop or a named function.',
    ],
    code: [
      {
        title: 'Comprehensions',
        code: md`
prices = [120, 45, 300, 80, 15]

with_vat = [round(p * 1.12, 2) for p in prices]
expensive = [p for p in prices if p >= 100]
labels = ["high" if p >= 100 else "low" for p in prices]
print(with_vat, expensive, labels, sep="\n")

names = ["ana", "ben", "carla"]
lengths = {n.title(): len(n) for n in names}
print(lengths)

matrix = [[1, 2, 3], [4, 5, 6]]
flat = [x for row in matrix for x in row]
print(flat, sum(x * x for x in flat))
`,
        explanation: [
          'A list of prices.',
          'Transform: each price with 12% VAT.',
          'Filter: keep only prices ≥ 100.',
          'Conditional expression inside: label each price.',
          '`sep="\\n"` prints each list on its own line.',
          'Names to process.',
          'Dict comprehension: `{"Ana": 3, "Ben": 3, "Carla": 5}`.',
          '…',
          'A nested list (2 rows × 3 columns).',
          'Two `for` clauses flatten it, read like nested loops: for each row, for each x.',
          'A generator expression inside `sum()` computes 1+4+9+16+25+36 = 91 without building a list.',
        ],
      },
      {
        title: 'Lambdas as sort keys, map and filter',
        code: md`
products = [
    {"name": "Mouse", "price": 25, "cost": 12, "stock": 40},
    {"name": "Monitor", "price": 249, "cost": 180, "stock": 0},
    {"name": "Keyboard", "price": 89, "cost": 41, "stock": 15},
]

in_stock = [p for p in products if p["stock"] > 0]
by_margin = sorted(in_stock, key=lambda p: p["price"] - p["cost"], reverse=True)
print([p["name"] for p in by_margin])

cheapest = min(products, key=lambda p: p["price"])
print("Cheapest:", cheapest["name"])

squares = list(map(lambda x: x ** 2, [1, 2, 3]))
odds = list(filter(lambda x: x % 2 == 1, range(10)))
print(squares, odds)
`,
        explanation: [
          'A list of product dictionaries (like rows of a table).',
          '…',
          '…',
          '…',
          'Filter out products with no stock.',
          '`key=lambda p: ...` tells sorted to compare by margin (price − cost); highest first.',
          '`[\'Keyboard\', \'Mouse\']` — margins 48 and 13.',
          '`min` with a key finds the product with the lowest price.',
          '…',
          '`map` applies the lambda to each number → [1, 4, 9].',
          '`filter` keeps odd numbers → [1, 3, 5, 7, 9].',
          'Print both.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Writing a giant comprehension with several conditions and nested loops.', fix: 'Readability first — split into steps or use a loop/function.' },
      { mistake: 'Putting the `if` filter in the wrong place: `[x if x > 0 for x in xs]` → SyntaxError.', fix: 'A filter goes at the end: `[x for x in xs if x > 0]`. An if/else expression goes at the front: `[x if x > 0 else 0 for x in xs]`.' },
      { mistake: 'Forgetting that `map`/`filter` return iterators (printing shows `<map object>`).', fix: 'Wrap with `list(...)`.' },
    ],
    exercises: [
      {
        id: 'py9-ex1', title: 'Clean names with a comprehension', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Use a list comprehension to create \`clean\`: each name stripped of spaces and in title case, **skipping** empty strings.`,
        starter: md`
raw = ["  ana ", "BEN", "", "  carla lopez", "   "]
clean = []
print(clean)
`,
        solution: md`
raw = ["  ana ", "BEN", "", "  carla lopez", "   "]
clean = [n.strip().title() for n in raw if n.strip()]
print(clean)
`,
        tests: md`assert clean == ["Ana", "Ben", "Carla Lopez"], f"Got {clean}"`,
        hints: ['Output expression: `n.strip().title()`.', 'Filter: `if n.strip()` — an empty string after stripping is falsy.'],
      },
      {
        id: 'py9-ex2', title: 'Sort by a key', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Sort \`students\` (a list of \`(name, score)\` tuples) by score **descending** into \`ranked\`. Use \`sorted\` with a lambda key.`,
        starter: md`
students = [("Ana", 88), ("Ben", 95), ("Carla", 79), ("Dev", 91)]
ranked = students
print(ranked)
`,
        solution: md`
students = [("Ana", 88), ("Ben", 95), ("Carla", 79), ("Dev", 91)]
ranked = sorted(students, key=lambda s: s[1], reverse=True)
print(ranked)
`,
        tests: md`assert ranked == [("Ben", 95), ("Dev", 91), ("Ana", 88), ("Carla", 79)], f"Got {ranked}"`,
        hints: ['Each item is a tuple; the score is index 1.', '`sorted(students, key=lambda s: s[1], reverse=True)`'],
      },
      {
        id: 'py9-ex3', title: 'Dict comprehension', type: 'fill', lang: 'python', difficulty: 'intermediate',
        prompt: md`Fill in the blank so \`passed\` maps each name to \`True\` if the score is at least 60, else \`False\`.`,
        starter: md`
scores = {"Ana": 72, "Ben": 55, "Carla": 60}
passed = {name: ___ for name, s in scores.items()}
print(passed)
`,
        solution: md`
scores = {"Ana": 72, "Ben": 55, "Carla": 60}
passed = {name: s >= 60 for name, s in scores.items()}
print(passed)
`,
        tests: md`assert passed == {"Ana": True, "Ben": False, "Carla": True}, f"Got {passed}"`,
        hints: ['A comparison already produces True/False.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'print([x * 2 for x in range(4)])', accepted: ['[0, 2, 4, 6]', '[0,2,4,6]'], explanation: 'Doubles 0, 1, 2, 3.' },
      { id: 'q2', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'print([x for x in range(10) if x % 3 == 0])', accepted: ['[0, 3, 6, 9]', '[0,3,6,9]'], explanation: 'Multiples of 3 between 0 and 9.' },
      { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'f = lambda a, b: a ** b\nprint(f(2, 5))', accepted: ['32'], explanation: '2 to the power 5.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which sorts words by length?', options: ['sorted(words, len)', 'sorted(words, key=len)', 'words.sort(len)', 'sorted(key=len)'], answer: 1, explanation: '`key=` takes a function; `len` itself works as the key.' },
      { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'What does `{x % 3 for x in range(10)}` produce?', options: ['{0, 1, 2}', '[0, 1, 2, 0, ...]', '{0: 0, 1: 1}', 'Error'], answer: 0, explanation: 'A set comprehension keeps unique remainders.' },
    ],
    summary: [
      '`[expr for x in it if cond]` builds lists; dict/set comprehensions use braces.',
      'Lambdas are one-expression anonymous functions — ideal as `key=` arguments.',
      'map/filter return iterators; comprehensions are usually clearer.',
      'Readability beats cleverness.',
    ],
    resources: [{ label: 'Python tutorial: list comprehensions', url: 'https://docs.python.org/3/tutorial/datastructures.html#list-comprehensions' }, { label: 'Sorting HOW TO', url: 'https://docs.python.org/3/howto/sorting.html' }],
  },
  {
    id: 'py-modules-exceptions',
    title: 'Modules, Packages & Exception Handling',
    minutes: 40,
    difficulty: 'intermediate',
    objectives: [
      'Import modules and packages in different ways',
      'Use key standard-library modules: math, statistics, random, datetime',
      'Install third-party packages with pip',
      'Handle errors with try / except / else / finally and raise your own exceptions',
    ],
    intro: md`
You never write everything from scratch: Python’s **standard library** and hundreds of thousands of **packages** (pandas, NumPy, scikit-learn) give you ready-made tools. And real data is messy — files go missing, values are malformed, networks fail. **Exception handling** lets your code respond gracefully instead of crashing.
`,
    simple: md`
A **module** is a file of useful code you can borrow: \`import math\` and now you have \`math.sqrt()\`. A **package** is a folder of modules (pandas is a package).

An **exception** is Python saying *“something went wrong.”* With \`try\`/\`except\` you say: *“Try this; if it fails in this specific way, do that instead.”* — like having a backup plan.
`,
    technical: md`
### Importing
\`\`\`python
import math                  # use as math.sqrt(16)
import numpy as np           # alias (conventional)
from statistics import mean, median
from datetime import date, timedelta
\`\`\`
Avoid \`from module import *\` (pollutes the namespace). Standard-library highlights: \`math\`, \`statistics\`, \`random\`, \`datetime\`, \`collections\`, \`itertools\`, \`json\`, \`csv\`, \`pathlib\`, \`re\` (regex).

**Third-party packages** come from PyPI: \`pip install pandas\` (or \`conda install pandas\`). Pin versions per project in \`requirements.txt\`. In this browser environment popular data packages load automatically on import.

Your own module: any \`.py\` file; \`import my_utils\` if it is in the same folder. \`if __name__ == "__main__":\` guards code that should only run when the file is executed directly.

### Exceptions
Common built-ins: \`ValueError\` (right type, bad value: \`int("abc")\`), \`TypeError\` (wrong type), \`KeyError\`, \`IndexError\`, \`ZeroDivisionError\`, \`FileNotFoundError\`, \`NameError\`, \`AttributeError\`.

\`\`\`python
try:
    risky()
except (ValueError, TypeError) as e:
    handle(e)          # runs only if one of these occurred
else:
    on_success()       # runs if no exception
finally:
    cleanup()          # always runs
\`\`\`
- Catch **specific** exceptions; a bare \`except:\` hides real bugs.
- \`raise ValueError("message")\` signals invalid input from your own functions.
- Read tracebacks **bottom-up**: the last line names the exception and message; the lines above show where it happened.
`,
    terms: [
      ['Module', 'A .py file of reusable code.'],
      ['Package', 'A folder/collection of modules, often installed with pip.'],
      ['Standard library', 'Modules shipped with Python (math, json, datetime...).'],
      ['PyPI / pip', 'The Python Package Index and the tool to install packages from it.'],
      ['Exception', 'An error event that interrupts normal execution.'],
      ['Traceback', 'The error report showing where an exception occurred.'],
      ['raise', 'Statement to trigger an exception deliberately.'],
    ],
    realWorld: md`
A script imports 2,000 sales records typed by staff. A few contain \`"N/A"\`, \`"12,5"\` or are blank. Without exception handling, the script crashes on row 37 and nobody gets the report. With \`try/except ValueError\`, bad rows are logged and skipped, the report still runs, and the data team gets a list of rows to fix.
`,
    steps: [
      'Import what you need at the top of the file.',
      'Identify operations that can fail (conversions, file access, division, dict lookups).',
      'Wrap only those operations in `try`.',
      'Catch the specific exception, log or count the problem, and continue sensibly.',
      'Raise clear exceptions from your own functions when input is invalid.',
    ],
    code: [
      {
        title: 'Using standard-library modules',
        code: md`
import math
import random
from statistics import mean, median, stdev
from datetime import date, timedelta

print(math.sqrt(144), math.log(100, 10), round(math.pi, 4))

data = [12, 15, 15, 18, 22, 30]
print(mean(data), median(data), round(stdev(data), 2))

random.seed(42)                 # reproducible randomness
print(random.randint(1, 6), random.choice(["A", "B", "C"]))

today = date(2026, 3, 1)
print(today + timedelta(days=30), today.strftime("%A, %d %B %Y"))
`,
        explanation: [
          'Import the whole math module.',
          'random numbers.',
          'Import specific functions from statistics.',
          'Import classes for dates.',
          '`math.sqrt(144)` = 12.0; `math.log(100, 10)` = 2.0 (log base 10).',
          'A small dataset.',
          'mean 18.67, median 16.5, sample standard deviation ≈ 6.53.',
          '`random.seed()` makes “random” results repeatable — essential for reproducible analyses.',
          'A random die roll and a random choice.',
          'Create a specific date.',
          'Date arithmetic with timedelta, and formatting with strftime → "Sunday, 01 March 2026".',
        ],
      },
      {
        title: 'Handling bad data with try / except',
        code: md`
raw_amounts = ["120.50", "N/A", "89", "", "1,200.00", "abc", "45.25"]

def parse_amount(text):
    if not text:
        raise ValueError("empty value")
    return float(text.replace(",", ""))

valid, errors = [], []
for i, txt in enumerate(raw_amounts):
    try:
        valid.append(parse_amount(txt))
    except ValueError as e:
        errors.append((i, txt, str(e)))

print("Parsed:", valid)
print("Total:", sum(valid))
for row in errors:
    print("Bad row:", row)

try:
    ratio = 10 / 0
except ZeroDivisionError:
    ratio = float("nan")
finally:
    print("Ratio computed:", ratio)
`,
        explanation: [
          'Messy text values, as typed by people.',
          'A helper that converts one value…',
          '…and **raises** its own ValueError for blanks, with a clear message.',
          'Remove thousands separators, then convert; `float("N/A")` raises ValueError automatically.',
          'Two lists to collect good values and problems.',
          'Loop with the row index.',
          'Try the risky operation…',
          '…if it works, keep the number.',
          'Catch only ValueError and keep the error message `e`…',
          '…record which row failed and why, then continue with the next row.',
          'Parsed: [120.5, 89.0, 1200.0, 45.25].',
          'Total: 1454.75.',
          'Show the rows needing attention.',
          '…',
          'Another example: division by zero…',
          '…',
          '…replaced with NaN (“not a number”, the standard missing-value marker in data science).',
          '`finally` always runs, error or not.',
          '…',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Using a bare `except:` that swallows every error, including typos.', fix: 'Catch specific exceptions: `except ValueError:`.' },
      { mistake: 'Wrapping a whole script in one giant try block.', fix: 'Wrap only the lines that can legitimately fail.' },
      { mistake: 'Naming your own file `pandas.py` or `random.py`.', fix: 'It shadows the real module and breaks imports. Use unique file names.' },
      { mistake: 'Reading a traceback from the top.', fix: 'Start at the last line (the error type and message), then look at the line number above it.' },
    ],
    exercises: [
      {
        id: 'py10-ex1', title: 'Safe integer parsing', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Write \`to_int(text, default=None)\` that returns \`int(text)\`, or \`default\` if the conversion raises a \`ValueError\`.`,
        starter: md`
def to_int(text, default=None):
    return int(text)

print(to_int("42"), to_int("forty-two"))
`,
        solution: md`
def to_int(text, default=None):
    try:
        return int(text)
    except ValueError:
        return default

print(to_int("42"), to_int("forty-two"))
`,
        tests: md`
assert to_int("42") == 42
assert to_int("abc") is None, "Invalid text should return the default None"
assert to_int("7.5", default=-1) == -1, "int('7.5') raises ValueError -> default"
`,
        hints: ['Put `return int(text)` inside a `try:` block.', '`except ValueError: return default`.'],
      },
      {
        id: 'py10-ex2', title: 'Use the statistics module', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Import \`median\` from the \`statistics\` module and set \`mid\` to the median of \`delivery_days\`.`,
        starter: md`
delivery_days = [3, 5, 2, 8, 4, 30, 3]
mid = 0
print(mid)
`,
        solution: md`
from statistics import median

delivery_days = [3, 5, 2, 8, 4, 30, 3]
mid = median(delivery_days)
print(mid)
`,
        tests: md`assert mid == 4, f"The median should be 4, got {mid}"`,
        hints: ['`from statistics import median`', 'Sorted: 2, 3, 3, 4, 5, 8, 30 — the middle value.'],
      },
      {
        id: 'py10-ex3', title: 'Raise a helpful error', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Make \`percentage(part, whole)\` raise a \`ValueError\` when \`whole\` is 0 or negative; otherwise return \`100 * part / whole\`.`,
        starter: md`
def percentage(part, whole):
    return 100 * part / whole

print(percentage(25, 200))
`,
        solution: md`
def percentage(part, whole):
    if whole <= 0:
        raise ValueError("whole must be positive")
    return 100 * part / whole

print(percentage(25, 200))
`,
        tests: md`
assert percentage(25, 200) == 12.5
for bad in (0, -5):
    try:
        percentage(1, bad)
    except ValueError:
        pass
    else:
        raise AssertionError(f"percentage(1, {bad}) should raise ValueError")
`,
        hints: ['Check `if whole <= 0:` before dividing.', '`raise ValueError("...")`'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which exception does `int("hello")` raise?', options: ['TypeError', 'ValueError', 'NameError', 'KeyError'], answer: 1, explanation: 'The type (str) is acceptable, but the value cannot be converted.' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'What is the conventional way to import NumPy?', options: ['import numpy as n', 'import numpy as np', 'from numpy import all', 'include numpy'], answer: 1, explanation: '`import numpy as np` is the universal convention.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'When does the `else` block of a try statement run?', options: ['Always', 'Only when an exception occurred', 'Only when no exception occurred', 'Never'], answer: 2, explanation: '`else` runs only if the try block completed without exceptions; `finally` always runs.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Accessing `{"a": 1}["b"]` raises…', options: ['IndexError', 'KeyError', 'ValueError', 'AttributeError'], answer: 1, explanation: 'Missing dictionary keys raise KeyError.' },
      { id: 'q5', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'try:\n    x = [1, 2][5]\nexcept IndexError:\n    x = -1\nprint(x)', accepted: ['-1'], explanation: 'Index 5 does not exist → IndexError → x = -1.' },
      { id: 'q6', kind: 'mcq', difficulty: 'beginner', prompt: 'Which command installs pandas from PyPI?', options: ['python get pandas', 'pip install pandas', 'import pandas --install', 'npm install pandas'], answer: 1, explanation: '`pip install pandas` (or `conda install pandas` with Anaconda).' },
    ],
    summary: [
      'Import with `import x`, `import x as y`, or `from x import a, b`.',
      'Standard library: math, statistics, random, datetime, json, csv, collections...',
      'Install packages with pip/conda; avoid naming files after modules.',
      'try/except specific errors; else on success; finally always; raise for invalid input.',
    ],
    resources: [{ label: 'Python tutorial: errors and exceptions', url: 'https://docs.python.org/3/tutorial/errors.html' }, { label: 'The Python Standard Library', url: 'https://docs.python.org/3/library/' }],
  },
  {
    id: 'py-files-csv-json',
    title: 'File Handling, CSV & JSON',
    minutes: 40,
    difficulty: 'intermediate',
    objectives: [
      'Read and write text files safely with `with open(...)`',
      'Read and write CSV files with the csv module',
      'Convert between JSON text, files and Python objects',
      'Choose file modes and encodings correctly',
    ],
    intro: md`
Data lives in files: CSV exports from Excel and databases, JSON from APIs, logs as text. Before pandas makes this a one-liner, it is important to understand what reading and writing files actually involves — and pure Python file handling is still the right tool for logs, configs and non-tabular data.
`,
    simple: md`
Opening a file is like opening a notebook: you choose whether you want to **read** it (\`"r"\`), start a **fresh page** (\`"w"\` — erases old content!), or **add to the end** (\`"a"\`).

\`with open(...) as f:\` automatically closes the notebook when you’re done, even if something goes wrong.

**CSV** is a table written as text with commas. **JSON** is nested data (dicts and lists) written as text — the language of web APIs.
`,
    technical: md`
### Text files
\`\`\`python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("line 1\n")
with open("notes.txt", encoding="utf-8") as f:   # default mode "r"
    for line in f:                                # memory-efficient
        print(line.rstrip("\n"))
\`\`\`
Modes: \`"r"\` read, \`"w"\` write (truncate), \`"a"\` append, \`"x"\` create (fail if exists), add \`"b"\` for binary. Always specify \`encoding="utf-8"\` for text. \`f.read()\` reads everything, \`f.readlines()\` a list of lines.

\`pathlib.Path\` is the modern way to handle paths: \`Path("data") / "sales.csv"\`, \`.exists()\`, \`.read_text()\`.

### CSV with the csv module
- \`csv.reader(f)\` yields each row as a **list of strings**; \`csv.DictReader(f)\` yields **dicts** keyed by the header.
- \`csv.writer(f).writerow([...])\`, \`csv.DictWriter(f, fieldnames=[...])\`.
- Open CSV files for writing with \`newline=""\` to avoid blank lines on Windows.
- All values arrive as **strings** — convert numbers yourself.

### JSON
| Function | From → To |
|---|---|
| \`json.loads(text)\` | JSON string → Python |
| \`json.dumps(obj, indent=2)\` | Python → JSON string |
| \`json.load(f)\` | JSON file → Python |
| \`json.dump(obj, f)\` | Python → JSON file |

Mapping: object ↔ dict, array ↔ list, string ↔ str, number ↔ int/float, true/false ↔ True/False, null ↔ None.
`,
    terms: [
      ['File mode', 'How a file is opened: r, w, a, x, b.'],
      ['Context manager', '`with` block that sets up and cleans up a resource (closes the file).'],
      ['Encoding', 'How characters are stored as bytes; use UTF-8.'],
      ['CSV', 'Comma-separated values; tabular text.'],
      ['DictReader', 'csv reader that returns each row as a dict keyed by column names.'],
      ['JSON', 'JavaScript Object Notation; text format for nested data.'],
      ['Serialisation', 'Converting objects into a storable/transmittable format (e.g. JSON).'],
    ],
    realWorld: md`
A logistics company receives a nightly CSV of deliveries and a JSON config file with thresholds (\`{"late_hours": 48}\`). A Python script reads the config, scans the CSV, writes a \`late_deliveries.csv\` report, and appends a line to \`run_log.txt\` with the timestamp and number of late deliveries. This kind of small automation script is often an analyst’s first “production” code.
`,
    steps: [
      'Open the file with `with open(path, mode, encoding="utf-8")`.',
      'For CSV, wrap the file in `csv.DictReader` and loop over rows.',
      'Convert string values to numbers/dates as needed.',
      'Write results with `csv.writer` / `json.dump`.',
      'Re-open the output to verify what you wrote.',
    ],
    code: [
      {
        title: 'Read a CSV with DictReader and write a report',
        code: md`
import csv

late, total = [], 0
with open("data/sales.csv", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        total += 1
        if float(row["revenue"]) > 700:
            late.append({"order_id": row["order_id"], "revenue": row["revenue"]})

print(f"{total} rows read, {len(late)} large orders")

with open("large_orders.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["order_id", "revenue"])
    writer.writeheader()
    writer.writerows(late)

with open("large_orders.csv", encoding="utf-8") as f:
    for line in list(f)[:4]:
        print(line.rstrip())
`,
        explanation: [
          'Import the built-in csv module.',
          'A list for matching rows and a counter.',
          'Open the CSV for reading (the file is closed automatically at the end of the block).',
          '`DictReader` uses the header line for keys.',
          'Each `row` is a dict like {"order_id": "50000", "revenue": "59.0", ...} — all strings.',
          'Count rows.',
          'Convert revenue to float before comparing.',
          'Keep the columns we care about.',
          '…',
          'Report counts.',
          'Open a new file for **writing**; `newline=""` is recommended for csv.',
          '`DictWriter` needs the column order.',
          'Write the header line.',
          'Write all collected rows at once.',
          'Re-open to verify…',
          '…print the header and first 3 data lines.',
        ],
      },
      {
        title: 'JSON round-trip and appending to a log',
        code: md`
import json
from datetime import datetime

config = {"late_hours": 48, "regions": ["North", "East"], "notify": True, "owner": None}

with open("config.json", "w", encoding="utf-8") as f:
    json.dump(config, f, indent=2)

with open("config.json", encoding="utf-8") as f:
    text = f.read()
print(text)

loaded = json.loads(text)
print(loaded["regions"][1], loaded["notify"], loaded["owner"])

with open("run_log.txt", "a", encoding="utf-8") as log:
    log.write(f"{datetime(2026, 1, 15, 2, 0):%Y-%m-%d %H:%M} run ok\n")
print(open("run_log.txt", encoding="utf-8").read())
`,
        explanation: [
          'json and datetime from the standard library.',
          '…',
          'A Python dict with a list, a bool and None.',
          'Write it to a file as JSON…',
          '`indent=2` makes it human-readable.',
          'Read the file back as raw text…',
          '…',
          'Notice `true` and `null` — JSON spellings of True and None.',
          '`json.loads` parses the text back into Python objects.',
          'Access nested values normally → East True None.',
          'Mode `"a"` appends instead of overwriting — perfect for logs.',
          'An f-string with a date format spec writes the timestamp.',
          'Quick read-back (fine for tiny files in an example; prefer `with` in real code).',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Opening with `"w"` when you meant to add — the old content is erased.', fix: 'Use `"a"` to append, `"x"` to fail if the file exists.' },
      { mistake: 'Forgetting that csv values are strings: `row["qty"] * 2` gives "33".', fix: 'Convert: `int(row["qty"]) * 2`.' },
      { mistake: 'Not closing files (or forgetting `with`).', fix: 'Always use `with open(...) as f:`.' },
      { mistake: '`json.load` on a string / `json.loads` on a file.', fix: 'Remember: the **s** means **string**.' },
      { mistake: 'Hard-coding Windows paths with backslashes: `"C:\\new\\data.csv"` (\\n becomes a newline!).', fix: 'Use forward slashes, raw strings `r"C:\\new"`, or `pathlib.Path`.' },
    ],
    exercises: [
      {
        id: 'py11-ex1', title: 'Write and read a text file', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Write the three strings in \`cities\` to \`cities.txt\`, one per line. Then read the file back into a list called \`lines\` (without newline characters).`,
        starter: md`
cities = ["Manila", "Cebu", "Davao"]
# write the file here

lines = []
print(lines)
`,
        solution: md`
cities = ["Manila", "Cebu", "Davao"]
with open("cities.txt", "w", encoding="utf-8") as f:
    for c in cities:
        f.write(c + "\n")

with open("cities.txt", encoding="utf-8") as f:
    lines = [line.rstrip("\n") for line in f]
print(lines)
`,
        tests: md`
import os
assert open("cities.txt", encoding="utf-8").read() == "Manila\nCebu\nDavao\n", "cities.txt should contain one city per line"
assert lines == ["Manila", "Cebu", "Davao"], f"lines should be the 3 cities, got {lines}"
os.remove("cities.txt")
`,
        hints: ['Open with mode `"w"` and write `c + "\\n"` for each city.', 'Read with a comprehension and `.rstrip("\\n")`.'],
      },
      {
        id: 'py11-ex2', title: 'Average from a CSV', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`Using only the \`csv\` module (no pandas), compute the average \`math\` score in \`data/students.csv\` and store it in \`avg_math\`.`,
        starter: md`
import csv

avg_math = 0
print(avg_math)
`,
        solution: md`
import csv

scores = []
with open("data/students.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        scores.append(int(row["math"]))
avg_math = sum(scores) / len(scores)
print(avg_math)
`,
        tests: md`
import csv as _c
_vals = [int(r["math"]) for r in _c.DictReader(open("data/students.csv", encoding="utf-8"))]
assert abs(avg_math - sum(_vals) / len(_vals)) < 1e-9, f"avg_math looks wrong: {avg_math}"
`,
        hints: ['Use `csv.DictReader` and collect `int(row["math"])`.', 'Average = sum / count.'],
      },
      {
        id: 'py11-ex3', title: 'Parse JSON', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Parse the JSON string \`payload\` and set \`n_items\` to the number of items in its \`"items"\` list.`,
        starter: md`
import json
payload = '{"order": 77, "items": [{"sku": "A"}, {"sku": "B"}, {"sku": "C"}], "paid": true}'
n_items = 0
print(n_items)
`,
        solution: md`
import json
payload = '{"order": 77, "items": [{"sku": "A"}, {"sku": "B"}, {"sku": "C"}], "paid": true}'
data = json.loads(payload)
n_items = len(data["items"])
print(n_items)
`,
        tests: md`assert n_items == 3, f"Expected 3, got {n_items}"`,
        hints: ['`json.loads(payload)` gives a dict.', '`len(data["items"])`'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which mode adds to the end of an existing file?', options: ['"r"', '"w"', '"a"', '"x"'], answer: 2, explanation: '"a" appends; "w" overwrites.' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'Why use `with open(...) as f:`?', options: ['It is faster', 'It closes the file automatically', 'It is required for CSV', 'It encrypts the file'], answer: 1, explanation: 'The context manager guarantees the file is closed, even on errors.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'What type are values read by `csv.DictReader`?', options: ['Automatically int/float', 'Strings', 'bytes', 'Depends on the column'], answer: 1, explanation: 'The csv module returns strings; you must convert them.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'JSON `null` becomes which Python value?', options: ['0', '"null"', 'None', 'False'], answer: 2, explanation: 'null ↔ None.' },
      { id: 'q5', kind: 'text', difficulty: 'intermediate', prompt: 'Which json function converts a Python object into a JSON **string**? (just the name, e.g. `json.xxx`)', accepted: ['json.dumps', 'dumps'], explanation: '`dumps` = dump to string; `dump` writes to a file.' },
    ],
    summary: [
      'Use `with open(path, mode, encoding="utf-8")`; modes r/w/a/x/b.',
      'csv.reader / DictReader read rows as strings; DictWriter writes dicts.',
      'json.load/loads read; json.dump/dumps write; the s means string.',
      'Never overwrite raw data; write results to new files.',
    ],
    resources: [{ label: 'Python docs: csv', url: 'https://docs.python.org/3/library/csv.html' }, { label: 'Python docs: json', url: 'https://docs.python.org/3/library/json.html' }],
  },
  {
    id: 'py-oop',
    title: 'Object-Oriented Programming (Classes & Objects)',
    minutes: 45,
    difficulty: 'intermediate',
    objectives: [
      'Define classes with attributes and methods',
      'Create objects (instances) with __init__ and use self',
      'Implement __repr__ / __str__ and use inheritance',
      'Recognise OOP patterns in data libraries (DataFrame, scikit-learn models)',
    ],
    intro: md`
Every pandas DataFrame and every scikit-learn model is an **object**: it bundles data (attributes such as \`df.shape\`) with behaviour (methods such as \`df.head()\` or \`model.fit()\`). Understanding classes makes these libraries far less mysterious — and lets you organise larger projects cleanly.
`,
    simple: md`
A **class** is a blueprint; an **object** is a thing built from it.

The blueprint “BankAccount” says every account has an *owner* and a *balance* (attributes) and can *deposit* and *withdraw* (methods). Ana’s account and Ben’s account are two separate objects built from the same blueprint — each with its own balance.

\`self\` simply means *“this particular object”*.
`,
    technical: md`
\`\`\`python
class BankAccount:
    interest_rate = 0.02            # class attribute (shared)

    def __init__(self, owner, balance=0):
        self.owner = owner          # instance attributes
        self.balance = balance

    def deposit(self, amount):      # method
        if amount <= 0:
            raise ValueError("amount must be positive")
        self.balance += amount
        return self.balance

    def __repr__(self):
        return f"BankAccount({self.owner!r}, {self.balance})"
\`\`\`
- \`__init__\` runs when you create an object: \`acct = BankAccount("Ana", 100)\`.
- Methods receive the object as the first parameter (\`self\`); call them as \`acct.deposit(50)\`.
- **Dunder (double-underscore) methods** customise behaviour: \`__repr__\` (developer display), \`__str__\` (\`print\`), \`__len__\`, \`__eq__\`...
- **Inheritance:** \`class SavingsAccount(BankAccount):\` reuses and extends the parent; \`super().__init__(...)\` calls the parent’s initialiser; methods can be **overridden**.
- **Encapsulation** (by convention): a leading underscore \`_balance\` marks “internal”.
- \`@dataclass\` (from \`dataclasses\`) auto-generates \`__init__\`/\`__repr__\` for data-holding classes.

**The scikit-learn pattern** (Module 10) is OOP: \`model = LinearRegression()\` (create) → \`model.fit(X, y)\` (method that learns and stores attributes like \`model.coef_\`) → \`model.predict(X_new)\`.
`,
    terms: [
      ['Class', 'A blueprint defining attributes and methods.'],
      ['Object / instance', 'A concrete thing created from a class.'],
      ['Attribute', 'Data stored on an object (`acct.balance`).'],
      ['Method', 'A function defined in a class that acts on its objects.'],
      ['self', 'The first parameter of a method: the object itself.'],
      ['__init__', 'The initialiser that sets up a new object.'],
      ['Inheritance', 'A class deriving from another, reusing and extending it.'],
    ],
    realWorld: md`
A data team writes a \`DataQualityReport\` class: you create it with a DataFrame, call \`.check_missing()\`, \`.check_duplicates()\` and \`.summary()\`, and it remembers results internally. The same class is reused across 20 projects. Meanwhile every model in scikit-learn — from linear regression to random forests — shares the same \`fit\`/\`predict\` interface thanks to OOP, so swapping models is a one-line change.
`,
    steps: [
      'Identify a “thing” in your problem with data + behaviour (an account, a report, a model).',
      'Write `class Name:` and an `__init__` that stores the data on `self`.',
      'Add methods for the behaviour; validate inputs.',
      'Add `__repr__` for readable printing.',
      'Create objects and call their methods; use inheritance for specialised versions.',
    ],
    code: [
      {
        title: 'A class with methods and validation',
        code: md`
class BankAccount:
    interest_rate = 0.02

    def __init__(self, owner, balance=0.0):
        self.owner = owner
        self.balance = balance
        self.history = []

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Deposit must be positive")
        self.balance += amount
        self.history.append(("deposit", amount))

    def withdraw(self, amount):
        if amount > self.balance:
            raise ValueError("Insufficient funds")
        self.balance -= amount
        self.history.append(("withdraw", amount))

    def __repr__(self):
        return f"BankAccount(owner={self.owner!r}, balance={self.balance:.2f})"

ana = BankAccount("Ana", 100)
ben = BankAccount("Ben")
ana.deposit(50)
ana.withdraw(30)
print(ana, ben, sep="\n")
print(ana.history, BankAccount.interest_rate)
try:
    ben.withdraw(10)
except ValueError as e:
    print("Error:", e)
`,
        explanation: [
          '`class` defines a blueprint named BankAccount.',
          'A class attribute shared by all accounts.',
          '`__init__` runs on creation; `self` is the new object.',
          'Store the owner on this object…',
          '…its starting balance…',
          '…and an empty transaction history (each object gets its own list).',
          'A method to deposit money.',
          'Validate input — raise an error for nonsense values.',
          '…',
          'Update this object’s balance…',
          '…and record the transaction.',
          'Withdraw, refusing to overdraw.',
          '…',
          '…',
          '…',
          '…',
          '`__repr__` controls how the object displays; `!r` adds quotes around the name.',
          '…',
          'Create two independent objects.',
          '`ben` uses the default balance 0.0.',
          'Call methods with dot notation.',
          '…',
          'Ana has 120.00, Ben 0.00 — separate states.',
          'Her history, and the shared class attribute.',
          'Ben cannot withdraw…',
          '…',
          '…so the error is caught and printed.',
        ],
      },
      {
        title: 'Inheritance and the fit/predict pattern',
        code: md`
class Model:
    def fit(self, xs, ys):
        raise NotImplementedError

    def predict(self, xs):
        raise NotImplementedError

class MeanModel(Model):
    """Baseline: always predicts the average of the training targets."""
    def fit(self, xs, ys):
        self.mean_ = sum(ys) / len(ys)
        return self

    def predict(self, xs):
        return [self.mean_ for _ in xs]

class LineModel(Model):
    """Least-squares line y = a*x + b for one feature."""
    def fit(self, xs, ys):
        n = len(xs)
        mx, my = sum(xs) / n, sum(ys) / n
        self.a_ = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
        self.b_ = my - self.a_ * mx
        return self

    def predict(self, xs):
        return [self.a_ * x + self.b_ for x in xs]

hours = [1, 2, 3, 4, 5]
score = [52, 58, 65, 70, 78]
for model in [MeanModel(), LineModel()]:
    preds = model.fit(hours, score).predict([6])
    print(type(model).__name__, [round(p, 1) for p in preds])
`,
        explanation: [
          'A base class defining the interface every model must have.',
          '`NotImplementedError` signals “subclasses must implement this”.',
          '…',
          '…',
          '…',
          '`MeanModel` **inherits** from Model and overrides its methods.',
          '…',
          '`fit` learns from data and stores the result in an attribute (trailing underscore = learned, like scikit-learn).',
          '…',
          'Returning `self` allows chaining: `model.fit(...).predict(...)`.',
          '`predict` uses what was learned.',
          '…',
          'A second model with the same interface.',
          '…',
          '…',
          'Compute means of x and y.',
          'Least-squares slope: covariance / variance (you’ll derive this in Module 10).',
          'Intercept.',
          '…',
          '…',
          '…',
          'Training data: hours studied vs score.',
          '…',
          'Because both share the same interface, we can loop over them — this is **polymorphism**.',
          'Fit then predict for 6 hours of study.',
          'MeanModel predicts 64.6; LineModel ≈ 83.9.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Forgetting `self` as the first method parameter → TypeError: takes 1 positional argument but 2 were given.', fix: 'Every instance method starts with `self`.' },
      { mistake: 'Writing `balance = balance` in __init__ instead of `self.balance = balance`.', fix: 'Attributes must be stored on `self`, otherwise they vanish.' },
      { mistake: 'Using a mutable class attribute (`history = []` at class level) shared by all objects.', fix: 'Create mutable attributes inside `__init__`.' },
      { mistake: 'Calling a method without parentheses: `acct.deposit`.', fix: '`acct.deposit(50)`.' },
    ],
    exercises: [
      {
        id: 'py12-ex1', title: 'Rectangle class', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Create a class \`Rectangle\` whose \`__init__\` takes \`width\` and \`height\`, with methods \`area()\` and \`perimeter()\`.`,
        starter: md`
class Rectangle:
    pass

r = Rectangle(3, 4)
print(r.area(), r.perimeter())
`,
        solution: md`
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

    def perimeter(self):
        return 2 * (self.width + self.height)

r = Rectangle(3, 4)
print(r.area(), r.perimeter())
`,
        tests: md`
r2 = Rectangle(5, 2)
assert r2.area() == 10, "area of 5x2 should be 10"
assert r2.perimeter() == 14, "perimeter of 5x2 should be 14"
assert r2.width == 5 and r2.height == 2, "store width and height on self"
`,
        hints: ['`def __init__(self, width, height):` then `self.width = width`.', 'Methods use `self.width` and `self.height`.'],
      },
      {
        id: 'py12-ex2', title: 'Inventory item', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Complete \`Item\`: \`sell(qty)\` should reduce \`stock\` by \`qty\` and return the sale revenue (\`qty * price\`), but raise \`ValueError\` if there isn’t enough stock.`,
        starter: md`
class Item:
    def __init__(self, name, price, stock):
        self.name = name
        self.price = price
        self.stock = stock

    def sell(self, qty):
        pass

pen = Item("Pen", 1.5, 10)
print(pen.sell(4), pen.stock)
`,
        solution: md`
class Item:
    def __init__(self, name, price, stock):
        self.name = name
        self.price = price
        self.stock = stock

    def sell(self, qty):
        if qty > self.stock:
            raise ValueError("not enough stock")
        self.stock -= qty
        return qty * self.price

pen = Item("Pen", 1.5, 10)
print(pen.sell(4), pen.stock)
`,
        tests: md`
it = Item("X", 2.0, 5)
assert it.sell(3) == 6.0, "sell(3) at 2.0 should return 6.0"
assert it.stock == 2, "stock should drop to 2"
try:
    it.sell(10)
except ValueError:
    pass
else:
    raise AssertionError("selling more than stock should raise ValueError")
assert it.stock == 2, "a failed sale must not change stock"
`,
        hints: ['Check `qty > self.stock` first.', 'Then `self.stock -= qty` and `return qty * self.price`.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What is `self` in a method?', options: ['The class', 'The current object', 'A global variable', 'A keyword for imports'], answer: 1, explanation: '`self` refers to the instance the method was called on.' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'When does `__init__` run?', options: ['When the class is defined', 'When an object is created', 'When the program ends', 'When print() is called'], answer: 1, explanation: 'It initialises each new object.' },
      { id: 'q3', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'class C:\n    def __init__(self):\n        self.n = 0\n    def inc(self):\n        self.n += 1\n        return self\nc = C()\nc.inc().inc().inc()\nprint(c.n)', accepted: ['3'], explanation: 'Each inc returns self, enabling chaining; n goes 0 → 3.' },
      { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'In scikit-learn, `model.fit(X, y)` is…', options: ['A function call unrelated to OOP', 'A method call on a model object that stores learned parameters', 'A class definition', 'A module import'], answer: 1, explanation: 'Models are objects; fit is a method that learns and stores attributes like coef_.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: '`class Savings(Account):` means…', options: ['Savings contains an Account', 'Savings inherits from Account', 'Account inherits from Savings', 'They are unrelated'], answer: 1, explanation: 'The class in parentheses is the parent (base) class.' },
    ],
    summary: [
      'Classes are blueprints; objects are instances with their own attributes.',
      '`__init__` sets up state on `self`; methods take `self` first.',
      'Dunder methods customise behaviour; inheritance reuses and extends classes.',
      'Data libraries are OOP: DataFrames and models are objects with methods.',
    ],
    resources: [{ label: 'Python tutorial: classes', url: 'https://docs.python.org/3/tutorial/classes.html' }, { label: 'dataclasses', url: 'https://docs.python.org/3/library/dataclasses.html' }],
  },
];
