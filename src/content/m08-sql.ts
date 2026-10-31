import type { Module } from '../types.ts';
import { md } from './md.ts';
import { sqlDmlLesson } from './m08b.ts';

const SQLITE = { label: 'SQLite SQL reference', url: 'https://www.sqlite.org/lang.html' };
const MODE = { label: 'Mode SQL Tutorial (free)', url: 'https://mode.com/sql-tutorial' };
const SQLBOLT = { label: 'SQLBolt — interactive SQL lessons', url: 'https://sqlbolt.com/' };

export const m08: Module = {
  id: 'sql',
  number: 8,
  title: 'SQL & Databases',
  short: 'SQL',
  icon: 'database',
  description:
    'Relational databases and SQL from first principles to analyst level: SELECT, WHERE, ORDER BY, aggregates, GROUP BY/HAVING, all JOIN types, subqueries, CTEs, window functions, data changes, transactions and indexes — practised in a real SQLite playground on e-commerce and HR databases.',
  skills: ['Relational model', 'SELECT & WHERE', 'Aggregation', 'GROUP BY / HAVING', 'JOINs', 'Subqueries & CTEs', 'Window functions', 'SQL from Python', 'INSERT/UPDATE/DELETE', 'Transactions & indexes'],
  lessons: [
    {
      id: 'sql-databases',
      title: 'Databases, Tables & Relationships',
      minutes: 30,
      difficulty: 'beginner',
      widgets: ['sql-schema'],
      objectives: [
        'Explain what a relational database is and why organisations use them',
        'Describe tables, rows, columns, primary keys and foreign keys',
        'Identify one-to-many and many-to-many relationships',
        'Write your first SELECT query',
      ],
      intro: md`
Most company data lives in **databases**, not CSV files. SQL (Structured Query Language) is how you ask a database questions. It is the single most requested skill in data job ads — analysts, scientists and engineers all use it daily.
`,
      simple: md`
A relational database is a set of linked spreadsheets (**tables**). Instead of repeating a customer’s name and address on every order, the \`orders\` table just stores the customer’s **ID**, which points to one row in the \`customers\` table.

- Each table has a **primary key**: a column that uniquely identifies each row (like a student ID number).
- A **foreign key** is a column that refers to another table’s primary key (an order’s \`customer_id\`).

Use the schema explorer above to see how the practice **Online Shop** database is connected.
`,
      technical: md`
### Relational model
- **Table (relation):** rows (records) × columns (fields), each column with a type (\`INTEGER\`, \`REAL\`, \`TEXT\`, \`DATE\`...).
- **Primary key (PK):** unique, not null; identifies each row (\`customer_id\`).
- **Foreign key (FK):** references a PK in another table, enforcing **referential integrity** (an order can’t point to a non-existent customer).
- **Relationships:**
  - one-to-many: one customer → many orders;
  - many-to-many: orders ↔ products, implemented with a **junction table** (\`order_items\` with \`order_id\`, \`product_id\`, \`quantity\`);
  - one-to-one: e.g. user ↔ profile.
- **Normalisation:** organise data to avoid duplication and update anomalies (store each fact once).

### SQL vs other tools
SQL is **declarative**: you describe *what* you want; the database figures out *how*. Popular systems: PostgreSQL, MySQL, SQL Server, Oracle, SQLite (embedded — used in this app), and cloud warehouses (BigQuery, Snowflake, Redshift). Core SQL is the same everywhere; dialects differ in functions (dates, strings).

### Statement categories
- **DQL:** \`SELECT\` (query — 95% of analyst work).
- **DML:** \`INSERT\`, \`UPDATE\`, \`DELETE\`.
- **DDL:** \`CREATE TABLE\`, \`ALTER\`, \`DROP\`.

### First query
\`\`\`sql
SELECT name, city FROM customers LIMIT 5;
\`\`\`
\`SELECT *\` returns all columns (fine for exploring, avoid in production queries).
`,
      terms: [
        ['Database', 'An organised collection of data managed by a DBMS.'],
        ['Table', 'A set of rows sharing the same columns.'],
        ['Primary key', 'Column(s) uniquely identifying each row.'],
        ['Foreign key', 'Column referencing a primary key in another table.'],
        ['Junction table', 'A table linking two tables in a many-to-many relationship.'],
        ['Normalisation', 'Structuring tables to store each fact once.'],
        ['SQL', 'Structured Query Language for relational databases.'],
      ],
      realWorld: md`
An online shop’s database has \`customers\`, \`products\`, \`orders\` and \`order_items\`. When a customer changes their email, it is updated in **one** row of \`customers\`, and every one of their 200 orders automatically reflects it — because orders store only \`customer_id\`. Analysts then **join** these tables to answer questions like “revenue by customer city”.
`,
      steps: [
        'Explore the schema: which tables exist, what are their keys?',
        'Identify relationships (which FK points to which PK).',
        'Preview each table: `SELECT * FROM table LIMIT 5;`.',
        'Count rows: `SELECT COUNT(*) FROM table;`.',
        'Write down which table holds the facts you need.',
      ],
      code: [
        {
          title: 'Your first queries (Online Shop database)',
          lang: 'sql', db: 'shop',
          code: md`
-- Preview the customers table
SELECT * FROM customers LIMIT 5;
`,
          explanation: [
            '`--` starts a comment.',
            '`SELECT *` = all columns; `FROM customers` = which table; `LIMIT 5` = only 5 rows. Statements end with `;`.',
          ],
        },
        {
          title: 'How big are the tables?',
          lang: 'sql', db: 'shop',
          code: md`
SELECT 'customers' AS table_name, COUNT(*) AS n_rows FROM customers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;
`,
          explanation: [
            '`COUNT(*)` counts rows; `AS` gives output columns readable names.',
            '`UNION ALL` stacks the results of several SELECTs (same number of columns).',
            '…',
            'order_items has more rows than orders: one order can contain several products (one-to-many).',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Storing repeated details (customer name) in every order row.', fix: 'Normalise: store an ID and keep details in one table.' },
        { mistake: 'Using `SELECT *` on huge production tables.', fix: 'Select only needed columns and use LIMIT while exploring.' },
        { mistake: 'Forgetting that a many-to-many relationship needs a junction table.', fix: 'Model it as two one-to-many relationships through a linking table.' },
      ],
      exercises: [
        {
          id: 'sql1-ex1', title: 'Preview products', type: 'write', lang: 'sql', db: 'shop', difficulty: 'beginner',
          prompt: md`Return the \`name\` and \`price\` of **all** products.`,
          starter: md`SELECT * FROM customers;`,
          solution: md`SELECT name, price FROM products;`,
          hints: ['List the two column names after SELECT, separated by a comma.', 'The table is `products`.'],
        },
        {
          id: 'sql1-ex2', title: 'Count the employees', type: 'write', lang: 'sql', db: 'company', difficulty: 'beginner',
          prompt: md`Using the **Company HR** database, return the total number of employees (one row, one column).`,
          starter: md`SELECT * FROM employees LIMIT 3;`,
          solution: md`SELECT COUNT(*) AS n_employees FROM employees;`,
          hints: ['`COUNT(*)` counts rows.'],
        },
        {
          id: 'sql1-ex3', title: 'Identify the key', type: 'predict', lang: 'sql', difficulty: 'beginner',
          prompt: md`In the \`orders\` table, the column \`customer_id\` refers to \`customers.customer_id\`. Is it a primary key or a foreign key in **orders**? (two words)`,
          solution: 'foreign key', accepted: ['foreign key', 'fk', 'foreign'],
          hints: ['It points to a row in another table.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'A primary key must be…', options: ['Text', 'Unique and not null', 'A foreign key', 'Sorted'], answer: 1, explanation: 'It identifies each row uniquely.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: 'One customer can place many orders. This is a…', options: ['One-to-one relationship', 'One-to-many relationship', 'Many-to-many relationship', 'Self-join'], answer: 1, explanation: 'One customer row, many order rows.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Orders contain many products and products appear in many orders. How is this modelled?', options: ['A products column listing all IDs', 'A junction table like order_items', 'Duplicate tables', 'It cannot be modelled'], answer: 1, explanation: 'Many-to-many needs a linking table.' },
        { id: 'q4', kind: 'mcq', difficulty: 'beginner', prompt: 'SQL is described as declarative because…', options: ['You declare variables', 'You describe what result you want, not how to compute it', 'It only works on declarations', 'It is case-sensitive'], answer: 1, explanation: 'The query planner decides how.' },
      ],
      summary: [
        'Relational databases store linked tables; SQL queries them.',
        'Primary keys identify rows; foreign keys link tables.',
        'One-to-many and many-to-many (junction tables) relationships.',
        '`SELECT columns FROM table LIMIT n;` to start exploring.',
      ],
      resources: [SQLBOLT, MODE, SQLITE],
    },
    {
      id: 'sql-select-where',
      title: 'SELECT, WHERE, ORDER BY & Filtering',
      minutes: 40,
      difficulty: 'beginner',
      objectives: [
        'Select columns, compute expressions and use aliases',
        'Filter rows with WHERE, AND/OR/NOT, IN, BETWEEN, LIKE and IS NULL',
        'Sort with ORDER BY and limit results; use DISTINCT',
        'Use CASE WHEN to create categories',
      ],
      intro: md`
\`SELECT ... FROM ... WHERE ... ORDER BY\` is the backbone of SQL. With it you can answer most “show me the …” questions directly in the database, before data even reaches Python.
`,
      simple: md`
Read a query like a sentence:

\`SELECT name, price FROM products WHERE category = 'Electronics' ORDER BY price DESC;\`

“**Show** the name and price **from** the products table, **only where** the category is Electronics, **sorted** by price from highest to lowest.”

Text values go in **single quotes**: \`'Electronics'\`.
`,
      technical: md`
### Logical order of a query
Written: \`SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT\`
Executed (roughly): \`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT\`. That’s why a column alias defined in SELECT can’t be used in WHERE (but can in ORDER BY).

### SELECT
- Expressions: \`quantity * unit_price AS line_total\`, \`ROUND(price * 1.12, 2)\`, \`UPPER(name)\`.
- \`DISTINCT\` removes duplicate rows: \`SELECT DISTINCT country FROM customers\`.

### WHERE
| Operator | Example |
|---|---|
| comparison | \`price >= 100\`, \`status <> 'cancelled'\` |
| AND / OR / NOT | \`category = 'Furniture' AND price < 200\` |
| IN | \`country IN ('Japan', 'Canada')\` |
| BETWEEN (inclusive) | \`order_date BETWEEN '2025-01-01' AND '2025-03-31'\` |
| LIKE | \`name LIKE '%Desk%'\` (\`%\` any characters, \`_\` one character) |
| NULL checks | \`manager_id IS NULL\` (never \`= NULL\`) |

Use parentheses when mixing AND/OR: \`WHERE (a OR b) AND c\`.

### ORDER BY & LIMIT
\`ORDER BY price DESC, name ASC\`; \`LIMIT 10\` (+ \`OFFSET 10\` for the next page).

### CASE WHEN
\`\`\`sql
CASE WHEN price >= 200 THEN 'premium'
     WHEN price >= 50  THEN 'mid'
     ELSE 'budget' END AS price_band
\`\`\`

### Dates in SQLite
Stored as ISO text \`'YYYY-MM-DD'\`, so comparisons and sorting work; \`strftime('%m', order_date)\` extracts parts (other databases use \`EXTRACT\`/\`DATE_TRUNC\`).
`,
      terms: [
        ['SELECT', 'Chooses which columns/expressions to return.'],
        ['WHERE', 'Filters rows before grouping.'],
        ['ORDER BY', 'Sorts the result.'],
        ['DISTINCT', 'Removes duplicate rows from the result.'],
        ['Alias (AS)', 'A temporary name for a column or table.'],
        ['LIKE', 'Pattern matching with % and _ wildcards.'],
        ['NULL', 'Missing/unknown value; test with IS NULL.'],
        ['CASE', 'Conditional expression inside SQL.'],
      ],
      realWorld: md`
Customer support asks for a list of all **cancelled** orders from **Q1 2025** placed by **Business** customers, newest first. A single SELECT with three conditions (plus a join you’ll learn soon) produces the list in milliseconds — even on a table with millions of orders.
`,
      steps: [
        'Choose the table (FROM).',
        'Write the row conditions (WHERE), with parentheses for mixed AND/OR.',
        'Choose the output columns and expressions (SELECT, with aliases).',
        'Sort and limit (ORDER BY, LIMIT).',
        'Run, check the row count and a few rows.',
      ],
      code: [
        {
          title: 'Filtering and sorting products',
          lang: 'sql', db: 'shop',
          code: md`
SELECT name,
       category,
       price,
       ROUND(price * 1.12, 2) AS price_with_vat
FROM products
WHERE category IN ('Electronics', 'Furniture')
  AND price BETWEEN 50 AND 300
ORDER BY price DESC;
`,
          explanation: [
            'Choose columns…',
            '…',
            '…',
            '…and a computed column with an alias.',
            'From the products table.',
            'Only two categories (IN)…',
            '…and a price range (BETWEEN is inclusive).',
            'Most expensive first.',
          ],
        },
        {
          title: 'LIKE, NULL, DISTINCT and CASE',
          lang: 'sql', db: 'company',
          code: md`
SELECT name,
       title,
       salary,
       CASE WHEN salary >= 100000 THEN 'high'
            WHEN salary >= 70000 THEN 'medium'
            ELSE 'entry' END AS band,
       manager_id IS NULL AS is_top_manager
FROM employees
WHERE name LIKE '%a%'
ORDER BY salary DESC
LIMIT 10;
`,
          explanation: [
            '…',
            '…',
            '…',
            'CASE creates a category from salary…',
            '…conditions are checked in order…',
            '…ELSE covers the rest.',
            'A boolean expression (1/0 in SQLite): managers have no manager.',
            'Company HR database.',
            'Names containing the letter “a” (SQLite’s LIKE is case-insensitive for ASCII).',
            'Highest salaries first…',
            '…top 10 only.',
          ],
        },
      ],
      mistakes: [
        { mistake: '`WHERE manager_id = NULL` returns nothing.', fix: 'Use `IS NULL` / `IS NOT NULL`.' },
        { mistake: 'Double quotes for text values (`"Electronics"`).', fix: 'Use single quotes for strings; double quotes are for identifiers.' },
        { mistake: 'Mixing AND/OR without parentheses.', fix: 'AND binds tighter than OR — add parentheses.' },
        { mistake: 'Using a SELECT alias in WHERE.', fix: 'Repeat the expression in WHERE or use a subquery/CTE.' },
      ],
      exercises: [
        {
          id: 'sql2-ex1', title: 'Affordable stationery', type: 'write', lang: 'sql', db: 'shop', difficulty: 'beginner',
          prompt: md`Return \`name\` and \`price\` of products in the \`Stationery\` category costing **less than 10**, sorted by price ascending.`,
          starter: md`SELECT name, price FROM products;`,
          solution: md`SELECT name, price FROM products WHERE category = 'Stationery' AND price < 10 ORDER BY price;`,
          hints: ['Two conditions joined with AND.', '`ORDER BY price` (ascending is the default).'],
        },
        {
          id: 'sql2-ex2', title: 'Customers outside the Philippines', type: 'write', lang: 'sql', db: 'shop', difficulty: 'beginner',
          prompt: md`List the **distinct** countries of customers, excluding the Philippines, in alphabetical order.`,
          starter: md`SELECT country FROM customers;`,
          solution: md`SELECT DISTINCT country FROM customers WHERE country <> 'Philippines' ORDER BY country;`,
          hints: ['`SELECT DISTINCT country`', '`<>` means “not equal”.'],
        },
        {
          id: 'sql2-ex3', title: 'Salary bands', type: 'write', lang: 'sql', db: 'company', difficulty: 'intermediate',
          prompt: md`For every employee return \`name\`, \`salary\` and \`band\`: \`'senior'\` if salary ≥ 90000, otherwise \`'standard'\`. Sort by salary descending.`,
          starter: md`SELECT name, salary FROM employees;`,
          solution: md`SELECT name, salary, CASE WHEN salary >= 90000 THEN 'senior' ELSE 'standard' END AS band FROM employees ORDER BY salary DESC;`,
          hints: ['`CASE WHEN ... THEN ... ELSE ... END AS band`'],
        },
        {
          id: 'sql2-ex4', title: 'Fix the NULL filter', type: 'debug', lang: 'sql', db: 'company', difficulty: 'beginner',
          prompt: md`This query should list employees with **no manager**, but returns no rows. Fix it.`,
          starter: md`SELECT name, title FROM employees WHERE manager_id = NULL;`,
          solution: md`SELECT name, title FROM employees WHERE manager_id IS NULL;`,
          hints: ['NULL is never equal to anything — even NULL.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which keyword filters rows?', options: ['ORDER BY', 'WHERE', 'SELECT', 'LIMIT'], answer: 1, explanation: 'WHERE keeps rows meeting a condition.' },
        { id: 'q2', kind: 'mcq', difficulty: 'beginner', prompt: '`price BETWEEN 10 AND 20` includes…', options: ['10 < price < 20', '10 ≤ price ≤ 20', 'Only 10 and 20', '10 ≤ price < 20'], answer: 1, explanation: 'BETWEEN is inclusive on both ends.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which pattern matches names starting with "S"?', options: ["LIKE '%S'", "LIKE 'S%'", "LIKE '_S'", "= 'S*'"], answer: 1, explanation: '% matches any characters after S.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why can’t you use a SELECT alias in WHERE?', options: ['Aliases are illegal', 'WHERE is evaluated before SELECT', 'WHERE only uses numbers', 'Aliases need quotes'], answer: 1, explanation: 'Logical execution order: FROM → WHERE → … → SELECT.' },
        { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'How do you sort from highest to lowest?', options: ['ORDER BY x UP', 'ORDER BY x DESC', 'SORT x DESC', 'ORDER x HIGH'], answer: 1, explanation: 'DESC = descending.' },
      ],
      summary: [
        'SELECT columns/expressions with aliases; DISTINCT removes duplicates.',
        'WHERE with comparisons, AND/OR/NOT, IN, BETWEEN, LIKE, IS NULL.',
        'ORDER BY ... DESC and LIMIT for top-n.',
        'CASE WHEN creates categories; logical order explains alias rules.',
      ],
      resources: [SQLBOLT, MODE],
    },
    {
      id: 'sql-aggregation',
      title: 'Aggregate Functions, GROUP BY & HAVING',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Use COUNT, SUM, AVG, MIN, MAX (and COUNT DISTINCT)',
        'Group rows with GROUP BY on one or more columns',
        'Filter groups with HAVING and know how it differs from WHERE',
        'Combine aggregation with CASE for conditional counts',
      ],
      intro: md`
Business questions are usually summaries: total revenue per category, number of orders per month, average salary per department. SQL aggregation does this inside the database, which is often much faster than exporting raw rows.
`,
      simple: md`
**Aggregate functions** squash many rows into one number: \`COUNT\` (how many), \`SUM\` (total), \`AVG\` (average), \`MIN\`, \`MAX\`.

\`GROUP BY\` makes one pile per group and summarises each pile — exactly like pandas’ \`groupby\`.

\`WHERE\` filters **rows before** grouping; \`HAVING\` filters **groups after** grouping (“only show departments with more than 4 people”).
`,
      technical: md`
### Aggregates
\`COUNT(*)\` (rows), \`COUNT(col)\` (non-null values), \`COUNT(DISTINCT col)\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`. Aggregates ignore NULLs (except \`COUNT(*)\`).

### GROUP BY rules
Every column in SELECT must either be in GROUP BY or inside an aggregate:
\`\`\`sql
SELECT category, COUNT(*) AS n, AVG(price) AS avg_price
FROM products
GROUP BY category;
\`\`\`
Group by several columns for finer groups: \`GROUP BY region, category\`.

### HAVING
\`\`\`sql
SELECT customer_id, COUNT(*) AS n_orders
FROM orders
WHERE status = 'delivered'      -- row filter
GROUP BY customer_id
HAVING COUNT(*) >= 8            -- group filter
ORDER BY n_orders DESC;
\`\`\`

### Conditional aggregation
\`SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)\` counts cancellations per group; divide by \`COUNT(*)\` for a rate (multiply by \`1.0\` in SQLite to avoid integer division).

### Grouping by time (SQLite)
\`strftime('%Y-%m', order_date) AS month\` then \`GROUP BY month\`.
`,
      terms: [
        ['Aggregate function', 'Computes one value from many rows (SUM, AVG...).'],
        ['GROUP BY', 'Groups rows sharing values so aggregates are computed per group.'],
        ['HAVING', 'Filters groups after aggregation.'],
        ['COUNT(DISTINCT x)', 'Number of distinct non-null values.'],
        ['Conditional aggregation', 'Aggregating a CASE expression to count/sum a subset.'],
        ['Integer division', 'Dividing integers truncates in SQLite: 3/4 = 0. Use 1.0 *.'],
      ],
      realWorld: md`
Every Monday a dashboard shows **revenue, order count and cancellation rate per product category** for the previous week. Behind it is a single GROUP BY query with SUM, COUNT and a conditional aggregate — scheduled to refresh automatically.
`,
      steps: [
        'Decide the grain of the result (one row per what?). That is your GROUP BY.',
        'Choose the aggregates (SUM, COUNT, AVG...).',
        'Put row filters in WHERE.',
        'Put conditions on aggregates in HAVING.',
        'Sort the summary by the most important metric.',
      ],
      code: [
        {
          title: 'Revenue by category',
          lang: 'sql', db: 'shop',
          code: md`
SELECT p.category,
       COUNT(DISTINCT oi.order_id)              AS orders,
       SUM(oi.quantity)                         AS units,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue,
       ROUND(AVG(oi.unit_price), 2)             AS avg_unit_price
FROM order_items AS oi
JOIN products AS p ON p.product_id = oi.product_id
GROUP BY p.category
ORDER BY revenue DESC;
`,
          explanation: [
            'One output row per category.',
            'Number of distinct orders containing the category.',
            'Units sold.',
            'Revenue = sum of quantity × unit price.',
            'Average unit price.',
            '`AS oi` gives the table a short alias.',
            'A JOIN (next lesson) brings in each item’s category.',
            'Group by category…',
            '…and sort the summary.',
          ],
        },
        {
          title: 'HAVING and conditional aggregation',
          lang: 'sql', db: 'shop',
          code: md`
SELECT customer_id,
       COUNT(*) AS n_orders,
       SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS n_cancelled,
       ROUND(1.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 2) AS cancel_rate
FROM orders
GROUP BY customer_id
HAVING COUNT(*) >= 7
ORDER BY n_orders DESC;

-- Orders per month
SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders
FROM orders
GROUP BY month
ORDER BY month;
`,
          explanation: [
            'One row per customer.',
            'Orders per customer.',
            'Conditional aggregation: count only cancelled orders.',
            '`1.0 *` forces decimal division for the rate.',
            '…',
            '…',
            'Keep only customers with at least 7 orders (a group filter).',
            '…',
            '…',
            'A second query: group by month using strftime.',
            '…',
            '…',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Selecting a non-aggregated column not in GROUP BY.', fix: 'Add it to GROUP BY or wrap it in an aggregate. (SQLite allows it but returns an arbitrary value!)' },
        { mistake: 'Using WHERE with an aggregate: `WHERE COUNT(*) > 5`.', fix: 'Use HAVING for conditions on aggregates.' },
        { mistake: 'Integer division producing 0 rates in SQLite.', fix: 'Multiply by 1.0 or CAST to REAL.' },
        { mistake: '`COUNT(column)` when you meant all rows.', fix: 'COUNT(column) skips NULLs; use COUNT(*) for rows.' },
      ],
      exercises: [
        {
          id: 'sql3-ex1', title: 'Headcount and average salary per department', type: 'write', lang: 'sql', db: 'company', difficulty: 'beginner',
          prompt: md`Return \`dept_id\`, the number of employees (\`headcount\`) and average salary (\`avg_salary\`, rounded to 0 decimals) per department, sorted by \`avg_salary\` descending.`,
          starter: md`SELECT dept_id, salary FROM employees;`,
          solution: md`SELECT dept_id, COUNT(*) AS headcount, ROUND(AVG(salary)) AS avg_salary FROM employees GROUP BY dept_id ORDER BY avg_salary DESC;`,
          hints: ['GROUP BY dept_id.', 'COUNT(*) and ROUND(AVG(salary)).'],
        },
        {
          id: 'sql3-ex2', title: 'Big customers', type: 'write', lang: 'sql', db: 'shop', difficulty: 'intermediate',
          prompt: md`Return \`customer_id\` and \`n_orders\` for customers with **more than 6 delivered orders**, sorted by \`n_orders\` descending then \`customer_id\` ascending.`,
          starter: md`SELECT customer_id, COUNT(*) AS n_orders FROM orders GROUP BY customer_id;`,
          solution: md`SELECT customer_id, COUNT(*) AS n_orders FROM orders WHERE status = 'delivered' GROUP BY customer_id HAVING COUNT(*) > 6 ORDER BY n_orders DESC, customer_id;`,
          hints: ['Filter delivered rows with WHERE first.', 'Filter groups with HAVING COUNT(*) > 6.'],
        },
        {
          id: 'sql3-ex3', title: 'Monthly revenue', type: 'write', lang: 'sql', db: 'shop', difficulty: 'intermediate',
          prompt: md`Compute revenue per month (\`month\` as 'YYYY-MM', \`revenue\` = SUM(quantity × unit_price) rounded to 2) for **delivered** orders only, ordered by month. You will need to join \`orders\` and \`order_items\` on \`order_id\`.`,
          starter: md`SELECT order_date FROM orders;`,
          solution: md`
SELECT strftime('%Y-%m', o.order_date) AS month,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
WHERE o.status = 'delivered'
GROUP BY month
ORDER BY month;
`,
          hints: ['`JOIN order_items oi ON oi.order_id = o.order_id`', '`strftime(\'%Y-%m\', o.order_date) AS month` and GROUP BY month.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which clause filters groups after aggregation?', options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'], answer: 1, explanation: 'HAVING filters aggregated groups.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: '`COUNT(email)` vs `COUNT(*)`:', options: ['Identical', 'COUNT(email) skips NULL emails', 'COUNT(*) skips NULLs', 'COUNT(email) counts distinct'], answer: 1, explanation: 'COUNT(col) counts non-null values.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'In SQLite, `SELECT 3 / 4;` returns…', options: ['0.75', '0', '1', 'Error'], answer: 1, explanation: 'Integer division; use 3 * 1.0 / 4.' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'You want the cancellation **rate** per category. Which expression?', options: ['COUNT(status)', "AVG(CASE WHEN status = 'cancelled' THEN 1.0 ELSE 0 END)", 'SUM(status)', "COUNT(*) WHERE status='cancelled'"], answer: 1, explanation: 'The average of a 1/0 indicator is a rate.' },
        { id: 'q5', kind: 'mcq', difficulty: 'beginner', prompt: 'SQL `GROUP BY` is most similar to pandas’…', options: ['merge', 'groupby', 'sort_values', 'dropna'], answer: 1, explanation: 'Both implement split-apply-combine.' },
      ],
      summary: [
        'COUNT, SUM, AVG, MIN, MAX (aggregates ignore NULLs except COUNT(*)).',
        'GROUP BY sets the grain; non-aggregated SELECT columns must be grouped.',
        'WHERE filters rows before grouping; HAVING filters groups after.',
        'Conditional aggregation with CASE; beware integer division.',
      ],
      resources: [MODE, SQLITE],
    },
    {
      id: 'sql-joins',
      title: 'JOIN Operations',
      minutes: 45,
      difficulty: 'intermediate',
      objectives: [
        'Combine tables with INNER JOIN and LEFT JOIN',
        'Join three or more tables through keys',
        'Find unmatched rows with LEFT JOIN ... IS NULL',
        'Use self-joins and avoid join fan-out mistakes',
      ],
      intro: md`
Data is split across tables, so almost every real query uses **JOINs**. “Revenue by customer country” needs customers, orders, order_items and products together. Mastering joins is what separates beginners from capable SQL users.
`,
      simple: md`
A JOIN glues two tables side by side by matching a key — like matching name tags.

- **INNER JOIN**: only rows that match in **both** tables (customers who placed orders).
- **LEFT JOIN**: **all** rows from the left table, plus matches from the right; no match → NULLs (all customers, including those who never ordered).

It is exactly pandas’ \`merge\` with \`how="inner"\` / \`how="left"\`.
`,
      technical: md`
\`\`\`sql
SELECT c.name, o.order_id, o.order_date
FROM customers AS c
INNER JOIN orders AS o ON o.customer_id = c.customer_id;
\`\`\`
- **Table aliases** (\`c\`, \`o\`) keep queries short; prefix columns to avoid ambiguity.
- \`ON\` specifies the matching condition (usually FK = PK).

| Join | Keeps |
|---|---|
| \`INNER JOIN\` | matching rows only |
| \`LEFT JOIN\` | all left rows (+ NULLs) |
| \`RIGHT JOIN\` | all right rows (supported in SQLite ≥ 3.39; usually rewrite as LEFT) |
| \`FULL OUTER JOIN\` | all rows from both |
| \`CROSS JOIN\` | every combination |

### Anti-join (find missing matches)
\`\`\`sql
SELECT c.name FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;      -- customers with no orders
\`\`\`
⚠️ A condition on the right table in WHERE turns a LEFT JOIN into an INNER JOIN; put such conditions in the \`ON\` clause when you want to keep unmatched rows.

### Multiple joins
Chain them following the keys: \`customers → orders → order_items → products\`.

### Self-join
Join a table to itself, e.g. employees to their managers: \`FROM employees e LEFT JOIN employees m ON m.emp_id = e.manager_id\`.

### Fan-out
Joining a one-to-many relationship multiplies rows (each order appears once per item). Aggregating after such a join can double-count; aggregate first in a subquery/CTE, or count DISTINCT.
`,
      terms: [
        ['JOIN', 'Combines rows from two tables based on a related column.'],
        ['INNER JOIN', 'Returns only matching rows.'],
        ['LEFT JOIN', 'Returns all left rows and matching right rows (NULL if none).'],
        ['Table alias', 'Short name for a table in a query.'],
        ['Anti-join', 'Rows in one table with no match in another.'],
        ['Self-join', 'Joining a table to itself.'],
        ['Fan-out', 'Row multiplication when joining one-to-many.'],
      ],
      realWorld: md`
Marketing wants to email **customers who signed up but never ordered** with a welcome discount. That’s a LEFT JOIN anti-join between \`customers\` and \`orders\`. Finance wants **revenue by country** — a four-table join followed by GROUP BY. Both are everyday analyst tasks.
`,
      steps: [
        'Identify the tables you need and the key path between them.',
        'Start FROM the table whose rows you want to keep (the “left” table).',
        'Add joins one at a time with explicit ON conditions; run after each to check row counts.',
        'Choose INNER vs LEFT deliberately.',
        'Aggregate carefully to avoid fan-out double counting.',
      ],
      code: [
        {
          title: 'INNER vs LEFT JOIN and the anti-join',
          lang: 'sql', db: 'shop',
          code: md`
-- Customers with their number of orders (INNER: only customers who ordered)
SELECT c.name, COUNT(o.order_id) AS n_orders
FROM customers c
JOIN orders o ON o.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY n_orders DESC
LIMIT 5;

-- Customers who never ordered (LEFT JOIN + IS NULL)
SELECT c.customer_id, c.name, c.signup_date
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.order_id IS NULL;
`,
          explanation: [
            '…',
            'Count each customer’s orders.',
            'Start from customers…',
            '…join orders on the foreign key.',
            'Group by customer (id and name).',
            'Most orders first…',
            '…top 5.',
            '…',
            '…',
            'All customers…',
            '…with their orders if any…',
            '…keep only those where no order matched → customers 38, 39, 40.',
          ],
        },
        {
          title: 'Four-table join and a self-join',
          lang: 'sql', db: 'shop',
          code: md`
SELECT c.country,
       COUNT(DISTINCT o.order_id) AS orders,
       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM customers c
JOIN orders o       ON o.customer_id = c.customer_id
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p     ON p.product_id = oi.product_id
WHERE o.status = 'delivered' AND p.category <> 'Grocery'
GROUP BY c.country
ORDER BY revenue DESC;
`,
          explanation: [
            'One row per country.',
            'DISTINCT avoids counting an order once per item (fan-out).',
            'Revenue from item lines.',
            'Follow the key path: customers →',
            '→ orders →',
            '→ order_items →',
            '→ products.',
            'Row filters across joined tables.',
            '…',
            '…',
          ],
        },
        {
          title: 'Self-join: employees and their managers',
          lang: 'sql', db: 'company',
          code: md`
SELECT e.name AS employee,
       e.title,
       d.name AS department,
       COALESCE(m.name, '(none)') AS manager
FROM employees e
JOIN departments d ON d.dept_id = e.dept_id
LEFT JOIN employees m ON m.emp_id = e.manager_id
ORDER BY department, e.title, employee;
`,
          explanation: [
            'The employee…',
            '…their title,',
            '…their department name (joined),',
            '`COALESCE` replaces NULL with a default — top managers have no manager.',
            'employees as `e`…',
            '…join departments,',
            '…and employees **again** as `m` (the manager). LEFT keeps managers themselves.',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Forgetting the ON condition → a Cartesian product of every row with every row.', fix: 'Always specify `ON a.key = b.key`.' },
        { mistake: 'Filtering the right table in WHERE after a LEFT JOIN (loses unmatched rows).', fix: 'Move the condition into the ON clause, or handle NULLs explicitly.' },
        { mistake: 'Double counting after a one-to-many join.', fix: 'Use COUNT(DISTINCT ...) or aggregate before joining.' },
        { mistake: 'Ambiguous column names (`customer_id` exists in two tables).', fix: 'Prefix with table aliases.' },
      ],
      exercises: [
        {
          id: 'sql4-ex1', title: 'Employee with department name', type: 'write', lang: 'sql', db: 'company', difficulty: 'beginner',
          prompt: md`Return each employee’s \`name\` and their department’s name as \`department\`, sorted by employee name.`,
          starter: md`SELECT name, dept_id FROM employees;`,
          solution: md`SELECT e.name, d.name AS department FROM employees e JOIN departments d ON d.dept_id = e.dept_id ORDER BY e.name;`,
          hints: ['JOIN departments d ON d.dept_id = e.dept_id', 'Alias the department name: `d.name AS department`.'],
        },
        {
          id: 'sql4-ex2', title: 'Empty departments', type: 'write', lang: 'sql', db: 'company', difficulty: 'intermediate',
          prompt: md`Find departments that have **no employees**. Return the department \`name\`.`,
          starter: md`SELECT name FROM departments;`,
          solution: md`SELECT d.name FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id WHERE e.emp_id IS NULL;`,
          hints: ['LEFT JOIN employees onto departments.', 'Keep rows where the employee side IS NULL.'],
        },
        {
          id: 'sql4-ex3', title: 'Top products by revenue', type: 'write', lang: 'sql', db: 'shop', difficulty: 'intermediate',
          prompt: md`Return the **top 3** products by total revenue (SUM(quantity × unit_price)) across **delivered** orders: columns \`name\` and \`revenue\` (rounded to 2), highest first.`,
          starter: md`SELECT name FROM products LIMIT 3;`,
          solution: md`
SELECT p.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN orders o ON o.order_id = oi.order_id
JOIN products p ON p.product_id = oi.product_id
WHERE o.status = 'delivered'
GROUP BY p.product_id, p.name
ORDER BY revenue DESC
LIMIT 3;
`,
          hints: ['Join order_items to orders (for status) and products (for name).', 'GROUP BY product, ORDER BY revenue DESC, LIMIT 3.'],
        },
        {
          id: 'sql4-ex4', title: 'Fix the lost rows', type: 'debug', lang: 'sql', db: 'shop', difficulty: 'advanced',
          prompt: md`This query should list **every** customer with their number of **cancelled** orders (0 if none) — all 40 customers. It only returns customers who had a cancellation. Fix it while keeping the LEFT JOIN.`,
          starter: md`
SELECT c.customer_id, COUNT(o.order_id) AS cancelled
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id
WHERE o.status = 'cancelled'
GROUP BY c.customer_id
ORDER BY c.customer_id;
`,
          solution: md`
SELECT c.customer_id, COUNT(o.order_id) AS cancelled
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'cancelled'
GROUP BY c.customer_id
ORDER BY c.customer_id;
`,
          hints: ['A WHERE condition on the right table removes the NULL rows.', 'Move `o.status = \'cancelled\'` into the ON clause.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'Which join returns only rows with matches in both tables?', options: ['LEFT JOIN', 'INNER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN'], answer: 1, explanation: 'INNER = intersection.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'How do you find customers with no orders?', options: ['INNER JOIN ... WHERE o.order_id IS NULL', 'LEFT JOIN orders ... WHERE o.order_id IS NULL', 'CROSS JOIN', 'GROUP BY customer HAVING COUNT(*) = 1'], answer: 1, explanation: 'The anti-join pattern.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Joining orders (180 rows) to order_items (~360 rows) and then COUNT(*) gives…', options: ['The number of orders', 'The number of order items (rows multiplied)', 'The number of customers', '180 always'], answer: 1, explanation: 'Fan-out — use COUNT(DISTINCT o.order_id).' },
        { id: 'q4', kind: 'mcq', difficulty: 'intermediate', prompt: 'A self-join is used to…', options: ['Copy a table', 'Relate rows of a table to other rows of the same table (e.g. employee → manager)', 'Delete duplicates', 'Join a table to a view'], answer: 1, explanation: 'Same table, two aliases.' },
        { id: 'q5', kind: 'mcq', difficulty: 'advanced', prompt: 'Putting `WHERE right_table.col = x` after a LEFT JOIN…', options: ['Has no effect', 'Removes unmatched rows, effectively making it an INNER JOIN', 'Makes it a FULL JOIN', 'Is a syntax error'], answer: 1, explanation: 'NULLs fail the WHERE test.' },
      ],
      summary: [
        'JOIN tables on keys with explicit ON conditions and aliases.',
        'INNER keeps matches; LEFT keeps all left rows; anti-join finds missing matches.',
        'Chain joins along the key path; self-join for hierarchies.',
        'Beware fan-out (COUNT DISTINCT) and WHERE conditions after LEFT JOIN.',
      ],
      resources: [{ label: 'Visual explanation of SQL joins', url: 'https://joins.spathon.com/' }, MODE],
    },
    {
      id: 'sql-subqueries-ctes',
      title: 'Subqueries & Common Table Expressions (CTEs)',
      minutes: 40,
      difficulty: 'intermediate',
      objectives: [
        'Write scalar, IN/EXISTS and derived-table subqueries',
        'Write correlated subqueries',
        'Structure multi-step queries with WITH (CTEs)',
        'Choose between joins, subqueries and CTEs for readability',
      ],
      intro: md`
Some questions need several steps: *“customers whose total spend is above the average customer’s spend”* requires computing each customer’s total, then the average of those totals, then comparing. **Subqueries** and **CTEs** let you build such answers step by step.
`,
      simple: md`
A **subquery** is a query inside another query — like asking a sub-question first. *“Which products cost more than the average price?”* → first ask *“what is the average price?”*, then use that answer.

A **CTE** (\`WITH name AS (...)\`) gives a sub-question a name, like defining a variable. Then the main query uses it as if it were a table. CTEs make long queries read top-to-bottom like a recipe.
`,
      technical: md`
### Subquery types
- **Scalar** (returns one value): \`WHERE price > (SELECT AVG(price) FROM products)\`.
- **List** with IN: \`WHERE customer_id IN (SELECT customer_id FROM orders WHERE status = 'cancelled')\`.
- **EXISTS** (true if the subquery returns any row): efficient for “has at least one ...”.
- **Derived table** in FROM: \`FROM (SELECT ... GROUP BY ...) AS t\`.
- **Correlated**: refers to the outer row and runs per row: \`WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)\`.

### CTEs
\`\`\`sql
WITH customer_totals AS (
    SELECT o.customer_id, SUM(oi.quantity * oi.unit_price) AS total
    FROM orders o JOIN order_items oi ON oi.order_id = o.order_id
    GROUP BY o.customer_id
),
avg_total AS (
    SELECT AVG(total) AS avg_t FROM customer_totals
)
SELECT ct.customer_id, ROUND(ct.total, 2) AS total
FROM customer_totals ct, avg_total
WHERE ct.total > avg_total.avg_t
ORDER BY total DESC;
\`\`\`
- Several CTEs separated by commas; later ones can use earlier ones.
- Improves readability and debugging (run each CTE alone).
- **Recursive CTEs** (\`WITH RECURSIVE\`) handle hierarchies and generated sequences.

### Choosing
Join when you need columns from both tables; IN/EXISTS for membership tests; CTEs for multi-step logic. Readability first — the optimiser usually handles performance.
`,
      terms: [
        ['Subquery', 'A query nested inside another query.'],
        ['Scalar subquery', 'Returns a single value.'],
        ['Correlated subquery', 'References columns of the outer query; evaluated per row.'],
        ['EXISTS', 'Tests whether a subquery returns at least one row.'],
        ['Derived table', 'A subquery in the FROM clause.'],
        ['CTE', 'Common Table Expression: a named temporary result defined with WITH.'],
      ],
      realWorld: md`
An HR analyst needs **employees paid above their own department’s average** to review pay equity. That’s a correlated subquery or a CTE with department averages joined back to employees. Analysts write such multi-step queries daily, and CTEs keep them reviewable by colleagues.
`,
      steps: [
        'Break the question into sub-questions.',
        'Write and test each sub-question as its own query.',
        'Name each step as a CTE (or nest it as a subquery).',
        'Write the final SELECT using the named steps.',
        'Check results against a hand calculation for one example.',
      ],
      code: [
        {
          title: 'Scalar, IN and correlated subqueries',
          lang: 'sql', db: 'company',
          code: md`
-- Employees earning above the company average
SELECT name, salary
FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees)
ORDER BY salary DESC;

-- Employees earning above THEIR department's average (correlated)
SELECT e.name, e.dept_id, e.salary
FROM employees e
WHERE e.salary > (SELECT AVG(e2.salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)
ORDER BY e.dept_id, e.salary DESC;

-- Employees who received a top rating (5) at least once
SELECT name FROM employees
WHERE emp_id IN (SELECT emp_id FROM reviews WHERE rating = 5)
ORDER BY name;
`,
          explanation: [
            '…',
            '…',
            '…',
            'The scalar subquery computes one number: the overall average.',
            '…',
            '…',
            '…',
            '…',
            'Correlated: for each outer row `e`, average the salaries of the same department.',
            '…',
            '…',
            '…',
            'IN with a subquery returning a list of emp_ids.',
            '…',
          ],
        },
        {
          title: 'A multi-step analysis with CTEs',
          lang: 'sql', db: 'shop',
          code: md`
WITH delivered_lines AS (
    SELECT o.customer_id, oi.quantity * oi.unit_price AS amount
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.status = 'delivered'
),
customer_totals AS (
    SELECT customer_id, SUM(amount) AS total, COUNT(*) AS lines
    FROM delivered_lines
    GROUP BY customer_id
),
stats AS (
    SELECT AVG(total) AS avg_total FROM customer_totals
)
SELECT c.name, c.segment, ROUND(ct.total, 2) AS total,
       ROUND(ct.total / s.avg_total, 2) AS vs_average
FROM customer_totals ct
JOIN customers c ON c.customer_id = ct.customer_id
CROSS JOIN stats s
WHERE ct.total > s.avg_total
ORDER BY total DESC;
`,
          explanation: [
            'Step 1: one row per delivered order line with its amount.',
            '…',
            '…',
            '…',
            '…',
            '…',
            'Step 2: total per customer (uses step 1 like a table).',
            '…',
            '…',
            '…',
            '…',
            'Step 3: the average customer total.',
            '…',
            '…',
            'Final query: customer details, total and ratio to the average…',
            '…',
            '…',
            '…',
            'CROSS JOIN attaches the single stats row to every customer row.',
            'Keep above-average customers.',
            '…',
          ],
        },
      ],
      mistakes: [
        { mistake: 'A scalar subquery that returns several rows → error.', fix: 'Make sure it aggregates to one value (or use IN).' },
        { mistake: 'Deeply nested subqueries that nobody can read.', fix: 'Refactor into named CTEs.' },
        { mistake: '`NOT IN (subquery)` when the subquery can return NULL → returns no rows.', fix: 'Use NOT EXISTS or filter NULLs out of the subquery.' },
      ],
      exercises: [
        {
          id: 'sql5-ex1', title: 'Above-average price', type: 'write', lang: 'sql', db: 'shop', difficulty: 'beginner',
          prompt: md`Return \`name\` and \`price\` of products priced **above the average product price**, highest first.`,
          starter: md`SELECT name, price FROM products ORDER BY price DESC;`,
          solution: md`SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) ORDER BY price DESC;`,
          hints: ['Scalar subquery: `(SELECT AVG(price) FROM products)`.'],
        },
        {
          id: 'sql5-ex2', title: 'Department averages with a CTE', type: 'write', lang: 'sql', db: 'company', difficulty: 'intermediate',
          prompt: md`Using a CTE \`dept_avg\` (dept_id, avg_salary), return each department’s \`name\` and \`avg_salary\` (rounded to 0) for departments whose average salary exceeds **70000**, sorted by avg_salary descending.`,
          starter: md`SELECT * FROM departments;`,
          solution: md`
WITH dept_avg AS (
    SELECT dept_id, AVG(salary) AS avg_salary FROM employees GROUP BY dept_id
)
SELECT d.name, ROUND(a.avg_salary) AS avg_salary
FROM dept_avg a JOIN departments d ON d.dept_id = a.dept_id
WHERE a.avg_salary > 70000
ORDER BY avg_salary DESC;
`,
          hints: ['`WITH dept_avg AS (SELECT dept_id, AVG(salary) ... GROUP BY dept_id)`', 'Join it to departments and filter.'],
        },
        {
          id: 'sql5-ex3', title: 'Customers who bought furniture', type: 'write', lang: 'sql', db: 'shop', difficulty: 'intermediate',
          prompt: md`Return the \`name\` of every customer who has **at least one order containing a Furniture product**, alphabetically, without duplicates. Use \`EXISTS\` or \`IN\`.`,
          starter: md`SELECT name FROM customers ORDER BY name;`,
          solution: md`
SELECT c.name FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON oi.order_id = o.order_id
    JOIN products p ON p.product_id = oi.product_id
    WHERE o.customer_id = c.customer_id AND p.category = 'Furniture'
)
ORDER BY c.name;
`,
          hints: ['EXISTS with a correlated subquery joining orders, order_items and products.', 'Correlate on `o.customer_id = c.customer_id`.'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'beginner', prompt: 'What does a CTE start with?', options: ['SELECT', 'WITH', 'CREATE', 'FROM'], answer: 1, explanation: '`WITH name AS (...)`.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'A correlated subquery…', options: ['Runs once', 'References the outer query and is evaluated per outer row', 'Must use JOIN', 'Cannot use aggregates'], answer: 1, explanation: 'It depends on each outer row.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Main benefit of CTEs?', options: ['Always faster', 'Readable, step-by-step query structure', 'They create permanent tables', 'They replace indexes'], answer: 1, explanation: 'Named steps make complex logic clear.' },
        { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'Why can `WHERE x NOT IN (SELECT y ...)` unexpectedly return no rows?', options: ['NOT IN is invalid', 'If the subquery returns a NULL, the comparison becomes unknown', 'Because of LIMIT', 'Because of indexes'], answer: 1, explanation: 'Use NOT EXISTS or exclude NULLs.' },
      ],
      summary: [
        'Subqueries: scalar, IN/EXISTS, derived tables, correlated.',
        'CTEs (WITH) name intermediate steps; chain several.',
        'Test each step on its own; prefer readability.',
        'Beware NOT IN with NULLs.',
      ],
      resources: [MODE, SQLITE],
    },
    {
      id: 'sql-window-functions',
      title: 'Window Functions & Database Analysis',
      minutes: 50,
      difficulty: 'advanced',
      objectives: [
        'Explain how window functions differ from GROUP BY',
        'Rank rows with ROW_NUMBER, RANK and DENSE_RANK within partitions',
        'Compute running totals, moving averages, LAG/LEAD and shares of total',
        'Run SQL from Python and load results into pandas',
      ],
      intro: md`
Window functions are the “superpower” of analytical SQL and a favourite interview topic: top-N per group, running totals, month-over-month growth, percent of total — all without collapsing rows. You’ll finish by running SQL from Python, the way analysts combine both tools.
`,
      simple: md`
\`GROUP BY\` squashes rows into one row per group. A **window function** computes something over a group of rows but **keeps every row** — like adding a column “rank within my department” to each employee without losing any employees.

\`OVER (PARTITION BY dept_id ORDER BY salary DESC)\` means: *look at my department’s rows, ordered by salary, and compute my value from that window.*
`,
      technical: md`
\`function(...) OVER (PARTITION BY ... ORDER BY ... [frame])\`

### Ranking
| Function | Ties |
|---|---|
| \`ROW_NUMBER()\` | 1, 2, 3, 4 (unique, arbitrary among ties) |
| \`RANK()\` | 1, 2, 2, 4 (gaps) |
| \`DENSE_RANK()\` | 1, 2, 2, 3 (no gaps) |
| \`NTILE(4)\` | quartile buckets |

**Top-N per group:** compute \`ROW_NUMBER() OVER (PARTITION BY g ORDER BY metric DESC) AS rn\` in a CTE, then \`WHERE rn <= 3\` (window functions can’t be used directly in WHERE).

### Aggregates as windows
- \`SUM(x) OVER (PARTITION BY g)\` — group total on every row → share: \`x * 1.0 / SUM(x) OVER (PARTITION BY g)\`.
- **Running total:** \`SUM(x) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\`.
- **Moving average:** \`AVG(x) OVER (ORDER BY date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)\`.

### Offset functions
\`LAG(x, 1) OVER (ORDER BY month)\` (previous row), \`LEAD\` (next row), \`FIRST_VALUE\`, \`LAST_VALUE\` → growth: \`(x - LAG(x)) * 1.0 / LAG(x)\`.

### SQL from Python
\`\`\`python
import sqlite3, pandas as pd
con = sqlite3.connect("shop.db")              # or SQLAlchemy for Postgres/MySQL
df = pd.read_sql("SELECT ...", con)
df.to_sql("table_name", con, index=False)     # write a DataFrame to a table
\`\`\`
Use **parameters** (\`pd.read_sql(q, con, params=[...])\` with \`?\` placeholders) instead of string formatting to prevent SQL injection.
`,
      terms: [
        ['Window function', 'Computes a value across related rows without collapsing them.'],
        ['OVER()', 'Defines the window for a window function.'],
        ['PARTITION BY', 'Splits rows into groups for the window.'],
        ['ROW_NUMBER / RANK / DENSE_RANK', 'Ranking functions with different tie handling.'],
        ['LAG / LEAD', 'Access values from previous / next rows.'],
        ['Running total', 'Cumulative sum up to the current row.'],
        ['SQL injection', 'Attack where untrusted input changes a query; prevented by parameters.'],
      ],
      realWorld: md`
A product team tracks **month-over-month revenue growth** and the **top 3 products in each category**. Both are window-function queries that run nightly and feed a BI dashboard. In interviews, “find the second-highest salary per department” or “compute a 7-day rolling average” are classic window-function questions.
`,
      steps: [
        'Decide what each row should keep (no collapsing) and what to compute.',
        'Choose PARTITION BY (the group) and ORDER BY (the sequence).',
        'Pick the function: ranking, aggregate or offset; add a frame for running/moving calculations.',
        'Wrap in a CTE to filter on the window result (top-N).',
        'Pull results into pandas for charts and further analysis.',
      ],
      code: [
        {
          title: 'Ranking within partitions and top-N per group',
          lang: 'sql', db: 'company',
          code: md`
WITH ranked AS (
    SELECT d.name AS department, e.name, e.salary,
           ROW_NUMBER() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rn,
           RANK()       OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rnk,
           ROUND(e.salary * 100.0 / SUM(e.salary) OVER (PARTITION BY e.dept_id), 1) AS pct_of_dept_payroll
    FROM employees e
    JOIN departments d ON d.dept_id = e.dept_id
)
SELECT * FROM ranked
WHERE rn <= 2
ORDER BY department, rn;
`,
          explanation: [
            'A CTE so we can filter on the window result.',
            'Every employee keeps their row…',
            '…and gets a row number within their department, highest salary first,',
            '…a rank (ties share a rank),',
            '…and their share of the department’s payroll (a window SUM).',
            '…',
            '…',
            '…',
            'Top 2 earners per department.',
            '…',
          ],
        },
        {
          title: 'Running totals, moving averages and month-over-month growth',
          lang: 'sql', db: 'shop',
          code: md`
WITH monthly AS (
    SELECT strftime('%Y-%m', o.order_date) AS month,
           SUM(oi.quantity * oi.unit_price) AS revenue
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.order_id
    WHERE o.status = 'delivered'
    GROUP BY month
)
SELECT month,
       ROUND(revenue, 0) AS revenue,
       ROUND(SUM(revenue) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 0) AS running_total,
       ROUND(AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 0) AS moving_avg_3m,
       ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month), 1) AS mom_growth_pct
FROM monthly
ORDER BY month;
`,
          explanation: [
            'Step 1: monthly revenue (GROUP BY) in a CTE.',
            '…',
            '…',
            '…',
            '…',
            '…',
            '…',
            '…',
            'Step 2: window functions over the monthly rows.',
            '…',
            'Cumulative revenue from the first month to the current one.',
            'Average of the current and two previous months.',
            '`LAG` fetches the previous month’s revenue to compute growth (NULL for the first month).',
            '…',
            '…',
          ],
        },
        {
          title: 'SQL from Python with sqlite3 and pandas',
          code: md`
import sqlite3
import pandas as pd

sales = pd.read_csv("data/sales.csv")
con = sqlite3.connect(":memory:")
sales.to_sql("sales", con, index=False)

query = """
SELECT region, category, ROUND(SUM(revenue), 2) AS revenue,
       RANK() OVER (PARTITION BY region ORDER BY SUM(revenue) DESC) AS rank_in_region
FROM sales
WHERE discount >= ?
GROUP BY region, category
ORDER BY region, rank_in_region
"""
result = pd.read_sql(query, con, params=[0.0])
print(result)
con.close()
`,
          explanation: [
            'Python’s built-in SQLite driver.',
            '…',
            '…',
            'Load the CSV with pandas.',
            'An in-memory database (use a file path for a persistent one).',
            'Write the DataFrame to a SQL table.',
            '…',
            'A SQL query as a Python string…',
            '…aggregates and a window function over the aggregated rows (rank categories within each region).',
            '…',
            '…',
            '`?` is a parameter placeholder — never paste user input into SQL strings.',
            '…',
            '…',
            '…',
            '`pd.read_sql` runs the query and returns a DataFrame, with the parameter value passed safely.',
            '…',
            'Close the connection.',
          ],
        },
      ],
      mistakes: [
        { mistake: 'Using a window function in WHERE: `WHERE ROW_NUMBER() OVER (...) <= 3`.', fix: 'Compute it in a CTE/subquery, then filter outside.' },
        { mistake: 'Confusing ROW_NUMBER and RANK with ties.', fix: 'RANK/DENSE_RANK give ties the same rank; ROW_NUMBER never does.' },
        { mistake: 'Forgetting ORDER BY inside OVER for running totals/LAG.', fix: 'Order defines the sequence; without it results are arbitrary.' },
        { mistake: 'Building SQL with f-strings from user input.', fix: 'Use query parameters.' },
      ],
      exercises: [
        {
          id: 'sql6-ex1', title: 'Rank products by price within category', type: 'write', lang: 'sql', db: 'shop', difficulty: 'intermediate',
          prompt: md`For every product return \`category\`, \`name\`, \`price\` and \`price_rank\`: its \`DENSE_RANK\` by price (highest = 1) **within its category**. Order by category, then price_rank, then name.`,
          starter: md`SELECT category, name, price FROM products ORDER BY category;`,
          solution: md`SELECT category, name, price, DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS price_rank FROM products ORDER BY category, price_rank, name;`,
          hints: ['`DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC)`'],
        },
        {
          id: 'sql6-ex2', title: 'Highest earner per department', type: 'write', lang: 'sql', db: 'company', difficulty: 'advanced',
          prompt: md`Return the **single highest-paid employee in each department**: columns \`dept_id\`, \`name\`, \`salary\`, ordered by dept_id. Use \`ROW_NUMBER\` in a CTE.`,
          starter: md`SELECT dept_id, name, MAX(salary) FROM employees;`,
          solution: md`
WITH r AS (
    SELECT dept_id, name, salary,
           ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn
    FROM employees
)
SELECT dept_id, name, salary FROM r WHERE rn = 1 ORDER BY dept_id;
`,
          hints: ['Number rows within each department by salary descending.', 'Keep rn = 1 in the outer query.'],
        },
        {
          id: 'sql6-ex3', title: 'Running count of orders', type: 'write', lang: 'sql', db: 'shop', difficulty: 'advanced',
          prompt: md`For each month (\`month\` = 'YYYY-MM') return \`orders\` (count of all orders that month) and \`cumulative_orders\` (running total), ordered by month.`,
          starter: md`SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders FROM orders GROUP BY month ORDER BY month;`,
          solution: md`
WITH m AS (
    SELECT strftime('%Y-%m', order_date) AS month, COUNT(*) AS orders
    FROM orders GROUP BY month
)
SELECT month, orders,
       SUM(orders) OVER (ORDER BY month ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_orders
FROM m
ORDER BY month;
`,
          hints: ['Aggregate per month in a CTE first.', '`SUM(orders) OVER (ORDER BY month ...)`'],
        },
      ],
      quiz: [
        { id: 'q1', kind: 'mcq', difficulty: 'intermediate', prompt: 'How do window functions differ from GROUP BY?', options: ['They are slower', 'They compute across related rows while keeping every row', 'They only rank', 'They require HAVING'], answer: 1, explanation: 'No collapsing of rows.' },
        { id: 'q2', kind: 'mcq', difficulty: 'intermediate', prompt: 'Salaries 100, 90, 90, 80 with RANK() descending give…', options: ['1, 2, 3, 4', '1, 2, 2, 4', '1, 2, 2, 3', '1, 1, 2, 3'], answer: 1, explanation: 'RANK leaves a gap after ties; DENSE_RANK would give 1, 2, 2, 3.' },
        { id: 'q3', kind: 'mcq', difficulty: 'intermediate', prompt: 'Which function returns the previous row’s value?', options: ['LEAD', 'LAG', 'FIRST_VALUE', 'NTILE'], answer: 1, explanation: 'LAG looks back.' },
        { id: 'q4', kind: 'mcq', difficulty: 'advanced', prompt: 'To get the top 3 products per category you…', options: ['Use LIMIT 3', 'Use ROW_NUMBER() OVER (PARTITION BY category ORDER BY revenue DESC) in a CTE and filter rn <= 3', 'GROUP BY category LIMIT 3', 'HAVING rank <= 3'], answer: 1, explanation: 'Filter window results in an outer query.' },
        { id: 'q5', kind: 'mcq', difficulty: 'intermediate', prompt: 'Why use `params=` with pd.read_sql?', options: ['Faster parsing', 'Prevents SQL injection and handles quoting safely', 'Required for SQLite', 'To return JSON'], answer: 1, explanation: 'Parameters are passed separately from the SQL text.' },
      ],
      summary: [
        'Window functions: f() OVER (PARTITION BY ... ORDER BY ... frame).',
        'Ranking: ROW_NUMBER, RANK, DENSE_RANK, NTILE; top-N via CTE + filter.',
        'Running totals, moving averages, shares, LAG/LEAD growth.',
        'Use pandas + sqlite3/SQLAlchemy with parameters to combine SQL and Python.',
      ],
      resources: [{ label: 'SQLite window functions', url: 'https://www.sqlite.org/windowfunctions.html' }, MODE],
    },
    sqlDmlLesson,
  ],
};
