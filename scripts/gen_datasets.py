"""Generate the practice datasets used by lessons and projects.

All datasets are SYNTHETIC (generated with a fixed random seed) but built to have
realistic structure, relationships and data-quality problems. Re-running this
script reproduces exactly the same files.

Usage:  python scripts/gen_datasets.py
"""
from pathlib import Path

import numpy as np
import pandas as pd

OUT = Path(__file__).resolve().parent.parent / "public" / "datasets"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(42)

FIRST = ["Ana", "Ben", "Carla", "Dev", "Ema", "Felix", "Gia", "Hiro", "Ines", "Jon", "Kai", "Lena",
         "Marco", "Nia", "Omar", "Pia", "Quinn", "Rosa", "Sam", "Tara", "Uma", "Victor", "Wen", "Xena",
         "Yusuf", "Zoe", "Liam", "Maya", "Noah", "Ivy"]


def save(df: pd.DataFrame, name: str) -> None:
    df.to_csv(OUT / name, index=False)
    print(f"{name:24s} {len(df):5d} rows  {df.shape[1]} cols")


# 1. Students ---------------------------------------------------------------
n = 120
study = rng.gamma(4, 1.6, n).round(1)
attendance = np.clip(rng.normal(85, 9, n), 50, 100).round(0)
base = 45 + 3.2 * study + 0.25 * (attendance - 80)
students = pd.DataFrame({
    "student_id": range(1001, 1001 + n),
    "name": [f"{rng.choice(FIRST)} {chr(65 + i % 26)}." for i in range(n)],
    "gender": rng.choice(["F", "M"], n),
    "age": rng.integers(17, 23, n),
    "study_hours_week": study,
    "attendance_pct": attendance,
    "math": np.clip(base + rng.normal(0, 8, n), 20, 100).round(0).astype(int),
    "science": np.clip(base + rng.normal(2, 8, n), 20, 100).round(0).astype(int),
    "english": np.clip(base * 0.6 + 30 + rng.normal(0, 9, n), 20, 100).round(0).astype(int),
})
students["average"] = students[["math", "science", "english"]].mean(axis=1).round(1)
students["passed"] = (students["average"] >= 60).map({True: "yes", False: "no"})
save(students, "students.csv")

# 2. Personal expenses ------------------------------------------------------
cats = {
    "Rent": (1, 1, 650, 0), "Groceries": (9, 3, 38, 12), "Transport": (14, 4, 6, 3),
    "Eating Out": (6, 3, 18, 8), "Utilities": (2, 1, 55, 15), "Entertainment": (3, 2, 22, 10),
    "Health": (1, 1, 30, 20), "Shopping": (2, 2, 45, 30), "Subscriptions": (3, 0, 11, 2),
}
rows = []
for month in pd.period_range("2025-01", "2025-12", freq="M"):
    days = month.days_in_month
    for cat, (mean_count, sd, mean_amt, sd_amt) in cats.items():
        count = max(1, int(rng.normal(mean_count, sd)))
        for _ in range(count):
            day = 1 if cat == "Rent" else int(rng.integers(1, days + 1))
            amt = max(1.0, rng.normal(mean_amt, sd_amt))
            if month.month == 12 and cat in ("Shopping", "Entertainment"):
                amt *= 1.8
            rows.append({
                "date": f"{month}-{day:02d}", "category": cat, "amount": round(amt, 2),
                "payment_method": rng.choice(["card", "cash", "transfer"], p=[0.65, 0.2, 0.15]) if cat != "Rent" else "transfer",
            })
expenses = pd.DataFrame(rows).sort_values("date").reset_index(drop=True)
save(expenses, "expenses.csv")

# 3. Retail sales -----------------------------------------------------------
products = {
    "Electronics": [("Headphones", 59), ("Keyboard", 45), ("Monitor", 189), ("Webcam", 39), ("Laptop Stand", 29)],
    "Furniture": [("Desk Chair", 149), ("Bookshelf", 89), ("Desk Lamp", 25), ("Standing Desk", 329)],
    "Office Supplies": [("Notebook", 4.5), ("Pens (10)", 6), ("Stapler", 9), ("Paper (500)", 7.5), ("Planner", 14)],
}
regions = ["North", "South", "East", "West"]
region_w = [0.3, 0.2, 0.28, 0.22]
dates = pd.date_range("2024-01-01", "2025-12-31", freq="D")
season = 1 + 0.35 * np.isin(dates.month, [11, 12]) + 0.15 * np.isin(dates.month, [8, 9])
date_p = season / season.sum()
n = 1500
cat_choice = rng.choice(list(products), n, p=[0.35, 0.2, 0.45])
sales_rows = []
for i in range(n):
    cat = cat_choice[i]
    name, price = products[cat][rng.integers(len(products[cat]))]
    units = int(rng.integers(1, 4 if cat != "Office Supplies" else 12))
    discount = rng.choice([0, 0, 0, 0.1, 0.2])
    d = dates[rng.choice(len(dates), p=date_p)]
    sales_rows.append({
        "order_id": 50000 + i, "order_date": d.strftime("%Y-%m-%d"),
        "region": rng.choice(regions, p=region_w), "category": cat, "product": name,
        "units": units, "unit_price": price, "discount": discount,
        "revenue": round(units * price * (1 - discount), 2),
        "customer_id": int(rng.integers(1, 301)),
    })
sales = pd.DataFrame(sales_rows).sort_values("order_date").reset_index(drop=True)
save(sales, "sales.csv")

# 4. Mall customers (segmentation) -----------------------------------------
centers = [(25, 25, 80), (55, 85, 18), (85, 22, 15), (86, 82, 30), (25, 78, 25)]  # income, score, n-ish weight
seg_rows = []
cid = 1
for (inc, score, _), size in zip(centers, [40, 80, 35, 39, 22]):
    for _ in range(size):
        income = max(15, rng.normal(inc, 9))
        sp = np.clip(rng.normal(score, 8), 1, 99)
        age = int(np.clip(rng.normal(30 if sp > 60 else 45, 10), 18, 70))
        seg_rows.append({"customer_id": cid, "gender": rng.choice(["Female", "Male"]), "age": age,
                         "annual_income_k": round(income), "spending_score": round(sp)})
        cid += 1
mall = pd.DataFrame(seg_rows).sample(frac=1, random_state=1).reset_index(drop=True)
mall["customer_id"] = range(1, len(mall) + 1)
save(mall, "mall_customers.csv")

# 5. Telecom churn -----------------------------------------------------------
n = 1200
contract = rng.choice(["Month-to-month", "One year", "Two year"], n, p=[0.55, 0.25, 0.2])
tenure = np.where(contract == "Month-to-month", rng.integers(1, 40, n),
                  np.where(contract == "One year", rng.integers(6, 60, n), rng.integers(12, 72, n)))
internet = rng.choice(["DSL", "Fiber", "None"], n, p=[0.35, 0.45, 0.2])
monthly = np.round(np.where(internet == "Fiber", rng.normal(85, 12, n),
                            np.where(internet == "DSL", rng.normal(55, 10, n), rng.normal(22, 4, n))), 2)
tech = np.where(internet == "None", "No", rng.choice(["Yes", "No"], n, p=[0.4, 0.6]))
calls = rng.poisson(1.5, n)
logit = (-1.2 + 1.6 * (contract == "Month-to-month") - 0.9 * (contract == "Two year")
         - 0.035 * tenure + 0.018 * (monthly - 60) + 0.35 * calls - 0.6 * (tech == "Yes"))
churn_p = 1 / (1 + np.exp(-logit))
churn = pd.DataFrame({
    "customer_id": [f"C{10000 + i}" for i in range(n)], "tenure_months": tenure, "contract": contract,
    "internet_service": internet, "tech_support": tech, "monthly_charges": monthly,
    "total_charges": np.round(monthly * tenure * rng.uniform(0.95, 1.05, n), 2),
    "support_calls": calls, "paperless_billing": rng.choice(["Yes", "No"], n, p=[0.6, 0.4]),
    "churn": np.where(rng.random(n) < churn_p, "Yes", "No"),
})
save(churn, "churn.csv")

# 6. House prices -------------------------------------------------------------
n = 800
hoods = {"Downtown": 1.35, "Riverside": 1.15, "Suburbia": 1.0, "Hillcrest": 1.2, "Industrial": 0.8}
hood = rng.choice(list(hoods), n, p=[0.15, 0.2, 0.35, 0.15, 0.15])
area = np.round(np.clip(rng.normal(1650, 520, n), 500, 4200))
bedrooms = np.clip(np.round(area / 600 + rng.normal(0, 0.7, n)), 1, 6).astype(int)
bathrooms = np.clip(np.round(bedrooms * 0.6 + rng.normal(0.3, 0.5, n)), 1, 4).astype(int)
age = rng.integers(0, 80, n)
garage = rng.choice([0, 1, 2], n, p=[0.25, 0.45, 0.3])
dist = np.round(rng.gamma(2.5, 3.2, n), 1)
price = ((48_000 + 145 * area + 9_000 * bathrooms + 11_000 * garage - 620 * age - 2_400 * dist)
         * np.array([hoods[h] for h in hood]) * rng.lognormal(0, 0.09, n))
houses = pd.DataFrame({"house_id": range(1, n + 1), "neighborhood": hood, "area_sqft": area.astype(int),
                       "bedrooms": bedrooms, "bathrooms": bathrooms, "age_years": age, "garage_spaces": garage,
                       "distance_to_center_km": dist, "price": np.round(price, -2).astype(int)})
save(houses, "houses.csv")

# 7. Pandemic cases (synthetic, COVID-19-style) ------------------------------
pops = {"Avalon": 5_400_000, "Borealia": 21_000_000, "Coastria": 9_800_000, "Dunmore": 2_300_000, "Equa": 44_000_000}
days = pd.date_range("2021-01-01", "2021-12-31", freq="D")
t = np.arange(len(days))
cv_rows = []
for k, (country, pop) in enumerate(pops.items()):
    peaks = [(60 + 15 * k, 18), (210 + 10 * k, 25)]
    rate = sum(h * np.exp(-((t - c) ** 2) / (2 * w ** 2)) for (c, w), h in zip(peaks, [55, 80]))
    rate = rate + 4  # cases per 100k per day baseline
    weekly = 1 - 0.25 * (days.dayofweek >= 5)  # weekend under-reporting
    cases = rng.poisson(rate * pop / 100_000 * weekly)
    deaths = rng.binomial(cases, 0.012)
    for d, c, de in zip(days, cases, deaths):
        cv_rows.append({"date": d.strftime("%Y-%m-%d"), "country": country, "population": pop,
                        "new_cases": int(c), "new_deaths": int(de)})
covid = pd.DataFrame(cv_rows)
miss_idx = rng.choice(len(covid), 25, replace=False)
covid.loc[miss_idx, "new_cases"] = np.nan  # reporting gaps
save(covid, "pandemic_cases.csv")

# 8. Stock prices (geometric Brownian motion) --------------------------------
bdays = pd.bdate_range("2023-01-02", "2025-12-31")
mu, sigma = 0.09, 0.24
dt = 1 / 252
rets = rng.normal((mu - sigma ** 2 / 2) * dt, sigma * np.sqrt(dt), len(bdays))
close = 100 * np.exp(np.cumsum(rets))
stock = pd.DataFrame({"date": bdays.strftime("%Y-%m-%d"), "close": close.round(2),
                      "volume": (rng.lognormal(13.5, 0.35, len(bdays))).astype(int)})
save(stock, "stock_prices.csv")

# 9. Messy customers (for data cleaning) --------------------------------------
n = 60
messy = pd.DataFrame({
    "customer_id": range(1, n + 1),
    "name": [f"{rng.choice(FIRST)} {rng.choice(['Lopez', 'Smith', 'Tan', 'Garcia', 'Kim', 'Reyes'])}" for _ in range(n)],
    "age": rng.integers(18, 70, n).astype(object),
    "city": rng.choice(["Manila", "manila ", "Cebu", "CEBU", "Davao", "Davao City"], n),
    "signup_date": pd.date_range("2024-01-01", periods=n, freq="5D").strftime("%Y-%m-%d"),
    "monthly_spend": rng.normal(1200, 300, n).round(2).astype(object),
})
messy.loc[[3, 17, 41], "age"] = np.nan
messy.loc[[8], "age"] = "thirty"
messy.loc[[25], "age"] = 230
messy.loc[[5, 33], "monthly_spend"] = np.nan
messy.loc[[12], "monthly_spend"] = "1,450.00"
messy.loc[[48], "monthly_spend"] = 98000.0
messy.loc[[20, 52], "signup_date"] = ["2024/04/10", "15-11-2024"]
messy = pd.concat([messy, messy.iloc[[2, 10, 30]]], ignore_index=True)  # duplicates
save(messy, "messy_customers.csv")
