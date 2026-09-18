"""
Generates a Monthly Budget spreadsheet template — universal, currency-neutral,
designed for personal-finance use worldwide. Two sheets:
  1. "Monthly Budget"  — income, fixed expenses, variable expenses, savings,
                          debt payments; budgeted vs actual columns; running
                          summary with money-left, savings rate, and category
                          totals; sample rows to teach the layout.
  2. "Yearly Summary"  — 12-month roll-up showing income, expenses, net
                          savings, and savings rate for each month plus totals.

Run:  .venv-tools/bin/python scripts/generate_monthly_budget.py
Output: public/files/monthly-budget-template.xlsx
"""

from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Neutral, non-India color palette — same brand teal used across TemplateHub
BRAND = "0F766E"
BRAND_LIGHT = "D7EEEB"
GREEN = "047857"
GREEN_LIGHT = "D1FADF"
RED = "B91C1C"
RED_LIGHT = "FEE2E2"
GREY = "F1F5F9"
WHITE = "FFFFFF"
DARK = "16181D"

thin = Side(style="thin", color="C9D2DC")
box = Border(left=thin, right=thin, top=thin, bottom=thin)

money_fmt = "#,##0.00"
pct_fmt = "0.0%"

wb = Workbook()

# ============================================================================
# Sheet 1: Monthly Budget
# ============================================================================
ws = wb.active
ws.title = "Monthly Budget"
ws.sheet_view.showGridLines = False

# Columns: A blank, B Category, C Subcategory, D Budgeted, E Actual, F Diff
widths = [2, 22, 30, 14, 14, 14]
for i, w in enumerate(widths, start=1):
    ws.column_dimensions[get_column_letter(i)].width = w


def style_cell(sheet, ref, *, value=None, bold=False, size=11, color=DARK,
               fill=None, align="left", border=False, wrap=False,
               number_format=None, italic=False):
    c = sheet[ref]
    if value is not None:
        c.value = value
    c.font = Font(name="Calibri", bold=bold, size=size, color=color, italic=italic)
    c.alignment = Alignment(horizontal=align, vertical="center", wrap_text=wrap)
    if fill:
        c.fill = PatternFill("solid", fgColor=fill)
    if border:
        c.border = box
    if number_format:
        c.number_format = number_format
    return c


# Title
ws.merge_cells("B1:F1")
style_cell(ws, "B1", value="MONTHLY BUDGET", bold=True, size=22, color=WHITE,
           fill=BRAND, align="center")
ws.row_dimensions[1].height = 34

ws.merge_cells("B2:F2")
style_cell(ws, "B2",
           value="For the month of [Month YYYY]  |  Enter your income and planned spending — actuals fill in as you track.",
           italic=True, size=10, color=DARK, align="center")

# ---- SUMMARY CARD (top) ----
ws.merge_cells("B4:F4")
style_cell(ws, "B4", value="MONTHLY SUMMARY", bold=True, color=WHITE,
           fill=BRAND, align="center", border=True)

# We'll fill these formula cells later — first define row anchors for sections.
SUMMARY_ROW = 5

# ---- INCOME SECTION ----
INCOME_HEADER = 8
ws.merge_cells(f"B{INCOME_HEADER}:F{INCOME_HEADER}")
style_cell(ws, f"B{INCOME_HEADER}", value="INCOME", bold=True, color=WHITE,
           fill=GREEN, align="center", border=True)

# Column headers
INCOME_COLS = INCOME_HEADER + 1
for col, label in zip(["B", "C", "D", "E", "F"],
                       ["Source", "Note", "Budgeted", "Actual", "Diff"]):
    style_cell(ws, f"{col}{INCOME_COLS}", value=label, bold=True,
               fill=BRAND_LIGHT, border=True, align="center")

income_rows = [
    ("Primary Salary", "Monthly take-home after tax", 5000),
    ("Secondary Income", "Freelance / side gig", 800),
    ("Investment / Interest", "Dividends, interest", 120),
    ("Other Income", "Gifts, refunds, etc.", 0),
    ("", "", 0),
]
INCOME_FIRST = INCOME_COLS + 1
for i, (src, note, budget) in enumerate(income_rows):
    r = INCOME_FIRST + i
    style_cell(ws, f"B{r}", value=src or None, border=True)
    style_cell(ws, f"C{r}", value=note or None, border=True, italic=True, color="64748B")
    style_cell(ws, f"D{r}", value=budget or None, border=True, align="right",
               number_format=money_fmt)
    style_cell(ws, f"E{r}", border=True, align="right", number_format=money_fmt)
    style_cell(ws, f"F{r}",
               value=f'=IF(E{r}="","",E{r}-D{r})',
               border=True, align="right", number_format=money_fmt)
INCOME_LAST = INCOME_FIRST + len(income_rows) - 1

# Income total row
INCOME_TOTAL = INCOME_LAST + 1
style_cell(ws, f"B{INCOME_TOTAL}", value="TOTAL INCOME", bold=True,
           fill=GREEN_LIGHT, border=True)
style_cell(ws, f"C{INCOME_TOTAL}", fill=GREEN_LIGHT, border=True)
style_cell(ws, f"D{INCOME_TOTAL}", value=f"=SUM(D{INCOME_FIRST}:D{INCOME_LAST})",
           bold=True, fill=GREEN_LIGHT, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, f"E{INCOME_TOTAL}", value=f"=SUM(E{INCOME_FIRST}:E{INCOME_LAST})",
           bold=True, fill=GREEN_LIGHT, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, f"F{INCOME_TOTAL}",
           value=f"=E{INCOME_TOTAL}-D{INCOME_TOTAL}",
           bold=True, fill=GREEN_LIGHT, border=True, align="right",
           number_format=money_fmt)


# ---- FIXED EXPENSES ----
def expense_block(header_row, title, rows, fill_color=BRAND, light_color=BRAND_LIGHT):
    ws.merge_cells(f"B{header_row}:F{header_row}")
    style_cell(ws, f"B{header_row}", value=title, bold=True, color=WHITE,
               fill=fill_color, align="center", border=True)
    cols_row = header_row + 1
    for col, label in zip(["B", "C", "D", "E", "F"],
                           ["Category", "Note", "Budgeted", "Actual", "Diff"]):
        style_cell(ws, f"{col}{cols_row}", value=label, bold=True,
                   fill=light_color, border=True, align="center")
    first = cols_row + 1
    for i, (cat, note, budget) in enumerate(rows):
        r = first + i
        style_cell(ws, f"B{r}", value=cat or None, border=True)
        style_cell(ws, f"C{r}", value=note or None, border=True,
                   italic=True, color="64748B")
        style_cell(ws, f"D{r}", value=budget or None, border=True,
                   align="right", number_format=money_fmt)
        style_cell(ws, f"E{r}", border=True, align="right",
                   number_format=money_fmt)
        style_cell(ws, f"F{r}",
                   value=f'=IF(E{r}="","",D{r}-E{r})',
                   border=True, align="right", number_format=money_fmt)
    last = first + len(rows) - 1
    total_row = last + 1
    style_cell(ws, f"B{total_row}", value=f"TOTAL {title.split()[0]}",
               bold=True, fill=light_color, border=True)
    style_cell(ws, f"C{total_row}", fill=light_color, border=True)
    style_cell(ws, f"D{total_row}", value=f"=SUM(D{first}:D{last})",
               bold=True, fill=light_color, border=True,
               align="right", number_format=money_fmt)
    style_cell(ws, f"E{total_row}", value=f"=SUM(E{first}:E{last})",
               bold=True, fill=light_color, border=True,
               align="right", number_format=money_fmt)
    style_cell(ws, f"F{total_row}",
               value=f"=D{total_row}-E{total_row}",
               bold=True, fill=light_color, border=True,
               align="right", number_format=money_fmt)
    return total_row


fixed_rows = [
    ("Rent / Mortgage", "Housing payment", 1400),
    ("Utilities", "Electricity, water, gas", 180),
    ("Internet & Phone", "Home internet + mobile", 90),
    ("Insurance", "Health, auto, home", 220),
    ("Loan Payments", "Car, student, personal loan", 350),
    ("Subscriptions", "Streaming, cloud, software", 55),
    ("Childcare / School", "Daycare, tuition, fees", 0),
    ("", "", 0),
]
FIXED_TOTAL = expense_block(INCOME_TOTAL + 2, "FIXED EXPENSES", fixed_rows)

variable_rows = [
    ("Groceries", "Weekly food shopping", 500),
    ("Dining Out", "Restaurants, coffee, takeout", 180),
    ("Transportation", "Fuel, transit, rideshare", 200),
    ("Entertainment", "Movies, events, hobbies", 120),
    ("Personal Care", "Haircut, gym, skincare", 80),
    ("Shopping", "Clothing, household items", 200),
    ("Medical", "Copays, prescriptions", 50),
    ("Gifts & Donations", "Birthdays, charity", 60),
    ("Miscellaneous", "Anything else", 100),
    ("", "", 0),
]
VARIABLE_TOTAL = expense_block(FIXED_TOTAL + 2, "VARIABLE EXPENSES", variable_rows,
                                fill_color="B45309", light_color="FEF3C7")

savings_rows = [
    ("Emergency Fund", "3-6 months of expenses", 300),
    ("Retirement", "401k / IRA / pension", 400),
    ("Investments", "Brokerage, index funds", 150),
    ("Savings Goal 1", "Vacation, down payment, etc.", 100),
    ("Savings Goal 2", "Any other goal", 0),
    ("", "", 0),
]
SAVINGS_TOTAL = expense_block(VARIABLE_TOTAL + 2, "SAVINGS & INVESTMENTS", savings_rows,
                               fill_color="0369A1", light_color="DBEAFE")

debt_rows = [
    ("Credit Card 1", "Balance / min payment", 150),
    ("Credit Card 2", "Balance / min payment", 0),
    ("Extra Debt Payoff", "Snowball / avalanche", 200),
    ("", "", 0),
]
DEBT_TOTAL = expense_block(SAVINGS_TOTAL + 2, "DEBT PAYMENTS", debt_rows,
                            fill_color=RED, light_color=RED_LIGHT)

# ---- SUMMARY CARD formulas (fill in row 5 now that anchors exist) ----
style_cell(ws, "B5", value="Total Income", bold=True, fill=GREY, border=True)
style_cell(ws, "C5", value=f"=D{INCOME_TOTAL}", bold=True, fill=GREY,
           border=True, align="right", number_format=money_fmt)
style_cell(ws, "D5", value="Total Planned Spending", bold=True, fill=GREY,
           border=True)
style_cell(ws, "E5",
           value=f"=D{FIXED_TOTAL}+D{VARIABLE_TOTAL}+D{SAVINGS_TOTAL}+D{DEBT_TOTAL}",
           bold=True, fill=GREY, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, "F5",
           value=f"=C5-E5", bold=True, fill=GREEN_LIGHT,
           border=True, align="right", number_format=money_fmt, size=12)

style_cell(ws, "B6", value="Total Actual Income", bold=True, fill=GREY,
           border=True)
style_cell(ws, "C6", value=f"=E{INCOME_TOTAL}", bold=True, fill=GREY,
           border=True, align="right", number_format=money_fmt)
style_cell(ws, "D6", value="Total Actual Spending", bold=True, fill=GREY,
           border=True)
style_cell(ws, "E6",
           value=f"=E{FIXED_TOTAL}+E{VARIABLE_TOTAL}+E{SAVINGS_TOTAL}+E{DEBT_TOTAL}",
           bold=True, fill=GREY, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, "F6",
           value=f'=IF(C6=0,"",C6-E6)', bold=True, fill=BRAND_LIGHT,
           border=True, align="right", number_format=money_fmt, size=12)

# Savings rate note
SR = DEBT_TOTAL + 3
ws.merge_cells(f"B{SR}:C{SR}")
style_cell(ws, f"B{SR}", value="Savings Rate (Savings ÷ Income)",
           bold=True, fill=GREY, border=True)
style_cell(ws, f"D{SR}",
           value=f'=IF(D{INCOME_TOTAL}=0,"",D{SAVINGS_TOTAL}/D{INCOME_TOTAL})',
           bold=True, fill=GREY, border=True, align="right", number_format=pct_fmt)
style_cell(ws, f"E{SR}", fill=GREY, border=True)
style_cell(ws, f"F{SR}",
           value=f'=IF(E{INCOME_TOTAL}=0,"",E{SAVINGS_TOTAL}/E{INCOME_TOTAL})',
           bold=True, fill=GREEN_LIGHT, border=True, align="right",
           number_format=pct_fmt)

ws.freeze_panes = "B4"

# ============================================================================
# Sheet 2: Yearly Summary
# ============================================================================
ws2 = wb.create_sheet("Yearly Summary")
ws2.sheet_view.showGridLines = False

widths2 = [2, 14, 14, 14, 14, 14, 14]
for i, w in enumerate(widths2, start=1):
    ws2.column_dimensions[get_column_letter(i)].width = w

ws2.merge_cells("B1:G1")
style_cell(ws2, "B1", value="YEARLY BUDGET SUMMARY", bold=True, size=22,
           color=WHITE, fill=BRAND, align="center")
ws2.row_dimensions[1].height = 34

ws2.merge_cells("B2:G2")
style_cell(ws2, "B2",
           value="Fill in each month's totals to see the year at a glance.",
           italic=True, size=10, align="center")

HEADER = 4
for col, label in zip(["B", "C", "D", "E", "F", "G"],
                       ["Month", "Income", "Fixed", "Variable", "Savings",
                        "Debt"]):
    style_cell(ws2, f"{col}{HEADER}", value=label, bold=True, color=WHITE,
               fill=BRAND, align="center", border=True)
ws2.row_dimensions[HEADER].height = 26

months = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]
FIRST = HEADER + 1
for i, m in enumerate(months):
    r = FIRST + i
    style_cell(ws2, f"B{r}", value=m, border=True)
    for col in ["C", "D", "E", "F", "G"]:
        style_cell(ws2, f"{col}{r}", border=True, align="right",
                   number_format=money_fmt)
    if i % 2 == 1:
        for col in ["B", "C", "D", "E", "F", "G"]:
            ws2[f"{col}{r}"].fill = PatternFill("solid", fgColor=GREY)
LAST = FIRST + 11

# Annual totals
tot = LAST + 1
style_cell(ws2, f"B{tot}", value="TOTAL", bold=True, color=WHITE, fill=BRAND,
           border=True)
for col in ["C", "D", "E", "F", "G"]:
    style_cell(ws2, f"{col}{tot}", value=f"=SUM({col}{FIRST}:{col}{LAST})",
               bold=True, color=WHITE, fill=BRAND, border=True, align="right",
               number_format=money_fmt)

# Savings rate row
sr = tot + 2
ws2.merge_cells(f"B{sr}:C{sr}")
style_cell(ws2, f"B{sr}", value="Annual Savings Rate", bold=True,
           fill=GREY, border=True)
style_cell(ws2, f"D{sr}",
           value=f'=IF(C{tot}=0,"",F{tot}/C{tot})',
           bold=True, fill=GREEN_LIGHT, border=True, align="right",
           number_format=pct_fmt, size=12)

# Net cash flow
nc = sr + 1
ws2.merge_cells(f"B{nc}:C{nc}")
style_cell(ws2, f"B{nc}", value="Net Cash Flow (Income − Spending)",
           bold=True, fill=GREY, border=True)
style_cell(ws2, f"D{nc}",
           value=f"=C{tot}-(D{tot}+E{tot}+F{tot}+G{tot})",
           bold=True, fill=BRAND_LIGHT, border=True, align="right",
           number_format=money_fmt, size=12)

# Tip
tip = nc + 2
ws2.merge_cells(f"B{tip}:G{tip}")
style_cell(ws2, f"B{tip}",
           value="Tip: A common target is a savings rate of 20% or more. If yours is below 10%, review the Variable Expenses section for the biggest opportunities to trim.",
           italic=True, size=10, wrap=True, fill=BRAND_LIGHT, border=True)
ws2.row_dimensions[tip].height = 32

ws2.freeze_panes = f"B{FIRST}"

out = Path("public/files/monthly-budget-template.xlsx")
out.parent.mkdir(parents=True, exist_ok=True)
wb.save(out)
print(f"Saved: {out.resolve()}")
