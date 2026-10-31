import type { Lesson } from '../types.ts';
import { md } from './md.ts';

export const sqlDmlLesson: Lesson = {
  id: 'sql-dml-indexes',
  title: 'Changing Data Safely: INSERT, UPDATE, DELETE, Transactions & Indexes',
  minutes: 45,
  difficulty: 'intermediate',
  objectives: [
    'Add, change and remove rows with INSERT, UPDATE and DELETE',
    'Use transactions (BEGIN / COMMIT / ROLLBACK) to make changes all-or-nothing',
    'Create tables with constraints and build summary tables with CREATE TABLE … AS SELECT',
    'Explain what an index is, create one, and read EXPLAIN QUERY PLAN output',
  ],
  intro: md`
So far you have only **read** data. Analysts and data engineers also load new data, fix bad records, build summary tables and keep queries fast. Those statements change the database permanently, and one missing \`WHERE\` can wipe a table. This lesson teaches the commands **and** the safety habits that go with them.

In lessons and exercises every run starts from a fresh copy of the practice database, so you cannot break anything. (In the SQL Playground your changes persist between runs until you press the database reset button.)
`,
  simple: md`
- **INSERT** adds new rows. **UPDATE** changes values in existing rows. **DELETE** removes rows.
- \`UPDATE\` and \`DELETE\` affect **every row** unless you add a \`WHERE\`. Always run the same \`WHERE\` as a \`SELECT\` first to see what will change.
- A **transaction** is an “undo” bubble: \`BEGIN\`, make changes, then \`COMMIT\` to keep them or \`ROLLBACK\` to cancel them all.
- An **index** is like the index at the back of a book. Instead of reading every page (row) to find "customer 7", the database jumps straight to the right place.
`,
  technical: md`
### DML: Data Manipulation Language
\`\`\`sql
INSERT INTO products (product_id, name, category, price) VALUES (16, 'Laptop Stand', 'Electronics', 45);
INSERT INTO t (a, b) VALUES (1, 'x'), (2, 'y');           -- several rows at once
INSERT INTO archive SELECT * FROM orders WHERE status = 'cancelled';   -- from a query

UPDATE employees SET salary = salary * 1.05 WHERE dept_id = 2;
DELETE FROM orders WHERE status = 'cancelled';
\`\`\`
- Always list the columns in \`INSERT\`: the statement keeps working if the table gains columns.
- **Upsert:** \`INSERT … ON CONFLICT(key) DO UPDATE SET …\` inserts a row, or updates it if the key already exists.

### DDL and constraints
\`\`\`sql
CREATE TABLE targets (
  region TEXT PRIMARY KEY,
  target REAL NOT NULL CHECK (target > 0)
);
CREATE TABLE customer_totals AS SELECT customer_id, COUNT(*) AS n_orders FROM orders GROUP BY customer_id;
DROP TABLE IF EXISTS customer_totals;
\`\`\`
Constraints (\`PRIMARY KEY\`, \`NOT NULL\`, \`UNIQUE\`, \`CHECK\`, \`REFERENCES\`) make the **database** reject bad data, so every application that writes to it is protected.

### Transactions (ACID)
\`BEGIN; … COMMIT;\` groups statements so they all succeed or none do (**atomicity**). The classic example is a bank transfer: debit one account and credit another, never only one. \`ROLLBACK\` discards everything since \`BEGIN\`.

### Indexes
- Without an index, \`WHERE customer_id = 7\` must **scan** every row: O(n).
- \`CREATE INDEX idx_orders_customer ON orders(customer_id);\` builds a sorted B-tree, so lookups take O(log n) steps.
- Indexes speed up \`WHERE\`, \`JOIN\` and \`ORDER BY\` on the indexed columns but **slow down writes** and use disk space. Index the columns you filter and join on, not everything.
- \`EXPLAIN QUERY PLAN SELECT …\` shows whether SQLite will \`SCAN\` the table or \`SEARCH\` it using an index.
`,
  terms: [
    ['DML', 'Data Manipulation Language: INSERT, UPDATE, DELETE (and SELECT).'],
    ['DDL', 'Data Definition Language: CREATE, ALTER, DROP for tables and indexes.'],
    ['Transaction', 'A group of statements that succeed or fail together (BEGIN … COMMIT/ROLLBACK).'],
    ['ROLLBACK', 'Undoes every change made since the transaction began.'],
    ['Constraint', 'A rule the database enforces on column values (NOT NULL, UNIQUE, CHECK, foreign key).'],
    ['Upsert', 'Insert a row, or update it if a row with the same key already exists.'],
    ['Index', 'A separate sorted data structure that lets the database find rows without scanning the whole table.'],
    ['Query plan', 'The steps the database chooses to execute a query, shown by EXPLAIN QUERY PLAN.'],
  ],
  realWorld: md`
A junior analyst at a retailer meant to delete one test order and ran \`DELETE FROM orders;\` on the production database. Every order vanished. The team restored from the night’s backup and lost a day of sales data. Since then the company has three rules, now standard practice almost everywhere:
1. Analysts get **read-only** access to production.
2. Every change runs inside \`BEGIN … COMMIT\`, after a \`SELECT\` with the same \`WHERE\` confirms the row count.
3. A slow dashboard query (40 s) was fixed not with a bigger server but with **one index** on \`orders(customer_id, order_date)\`, which brought it down to 0.2 s.
`,
  steps: [
    'Write the `SELECT … WHERE …` that finds exactly the rows you mean to change, and check the count.',
    'Open a transaction with `BEGIN;`.',
    'Turn the SELECT into an `UPDATE` or `DELETE` with the *same* WHERE clause.',
    'Re-run the SELECT to verify the result, then `COMMIT;` (or `ROLLBACK;` if anything looks wrong).',
    'For slow queries, run `EXPLAIN QUERY PLAN`; if you see a full SCAN on a filtered column, consider an index.',
  ],
  code: [
    {
      title: 'INSERT one row and several rows',
      lang: 'sql', db: 'shop',
      code: md`
INSERT INTO products (product_id, name, category, price)
VALUES (16, 'Laptop Stand', 'Electronics', 45);
INSERT INTO products (product_id, name, category, price)
VALUES (17, 'Whiteboard', 'Office', 60), (18, 'Desk Mat', 'Office', 20);
SELECT * FROM products WHERE product_id >= 15 ORDER BY product_id;
`,
      explanation: [
        'Name the table and list the columns you are filling…',
        '…then give the values in the same order. Text goes in single quotes.',
        'One INSERT can add several rows…',
        '…as comma-separated groups of values.',
        'Check the result: product 15 (Desk Plant) plus the three new rows.',
      ],
    },
    {
      title: 'UPDATE safely: preview first, then change',
      lang: 'sql', db: 'company',
      code: md`
SELECT emp_id, name, salary FROM employees WHERE dept_id = 6;
UPDATE employees SET salary = ROUND(salary * 1.08) WHERE dept_id = 6;
SELECT emp_id, name, salary FROM employees WHERE dept_id = 6;
`,
      explanation: [
        'Step 1: preview exactly which rows the WHERE clause matches (the HR department).',
        'Step 2: the same WHERE in an UPDATE gives those rows an 8% raise, rounded to a whole number.',
        'Step 3: verify. Compare the two result tables shown below the editor.',
      ],
    },
    {
      title: 'DELETE inside a transaction, then undo it',
      lang: 'sql', db: 'shop',
      code: md`
BEGIN;
DELETE FROM orders WHERE status = 'cancelled';
SELECT status, COUNT(*) AS n FROM orders GROUP BY status;
ROLLBACK;
SELECT status, COUNT(*) AS n FROM orders GROUP BY status;
`,
      explanation: [
        'Start a transaction: nothing is permanent until COMMIT.',
        'Remove the 7 cancelled orders.',
        'Inside the transaction they are gone: only delivered and shipped remain.',
        'Changed your mind? ROLLBACK undoes everything since BEGIN.',
        'All 7 cancelled orders are back. With COMMIT instead of ROLLBACK, the delete would have been kept.',
      ],
    },
    {
      title: 'Constraints, upserts and summary tables',
      lang: 'sql', db: 'shop',
      code: md`
CREATE TABLE targets (
  category TEXT PRIMARY KEY,
  monthly_target REAL NOT NULL CHECK (monthly_target > 0)
);
INSERT INTO targets VALUES ('Electronics', 5000), ('Furniture', 3000);
INSERT INTO targets VALUES ('Furniture', 3500)
  ON CONFLICT(category) DO UPDATE SET monthly_target = excluded.monthly_target;
CREATE TABLE customer_totals AS
  SELECT customer_id, COUNT(*) AS n_orders FROM orders GROUP BY customer_id;
SELECT * FROM targets;
SELECT * FROM customer_totals ORDER BY n_orders DESC LIMIT 3;
`,
      explanation: [
        'Create a new table…',
        '…whose primary key is the category, so each category appears once…',
        '…and whose target must be present and positive (CHECK).',
        'End of the table definition.',
        'Insert two rows without listing columns (acceptable for a table you just created).',
        'Furniture already exists, so a plain INSERT would fail with a UNIQUE error…',
        '…but ON CONFLICT turns it into an update. `excluded` refers to the row we tried to insert.',
        'Build a summary table directly from a query…',
        '…with one row per customer and their order count.',
        'Furniture now has a target of 3500.',
        'The three customers with the most orders.',
      ],
    },
    {
      title: 'Indexes and EXPLAIN QUERY PLAN',
      lang: 'sql', db: 'shop',
      code: md`
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 7;
CREATE INDEX idx_orders_customer ON orders(customer_id);
EXPLAIN QUERY PLAN SELECT * FROM orders WHERE customer_id = 7;
SELECT order_id, order_date, status FROM orders WHERE customer_id = 7;
`,
      explanation: [
        'Ask SQLite how it would run the query: `SCAN orders` means it reads every row.',
        'Build an index on the filtered column.',
        'Now the plan says `SEARCH orders USING INDEX idx_orders_customer (customer_id=?)`: a direct lookup.',
        'The query returns the same 6 rows. Indexes change speed, never results.',
      ],
    },
  ],
  mistakes: [
    { mistake: 'Running `UPDATE` or `DELETE` without a `WHERE` clause.', fix: 'Always write and run the matching SELECT first; wrap changes in BEGIN … COMMIT.' },
    { mistake: '`INSERT INTO t VALUES (…)` without column names in production code.', fix: 'List the columns, so the statement survives schema changes and is self-documenting.' },
    { mistake: 'Adding an index on every column “to be fast”.', fix: 'Each index slows down INSERT/UPDATE and uses space. Index columns used in WHERE, JOIN and ORDER BY of frequent queries.' },
    { mistake: 'Validating data only in Python code.', fix: 'Add constraints (NOT NULL, CHECK, UNIQUE, foreign keys) so the database rejects bad data from any source.' },
    { mistake: 'Forgetting to COMMIT, then wondering why other sessions do not see the change.', fix: 'Changes inside an open transaction are visible only to you until COMMIT.' },
  ],
  exercises: [
    {
      id: 'dml-ex1', title: 'Add a new product', type: 'write', lang: 'sql', db: 'shop', difficulty: 'beginner',
      prompt: md`Insert a product with \`product_id\` **16**, name **'Laptop Stand'**, category **'Electronics'**, price **45**. Then return all Electronics products (\`product_id, name, price\`) ordered by price.`,
      starter: md`SELECT product_id, name, price FROM products WHERE category = 'Electronics' ORDER BY price;`,
      solution: md`
INSERT INTO products (product_id, name, category, price) VALUES (16, 'Laptop Stand', 'Electronics', 45);
SELECT product_id, name, price FROM products WHERE category = 'Electronics' ORDER BY price;
`,
      hints: ['`INSERT INTO products (product_id, name, category, price) VALUES (...);`', 'Keep the SELECT after the INSERT, separated by a semicolon.'],
    },
    {
      id: 'dml-ex2', title: 'Give the Data Science team a raise', type: 'write', lang: 'sql', db: 'company', difficulty: 'intermediate',
      prompt: md`Increase the salary of everyone in **department 2** by **10%**, rounded to a whole number with \`ROUND()\`. Then return \`emp_id, name, salary\` for department 2, ordered by \`emp_id\`. No one in other departments may be affected.`,
      starter: md`SELECT emp_id, name, salary FROM employees WHERE dept_id = 2 ORDER BY emp_id;`,
      solution: md`
UPDATE employees SET salary = ROUND(salary * 1.10) WHERE dept_id = 2;
SELECT emp_id, name, salary FROM employees WHERE dept_id = 2 ORDER BY emp_id;
`,
      hints: ['`UPDATE employees SET salary = ... WHERE dept_id = 2;`', '`ROUND(salary * 1.10)`'],
    },
    {
      id: 'dml-ex3', title: 'Fix the dangerous DELETE', type: 'debug', lang: 'sql', db: 'shop', difficulty: 'beginner',
      prompt: md`The goal is to delete **only cancelled orders** and then show how many orders remain per status (\`status, n\`, ordered by status). This script deletes everything. Fix it.`,
      starter: md`
DELETE FROM orders;
SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status;
`,
      solution: md`
DELETE FROM orders WHERE status = 'cancelled';
SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY status;
`,
      hints: ['A DELETE without WHERE removes every row.', "Add `WHERE status = 'cancelled'`."],
    },
    {
      id: 'dml-ex4', title: 'Build a loyal-customers table', type: 'write', lang: 'sql', db: 'shop', difficulty: 'advanced',
      prompt: md`
Create a table \`customer_totals\` with one row per customer: \`customer_id\`, \`n_orders\` (number of **delivered** orders) and \`last_order\` (their latest delivered \`order_date\`). Use \`CREATE TABLE … AS SELECT\`.

Then return the rows of \`customer_totals\` with **at least 5** delivered orders, ordered by \`n_orders\` descending, then \`customer_id\`.
`,
      starter: md`SELECT customer_id, COUNT(*) AS n_orders FROM orders GROUP BY customer_id;`,
      solution: md`
CREATE TABLE customer_totals AS
  SELECT customer_id, COUNT(*) AS n_orders, MAX(order_date) AS last_order
  FROM orders
  WHERE status = 'delivered'
  GROUP BY customer_id;
SELECT * FROM customer_totals WHERE n_orders >= 5 ORDER BY n_orders DESC, customer_id;
`,
      hints: ['Write the GROUP BY query first and check it.', "Filter `WHERE status = 'delivered'` before grouping; `MAX(order_date)` works on ISO date strings.", 'Prefix it with `CREATE TABLE customer_totals AS`, then query the new table.'],
    },
    {
      id: 'dml-ex5', title: 'What survives a ROLLBACK?', type: 'predict', lang: 'sql', difficulty: 'intermediate',
      prompt: md`
The shop has 15 products. What number does the final query return?
\`\`\`sql
BEGIN;
DELETE FROM products WHERE price < 20;
INSERT INTO products (product_id, name, category, price) VALUES (99, 'Lamp', 'Home', 30);
ROLLBACK;
SELECT COUNT(*) FROM products;
\`\`\`
`,
      solution: '15', accepted: ['15'],
      hints: ['ROLLBACK undoes every statement since BEGIN, including the INSERT.'],
    },
  ],
  quiz: [
    { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What does `UPDATE employees SET salary = 0;` do?', options: ['Nothing, because it needs a WHERE', 'Sets the salary of every employee to 0', 'Sets the first employee’s salary to 0', 'Raises an error'], answer: 1, explanation: 'Without WHERE, UPDATE applies to every row. This is why you preview with SELECT first.' },
    { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'A bank transfer debits account A and credits account B. Why put both in one transaction?', options: ['It runs faster', 'So either both changes happen or neither does, and money is never lost or created', 'Transactions encrypt the data', 'Required by SQL syntax'], answer: 1, explanation: 'Atomicity: a crash between the two statements must not leave the books unbalanced.' },
    { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'EXPLAIN QUERY PLAN shows `SCAN orders` for `WHERE customer_id = 7` on a 50-million-row table. What is the most likely fix?', options: ['Add LIMIT 1', 'Create an index on orders(customer_id)', 'Use SELECT * instead', 'Rewrite it as a subquery'], answer: 1, explanation: 'SCAN means every row is read. An index turns it into a SEARCH, an O(log n) lookup.' },
    { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'Why not index every column of a heavily written table?', options: ['SQLite allows only one index per table', 'Every INSERT/UPDATE must also update every index, slowing writes and using storage', 'Indexes change query results', 'Indexes only work on text columns'], answer: 1, explanation: 'Indexes are a trade-off: faster reads, slower writes and more space.' },
    { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which constraint stops a negative price from ever being stored, no matter which app writes the data?', options: ['NOT NULL', 'UNIQUE', 'CHECK (price >= 0)', 'An index on price'], answer: 2, explanation: 'CHECK constraints are enforced by the database for every insert and update.' },
    { id: 'q6', kind: 'text', difficulty: 'beginner', prompt: 'Which SQL keyword undoes all changes made since BEGIN?', accepted: ['ROLLBACK', 'rollback;'], explanation: 'ROLLBACK discards the transaction; COMMIT keeps it.' },
  ],
  summary: [
    'INSERT adds rows (list the columns), UPDATE changes them, DELETE removes them; the last two need a WHERE.',
    'Preview with SELECT, then change inside BEGIN … COMMIT, and ROLLBACK if anything looks wrong.',
    'Constraints let the database reject bad data; upserts (ON CONFLICT) insert or update.',
    'CREATE TABLE … AS SELECT builds summary tables.',
    'Indexes turn full scans into fast searches at the cost of slower writes; check with EXPLAIN QUERY PLAN.',
  ],
  resources: [
    { label: 'SQLite: INSERT, UPDATE, DELETE syntax', url: 'https://www.sqlite.org/lang_insert.html' },
    { label: 'SQLite: Query planning and indexes', url: 'https://www.sqlite.org/queryplanner.html' },
    { label: 'Use The Index, Luke: SQL indexing explained', url: 'https://use-the-index-luke.com/' },
  ],
};
