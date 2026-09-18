"""
Generates a Self Invoice (RCM) template for GST in India — issued by a
registered recipient for supplies received from an unregistered supplier,
where GST is payable under Reverse Charge Mechanism.

Run:  .venv-tools/bin/python scripts/generate_self_invoice.py
Output: public/files/self-invoice-rcm-template.xlsx

Layout mirrors the standard GST invoice but flips the parties (buyer is the
issuer, supplier has no GSTIN) and sets Reverse Charge = Yes. Formulas for
Taxable Value, CGST, SGST, and Total are live.
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
ACCENT = "B45309"  # amber — highlights the RCM note

thin = Side(style="thin", color="C9D2DC")
box = Border(left=thin, right=thin, top=thin, bottom=thin)

money_fmt = "#,##0.00"
pct_fmt = "0%"

wb = Workbook()
ws = wb.active
ws.title = "Self Invoice (RCM)"
ws.sheet_view.showGridLines = False

widths = [6, 26, 12, 8, 12, 14, 8, 13, 13, 14]
for i, w in enumerate(widths, start=1):
    ws.column_dimensions[get_column_letter(i)].width = w


def style_cell(ref, *, value=None, bold=False, size=11, color=DARK,
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


ws.merge_cells("A1:J1")
style_cell("A1", value="SELF INVOICE (Reverse Charge)", bold=True, size=22,
           color=WHITE, fill=BRAND, align="center")
ws.row_dimensions[1].height = 34

ws.merge_cells("A2:J2")
style_cell(
    "A2",
    value=("Issued under Section 31(3)(f) of the CGST Act, 2017 — "
           "for supplies received from an unregistered supplier where GST is payable under RCM."),
    italic=True, size=10, color=ACCENT, align="center"
)
ws.row_dimensions[2].height = 22

ws.merge_cells("A4:E4")
style_cell("A4", value="RECIPIENT (Registered — Issuer of this invoice)",
           bold=True, color=WHITE, fill=BRAND, border=True)
for row, key in ((5, "Legal Name"), (6, "Address"), (7, "GSTIN"),
                 (8, "State & Code")):
    ws.merge_cells(f"A{row}:E{row}")
    style_cell(f"A{row}", value=f"{key}: [ ]", border=True, wrap=True)

meta = [
    ("Self Invoice No.", "[SI-001]"),
    ("Invoice Date", "[DD-MM-YYYY]"),
    ("Place of Supply", "[State Name (Code)]"),
    ("Reverse Charge", "Yes"),
    ("Type of Supply", "[Goods / Services]"),
    ("Payment Voucher No.", "[PV-001]"),
]
r = 4
for label, val in meta:
    style_cell(f"G{r}", value=label, bold=True, fill=GREY, border=True)
    ws.merge_cells(f"H{r}:J{r}")
    style_cell(f"H{r}", value=val, border=True,
               bold=(label == "Reverse Charge"),
               color=(ACCENT if label == "Reverse Charge" else DARK))
    r += 1

ws.merge_cells("A10:E10")
style_cell("A10", value="UNREGISTERED SUPPLIER",
           bold=True, color=WHITE, fill=BRAND, border=True)
for row, key in ((11, "Name"), (12, "Address"), (13, "State & Code")):
    ws.merge_cells(f"A{row}:E{row}")
    style_cell(f"A{row}", value=f"{key}: [ ]", border=True, wrap=True)

ws.merge_cells("F10:J10")
style_cell("F10", value="NATURE OF SUPPLY",
           bold=True, color=WHITE, fill=BRAND, border=True)
ws.merge_cells("F11:J11")
style_cell(
    "F11",
    value=("Reason for RCM: [Purchase from unregistered dealer / GTA / Advocate / "
           "Director's remuneration / Notified goods or services]"),
    border=True, wrap=True
)
ws.merge_cells("F12:J13")
style_cell(
    "F12",
    value=("Note: This self invoice is issued by the recipient because the supplier "
           "is unregistered and GST is payable under Reverse Charge. A separate "
           "Payment Voucher must also be raised when payment is made."),
    border=True, wrap=True, italic=True, size=10, color=ACCENT
)
ws.row_dimensions[11].height = 36
ws.row_dimensions[12].height = 22
ws.row_dimensions[13].height = 22

HEADER_ROW = 15
headers = ["S.No", "Description of Goods/Services", "HSN/SAC", "Qty", "Rate",
           "Taxable Value", "GST %", "CGST", "SGST", "Total"]
for i, h in enumerate(headers, start=1):
    col = get_column_letter(i)
    style_cell(f"{col}{HEADER_ROW}", value=h, bold=True, color=WHITE,
               fill=BRAND, align="center", border=True, wrap=True)
ws.row_dimensions[HEADER_ROW].height = 28

FIRST = HEADER_ROW + 1
N_ROWS = 8
LAST = FIRST + N_ROWS - 1

samples = [
    (1, "Freight (GTA services)", "9965", 1, 8000, 0.05),
    (2, "Legal consultation (Advocate)", "9982", 1, 15000, 0.18),
    (3, "Stationery (unregistered vendor)", "4820", 20, 45, 0.12),
]

for idx, row in enumerate(range(FIRST, LAST + 1)):
    sample = samples[idx] if idx < len(samples) else None
    style_cell(f"A{row}", value=(sample[0] if sample else None),
               align="center", border=True)
    style_cell(f"B{row}", value=(sample[1] if sample else None), border=True)
    style_cell(f"C{row}", value=(sample[2] if sample else None),
               align="center", border=True)
    style_cell(f"D{row}", value=(sample[3] if sample else None),
               align="center", border=True)
    style_cell(f"E{row}", value=(sample[4] if sample else None),
               align="right", border=True, number_format=money_fmt)
    style_cell(f"G{row}", value=(sample[5] if sample else None),
               align="center", border=True, number_format=pct_fmt)
    style_cell(f"F{row}",
               value=f'=IF(OR($D{row}="",$E{row}=""),"",ROUND($D{row}*$E{row},2))',
               align="right", border=True, number_format=money_fmt)
    style_cell(f"H{row}",
               value=f'=IF($F{row}="","",ROUND($F{row}*$G{row}/2,2))',
               align="right", border=True, number_format=money_fmt)
    style_cell(f"I{row}",
               value=f'=IF($F{row}="","",ROUND($F{row}*$G{row}/2,2))',
               align="right", border=True, number_format=money_fmt)
    style_cell(f"J{row}",
               value=f'=IF($F{row}="","",$F{row}+$H{row}+$I{row})',
               align="right", border=True, number_format=money_fmt)
    if idx % 2 == 1:
        for i in range(1, 11):
            ws[f"{get_column_letter(i)}{row}"].fill = PatternFill("solid", fgColor=GREY)


def total_row(row, label, formula, *, strong=False):
    ws.merge_cells(f"A{row}:G{row}")
    style_cell(f"A{row}", value=label, bold=True, align="right",
               fill=(BRAND if strong else BRAND_LIGHT),
               color=(WHITE if strong else DARK), border=True)
    ws.merge_cells(f"H{row}:I{row}")
    style_cell(f"H{row}", border=True, fill=(BRAND if strong else None))
    style_cell(f"J{row}", value=formula, bold=True, align="right",
               border=True, number_format=money_fmt,
               fill=(BRAND if strong else BRAND_LIGHT),
               color=(WHITE if strong else DARK), size=(12 if strong else 11))


tcg = LAST + 1
total_row(tcg, "Total Taxable Value", f"=ROUND(SUM(F{FIRST}:F{LAST}),2)")
total_row(tcg + 1, "Total CGST (payable under RCM)",
          f"=ROUND(SUM(H{FIRST}:H{LAST}),2)")
total_row(tcg + 2, "Total SGST (payable under RCM)",
          f"=ROUND(SUM(I{FIRST}:I{LAST}),2)")
total_row(tcg + 3, "Round Off",
          f"=ROUND(SUM(J{FIRST}:J{LAST}),0)-SUM(J{FIRST}:J{LAST})")
total_row(tcg + 4, "GRAND TOTAL (₹)",
          f"=ROUND(SUM(J{FIRST}:J{LAST}),0)", strong=True)

words = tcg + 6
ws.merge_cells(f"A{words}:J{words}")
style_cell(f"A{words}",
           value="Amount in words: [ Rupees ______________________ Only ]",
           bold=True, italic=True)

# ---- RCM compliance checklist (why the buyer should NOT skip this) -----------
check = words + 2
ws.merge_cells(f"A{check}:J{check}")
style_cell(f"A{check}", value="RCM COMPLIANCE CHECKLIST",
           bold=True, color=WHITE, fill=BRAND, border=True, align="center")
checklist = [
    "1. Issue this self invoice at the time of receipt of goods/services.",
    "2. Issue a separate Payment Voucher when paying the supplier.",
    "3. Pay the GST amount to the government in cash (ITC cannot be used).",
    "4. Claim Input Tax Credit of the RCM tax paid, in the same or next return.",
    "5. Report the transaction in Table 3.1(d) of GSTR-3B (inward supplies liable to reverse charge).",
    "6. Show it in Table 4B of GSTR-1 if applicable.",
]
for i, line in enumerate(checklist):
    ws.merge_cells(f"A{check+1+i}:J{check+1+i}")
    style_cell(f"A{check+1+i}", value=line, border=True, size=10, wrap=True)

sign = check + len(checklist) + 2
ws.merge_cells(f"G{sign}:J{sign}")
style_cell(f"G{sign}", value="For [Your Company Name]", bold=True, align="right")
ws.merge_cells(f"G{sign+2}:J{sign+2}")
style_cell(f"G{sign+2}", value="Authorised Signatory", align="right", color=BRAND)

ws.freeze_panes = f"A{FIRST}"

out = Path("public/files/self-invoice-rcm-template.xlsx")
out.parent.mkdir(parents=True, exist_ok=True)
wb.save(out)
print(f"Saved: {out.resolve()}")
