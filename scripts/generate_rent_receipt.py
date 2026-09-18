"""
Generates a Rent Receipt template for India — designed for HRA (House Rent
Allowance) tax claims. Two sheets:
  1. "Rent Receipt"  — a printable single-month receipt with every field
                        the employer / income-tax officer expects.
  2. "12-Month HRA Log" — 12 rows (Apr → Mar of an Indian financial year)
                        with monthly rent, cumulative total, and signature
                        column. Ideal to attach to the annual HRA declaration.

Run:  .venv-tools/bin/python scripts/generate_rent_receipt.py
Output: public/files/rent-receipt-template.xlsx
"""

from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

BRAND = "0F766E"
BRAND_LIGHT = "D7EEEB"
GREY = "F1F5F9"
WHITE = "FFFFFF"
DARK = "16181D"
ACCENT = "B45309"

thin = Side(style="thin", color="C9D2DC")
medium = Side(style="medium", color=BRAND)
box = Border(left=thin, right=thin, top=thin, bottom=thin)

money_fmt = '#,##0.00'


def style_cell(ws, ref, *, value=None, bold=False, size=11, color=DARK,
               fill=None, align="left", border=False, wrap=False,
               number_format=None, italic=False):
    c = ws[ref]
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


wb = Workbook()

# ============================================================================
# Sheet 1: Printable Rent Receipt
# ============================================================================
ws = wb.active
ws.title = "Rent Receipt"
ws.sheet_view.showGridLines = False

widths = [6, 22, 22, 22, 22, 14]
for i, w in enumerate(widths, start=1):
    ws.column_dimensions[get_column_letter(i)].width = w

# Title
ws.merge_cells("A1:F1")
style_cell(ws, "A1", value="RENT RECEIPT", bold=True, size=22, color=WHITE,
           fill=BRAND, align="center")
ws.row_dimensions[1].height = 34

ws.merge_cells("A2:F2")
style_cell(ws, "A2",
           value="For claiming House Rent Allowance (HRA) under Section 10(13A) of the Income Tax Act",
           italic=True, size=10, color=ACCENT, align="center")
ws.row_dimensions[2].height = 22

# Receipt No / Date row
ws.merge_cells("A4:B4")
style_cell(ws, "A4", value="Receipt No.", bold=True, fill=GREY, border=True)
ws.merge_cells("C4:C4")
style_cell(ws, "C4", value="[RR-001]", border=True)
style_cell(ws, "D4", value="Date", bold=True, fill=GREY, border=True)
ws.merge_cells("E4:F4")
style_cell(ws, "E4", value="[DD-MM-YYYY]", border=True)

# Amount received line — the star of the receipt
ws.merge_cells("A6:F6")
style_cell(ws, "A6",
           value="Received a sum of ₹ [Amount] from Mr./Ms. [Tenant's Full Name]",
           size=12, wrap=True)

ws.merge_cells("A7:F7")
style_cell(ws, "A7",
           value="towards the monthly rent for the period from [DD-MM-YYYY] to [DD-MM-YYYY]",
           size=12)

ws.merge_cells("A8:F8")
style_cell(ws, "A8",
           value="for the property situated at [Full Address of the Rented Property].",
           size=12, wrap=True)

# Amount block
ws.merge_cells("A10:C10")
style_cell(ws, "A10", value="Rent Amount (₹)", bold=True, fill=BRAND_LIGHT, border=True)
ws.merge_cells("D10:F10")
style_cell(ws, "D10", value=25000, border=True, number_format=money_fmt,
           bold=True, align="right", size=13)

ws.merge_cells("A11:C11")
style_cell(ws, "A11", value="Amount in words", bold=True, fill=BRAND_LIGHT, border=True)
ws.merge_cells("D11:F11")
style_cell(ws, "D11",
           value="[Rupees ____________________________ Only]",
           border=True, italic=True)

ws.merge_cells("A12:C12")
style_cell(ws, "A12", value="Mode of Payment", bold=True, fill=BRAND_LIGHT, border=True)
ws.merge_cells("D12:F12")
style_cell(ws, "D12",
           value="[ Cash / Cheque / NEFT / UPI / Bank Transfer ]",
           border=True)

# Landlord details
ws.merge_cells("A14:F14")
style_cell(ws, "A14", value="LANDLORD DETAILS",
           bold=True, color=WHITE, fill=BRAND, border=True, align="center")

landlord = [
    ("Landlord Name", "[Full Name of the Landlord]"),
    ("Landlord Address", "[Landlord's Address]"),
    ("PAN of Landlord",
     "[ABCDE1234F]  (Mandatory if annual rent exceeds ₹1,00,000)"),
    ("Contact Number", "[+91 00000 00000]"),
]
for i, (label, val) in enumerate(landlord):
    r = 15 + i
    ws.merge_cells(f"A{r}:B{r}")
    style_cell(ws, f"A{r}", value=label, bold=True, fill=GREY, border=True)
    ws.merge_cells(f"C{r}:F{r}")
    style_cell(ws, f"C{r}", value=val, border=True,
               color=(ACCENT if "PAN" in label else DARK),
               bold=("PAN" in label))

# Revenue stamp box (for cash > 5000)
ws.merge_cells("A20:B23")
style_cell(ws, "A20",
           value="Affix Revenue\nStamp here\n(if cash > ₹5,000)",
           italic=True, size=9, color=ACCENT, align="center", wrap=True, border=True)

# Signature block
ws.merge_cells("D22:F22")
style_cell(ws, "D22", value="______________________________", align="right")
ws.merge_cells("D23:F23")
style_cell(ws, "D23", value="Signature of Landlord", bold=True, align="right",
           color=BRAND)

# Footer note
ws.merge_cells("A25:F25")
style_cell(ws, "A25",
           value=("Notes: (1) PAN of landlord is mandatory if annual rent is more "
                  "than ₹1,00,000. (2) A revenue stamp is required for cash "
                  "payments above ₹5,000. (3) Keep one signed receipt per month "
                  "for your HRA claim."),
           italic=True, size=9, wrap=True, color=DARK)
ws.row_dimensions[25].height = 40

# ============================================================================
# Sheet 2: 12-Month HRA Log (Apr → Mar Indian FY)
# ============================================================================
ws2 = wb.create_sheet("12-Month HRA Log")
ws2.sheet_view.showGridLines = False

widths2 = [6, 12, 16, 18, 16, 24]
for i, w in enumerate(widths2, start=1):
    ws2.column_dimensions[get_column_letter(i)].width = w

# Title
ws2.merge_cells("A1:F1")
style_cell(ws2, "A1", value="12-MONTH HRA RENT LOG", bold=True, size=22,
           color=WHITE, fill=BRAND, align="center")
ws2.row_dimensions[1].height = 34

ws2.merge_cells("A2:F2")
style_cell(ws2, "A2",
           value="Financial Year: [YYYY-YY]   |   Tenant: [Full Name]   |   PAN: [ABCDE1234F]",
           italic=True, size=11, align="center")

ws2.merge_cells("A3:F3")
style_cell(ws2, "A3",
           value=("Landlord: [Full Name]   |   Landlord PAN: [ABCDE1234F]   |   "
                  "Property: [Rented Property Address]"),
           italic=True, size=10, color=DARK, align="center", wrap=True)
ws2.row_dimensions[3].height = 22

# Header row
HEADER = 5
headers = ["S.No", "Month", "Receipt No.", "Payment Date", "Rent (₹)", "Landlord Signature"]
for i, h in enumerate(headers, start=1):
    col = get_column_letter(i)
    style_cell(ws2, f"{col}{HEADER}", value=h, bold=True, color=WHITE, fill=BRAND,
               align="center", border=True, wrap=True)
ws2.row_dimensions[HEADER].height = 28

# 12 rows for Apr → Mar
months = ["April", "May", "June", "July", "August", "September",
          "October", "November", "December", "January", "February", "March"]

FIRST = HEADER + 1
for idx, month in enumerate(months):
    r = FIRST + idx
    style_cell(ws2, f"A{r}", value=idx + 1, align="center", border=True)
    style_cell(ws2, f"B{r}", value=month, border=True)
    style_cell(ws2, f"C{r}", value=f"RR-{idx + 1:03d}", border=True, align="center")
    style_cell(ws2, f"D{r}", value="[DD-MM-YYYY]", border=True, align="center")
    style_cell(ws2, f"E{r}", value=25000, border=True, align="right",
               number_format=money_fmt)
    style_cell(ws2, f"F{r}", value="", border=True)
    if idx % 2 == 1:
        for i in range(1, 7):
            ws2[f"{get_column_letter(i)}{r}"].fill = PatternFill("solid", fgColor=GREY)

# Totals row
LAST = FIRST + 11
tot = LAST + 1
ws2.merge_cells(f"A{tot}:D{tot}")
style_cell(ws2, f"A{tot}", value="TOTAL ANNUAL RENT (₹)", bold=True, align="right",
           fill=BRAND, color=WHITE, border=True)
style_cell(ws2, f"E{tot}", value=f"=SUM(E{FIRST}:E{LAST})",
           bold=True, align="right", border=True, number_format=money_fmt,
           fill=BRAND, color=WHITE, size=12)
style_cell(ws2, f"F{tot}", border=True, fill=BRAND)

# HRA calculation hint box
hint = tot + 2
ws2.merge_cells(f"A{hint}:F{hint}")
style_cell(ws2, f"A{hint}", value="HRA EXEMPTION CALCULATION (for reference)",
           bold=True, color=WHITE, fill=BRAND, align="center", border=True)

hints = [
    "The HRA exemption you can claim is the LEAST of the three:",
    "  1. Actual HRA received from employer",
    "  2. Rent paid minus 10% of Basic Salary + DA",
    "  3. 50% of Basic + DA (metro cities) OR 40% of Basic + DA (non-metro)",
    "Metros for HRA: Delhi, Mumbai, Kolkata, Chennai. All other cities are non-metro (including Bengaluru, Hyderabad, Pune).",
]
for i, line in enumerate(hints):
    r = hint + 1 + i
    ws2.merge_cells(f"A{r}:F{r}")
    style_cell(ws2, f"A{r}", value=line, size=10, wrap=True,
               fill=BRAND_LIGHT, border=True)

ws2.freeze_panes = f"A{FIRST}"

# Save
out = Path("public/files/rent-receipt-template.xlsx")
out.parent.mkdir(parents=True, exist_ok=True)
wb.save(out)
print(f"Saved: {out.resolve()}")
