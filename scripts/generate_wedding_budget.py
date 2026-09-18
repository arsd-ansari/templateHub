"""
Generates a Wedding Budget Planner template — universal, currency-neutral,
built for Pinterest-driven wedding-planning audience worldwide.

Three sheets:
  1. "Budget Overview" — total budget, savings vs actual, category summary,
                          savings goal tracker.
  2. "Detailed Budget"  — 60+ line items across 12 wedding categories
                          (venue, catering, attire, flowers, photo/video,
                          decor, stationery, music/entertainment, transport,
                          rings, honeymoon, misc). Per-item vendor, estimated
                          cost, actual cost, deposit paid, balance due,
                          due date.
  3. "Guest & Per-Head" — guest count, RSVP tracker, per-head cost calculator
                           for catering/favors/rentals.

Run:  .venv-tools/bin/python scripts/generate_wedding_budget.py
Output: public/files/wedding-budget-template.xlsx
"""

from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Warm palette suited for wedding aesthetic — still brand-compatible
ROSE = "BE185D"        # deep rose (accent/section headers)
ROSE_LIGHT = "FCE7F3"  # blush pink (light band)
BRAND = "0F766E"       # brand teal (summary/highlights)
BRAND_LIGHT = "D7EEEB"
GOLD = "B45309"        # amber accents
CREAM = "FEF6E4"
GREY = "F1F5F9"
WHITE = "FFFFFF"
DARK = "16181D"
GREEN_LIGHT = "D1FADF"
RED_LIGHT = "FEE2E2"

thin = Side(style="thin", color="E4C7D1")
box = Border(left=thin, right=thin, top=thin, bottom=thin)

money_fmt = "#,##0.00"
pct_fmt = "0.0%"

wb = Workbook()


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


# ============================================================================
# Sheet 1: Budget Overview
# ============================================================================
ws = wb.active
ws.title = "Budget Overview"
ws.sheet_view.showGridLines = False

widths = [2, 26, 16, 16, 16, 16]
for i, w in enumerate(widths, start=1):
    ws.column_dimensions[get_column_letter(i)].width = w

# Title band
ws.merge_cells("B1:F1")
style_cell(ws, "B1", value="WEDDING BUDGET PLANNER", bold=True, size=22,
           color=WHITE, fill=ROSE, align="center")
ws.row_dimensions[1].height = 34

ws.merge_cells("B2:F2")
style_cell(ws, "B2",
           value="A calm, all-in-one planner for tracking every wedding expense — from venue to honeymoon.",
           italic=True, size=10, color=DARK, align="center")

# --- HEADLINE NUMBERS CARD ---
ws.merge_cells("B4:F4")
style_cell(ws, "B4", value="BUDGET AT A GLANCE", bold=True, color=WHITE,
           fill=ROSE, align="center", border=True)

style_cell(ws, "B5", value="Total Budget", bold=True, fill=CREAM, border=True)
style_cell(ws, "C5", value=25000, border=True, align="right",
           number_format=money_fmt, bold=True, size=13)
style_cell(ws, "D5", value="Total Spent (so far)", bold=True, fill=CREAM, border=True)
# Placeholder — filled after detail sheet totals are known via cross-sheet ref
style_cell(ws, "E5", value="=SUM('Detailed Budget'!F8:F200)", border=True,
           align="right", number_format=money_fmt, bold=True, size=13)
style_cell(ws, "F5", value=None, fill=CREAM, border=True)

style_cell(ws, "B6", value="Estimated Total", bold=True, fill=CREAM, border=True)
style_cell(ws, "C6", value="=SUM('Detailed Budget'!E8:E200)", border=True,
           align="right", number_format=money_fmt)
style_cell(ws, "D6", value="Balance Due (Est. − Deposits)", bold=True, fill=CREAM, border=True)
style_cell(ws, "E6",
           value="=SUM('Detailed Budget'!E8:E200)-SUM('Detailed Budget'!F8:F200)",
           border=True, align="right", number_format=money_fmt)
style_cell(ws, "F6", value=None, fill=CREAM, border=True)

style_cell(ws, "B7", value="Remaining in Budget", bold=True, fill=GREEN_LIGHT,
           border=True)
style_cell(ws, "C7", value="=C5-C6", border=True, align="right",
           number_format=money_fmt, bold=True, fill=GREEN_LIGHT, size=13,
           color=BRAND)
style_cell(ws, "D7", value="% of Budget Spent", bold=True, fill=BRAND_LIGHT,
           border=True)
style_cell(ws, "E7",
           value='=IF(C5=0,"",E5/C5)',
           border=True, align="right", number_format=pct_fmt, bold=True,
           fill=BRAND_LIGHT, size=13, color=BRAND)
style_cell(ws, "F7", value=None, fill=BRAND_LIGHT, border=True)

# --- CATEGORY SUMMARY TABLE ---
CS = 10
ws.merge_cells(f"B{CS}:F{CS}")
style_cell(ws, f"B{CS}", value="CATEGORY SUMMARY", bold=True, color=WHITE,
           fill=ROSE, align="center", border=True)

CSH = CS + 1
for col, label in zip(["B", "C", "D", "E", "F"],
                       ["Category", "Estimated", "Spent", "Balance", "% Spent"]):
    style_cell(ws, f"{col}{CSH}", value=label, bold=True, fill=ROSE_LIGHT,
               border=True, align="center")

# Categories that exactly match the "Detailed Budget" section headers
categories = [
    "Venue & Ceremony",
    "Catering & Bar",
    "Attire & Beauty",
    "Flowers & Decor",
    "Photography & Video",
    "Stationery",
    "Music & Entertainment",
    "Transportation",
    "Rings & Gifts",
    "Honeymoon",
    "Miscellaneous",
]

CS_FIRST = CSH + 1
for i, cat in enumerate(categories):
    r = CS_FIRST + i
    style_cell(ws, f"B{r}", value=cat, border=True)
    style_cell(ws, f"C{r}",
               value=f"=SUMIF('Detailed Budget'!B:B,B{r},'Detailed Budget'!E:E)",
               border=True, align="right", number_format=money_fmt)
    style_cell(ws, f"D{r}",
               value=f"=SUMIF('Detailed Budget'!B:B,B{r},'Detailed Budget'!F:F)",
               border=True, align="right", number_format=money_fmt)
    style_cell(ws, f"E{r}",
               value=f"=C{r}-D{r}",
               border=True, align="right", number_format=money_fmt)
    style_cell(ws, f"F{r}",
               value=f'=IF(C{r}=0,"",D{r}/C{r})',
               border=True, align="right", number_format=pct_fmt)
    if i % 2 == 1:
        for col in ["B", "C", "D", "E", "F"]:
            ws[f"{col}{r}"].fill = PatternFill("solid", fgColor=GREY)

CS_LAST = CS_FIRST + len(categories) - 1
CS_TOT = CS_LAST + 1
style_cell(ws, f"B{CS_TOT}", value="TOTAL", bold=True, color=WHITE, fill=ROSE,
           border=True)
style_cell(ws, f"C{CS_TOT}", value=f"=SUM(C{CS_FIRST}:C{CS_LAST})", bold=True,
           color=WHITE, fill=ROSE, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, f"D{CS_TOT}", value=f"=SUM(D{CS_FIRST}:D{CS_LAST})", bold=True,
           color=WHITE, fill=ROSE, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, f"E{CS_TOT}", value=f"=SUM(E{CS_FIRST}:E{CS_LAST})", bold=True,
           color=WHITE, fill=ROSE, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, f"F{CS_TOT}", bold=True, color=WHITE, fill=ROSE, border=True)

# --- SAVINGS TRACKER ---
ST = CS_TOT + 3
ws.merge_cells(f"B{ST}:F{ST}")
style_cell(ws, f"B{ST}", value="SAVINGS TRACKER", bold=True, color=WHITE,
           fill=ROSE, align="center", border=True)

ST_HEAD = ST + 1
for col, label in zip(["B", "C", "D", "E", "F"],
                       ["Source", "Note", "Goal", "Saved", "Remaining"]):
    style_cell(ws, f"{col}{ST_HEAD}", value=label, bold=True, fill=ROSE_LIGHT,
               border=True, align="center")

savings = [
    ("Couple's savings", "Personal contribution", 15000, 8000),
    ("Family contribution", "Parents / relatives", 8000, 5000),
    ("Wedding gifts (expected)", "Cash gifts", 2000, 0),
    ("Other", "Loans / other", 0, 0),
]
for i, (src, note, goal, saved) in enumerate(savings):
    r = ST_HEAD + 1 + i
    style_cell(ws, f"B{r}", value=src, border=True)
    style_cell(ws, f"C{r}", value=note, border=True, italic=True, color="64748B")
    style_cell(ws, f"D{r}", value=goal, border=True, align="right",
               number_format=money_fmt)
    style_cell(ws, f"E{r}", value=saved, border=True, align="right",
               number_format=money_fmt)
    style_cell(ws, f"F{r}", value=f"=D{r}-E{r}", border=True, align="right",
               number_format=money_fmt)

ST_TOT = ST_HEAD + 1 + len(savings)
style_cell(ws, f"B{ST_TOT}", value="TOTAL SAVINGS", bold=True, fill=GREEN_LIGHT,
           border=True)
style_cell(ws, f"C{ST_TOT}", fill=GREEN_LIGHT, border=True)
style_cell(ws, f"D{ST_TOT}", value=f"=SUM(D{ST_HEAD+1}:D{ST_TOT-1})", bold=True,
           fill=GREEN_LIGHT, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, f"E{ST_TOT}", value=f"=SUM(E{ST_HEAD+1}:E{ST_TOT-1})", bold=True,
           fill=GREEN_LIGHT, border=True, align="right",
           number_format=money_fmt)
style_cell(ws, f"F{ST_TOT}", value=f"=D{ST_TOT}-E{ST_TOT}", bold=True,
           fill=GREEN_LIGHT, border=True, align="right",
           number_format=money_fmt)

ws.freeze_panes = "B4"

# ============================================================================
# Sheet 2: Detailed Budget
# ============================================================================
ws2 = wb.create_sheet("Detailed Budget")
ws2.sheet_view.showGridLines = False

widths2 = [2, 22, 26, 22, 14, 14, 14, 16]
for i, w in enumerate(widths2, start=1):
    ws2.column_dimensions[get_column_letter(i)].width = w

ws2.merge_cells("B1:H1")
style_cell(ws2, "B1", value="DETAILED BUDGET", bold=True, size=22, color=WHITE,
           fill=ROSE, align="center")
ws2.row_dimensions[1].height = 34

ws2.merge_cells("B2:H2")
style_cell(ws2, "B2",
           value="Fill in Estimated cost as you research vendors. Fill in Paid as you deposit.",
           italic=True, size=10, align="center")

HEADER = 4
for col, label in zip(["B", "C", "D", "E", "F", "G", "H"],
                       ["Category", "Item", "Vendor", "Estimated",
                        "Paid", "Balance", "Due Date"]):
    style_cell(ws2, f"{col}{HEADER}", value=label, bold=True, color=WHITE,
               fill=ROSE, border=True, align="center")
ws2.row_dimensions[HEADER].height = 26

# Detailed rows: category, item, vendor placeholder, estimated
items = [
    # Venue & Ceremony
    ("Venue & Ceremony", "Venue rental fee", "[Vendor]", 6000),
    ("Venue & Ceremony", "Officiant / celebrant", "[Vendor]", 500),
    ("Venue & Ceremony", "Ceremony chairs / arch rental", "[Vendor]", 300),
    ("Venue & Ceremony", "Marriage license / paperwork", "", 100),
    # Catering & Bar
    ("Catering & Bar", "Reception food (per head)", "[Caterer]", 5000),
    ("Catering & Bar", "Cocktail hour appetizers", "[Caterer]", 500),
    ("Catering & Bar", "Wedding cake", "[Baker]", 400),
    ("Catering & Bar", "Alcohol / bar service", "[Bar]", 1200),
    ("Catering & Bar", "Cake cutting / service fees", "", 100),
    # Attire & Beauty
    ("Attire & Beauty", "Bride's dress + alterations", "[Store]", 1500),
    ("Attire & Beauty", "Bride's shoes + accessories", "[Store]", 300),
    ("Attire & Beauty", "Groom's suit + accessories", "[Store]", 500),
    ("Attire & Beauty", "Hair styling (bride + party)", "[Stylist]", 400),
    ("Attire & Beauty", "Makeup artist", "[Artist]", 300),
    ("Attire & Beauty", "Bridal party gifts / outfits", "", 400),
    # Flowers & Decor
    ("Flowers & Decor", "Bride's bouquet", "[Florist]", 250),
    ("Flowers & Decor", "Bridesmaid bouquets", "[Florist]", 200),
    ("Flowers & Decor", "Ceremony flowers / arch", "[Florist]", 400),
    ("Flowers & Decor", "Centerpieces", "[Florist]", 500),
    ("Flowers & Decor", "Reception decor / lighting", "[Vendor]", 400),
    ("Flowers & Decor", "Aisle runner / signs", "", 150),
    # Photography & Video
    ("Photography & Video", "Photographer (full day)", "[Photographer]", 2500),
    ("Photography & Video", "Videographer", "[Videographer]", 1500),
    ("Photography & Video", "Engagement / pre-wedding shoot", "[Photographer]", 400),
    ("Photography & Video", "Photo album / prints", "", 300),
    # Stationery
    ("Stationery", "Save-the-dates", "[Vendor]", 150),
    ("Stationery", "Wedding invitations", "[Vendor]", 350),
    ("Stationery", "RSVP cards + envelopes", "", 100),
    ("Stationery", "Ceremony programs", "", 80),
    ("Stationery", "Menu cards / place cards", "", 100),
    ("Stationery", "Thank-you cards + postage", "", 120),
    # Music & Entertainment
    ("Music & Entertainment", "DJ / band", "[DJ]", 1500),
    ("Music & Entertainment", "Ceremony music", "[Musician]", 300),
    ("Music & Entertainment", "Sound system / mic rental", "", 200),
    ("Music & Entertainment", "Photo booth / extras", "", 400),
    # Transportation
    ("Transportation", "Bride & groom car / carriage", "[Vendor]", 300),
    ("Transportation", "Guest shuttle service", "[Vendor]", 400),
    ("Transportation", "Valet parking", "", 200),
    # Rings & Gifts
    ("Rings & Gifts", "Bride's wedding ring", "[Jeweler]", 800),
    ("Rings & Gifts", "Groom's wedding ring", "[Jeweler]", 500),
    ("Rings & Gifts", "Gifts for parents", "", 200),
    ("Rings & Gifts", "Favors for guests", "", 200),
    # Honeymoon
    ("Honeymoon", "Flights", "[Airline]", 1200),
    ("Honeymoon", "Accommodation", "[Hotel]", 1500),
    ("Honeymoon", "Activities & tours", "", 500),
    ("Honeymoon", "Meals & spending money", "", 500),
    # Miscellaneous
    ("Miscellaneous", "Wedding insurance", "[Insurer]", 250),
    ("Miscellaneous", "Rehearsal dinner", "", 800),
    ("Miscellaneous", "Welcome bags for out-of-town guests", "", 300),
    ("Miscellaneous", "Tips & gratuities", "", 500),
    ("Miscellaneous", "Emergency fund (unforeseen)", "", 600),
]

# Add several blank rows per category so users can add their own items
first_data = HEADER + 4  # give some visual breathing room
row = first_data
current_cat = None
for cat, item, vendor, est in items:
    if cat != current_cat:
        # Insert a small band before switching category
        ws2.merge_cells(f"B{row}:H{row}")
        style_cell(ws2, f"B{row}", value=cat.upper(), bold=True, color=DARK,
                   fill=ROSE_LIGHT, border=True, align="left", size=10)
        row += 1
        current_cat = cat
    style_cell(ws2, f"B{row}", value=cat, border=True)
    style_cell(ws2, f"C{row}", value=item, border=True)
    style_cell(ws2, f"D{row}", value=vendor or None, border=True,
               italic=True, color="64748B")
    style_cell(ws2, f"E{row}", value=est, border=True, align="right",
               number_format=money_fmt)
    style_cell(ws2, f"F{row}", border=True, align="right",
               number_format=money_fmt)
    style_cell(ws2, f"G{row}",
               value=f'=IF(E{row}="","",E{row}-F{row})',
               border=True, align="right", number_format=money_fmt)
    style_cell(ws2, f"H{row}", border=True, align="center")
    row += 1

ws2.freeze_panes = f"B{HEADER+1}"

# ============================================================================
# Sheet 3: Guest & Per-Head
# ============================================================================
ws3 = wb.create_sheet("Guest & Per-Head")
ws3.sheet_view.showGridLines = False

widths3 = [2, 22, 14, 14, 14, 14]
for i, w in enumerate(widths3, start=1):
    ws3.column_dimensions[get_column_letter(i)].width = w

ws3.merge_cells("B1:F1")
style_cell(ws3, "B1", value="GUEST COUNT & PER-HEAD COSTS",
           bold=True, size=22, color=WHITE, fill=ROSE, align="center")
ws3.row_dimensions[1].height = 34

ws3.merge_cells("B2:F2")
style_cell(ws3, "B2",
           value="Track RSVPs and see how your per-head costs scale as the guest list changes.",
           italic=True, size=10, align="center")

# --- Guest count block ---
ws3.merge_cells("B4:F4")
style_cell(ws3, "B4", value="GUEST COUNT", bold=True, color=WHITE, fill=ROSE,
           align="center", border=True)

guest_rows = [
    ("Invited", 150, "Total invitations sent"),
    ("Confirmed (Yes)", 110, "RSVPs confirmed"),
    ("Declined (No)", 20, "RSVPs declined"),
    ("Awaiting response", 20, "No reply yet — follow up"),
    ("Plus-ones", 15, "Included in confirmed count"),
    ("Children", 10, "Charged at half rate typically"),
]
for i, (label, val, note) in enumerate(guest_rows):
    r = 5 + i
    style_cell(ws3, f"B{r}", value=label, bold=True, fill=CREAM, border=True)
    style_cell(ws3, f"C{r}", value=val, border=True, align="center",
               number_format="0")
    ws3.merge_cells(f"D{r}:F{r}")
    style_cell(ws3, f"D{r}", value=note, border=True, italic=True,
               color="64748B")

# --- Per-head calculator ---
PH = 12
ws3.merge_cells(f"B{PH}:F{PH}")
style_cell(ws3, f"B{PH}", value="PER-HEAD COST CALCULATOR", bold=True,
           color=WHITE, fill=ROSE, align="center", border=True)

for col, label in zip(["B", "C", "D", "E", "F"],
                       ["Item", "Confirmed Guests", "Cost per Head",
                        "Estimated Total", "Notes"]):
    style_cell(ws3, f"{col}{PH+1}", value=label, bold=True,
               fill=ROSE_LIGHT, border=True, align="center")

per_head = [
    ("Reception meal", 110, 45, "Caterer's per-plate price"),
    ("Cocktail hour", 110, 12, "Appetizers + drinks per guest"),
    ("Bar service", 110, 20, "Open bar per guest, 5 hrs"),
    ("Wedding favors", 110, 3, "Small token per guest"),
    ("Chair / linen rental", 110, 4, "Per seat"),
    ("Stationery", 110, 2, "Menu + place card per guest"),
]

for i, (item, guests, per, notes) in enumerate(per_head):
    r = PH + 2 + i
    style_cell(ws3, f"B{r}", value=item, border=True)
    style_cell(ws3, f"C{r}", value=guests, border=True, align="center",
               number_format="0")
    style_cell(ws3, f"D{r}", value=per, border=True, align="right",
               number_format=money_fmt)
    style_cell(ws3, f"E{r}",
               value=f"=C{r}*D{r}", border=True, align="right",
               number_format=money_fmt)
    style_cell(ws3, f"F{r}", value=notes, border=True, italic=True,
               color="64748B")

ph_tot = PH + 2 + len(per_head)
ws3.merge_cells(f"B{ph_tot}:C{ph_tot}")
style_cell(ws3, f"B{ph_tot}", value="TOTAL PER-HEAD COSTS", bold=True,
           fill=BRAND, color=WHITE, border=True, align="right")
style_cell(ws3, f"D{ph_tot}", bold=True, fill=BRAND, color=WHITE, border=True)
style_cell(ws3, f"E{ph_tot}",
           value=f"=SUM(E{PH+2}:E{ph_tot-1})",
           bold=True, fill=BRAND, color=WHITE, border=True, align="right",
           number_format=money_fmt)
style_cell(ws3, f"F{ph_tot}", fill=BRAND, border=True)

# Tip
tip = ph_tot + 2
ws3.merge_cells(f"B{tip}:F{tip}")
style_cell(ws3, f"B{tip}",
           value="Tip: Per-head costs are the biggest lever in a wedding budget. Cutting the guest list by 20 people can save more than negotiating on the venue.",
           italic=True, size=10, wrap=True, fill=CREAM, border=True)
ws3.row_dimensions[tip].height = 32

ws3.freeze_panes = "B4"

# ============================================================================
out = Path("public/files/wedding-budget-template.xlsx")
out.parent.mkdir(parents=True, exist_ok=True)
wb.save(out)
print(f"Saved: {out.resolve()}")
