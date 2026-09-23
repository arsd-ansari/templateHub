"""
Generates a GST Payment Voucher for Reverse Charge (RCM) in India.

Issued by the registered recipient when they pay an unregistered supplier.
Required under Section 31(3)(g) of the CGST Act / Rule 52. Pair it with the
self invoice (Section 31(3)(f)) — two documents, one inward supply.

Run:  .venv-tools/bin/python scripts/generate_rcm_payment_voucher.py
Output: public/files/rcm-payment-voucher-template.xlsx
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
box = Border(left=thin, right=thin, top=thin, bottom=thin)

money_fmt = "#,##0.00"
pct_fmt = "0%"

wb = Workbook()
ws = wb.active
ws.title = "Payment Voucher (RCM)"
ws.sheet_view.showGridLines = False

widths = [6, 32, 12, 18, 10, 14, 14]
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


ws.merge_cells("A1:G1")
style_cell("A1", value="PAYMENT VOUCHER (Reverse Charge)", bold=True, size=22,
           color=WHITE, fill=BRAND, align="center")
ws.row_dimensions[1].height = 34

ws.merge_cells("A2:G2")
style_cell(
    "A2",
    value=("Issued under Section 31(3)(g) of the CGST Act, 2017 and Rule 52 — "
           "record of payment to an unregistered supplier where GST is payable under RCM."),
    italic=True, size=10, color=ACCENT, align="center"
)
ws.row_dimensions[2].height = 22

ws.merge_cells("A4:C4")
style_cell("A4", value="RECIPIENT (Registered — Payer / Issuer)",
           bold=True, color=WHITE, fill=BRAND, border=True)
for row, key in ((5, "Legal Name"), (6, "Address"), (7, "GSTIN"),
                 (8, "State & Code")):
    ws.merge_cells(f"A{row}:C{row}")
    style_cell(f"A{row}", value=f"{key}: [ ]", border=True, wrap=True)

meta = [
    ("Payment Voucher No.", "[PV-001]"),
    ("Payment Date", "[DD-MM-YYYY]"),
    ("Mode of Payment", "[NEFT / UPI / Cheque / Cash]"),
    ("UTR / Cheque No.", "[ ]"),
    ("Self Invoice No.", "[SI-001]"),
    ("Reverse Charge", "Yes"),
    ("Place of Supply", "[State Name (Code)]"),
]
r = 4
for label, val in meta:
    style_cell(f"E{r}", value=label, bold=True, fill=GREY, border=True)
    ws.merge_cells(f"F{r}:G{r}")
    style_cell(f"F{r}", value=val, border=True,
               bold=(label == "Reverse Charge"),
               color=(ACCENT if label == "Reverse Charge" else DARK))
    r += 1

ws.merge_cells("A10:C10")
style_cell("A10", value="UNREGISTERED SUPPLIER (Payee)",
           bold=True, color=WHITE, fill=BRAND, border=True)
for row, key in ((11, "Name"), (12, "Address"), (13, "State & Code")):
    ws.merge_cells(f"A{row}:C{row}")
    style_cell(f"A{row}", value=f"{key}: [ ]", border=True, wrap=True)

ws.merge_cells("D10:G10")
style_cell("D10", value="NATURE OF PAYMENT",
           bold=True, color=WHITE, fill=BRAND, border=True)
ws.merge_cells("D11:G11")
style_cell(
    "D11",
    value=("Reason for RCM: [Purchase from unregistered dealer / GTA / Advocate / "
           "Director's remuneration / Notified goods or services]"),
    border=True, wrap=True
)
ws.merge_cells("D12:G13")
style_cell(
    "D12",
    value=("Note: Pay the supplier only the billed amount (no GST added by them). "
           "GST under Reverse Charge is paid separately to the government from the "
           "electronic cash ledger. This voucher is the payment record; the self "
           "invoice (SI-xxx) is the tax document."),
    border=True, wrap=True, italic=True, size=10, color=ACCENT
)
ws.row_dimensions[11].height = 36
ws.row_dimensions[12].height = 22
ws.row_dimensions[13].height = 22

HEADER_ROW = 15
headers = ["S.No", "Description of Goods/Services", "HSN/SAC",
           "Amount paid to supplier", "GST %", "CGST (RCM)", "SGST (RCM)"]
for i, h in enumerate(headers, start=1):
    col = get_column_letter(i)
    style_cell(f"{col}{HEADER_ROW}", value=h, bold=True, color=WHITE,
               fill=BRAND, align="center", border=True, wrap=True)
ws.row_dimensions[HEADER_ROW].height = 32

FIRST = HEADER_ROW + 1
N_ROWS = 6
LAST = FIRST + N_ROWS - 1

# Same sample lines as the self invoice so the pair can be used together.
samples = [
    (1, "Freight (GTA services)", "9965", 8000, 0.05),
    (2, "Legal consultation (Advocate)", "9982", 15000, 0.18),
    (3, "Stationery (unregistered vendor)", "4820", 900, 0.12),
]

for idx, row in enumerate(range(FIRST, LAST + 1)):
    sample = samples[idx] if idx < len(samples) else None
    style_cell(f"A{row}", value=(sample[0] if sample else None),
               align="center", border=True)
    style_cell(f"B{row}", value=(sample[1] if sample else None), border=True)
    style_cell(f"C{row}", value=(sample[2] if sample else None),
               align="center", border=True)
    style_cell(f"D{row}", value=(sample[3] if sample else None),
               align="right", border=True, number_format=money_fmt)
    style_cell(f"E{row}", value=(sample[4] if sample else None),
               align="center", border=True, number_format=pct_fmt)
    style_cell(f"F{row}",
               value=f'=IF(OR($D{row}="",$E{row}=""),"",ROUND($D{row}*$E{row}/2,2))',
               align="right", border=True, number_format=money_fmt)
    style_cell(f"G{row}",
               value=f'=IF(OR($D{row}="",$E{row}=""),"",ROUND($D{row}*$E{row}/2,2))',
               align="right", border=True, number_format=money_fmt)
    if idx % 2 == 1:
        for i in range(1, 8):
            ws[f"{get_column_letter(i)}{row}"].fill = PatternFill("solid", fgColor=GREY)


paid = LAST + 1
ws.merge_cells(f"A{paid}:C{paid}")
style_cell(f"A{paid}", value="TOTAL PAID TO SUPPLIER (₹)", bold=True, align="right",
           fill=BRAND, color=WHITE, border=True)
style_cell(f"D{paid}", value=f"=ROUND(SUM(D{FIRST}:D{LAST}),2)", bold=True,
           align="right", border=True, number_format=money_fmt, fill=BRAND, color=WHITE)
style_cell(f"E{paid}", border=True, fill=BRAND)
style_cell(f"F{paid}", border=True, fill=BRAND)
style_cell(f"G{paid}", border=True, fill=BRAND)

tcg = paid + 1
ws.merge_cells(f"A{tcg}:E{tcg}")
style_cell(f"A{tcg}", value="CGST payable to government (cash ledger, not to supplier)",
           bold=True, align="right", fill=BRAND_LIGHT, border=True)
style_cell(f"F{tcg}", border=True, fill=BRAND_LIGHT)
style_cell(f"G{tcg}", value=f"=ROUND(SUM(F{FIRST}:F{LAST}),2)", bold=True,
           align="right", border=True, number_format=money_fmt, fill=BRAND_LIGHT)

tsg = tcg + 1
ws.merge_cells(f"A{tsg}:E{tsg}")
style_cell(f"A{tsg}", value="SGST payable to government (cash ledger, not to supplier)",
           bold=True, align="right", fill=BRAND_LIGHT, border=True)
style_cell(f"F{tsg}", border=True, fill=BRAND_LIGHT)
style_cell(f"G{tsg}", value=f"=ROUND(SUM(G{FIRST}:G{LAST}),2)", bold=True,
           align="right", border=True, number_format=money_fmt, fill=BRAND_LIGHT)

gst_total = tsg + 1
ws.merge_cells(f"A{gst_total}:E{gst_total}")
style_cell(f"A{gst_total}", value="TOTAL GST UNDER RCM (pay in cash to government)",
           bold=True, align="right", fill=BRAND, color=WHITE, border=True)
style_cell(f"F{gst_total}", border=True, fill=BRAND)
style_cell(f"G{gst_total}",
           value=f"=ROUND(G{tcg}+G{tsg},2)", bold=True, align="right",
           border=True, number_format=money_fmt, fill=BRAND, color=WHITE, size=12)

words = gst_total + 2
ws.merge_cells(f"A{words}:G{words}")
style_cell(f"A{words}",
           value="Amount paid to supplier in words: [ Rupees ______________________ Only ]",
           bold=True, italic=True)

check = words + 2
ws.merge_cells(f"A{check}:G{check}")
style_cell(f"A{check}", value="RCM PAYMENT CHECKLIST",
           bold=True, color=WHITE, fill=BRAND, border=True, align="center")
checklist = [
    "1. Raise the self invoice (SI-xxx) when you receive the goods or services — this voucher is not a substitute.",
    "2. Fill this payment voucher on the day you pay the supplier. Use a separate PV-xxx series.",
    "3. Enter the same Self Invoice No. so the two documents join in an audit.",
    "4. Pay the supplier only column D. Do not add CGST/SGST to their NEFT or UPI.",
    "5. Pay the RCM GST from the electronic cash ledger. Existing ITC cannot discharge Reverse Charge.",
    "6. Keep NEFT/UPI proof + this voucher + the self invoice + the supplier's plain bill together.",
]
for i, line in enumerate(checklist):
    ws.merge_cells(f"A{check+1+i}:G{check+1+i}")
    style_cell(f"A{check+1+i}", value=line, border=True, size=10, wrap=True)
    ws.row_dimensions[check + 1 + i].height = 18

sign = check + len(checklist) + 2
ws.merge_cells(f"E{sign}:G{sign}")
style_cell(f"E{sign}", value="For [Your Company Name]", bold=True, align="right")
ws.merge_cells(f"E{sign+2}:G{sign+2}")
style_cell(f"E{sign+2}", value="Authorised Signatory", align="right", color=BRAND)

ws.freeze_panes = f"A{FIRST}"
ws.print_area = f"A1:G{sign+2}"
ws.page_setup.orientation = "portrait"
ws.page_setup.fitToPage = True
ws.page_setup.fitToWidth = 1
ws.page_setup.fitToHeight = 1
ws.page_setup.paperSize = ws.PAPERSIZE_A4

out = Path("public/files/rcm-payment-voucher-template.xlsx")
out.parent.mkdir(parents=True, exist_ok=True)
wb.save(out)
print(f"Saved: {out.resolve()}")
