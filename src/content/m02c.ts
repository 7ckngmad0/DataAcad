import type { Lesson } from '../types.ts';
import { md } from './md.ts';

export const m02c: Lesson[] = [
  {
    id: 'py-generators',
    title: 'Iterators, Generators & Lazy Evaluation',
    minutes: 40,
    difficulty: 'intermediate',
    objectives: [
      'Explain the iterator protocol (`iter` and `next`) behind every for-loop',
      'Write generator functions with `yield` and generator expressions',
      'Process large files one row at a time with a generator pipeline',
      'Use `itertools` (islice, count, chain, groupby) for lazy data processing',
    ],
    intro: md`
A list holds **all** its items in memory at once. That is fine for 1,000 rows and a problem for a 10 GB log file. **Generators** produce items *one at a time, only when asked*, so you can process data far bigger than your RAM. pandas' \`chunksize\`, PyTorch's data loaders and Python's own \`range\` all rely on this idea.
`,
    simple: md`
Think of a list as a **printed book**: every page exists before you start reading. A generator is a **storyteller**: they tell you the next sentence only when you ask, and they don't remember sentences they have already told.

- \`for x in something\` secretly calls \`next()\` again and again until the items run out.
- A function with \`yield\` instead of \`return\` becomes a generator: it **pauses** at each \`yield\` and resumes from there next time.
- A generator can be used **once**. After the last item it is *exhausted*.
`,
    technical: md`
### The iterator protocol
- An **iterable** is anything you can loop over (list, str, dict, file, range). \`iter(iterable)\` returns an **iterator**.
- An **iterator** has a \`__next__\` method. \`next(it)\` returns the next item or raises \`StopIteration\` when there are none. \`next(it, default)\` returns \`default\` instead of raising.
- A \`for\` loop is just: \`it = iter(obj)\`, then call \`next(it)\` until \`StopIteration\`.

### Generators
- **Generator function:** any function containing \`yield\`. Calling it runs **none** of the body; it returns a generator object. Each \`next()\` runs until the next \`yield\`, hands back that value and freezes the function's local state.
- **Generator expression:** \`(x * x for x in data)\` is the lazy version of a list comprehension. Inside a function call the extra parentheses can be dropped: \`sum(x * x for x in data)\`.
- **Lazy evaluation:** values are computed on demand, so memory use is constant regardless of length, and infinite sequences (\`itertools.count()\`) are possible.
- **Single pass:** once exhausted, a generator yields nothing more. Need the data twice? Convert it with \`list()\` or create a new generator.

### Pipelines
Chain generators so each stage pulls from the previous one: *read rows → filter → transform → aggregate*. Only one row is in memory at a time.

### itertools highlights
| Function | Does |
| --- | --- |
| \`islice(it, n)\` | first *n* items of any iterator (slicing for generators) |
| \`count(start, step)\` | infinite counter |
| \`chain(a, b, ...)\` | one iterator over several iterables |
| \`groupby(it, key)\` | groups **consecutive** items with the same key (sort first!) |
`,
    terms: [
      ['Iterable', 'An object you can loop over; `iter(obj)` returns an iterator for it.'],
      ['Iterator', 'An object that returns the next item with `next()` and raises StopIteration when done.'],
      ['Generator', 'An iterator created by a function containing `yield` or by a generator expression.'],
      ['yield', 'Hands a value to the caller and pauses the function until the next `next()` call.'],
      ['Lazy evaluation', 'Computing values only when they are needed, not all up front.'],
      ['Exhausted', 'An iterator that has produced all its items and will yield nothing more.'],
      ['StopIteration', 'The exception `next()` raises when an iterator has no more items.'],
    ],
    realWorld: md`
A payments company receives a 40 GB CSV of transactions every night. Loading it with \`pd.read_csv\` crashes the 16 GB server. The fix is a generator pipeline: one generator reads lines, the next keeps only failed payments, the next parses amounts, and \`sum()\` totals them. Memory use stays under 50 MB, and the same code works for 4 GB or 400 GB. (\`pd.read_csv(..., chunksize=100_000)\` applies the same idea, a chunk at a time.)
`,
    steps: [
      'Call `iter()` on a list and pull items manually with `next()` to see what a for-loop does.',
      'Write a generator function with `yield` and step through it.',
      'Compare the memory size of a list comprehension and a generator expression.',
      'Build a two-stage generator pipeline that streams a CSV file.',
      'Use `itertools.islice` to peek at the first few items of a long or infinite generator.',
    ],
    code: [
      {
        title: 'What a for-loop really does',
        code: md`
nums = [10, 20, 30]
it = iter(nums)
print(next(it))
print(next(it))
print(next(it))
print(next(it, "done"))
`,
        explanation: [
          'A normal list is an iterable.',
          '`iter()` gives an iterator: an object that remembers its position.',
          'Each `next()` returns the next item: 10.',
          '20.',
          '30.',
          'Nothing is left. With a default, `next` returns "done" instead of raising StopIteration.',
        ],
      },
      {
        title: 'A generator function pauses at every yield',
        code: md`
def countdown(n):
    print("starting")
    while n > 0:
        yield n
        n -= 1

gen = countdown(3)
print(type(gen).__name__)
print(next(gen))
print(list(gen))
print(list(gen))
`,
        explanation: [
          'A function containing `yield` is a generator function.',
          'This line runs only when the first value is requested, not when the function is called.',
          'Loop while there is something to count.',
          'Hand back `n` and freeze here until the next request.',
          'On the next request execution continues here.',
          'Calling the function runs none of its body; it just creates a generator object.',
          'Prints "generator".',
          'Now the body runs: "starting" is printed, then 3 is returned.',
          '`list()` pulls every remaining item: [2, 1].',
          'The generator is exhausted, so a second pass gives [].',
        ],
      },
      {
        title: 'Lazy vs eager: memory use',
        code: md`
import sys
squares_list = [x * x for x in range(1_000_000)]
squares_gen = (x * x for x in range(1_000_000))
print(sys.getsizeof(squares_list), "bytes for the list")
print(sys.getsizeof(squares_gen), "bytes for the generator")
print(sum(squares_gen))
`,
        explanation: [
          '`sys.getsizeof` reports an object’s size in bytes.',
          'Square brackets build all one million numbers now.',
          'Parentheses build a generator: nothing is computed yet.',
          'Roughly 8 MB just for the list’s slots.',
          'About 200 bytes, no matter how long the sequence is.',
          '`sum` pulls the values one by one, so the full sequence never sits in memory.',
        ],
      },
      {
        title: 'A generator pipeline over a CSV file',
        code: md`
import csv

def read_rows(path):
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            yield row

def big_orders(rows, min_revenue):
    for row in rows:
        if float(row["revenue"]) >= min_revenue:
            yield row

big = big_orders(read_rows("data/sales.csv"), 500)
first = next(big)
print("First big order:", first["order_id"], first["revenue"])
print("Total big orders:", 1 + sum(1 for _ in big))
`,
        explanation: [
          'The csv module reads files row by row.',
          'Stage 1: a generator that yields one row (a dict) at a time.',
          'The file stays open while rows are being pulled…',
          '…and `DictReader` itself is lazy.',
          'Each row is handed on as soon as it is read.',
          'Stage 2: takes any iterable of rows and passes on only the big ones.',
          'Pull rows from the previous stage one at a time.',
          'CSV values are strings, so convert before comparing.',
          'Only matching rows continue down the pipeline.',
          'Chaining the stages reads nothing yet: the pipeline only runs when pulled.',
          'Pull just the first matching row.',
          'Show it.',
          'Count the rest without building a list (`_` means "I don’t need the value"), plus the one we already took.',
        ],
      },
      {
        title: 'itertools: slicing, chaining and grouping lazily',
        code: md`
from itertools import islice, count, chain, groupby
evens = (n for n in count(0, 2))
print(list(islice(evens, 5)))
print(list(chain([1, 2], (3, 4), "ab")))
words = ["apple", "avocado", "banana", "blueberry", "cherry"]
for letter, group in groupby(words, key=lambda w: w[0]):
    print(letter, list(group))
`,
        explanation: [
          'Import four lazy helpers.',
          '`count(0, 2)` counts 0, 2, 4… forever. That is safe because nothing is computed yet.',
          '`islice` takes just the first 5: [0, 2, 4, 6, 8].',
          '`chain` walks through several iterables as one: [1, 2, 3, 4, "a", "b"].',
          'The words are already sorted by first letter.',
          '`groupby` yields (key, group) for each run of consecutive items with the same key.',
          'Each group is itself an iterator, so `list()` it to print.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Looping over the same generator twice and getting nothing the second time.', fix: 'Generators are single-pass. Store `list(gen)` if you need the data again, or create a new generator.' },
      { mistake: 'Calling `len()` on a generator.', fix: 'Generators have no length. Count with `sum(1 for _ in gen)` (which consumes it) or use a list.' },
      { mistake: 'Using `itertools.groupby` on unsorted data and getting the same key several times.', fix: 'Sort by the same key first: `groupby(sorted(data, key=k), key=k)`.' },
      { mistake: 'Writing `return value` inside a generator and expecting it to be yielded.', fix: 'Use `yield value`. A `return` in a generator just ends it.' },
      { mistake: 'Building a huge list just to sum or filter it: `sum([x for x in big])`.', fix: 'Drop the brackets: `sum(x for x in big)` streams the values.' },
    ],
    exercises: [
      {
        id: 'gen-ex1', title: 'Yield chunks', type: 'write', lang: 'python', difficulty: 'intermediate',
        prompt: md`Write a **generator function** \`chunks(items, size)\` that yields consecutive lists of at most \`size\` items. \`list(chunks([1, 2, 3, 4, 5, 6, 7], 3))\` should be \`[[1, 2, 3], [4, 5, 6], [7]]\`. Batching like this is how data is sent to APIs and fed into models.`,
        starter: md`
def chunks(items, size):
    # yield one list of up to size items at a time
    return []
`,
        solution: md`
def chunks(items, size):
    for start in range(0, len(items), size):
        yield items[start:start + size]

print(list(chunks([1, 2, 3, 4, 5, 6, 7], 3)))
`,
        tests: md`
import inspect
assert inspect.isgeneratorfunction(chunks), "chunks must be a generator function (use yield)"
assert list(chunks([1, 2, 3, 4, 5, 6, 7], 3)) == [[1, 2, 3], [4, 5, 6], [7]], "Wrong chunks for size 3"
assert list(chunks([], 2)) == [], "An empty list should yield nothing"
assert list(chunks(list("abcd"), 2)) == [["a", "b"], ["c", "d"]], "Wrong chunks for size 2"
`,
        hints: ['`range(0, len(items), size)` gives the start index of each chunk.', 'Slice `items[start:start + size]` and `yield` it.'],
      },
      {
        id: 'gen-ex2', title: 'Two sums of one generator', type: 'predict', lang: 'python', difficulty: 'intermediate',
        prompt: md`
What does this print? (type both numbers separated by a space)
\`\`\`python
gen = (n * 2 for n in range(4))
print(sum(gen), sum(gen))
\`\`\`
`,
        solution: '12 0', accepted: ['12 0', '12, 0'],
        hints: ['0+2+4+6 = ?', 'What is left in a generator after it has been fully consumed?'],
      },
      {
        id: 'gen-ex3', title: 'Fix the exhausted generator', type: 'debug', lang: 'python', difficulty: 'intermediate',
        prompt: md`This code should store the average score in \`average\` (75.0), but it crashes with \`ZeroDivisionError\`. Explain to yourself *why*, then fix it.`,
        starter: md`
scores = (s for s in [70, 85, 90, 55])
average = sum(scores) / len(list(scores))
print(average)
`,
        solution: md`
scores = [s for s in [70, 85, 90, 55]]
average = sum(scores) / len(scores)
print(average)
`,
        tests: md`assert average == 75.0, f"Expected 75.0, got {average}"`,
        hints: ['After `sum(scores)` the generator is exhausted, so `list(scores)` is empty.', 'Use a list (square brackets) so the data can be read twice.'],
      },
      {
        id: 'gen-ex4', title: 'Stream a CSV without pandas', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`Using the \`csv\` module and a **generator expression** (no pandas, no lists of all rows), compute the total revenue of orders in region **West** and category **Furniture** from \`data/sales.csv\`. Store it, rounded to 2 decimals, in \`west_furniture_revenue\`.`,
        starter: md`
import csv

west_furniture_revenue = 0
`,
        solution: md`
import csv

with open("data/sales.csv", newline="") as f:
    rows = csv.DictReader(f)
    west_furniture_revenue = round(
        sum(float(r["revenue"]) for r in rows if r["region"] == "West" and r["category"] == "Furniture"), 2
    )
print(west_furniture_revenue)
`,
        tests: md`
import csv as _csv
with open("data/sales.csv", newline="") as _f:
    _exp = round(sum(float(r["revenue"]) for r in _csv.DictReader(_f) if r["region"] == "West" and r["category"] == "Furniture"), 2)
assert abs(west_furniture_revenue - _exp) < 0.01, f"Expected {_exp}, got {west_furniture_revenue}"
`,
        hints: ['Open the file with `with open(...)` and wrap it in `csv.DictReader`.', '`sum(float(r["revenue"]) for r in rows if ...)` streams the rows.', 'Remember `round(..., 2)`.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'You must total one column of a 20 GB CSV on a laptop with 8 GB of RAM. Why does a generator pipeline work where `list(csv.reader(f))` fails?', options: ['Generators run in parallel on several cores', 'Generators compress the data', 'Only one row is in memory at a time, so memory use does not grow with file size', 'Generators skip invalid rows automatically'], answer: 2, explanation: 'Lazy evaluation keeps memory constant; the list version tries to hold all 20 GB at once.' },
      { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'A function body contains `yield`. What happens when you call the function?', options: ['The body runs to the first yield immediately', 'The body runs completely and returns a list', 'Nothing in the body runs yet; you get a generator object', 'A SyntaxError, because it needs return'], answer: 2, explanation: 'The body only starts running when the first value is requested with next() or a loop.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which of these is evaluated lazily?', options: ['`[x * 2 for x in data]`', '`(x * 2 for x in data)`', '`{x * 2 for x in data}`', '`sorted(data)`'], answer: 1, explanation: 'Parentheses make a generator expression. The others build complete collections immediately.' },
      { id: 'q4', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'from itertools import islice, count\nprint(list(islice(count(5), 3)))', accepted: ['[5, 6, 7]'], explanation: 'count(5) yields 5, 6, 7, …; islice takes the first three.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: '`groupby(["a", "b", "a"], key=str)` produces how many groups?', options: ['2, because there are two distinct keys', '3, because groupby only groups consecutive equal keys', '1', 'It raises an error on unsorted data'], answer: 1, explanation: 'groupby starts a new group whenever the key changes. Sort first to get one group per key.' },
      { id: 'q6', kind: 'mcq', difficulty: 'advanced', prompt: 'A teammate wraps a generator in `len(list(gen))` to log how many rows it has, then passes `gen` to the next stage. What goes wrong?', options: ['Nothing; it just costs memory', 'The next stage receives an exhausted generator and processes zero rows', 'len() raises TypeError', 'The rows are processed twice'], answer: 1, explanation: 'list() consumed every item. Generators are single-pass, a classic silent bug in data pipelines.' },
    ],
    summary: [
      'A for-loop calls `iter()` once, then `next()` until StopIteration.',
      'A function with `yield` returns a generator; it pauses at each yield and resumes on the next request.',
      'Generator expressions `( … )` are lazy versions of list comprehensions: constant memory, single pass.',
      'Chain generators into pipelines to stream files bigger than RAM.',
      '`itertools` gives lazy building blocks: islice, count, chain, groupby (sort first).',
    ],
    resources: [
      { label: 'Python docs: Generators (tutorial)', url: 'https://docs.python.org/3/tutorial/classes.html#generators' },
      { label: 'Python docs: itertools', url: 'https://docs.python.org/3/library/itertools.html' },
      { label: 'Real Python: How to Use Generators and yield', url: 'https://realpython.com/introduction-to-python-generators/' },
    ],
  },
  {
    id: 'py-regex',
    title: 'Regular Expressions for Text Cleaning',
    minutes: 45,
    difficulty: 'intermediate',
    objectives: [
      'Read and write common regex patterns: character classes, quantifiers, anchors and groups',
      'Use `re.search`, `re.findall`, `re.sub` and `re.fullmatch` appropriately',
      'Extract structured fields from messy text with (named) groups',
      'Clean pandas text columns with `.str.extract`, `.str.replace` and `.str.contains`',
    ],
    intro: md`
Real data is full of text that *almost* follows a pattern: prices written as "₱1,450.00", dates as "15-11-2024" or "2024/04/10", phone numbers with random spaces and dashes. **Regular expressions** (regex) describe text patterns precisely, so you can find, extract, validate and fix them in one line. Every data cleaning job uses them.
`,
    simple: md`
A regex is a **search pattern with wildcards**. Instead of searching for the exact text "2024", you can search for "any four digits": \`\d{4}\`.

- \`\d\` = a digit, \`\w\` = a letter/digit/underscore, \`\s\` = a space or tab, \`.\` = any character.
- \`+\` = one or more, \`*\` = zero or more, \`?\` = optional, \`{4}\` = exactly four.
- Parentheses \`( )\` **capture** the part you want to pull out.

So \`#(\d+)\` means “a # followed by one or more digits, and give me the digits”.
`,
    technical: md`
### Building blocks
| Pattern | Matches |
| --- | --- |
| \`\d\` \`\w\` \`\s\` | digit · word character \`[A-Za-z0-9_]\` · whitespace |
| \`\D\` \`\W\` \`\S\` | the opposite of each |
| \`[aeiou]\` \`[^0-9]\` \`[A-Z]\` | any one of a set · anything *not* in the set · a range |
| \`.\` | any character except newline (\`\.\` is a literal dot) |
| \`*\` \`+\` \`?\` \`{m,n}\` | 0+ · 1+ · 0 or 1 · between m and n repetitions |
| \`^\` \`$\` | start · end of the string |
| \`( )\` \`(?P<name> )\` \`(?: )\` | capture group · named group · group without capturing |
| \`a\|b\` | a or b |

### Functions in \`re\`
- \`re.search(p, s)\`: first match **anywhere**, returns a Match object or \`None\`.
- \`re.match(p, s)\`: match only at the **start**. \`re.fullmatch(p, s)\`: the **whole** string must match (use it for validation).
- \`re.findall(p, s)\`: list of all matches; if the pattern has one group, a list of that group's text.
- \`re.sub(p, repl, s)\`: replace matches; \`repl\` may refer to groups as \`\1\` or \`\g<name>\`.
- \`re.compile(p)\`: pre-compile a pattern you reuse many times.

### Raw strings
Always write patterns as **raw strings**, \`r"\d+"\`. Without the \`r\`, Python itself interprets backslashes first (\`"\b"\` becomes a backspace character), and the regex silently breaks.

### Greedy vs lazy
Quantifiers are **greedy**: \`<.+>\` on \`"<b>hi</b>"\` matches the whole string. Add \`?\` to make them lazy: \`<.+?>\` matches \`<b>\` and \`</b>\` separately.

### Regex in pandas
\`s.str.contains(p)\`, \`s.str.extract(p)\` (groups → columns), \`s.str.replace(p, repl, regex=True)\`, \`s.str.findall(p)\`. They are vectorised over the whole column and propagate \`NaN\`.
`,
    terms: [
      ['Regular expression', 'A pattern describing a set of strings, used to search, extract and replace text.'],
      ['Character class', 'A set of characters that can match one position, e.g. `[0-9]` or `\\d`.'],
      ['Quantifier', 'How many times the preceding item may repeat: `*`, `+`, `?`, `{m,n}`.'],
      ['Capture group', 'A parenthesised part of a pattern whose matched text you can extract.'],
      ['Anchor', 'A zero-width position such as `^` (start), `$` (end) or `\\b` (word boundary).'],
      ['Greedy quantifier', 'Matches as much text as possible; add `?` to match as little as possible.'],
      ['Raw string', 'A Python string prefixed with r in which backslashes are kept literally.'],
    ],
    realWorld: md`
A bank's fraud team receives 2 million free-text transaction descriptions like \`"POS 4821 GRAB*TRIP MNL 03/14 PHP 245.00"\`. A handful of regex patterns pulls out the merchant (\`GRAB\`), city code, date and amount into separate columns. That turns unusable text into features a model can learn from. The same team uses \`re.fullmatch\` to reject account numbers that don't match the official format before they enter the database.
`,
    steps: [
      'Look at several real examples of the text and write down the pattern in words.',
      'Translate it into a regex piece by piece (literal text, classes, quantifiers).',
      'Wrap the parts you want to keep in groups.',
      'Test it on good **and** bad examples. Check the edge cases.',
      'Apply it to the whole column with pandas `.str` methods and inspect the rows that did not match.',
    ],
    code: [
      {
        title: 'search, findall and sub',
        code: md`
import re
text = "Order #1042 shipped on 2025-03-14, order #1043 on 2025-03-15."
print(re.search(r"\d+", text).group())
print(re.findall(r"#(\d+)", text))
print(re.findall(r"\d{4}-\d{2}-\d{2}", text))
print(re.sub(r"\s+", " ", "too    many     spaces"))
`,
        explanation: [
          'The regex module is part of the standard library.',
          'Some text to search.',
          '`search` finds the first run of digits; `.group()` returns the matched text: "1042".',
          'With a group, `findall` returns just the captured part of every match: ["1042", "1043"].',
          'Four digits, dash, two digits, dash, two digits: both ISO dates.',
          '`sub` replaces every run of whitespace with a single space.',
        ],
      },
      {
        title: 'Named groups pull out structured fields',
        code: md`
import re
pattern = re.compile(r"(?P<user>[\w.]+)@(?P<domain>[\w-]+\.[a-z]{2,})")
m = pattern.search("Contact: ana.lopez@example.com before Friday")
print(m.group("user"), "|", m.group("domain"))
print(m.groupdict())
`,
        explanation: [
          'Import re.',
          'User part: letters, digits, `_` or dots. Then `@`, then a domain ending in a dot and two or more letters. Each part is named.',
          'Find the first email in the sentence.',
          'Access groups by name: "ana.lopez | example.com".',
          '`groupdict()` returns all named groups as a dictionary, ready to become a DataFrame row.',
        ],
      },
      {
        title: 'Validate with fullmatch (and why match is not enough)',
        code: md`
import re
valid = re.compile(r"[A-Z]{2}-\d{4}")
for code in ["PH-1234", "ph-1234", "PH-12345", "SG-0042"]:
    print(code, bool(valid.match(code)), bool(valid.fullmatch(code)))
`,
        explanation: [
          'Import re.',
          'Format: two capital letters, a dash, exactly four digits.',
          'Test four candidate codes.',
          '`match` accepts "PH-12345" because it only checks the start; `fullmatch` correctly rejects it.',
        ],
      },
      {
        title: 'Fix mixed date formats with groups and back-references',
        code: md`
import re
dates = ["2024-04-10", "2024/04/10", "15-11-2024"]
fixed = []
for d in dates:
    d = re.sub(r"^(\d{4})/(\d{2})/(\d{2})$", r"\1-\2-\3", d)
    d = re.sub(r"^(\d{2})-(\d{2})-(\d{4})$", r"\3-\2-\1", d)
    fixed.append(d)
print(fixed)
`,
        explanation: [
          'Import re.',
          'Three ways of writing a date, as found in messy_customers.csv.',
          'Collect the cleaned values here.',
          'Process each date.',
          'YYYY/MM/DD: capture year, month and day, then rebuild them with dashes. `\\1` refers to group 1.',
          'DD-MM-YYYY: reorder the groups to year, month, day. The anchors stop it touching ISO dates.',
          'Store the result.',
          'All three are now "2024-04-10" or "2024-11-15".',
        ],
      },
      {
        title: 'Regex on a whole pandas column',
        code: md`
import pandas as pd
df = pd.DataFrame({"raw": ["Price: $1,450.00", "USD 89.50", "free", "PHP 2,000"]})
df["amount"] = (
    df["raw"].str.replace(",", "", regex=False)
             .str.extract(r"(\d+(?:\.\d+)?)", expand=False)
             .astype(float)
)
df["has_currency"] = df["raw"].str.contains(r"\$|USD|PHP")
df
`,
        explanation: [
          'pandas has regex-aware string methods under `.str`.',
          'Prices written in four different ways.',
          'Build a numeric column in steps; the parentheses allow a readable multi-line chain.',
          'First remove thousands separators (a plain-text replace, not a regex).',
          'Extract digits with an optional decimal part. `(?: )` groups without capturing. "free" becomes NaN.',
          'Convert the extracted text to numbers.',
          'Close the chain.',
          'A boolean column: does the text mention a currency? (`\\$` is a literal dollar sign.)',
          'Display the DataFrame.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Writing patterns without the `r` prefix, e.g. `"\\bcat\\b"`.', fix: 'Always use raw strings: `r"\\bcat\\b"`. Otherwise `\\b` becomes a backspace character.' },
      { mistake: 'Using `.` to mean a literal dot (in emails, decimals, file names).', fix: 'Escape it: `\\.`. A bare `.` matches any character.' },
      { mistake: 'Using `re.match` to validate a whole value.', fix: 'Use `re.fullmatch` (or anchor with `^…$`). `match` only checks the beginning.' },
      { mistake: 'Greedy `.*` swallowing too much text.', fix: 'Use a lazy `.*?` or a negated class like `[^>]*`.' },
      { mistake: 'Parsing HTML, JSON or nested structures with regex.', fix: 'Use a real parser (`json`, `html.parser`, BeautifulSoup). Regex cannot track nesting.' },
    ],
    exercises: [
      {
        id: 'rx-ex1', title: 'Extract hashtags', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Store all hashtags in \`text\` in a list called \`tags\`, **without** the \`#\`, in the order they appear. Expected: \`["Python", "DataScience", "100DaysOfCode"]\`.`,
        starter: md`
import re
text = "Loving #Python and #DataScience! Day 12 of #100DaysOfCode."
tags = []
`,
        solution: md`
import re
text = "Loving #Python and #DataScience! Day 12 of #100DaysOfCode."
tags = re.findall(r"#(\w+)", text)
print(tags)
`,
        tests: md`assert tags == ["Python", "DataScience", "100DaysOfCode"], f"Got {tags}"`,
        hints: ['A hashtag is `#` followed by word characters.', 'Put the part after `#` in a group so `findall` returns only that.'],
      },
      {
        id: 'rx-ex2', title: 'Normalise phone numbers', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`The same phone number was typed three different ways. Use \`re.sub\` to keep **only the digits** and store the results in a list \`clean\`. Every entry should be \`"0281234567"\`.`,
        starter: md`
import re
phones = ["(02) 8123-4567", "02-8123-4567", "02 8123 4567"]
clean = phones
`,
        solution: md`
import re
phones = ["(02) 8123-4567", "02-8123-4567", "02 8123 4567"]
clean = [re.sub(r"\D", "", p) for p in phones]
print(clean)
`,
        tests: md`assert clean == ["0281234567"] * 3, f"Got {clean}"`,
        hints: ['`\\D` matches any character that is *not* a digit.', 'Replace those with an empty string, inside a list comprehension.'],
      },
      {
        id: 'rx-ex3', title: 'Fix the greedy tag matcher', type: 'debug', lang: 'python', difficulty: 'intermediate',
        prompt: md`\`tags\` should be \`["<b>", "</b>", "<i>", "</i>"]\`, but the pattern returns one giant match. Fix the pattern.`,
        starter: md`
import re
html = "<b>bold</b> and <i>italic</i>"
tags = re.findall(r"<.+>", html)
print(tags)
`,
        solution: md`
import re
html = "<b>bold</b> and <i>italic</i>"
tags = re.findall(r"<.+?>", html)
print(tags)
`,
        tests: md`assert tags == ["<b>", "</b>", "<i>", "</i>"], f"Got {tags}"`,
        hints: ['`.+` is greedy: it runs to the *last* `>` in the string.', 'Add `?` after the quantifier to make it lazy, or use `[^>]+`.'],
      },
      {
        id: 'rx-ex4', title: 'Repair signup dates in messy_customers.csv', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
\`data/messy_customers.csv\` has \`signup_date\` values in three formats: \`2024-04-10\`, \`2024/04/10\` and \`15-11-2024\` (day-month-year). Using **regex** (\`Series.str.replace\` with groups):
1. Convert every date to ISO \`YYYY-MM-DD\` in the column \`df["signup_date"]\`.
2. Store how many values you changed in \`n_fixed\`.

Then every date must fully match \`\d{4}-\d{2}-\d{2}\`.
`,
        starter: md`
import pandas as pd
df = pd.read_csv("data/messy_customers.csv")
n_fixed = 0
`,
        solution: md`
import pandas as pd
df = pd.read_csv("data/messy_customers.csv")
before = df["signup_date"].copy()
df["signup_date"] = (
    df["signup_date"]
    .str.replace(r"^(\d{4})/(\d{2})/(\d{2})$", r"\1-\2-\3", regex=True)
    .str.replace(r"^(\d{2})-(\d{2})-(\d{4})$", r"\3-\2-\1", regex=True)
)
n_fixed = int((before != df["signup_date"]).sum())
print(n_fixed, df["signup_date"].head())
`,
        tests: md`
assert df["signup_date"].str.fullmatch(r"\d{4}-\d{2}-\d{2}").all(), "Some dates are still not ISO formatted"
assert n_fixed == 2, f"Expected 2 changed values, got {n_fixed}"
assert (df["signup_date"] == "2024-11-15").any(), "15-11-2024 should become 2024-11-15 (day first)"
assert (df.loc[df["customer_id"] == 21, "signup_date"] == "2024-04-10").all(), "2024/04/10 should become 2024-04-10"
`,
        hints: ['Keep a copy of the column before changing it, so you can count the differences.', 'One `str.replace(..., regex=True)` per format; anchor each with `^…$`.', 'In the replacement, `\\3-\\2-\\1` reorders groups.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What does `re.search(r"\\d+", "abc123def45").group()` return?', options: ['"12345"', '"123"', '["123", "45"]', '"45"'], answer: 1, explanation: 'search returns the first match only: the first run of digits.' },
      { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'You must reject product codes that are not exactly `AB-1234` style. Which call is correct?', options: ['re.search(p, code)', 're.match(p, code)', 're.fullmatch(p, code)', 're.findall(p, code)'], answer: 2, explanation: 'Only fullmatch requires the entire string to fit the pattern; match would accept "AB-12345".' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why should regex patterns be written as raw strings (r"...")?', options: ['They run faster', 'So Python does not turn backslash sequences like \\b into special characters before the regex engine sees them', 'Raw strings ignore case', 'Because re only accepts bytes'], answer: 1, explanation: 'In a normal string "\\b" is a backspace character; in r"\\b" it stays a word boundary.' },
      { id: 'q4', kind: 'text', difficulty: 'intermediate', prompt: 'What does this print?', code: 'import re\nprint(re.findall(r"(\\w+)@", "a@x.com, bob@y.org"))', accepted: ["['a', 'bob']", '["a", "bob"]'], explanation: 'With one group, findall returns the captured text of each match.' },
      { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'On the string "<a><b>", what does the pattern `<.*?>` match first?', options: ['"<a><b>"', '"<a>"', '"a"', 'Nothing'], answer: 1, explanation: 'The lazy `*?` stops at the first `>`. The greedy `<.*>` would match the whole string.' },
      { id: 'q6', kind: 'mcq', difficulty: 'advanced', prompt: 'A colleague wants to extract every value from deeply nested JSON using one big regex. Best advice?', options: ['Fine, if the regex is long enough', 'Use json.loads and navigate the structure; regex cannot reliably handle nesting', 'Use re.fullmatch instead', 'Convert it to CSV first with regex'], answer: 1, explanation: 'Regex has no notion of matching brackets at arbitrary depth. Use a parser for structured formats.' },
    ],
    summary: [
      'Classes (`\\d \\w \\s [ ]`), quantifiers (`* + ? {m,n}`), anchors (`^ $ \\b`) and groups `( )` cover most needs.',
      '`search` finds the first match, `findall` finds all, `sub` replaces and `fullmatch` validates.',
      'Use raw strings, escape literal dots and prefer lazy `*?` when matching between delimiters.',
      'Groups and back-references (`\\1`) let you extract and reorder parts, e.g. to fix date formats.',
      'pandas `.str.extract / replace / contains` apply regex to whole columns.',
    ],
    resources: [
      { label: 'Python docs: Regular Expression HOWTO', url: 'https://docs.python.org/3/howto/regex.html' },
      { label: 'regex101: test and explain patterns', url: 'https://regex101.com/' },
      { label: 'pandas: Working with text data', url: 'https://pandas.pydata.org/docs/user_guide/text.html' },
    ],
  },
  {
    id: 'py-mini-project',
    title: 'Mini-project: A Gradebook Report in Pure Python',
    minutes: 60,
    difficulty: 'intermediate',
    objectives: [
      'Combine files, loops, functions, dictionaries, comprehensions and error handling in one program',
      'Load a CSV into a list of typed records without pandas',
      'Compute group statistics and rankings by hand',
      'Produce a clear text report from your results',
    ],
    intro: md`
You now know enough Python to build something real **without any libraries**. In this mini-project you'll turn \`data/students.csv\` (120 students, their study habits and grades) into a report a teacher could use. Doing it by hand once makes it obvious what pandas does for you later, and every step is a pattern you will reuse.
`,
    simple: md`
The plan is like cooking from a recipe:
1. **Read** the file into a list of dictionaries, one per student.
2. **Convert** the text values into numbers.
3. **Write small functions** for each question (letter grade, average per group, top students).
4. **Print a report.**

Each exercise below is one step. Solve them in order: each one checks your work automatically.
`,
    technical: md`
### Program design
- **Records:** \`list[dict]\`, one dict per row. Convert types *once* at load time (\`int\`, \`float\`, \`== "yes"\` for booleans) so the rest of the code can trust them.
- **Pure functions:** \`letter_grade(avg) -> str\` takes input and returns output with no printing or global state, so it is easy to test.
- **Grouping by hand:** a dict of lists, \`groups.setdefault(key, []).append(value)\`, then aggregate each list. This is exactly what \`df.groupby(key)[col].mean()\` does.
- **Ranking:** \`sorted(records, key=lambda r: r["average"], reverse=True)[:5]\`.
- **Robustness:** wrap conversions in \`try/except ValueError\` and **count** skipped rows instead of crashing or silently dropping them.
- **Output:** f-strings with format specs (\`{x:.1f}\`, \`{name:<12}\`) align a readable text table.

### The data (\`data/students.csv\`)
\`student_id, name, gender, age, study_hours_week, attendance_pct, math, science, english, average, passed\`
`,
    terms: [
      ['Record', 'One row of data, here represented as a dictionary of column → value.'],
      ['Type conversion', 'Turning text from a file into int/float/bool so you can calculate with it.'],
      ['Pure function', 'A function whose output depends only on its inputs and that has no side effects.'],
      ['Aggregation', 'Summarising many values into one (mean, count, max).'],
      ['Format spec', 'The part after `:` in an f-string placeholder that controls width, alignment and decimals.'],
    ],
    realWorld: md`
Many schools and small businesses run on exactly this kind of script: a nightly job reads an export from their system, computes a few statistics, and emails a text report. No database, no notebook, just 50 lines of standard-library Python that run anywhere. Being able to write one from scratch is a common take-home task in junior data interviews.
`,
    steps: [
      'Load the CSV with `csv.DictReader` and convert numeric columns.',
      'Write `letter_grade()` and test it on boundary values (89.9, 90, 59.9).',
      'Group averages by gender using a dict of lists.',
      'Rank the top five students.',
      'Assemble everything into an aligned text report.',
    ],
    code: [
      {
        title: 'The skeleton of the report program',
        code: md`
import csv

def load_students(path):
    students, skipped = [], 0
    with open(path, newline="") as f:
        for row in csv.DictReader(f):
            try:
                row["average"] = float(row["average"])
                row["study_hours_week"] = float(row["study_hours_week"])
                row["passed"] = row["passed"] == "yes"
                students.append(row)
            except ValueError:
                skipped += 1
    return students, skipped

students, skipped = load_students("data/students.csv")
print(len(students), "students loaded,", skipped, "rows skipped")
print(students[0]["name"], students[0]["average"], students[0]["passed"])
`,
        explanation: [
          'Standard library only.',
          'A loader function returns clean records plus a count of bad rows.',
          'Two results start empty.',
          'Open the file safely; it closes automatically.',
          'Each row arrives as a dict of strings.',
          'Try the conversions…',
          'Text to float.',
          'Same for study hours.',
          '"yes"/"no" to True/False.',
          'Keep the converted row.',
          'A value like "N/A" would raise ValueError…',
          '…so count it instead of crashing.',
          'Return both values as a tuple.',
          'Unpack the tuple.',
          '120 students loaded, 0 rows skipped.',
          'The types are now usable: a float and a bool.',
        ],
      },
    ],
    mistakes: [
      { mistake: 'Comparing numbers that are still strings: `"9" > "10"` is True.', fix: 'Convert once when loading, then every later comparison is numeric.' },
      { mistake: 'Off-by-one grade boundaries (is 90 an A or a B?).', fix: 'Decide on `>=` and test the exact boundary values.' },
      { mistake: 'Printing inside helper functions, which makes them hard to test and reuse.', fix: 'Return values; print only in the reporting step.' },
      { mistake: 'Silently skipping bad rows.', fix: 'Count (and ideally log) them, so data problems are visible.' },
    ],
    exercises: [
      {
        id: 'pmp-ex1', title: 'Step 1: load and convert', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`Load \`data/students.csv\` into a list of dicts called \`students\`. Convert \`math\`, \`science\` and \`english\` to **int**, \`average\` to **float**, and \`passed\` to a **bool** (\`True\` for "yes").`,
        starter: md`
import csv

students = []
`,
        solution: md`
import csv

students = []
with open("data/students.csv", newline="") as f:
    for row in csv.DictReader(f):
        for col in ("math", "science", "english"):
            row[col] = int(row[col])
        row["average"] = float(row["average"])
        row["passed"] = row["passed"] == "yes"
        students.append(row)
print(len(students), students[0])
`,
        tests: md`
assert len(students) == 120, f"Expected 120 students, got {len(students)}"
s = students[0]
assert isinstance(s["math"], int) and isinstance(s["english"], int), "math/science/english must be int"
assert isinstance(s["average"], float), "average must be float"
assert s["passed"] is True or s["passed"] is False, "passed must be a bool"
assert sum(st["passed"] for st in students) == 92, "Expected 92 students with passed == True"
`,
        hints: ['`csv.DictReader(f)` yields one dict per row.', 'Convert in a loop: `row[col] = int(row[col])`.', '`row["passed"] == "yes"` is already a bool.'],
      },
      {
        id: 'pmp-ex2', title: 'Step 2: letter grades', type: 'write', lang: 'python', difficulty: 'beginner',
        prompt: md`Write \`letter_grade(avg)\` returning **"A"** for 90 and above, **"B"** for 80 to under 90, **"C"** for 70 to under 80, **"D"** for 60 to under 70 and **"F"** below 60.`,
        starter: md`
def letter_grade(avg):
    return "A"
`,
        solution: md`
def letter_grade(avg):
    if avg >= 90:
        return "A"
    if avg >= 80:
        return "B"
    if avg >= 70:
        return "C"
    if avg >= 60:
        return "D"
    return "F"
`,
        tests: md`
cases = {95: "A", 90: "A", 89.9: "B", 80: "B", 79.99: "C", 70: "C", 65: "D", 60: "D", 59.9: "F", 0: "F"}
for avg, exp in cases.items():
    got = letter_grade(avg)
    assert got == exp, f"letter_grade({avg}) should be {exp!r}, got {got!r}"
`,
        hints: ['Check from the highest grade down, so each `if` only needs one comparison.', 'Use `>=` so 90 is an A.'],
      },
      {
        id: 'pmp-ex3', title: 'Step 3: average by gender (no pandas)', type: 'dataset', lang: 'python', difficulty: 'intermediate',
        prompt: md`Using the loaded \`students\`, build a dict \`avg_by_gender\` mapping each gender (\`"F"\`, \`"M"\`) to the mean of \`average\`, **rounded to 2 decimals**. Group with a dict of lists; don't use pandas.`,
        starter: md`
import csv
with open("data/students.csv", newline="") as f:
    students = [dict(r, average=float(r["average"])) for r in csv.DictReader(f)]

avg_by_gender = {}
`,
        solution: md`
import csv
with open("data/students.csv", newline="") as f:
    students = [dict(r, average=float(r["average"])) for r in csv.DictReader(f)]

groups = {}
for s in students:
    groups.setdefault(s["gender"], []).append(s["average"])
avg_by_gender = {g: round(sum(v) / len(v), 2) for g, v in groups.items()}
print(avg_by_gender)
`,
        tests: md`
assert set(avg_by_gender) == {"F", "M"}, f"Keys should be F and M, got {set(avg_by_gender)}"
assert avg_by_gender["F"] == 67.18 and avg_by_gender["M"] == 66.71, f"Got {avg_by_gender}"
`,
        hints: ['`groups.setdefault(key, []).append(value)` collects values per key.', 'Then a dict comprehension: `{g: round(sum(v) / len(v), 2) for g, v in groups.items()}`.'],
      },
      {
        id: 'pmp-ex4', title: 'Step 4: the final report', type: 'dataset', lang: 'python', difficulty: 'advanced',
        prompt: md`
Produce the teacher's report. Store in variables **and** print:
- \`top5\`: list of the names of the 5 students with the highest \`average\`, best first.
- \`grade_counts\`: dict of letter grade → number of students (use the grading scale from step 2, and include only grades that occur).
- \`pass_rate\`: percentage of students with \`passed == "yes"\`, rounded to 1 decimal.

Print at least one line containing the top student's name.
`,
        starter: md`
import csv
with open("data/students.csv", newline="") as f:
    students = [dict(r, average=float(r["average"])) for r in csv.DictReader(f)]

top5 = []
grade_counts = {}
pass_rate = 0
`,
        solution: md`
import csv
with open("data/students.csv", newline="") as f:
    students = [dict(r, average=float(r["average"])) for r in csv.DictReader(f)]

def letter_grade(avg):
    for cutoff, letter in [(90, "A"), (80, "B"), (70, "C"), (60, "D")]:
        if avg >= cutoff:
            return letter
    return "F"

top5 = [s["name"] for s in sorted(students, key=lambda s: s["average"], reverse=True)[:5]]
grade_counts = {}
for s in students:
    g = letter_grade(s["average"])
    grade_counts[g] = grade_counts.get(g, 0) + 1
pass_rate = round(100 * sum(s["passed"] == "yes" for s in students) / len(students), 1)

print("=== Gradebook report ===")
print(f"Students: {len(students)} | Pass rate: {pass_rate}%")
print("Top 5:", ", ".join(top5))
for g in sorted(grade_counts):
    print(f"  {g}: {grade_counts[g]:>3} {'#' * grade_counts[g]}")
`,
        tests: md`
assert top5 == ["Ben J.", "Sam C.", "Ana Q.", "Pia G.", "Dev H."], f"top5 is {top5}"
assert pass_rate == 76.7, f"pass_rate should be 76.7, got {pass_rate}"
assert sum(grade_counts.values()) == 120, "grade_counts should cover all 120 students"
assert grade_counts.get("A") == 2, f"Expected 2 A grades, got {grade_counts.get('A')}"
assert "Ben J." in _out, "Print the report (it should mention the top student)"
`,
        hints: ['`sorted(students, key=lambda s: s["average"], reverse=True)[:5]`', 'Count with `d[k] = d.get(k, 0) + 1`.', 'True counts as 1 in `sum(...)`.'],
      },
    ],
    quiz: [
      { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Why convert column types once, right after loading the CSV?', options: ['csv requires it', 'So all later code can trust the types; string comparisons like "9" > "10" give wrong answers', 'It makes the file smaller', 'Dictionaries cannot store strings'], answer: 1, explanation: 'CSV values are always strings. Converting once avoids subtle bugs everywhere else.' },
      { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which pure-Python pattern is equivalent to `df.groupby("gender")["average"].mean()`?', options: ['A list of tuples sorted by name', 'A dict of lists filled with setdefault(...).append(...), then the mean of each list', 'A set comprehension', 'A while loop over the file'], answer: 1, explanation: 'Grouping = collect values per key; aggregating = summarise each collection.' },
      { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why should `letter_grade` return a value rather than print it?', options: ['print is slow', 'Returned values can be tested, counted and reused; printed text can only be read', 'Functions cannot print', 'Return is required in Python'], answer: 1, explanation: 'Separating computation from presentation makes code testable and reusable.' },
      { id: 'q4', kind: 'text', difficulty: 'beginner', prompt: 'What does this print?', code: 'counts = {}\nfor g in ["A", "B", "A"]:\n    counts[g] = counts.get(g, 0) + 1\nprint(counts["A"])', accepted: ['2'], explanation: 'get returns 0 the first time; "A" is seen twice.' },
      { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'Five rows have "N/A" in the average column. What should a robust loader do?', options: ['Crash, so someone notices', 'Silently skip them', 'Skip them but count and report how many were skipped', 'Replace them with 0'], answer: 2, explanation: 'Crashing blocks everything; silent skipping hides data problems; inventing 0 biases results.' },
    ],
    summary: [
      'Load CSVs into a list of dicts and convert types once.',
      'Small pure functions (like letter_grade) are easy to test at their boundaries.',
      'Group with a dict of lists, aggregate with a comprehension: that is groupby by hand.',
      'Rank with `sorted(..., key=..., reverse=True)[:n]`.',
      'Count and report bad rows instead of crashing or hiding them.',
    ],
    resources: [
      { label: 'Python docs: csv module', url: 'https://docs.python.org/3/library/csv.html' },
      { label: 'Python docs: Format specification mini-language', url: 'https://docs.python.org/3/library/string.html#formatspec' },
    ],
  },
];
