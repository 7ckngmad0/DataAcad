// Practice SQLite databases, generated deterministically (same data every time).

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

function buildShop(): string {
  const r = rng(7);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const first = ['Ana', 'Ben', 'Carla', 'Dev', 'Ema', 'Felix', 'Gia', 'Hiro', 'Ines', 'Jon', 'Kai', 'Lena', 'Marco', 'Nia', 'Omar', 'Pia', 'Rosa', 'Sam', 'Tara', 'Victor'];
  const last = ['Lopez', 'Smith', 'Tan', 'Garcia', 'Kim', 'Reyes', 'Cruz', 'Patel', 'Nguyen', 'Mendoza'];
  const cities: [string, string][] = [['Manila', 'Philippines'], ['Cebu', 'Philippines'], ['Singapore', 'Singapore'], ['Tokyo', 'Japan'], ['Osaka', 'Japan'], ['Sydney', 'Australia'], ['Toronto', 'Canada']];
  const products: [string, string, number][] = [
    ['Wireless Mouse', 'Electronics', 25], ['Mechanical Keyboard', 'Electronics', 89], ['27" Monitor', 'Electronics', 249], ['USB-C Hub', 'Electronics', 39], ['Noise-Cancelling Headphones', 'Electronics', 199],
    ['Desk Chair', 'Furniture', 159], ['Standing Desk', 'Furniture', 399], ['Bookshelf', 'Furniture', 99],
    ['Notebook Pack', 'Stationery', 12], ['Gel Pens', 'Stationery', 8], ['Planner 2026', 'Stationery', 18], ['Sticky Notes', 'Stationery', 5],
    ['Coffee Beans 1kg', 'Grocery', 22], ['Green Tea', 'Grocery', 9], ['Desk Plant', 'Home', 15],
  ];
  const lines: string[] = [
    `CREATE TABLE customers (customer_id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT, country TEXT, signup_date TEXT, segment TEXT);`,
    `CREATE TABLE products (product_id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT, price REAL);`,
    `CREATE TABLE orders (order_id INTEGER PRIMARY KEY, customer_id INTEGER REFERENCES customers(customer_id), order_date TEXT, status TEXT);`,
    `CREATE TABLE order_items (order_id INTEGER REFERENCES orders(order_id), product_id INTEGER REFERENCES products(product_id), quantity INTEGER, unit_price REAL);`,
  ];
  const nCust = 40;
  for (let i = 1; i <= nCust; i++) {
    const [city, country] = pick(cities);
    const m = 1 + Math.floor(r() * 12);
    const d = 1 + Math.floor(r() * 28);
    const seg = r() < 0.25 ? 'Business' : 'Consumer';
    lines.push(`INSERT INTO customers VALUES (${i}, ${q(`${pick(first)} ${pick(last)}`)}, ${q(city)}, ${q(country)}, '2024-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}', ${q(seg)});`);
  }
  products.forEach(([n, c, p], i) => lines.push(`INSERT INTO products VALUES (${i + 1}, ${q(n)}, ${q(c)}, ${p});`));
  let oid = 1;
  for (let k = 0; k < 180; k++) {
    // Customers 38-40 never order (useful for LEFT JOIN exercises).
    const cust = 1 + Math.floor(Math.pow(r(), 1.4) * 37);
    const m = 1 + Math.floor(r() * 12);
    const d = 1 + Math.floor(r() * 28);
    const status = r() < 0.86 ? 'delivered' : r() < 0.5 ? 'cancelled' : 'shipped';
    lines.push(`INSERT INTO orders VALUES (${oid}, ${cust}, '2025-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}', '${status}');`);
    const nItems = 1 + Math.floor(r() * 3);
    const used = new Set<number>();
    for (let j = 0; j < nItems; j++) {
      const pid = 1 + Math.floor(r() * products.length);
      if (used.has(pid)) continue;
      used.add(pid);
      const qty = products[pid - 1][1] === 'Stationery' ? 1 + Math.floor(r() * 6) : 1 + Math.floor(r() * 2);
      lines.push(`INSERT INTO order_items VALUES (${oid}, ${pid}, ${qty}, ${products[pid - 1][2]});`);
    }
    oid++;
  }
  return lines.join('\n');
}

function buildCompany(): string {
  const r = rng(11);
  const depts: [string, string][] = [['Engineering', 'Manila'], ['Data Science', 'Manila'], ['Marketing', 'Cebu'], ['Sales', 'Cebu'], ['Finance', 'Makati'], ['HR', 'Makati']];
  const names = ['Alicia Ramos', 'Bryan Uy', 'Celine Ong', 'Diego Santos', 'Erica Lim', 'Francis Go', 'Grace Dy', 'Henry Chua', 'Isabel Co', 'Jasper Tan', 'Karen Sy', 'Leo Bautista', 'Mika Reyes', 'Nathan Cruz', 'Olivia Yap', 'Paolo Lee', 'Queenie Ang', 'Ramon Torres', 'Sofia Lao', 'Tomas Rivera', 'Ursula Vega', 'Vince Navarro', 'Wendy Castro', 'Xavier Ortiz', 'Yna Flores', 'Zack Mercado', 'Andrea Lu', 'Brent Velasco', 'Carmen Diaz', 'Dante Aquino'];
  const base: Record<string, number> = { Engineering: 85000, 'Data Science': 90000, Marketing: 62000, Sales: 58000, Finance: 70000, HR: 55000 };
  const lines = [
    `CREATE TABLE departments (dept_id INTEGER PRIMARY KEY, name TEXT NOT NULL, location TEXT);`,
    `CREATE TABLE employees (emp_id INTEGER PRIMARY KEY, name TEXT NOT NULL, dept_id INTEGER REFERENCES departments(dept_id), manager_id INTEGER REFERENCES employees(emp_id), title TEXT, hire_date TEXT, salary INTEGER);`,
    `CREATE TABLE reviews (emp_id INTEGER REFERENCES employees(emp_id), year INTEGER, rating INTEGER);`,
  ];
  depts.forEach(([n, l], i) => lines.push(`INSERT INTO departments VALUES (${i + 1}, ${q(n)}, ${q(l)});`));
  lines.push(`INSERT INTO departments VALUES (7, 'Legal', 'Makati');`); // department with no employees
  const managers: Record<number, number> = {};
  names.forEach((n, i) => {
    const id = i + 1;
    const dept = i < 6 ? i + 1 : 1 + Math.floor(r() * 6);
    const isMgr = i < 6;
    if (isMgr) managers[dept] = id;
    const title = isMgr ? 'Manager' : r() < 0.35 ? 'Senior Associate' : 'Associate';
    const factor = isMgr ? 1.45 : title === 'Senior Associate' ? 1.15 : 0.9;
    const salary = Math.round((base[depts[dept - 1][0]] * factor * (0.92 + r() * 0.16)) / 100) * 100;
    const y = 2016 + Math.floor(r() * 9);
    const m = 1 + Math.floor(r() * 12);
    const mgr = isMgr ? 'NULL' : String(managers[dept]);
    lines.push(`INSERT INTO employees VALUES (${id}, ${q(n)}, ${dept}, ${mgr}, ${q(title)}, '${y}-${String(m).padStart(2, '0')}-01', ${salary});`);
    for (const year of [2023, 2024, 2025]) {
      if (y < year) lines.push(`INSERT INTO reviews VALUES (${id}, ${year}, ${1 + Math.floor(r() * 5)});`);
    }
  });
  return lines.join('\n');
}

export interface PracticeDb {
  id: string;
  title: string;
  description: string;
  sql: string;
}

export const DATABASES: PracticeDb[] = [
  {
    id: 'shop',
    title: 'Online Shop',
    description:
      'An e-commerce store: customers place orders; each order has one or more order_items that reference products.',
    sql: buildShop(),
  },
  {
    id: 'company',
    title: 'Company HR',
    description:
      'Employees belong to departments, have a manager (another employee) and yearly performance reviews.',
    sql: buildCompany(),
  },
];

export const getDb = (id: string) => DATABASES.find((d) => d.id === id) ?? DATABASES[0];
