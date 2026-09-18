"""
Generates Pinterest-ready pin images (1000x1500 vertical) for every real
TemplateHub template and blog post, using brand colors. Also prints a
copy-paste content pack (title + description + URL + keywords) so the user
can upload the pins to Pinterest in one sitting.

Run:  .venv-tools/bin/python scripts/generate_pinterest_pins.py
Output: pinterest-pins/ folder in the project root (gitignored)
        + content pack printed to stdout
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

# ---- Brand -------------------------------------------------------------------
BRAND_TEAL = (15, 118, 110)          # #0F766E
BRAND_TEAL_DARK = (10, 82, 78)
BRAND_LIGHT = (215, 238, 235)        # #D7EEEB
CREAM = (253, 250, 244)
DARK = (22, 24, 29)                  # #16181D
ACCENT_AMBER = (180, 83, 9)          # #B45309
WHITE = (255, 255, 255)

SITE = "templatehub.co.in"

W, H = 1000, 1500
OUT = Path("pinterest-pins")

# ---- Font loading (macOS-friendly fallbacks) ---------------------------------
FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Arial.ttf",
]


def load_font(size, bold=True):
    for path in FONT_CANDIDATES:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


F_HERO = load_font(96)
F_HERO_SM = load_font(78)
F_SUB = load_font(44)
F_BADGE = load_font(32)
F_URL = load_font(36)
F_BULLET = load_font(38)


def text_size(draw, text, font):
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def wrap_text_pixel(draw, text, font, max_width):
    words = text.split()
    lines = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        tw, _ = text_size(draw, trial, font)
        if tw <= max_width:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_pin(title, subtitle, bullets, badge_text, filename, kind="template"):
    img = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    # Top color band with badge
    band_h = 220
    draw.rectangle([0, 0, W, band_h], fill=BRAND_TEAL)

    # Badge (small pill)
    badge_padding_x, badge_padding_y = 30, 14
    bw, bh = text_size(draw, badge_text.upper(), F_BADGE)
    bx = (W - bw) // 2
    by = 70
    draw.rounded_rectangle(
        [bx - badge_padding_x, by - badge_padding_y, bx + bw + badge_padding_x, by + bh + badge_padding_y],
        radius=40, outline=WHITE, width=3
    )
    draw.text((bx, by), badge_text.upper(), font=F_BADGE, fill=WHITE)

    # "FREE" flag ribbon top-left
    if kind == "template":
        ribbon_h = 60
        draw.rectangle([0, band_h + 10, 220, band_h + 10 + ribbon_h], fill=ACCENT_AMBER)
        draw.text((30, band_h + 20), "FREE", font=F_BADGE, fill=WHITE)

    # Hero title
    hero_y = band_h + 120
    max_title_w = W - 120
    font_title = F_HERO
    lines = wrap_text_pixel(draw, title, font_title, max_title_w)
    if len(lines) > 3:
        font_title = F_HERO_SM
        lines = wrap_text_pixel(draw, title, font_title, max_title_w)

    y = hero_y
    for line in lines:
        lw, lh = text_size(draw, line, font_title)
        draw.text(((W - lw) // 2, y), line, font=font_title, fill=DARK)
        y += lh + 12

    # Underline under title
    y += 20
    line_w = 220
    draw.rectangle([(W - line_w) // 2, y, (W + line_w) // 2, y + 8], fill=BRAND_TEAL)
    y += 60

    # Subtitle
    if subtitle:
        sub_lines = wrap_text_pixel(draw, subtitle, F_SUB, W - 160)
        for line in sub_lines:
            lw, lh = text_size(draw, line, F_SUB)
            draw.text(((W - lw) // 2, y), line, font=F_SUB, fill=BRAND_TEAL_DARK)
            y += lh + 10
        y += 40

    # Bullet points card
    if bullets:
        card_top = y
        card_bottom = H - 220
        draw.rounded_rectangle(
            [60, card_top, W - 60, card_bottom], radius=30, fill=BRAND_LIGHT
        )
        by = card_top + 40
        for bullet in bullets:
            # geometric checkmark (two-segment line)
            cx, cy = 110, by + 12
            r = 22
            # circle background
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=BRAND_TEAL)
            # white check mark strokes
            draw.line([(cx - 11, cy), (cx - 3, cy + 8)], fill=WHITE, width=5)
            draw.line([(cx - 3, cy + 8), (cx + 12, cy - 8)], fill=WHITE, width=5)
            wrapped = wrap_text_pixel(draw, bullet, F_BULLET, W - 240)
            for i, line in enumerate(wrapped):
                draw.text((cx + 40, by + i * 48), line, font=F_BULLET, fill=DARK)
            by += 48 * len(wrapped) + 26

    # Footer URL band
    footer_h = 140
    draw.rectangle([0, H - footer_h, W, H], fill=DARK)
    footer_text = SITE.upper()
    fw, fh = text_size(draw, footer_text, F_URL)
    fx = (W - fw) // 2
    fy = H - footer_h + (footer_h - fh) // 2
    draw.text((fx, fy), footer_text, font=F_URL, fill=BRAND_LIGHT)
    # small teal underline
    draw.rectangle([fx, fy + fh + 12, fx + fw, fy + fh + 18], fill=BRAND_TEAL)

    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / filename
    img.save(path, "PNG", optimize=True)
    return path


# ---- Content pack -----------------------------------------------------------
# Each pin: (slug, url, board, pin_title, pin_desc_short, big_title, subtitle,
#           bullets[3], badge)

TEMPLATES = [
    dict(
        slug="gst-invoice-template",
        url="/templates/gst-invoice-template",
        board="GST Templates",
        pin_title="Free GST Invoice Template for Excel (CGST + SGST Auto-Calculated)",
        pin_desc=(
            "Download a free GST-compliant tax invoice template for Excel & Google Sheets. "
            "CGST, SGST, and totals auto-calculate. Every field required by Indian GST law included. "
            "Perfect for small businesses, freelancers, and consultants in India."
        ),
        big_title="Free GST Invoice Template",
        subtitle="For Excel & Google Sheets",
        bullets=[
            "Auto CGST + SGST calculation",
            "Every GST-mandatory field included",
            "Works in Excel & Google Sheets",
        ],
        badge="GST invoice",
        keywords="gst invoice, gst invoice format in excel, gst invoice template, tax invoice india, small business",
    ),
    dict(
        slug="self-invoice-rcm-template",
        url="/templates/self-invoice-rcm-template",
        board="GST Templates",
        pin_title="Free Self Invoice Under GST (RCM) Template — Excel Download",
        pin_desc=(
            "Free Self Invoice template for GST Reverse Charge Mechanism (RCM) in Excel. "
            "Use it for purchases from unregistered suppliers, GTA freight, advocate fees, and director's remuneration. "
            "Auto-calculates CGST, SGST, and total. Includes RCM compliance checklist."
        ),
        big_title="Self Invoice Under GST (RCM)",
        subtitle="Excel Template — Free Download",
        bullets=[
            "Reverse Charge flag pre-set",
            "For unregistered supplier purchases",
            "Includes RCM compliance checklist",
        ],
        badge="RCM template",
        keywords="self invoice under gst, rcm invoice format, reverse charge mechanism, gst rcm, unregistered supplier",
    ),
    dict(
        slug="invoice-template",
        url="/templates/invoice-template",
        board="Invoice Templates",
        pin_title="Free Professional Invoice Template for Excel (Auto Tax + Total)",
        pin_desc=(
            "Free general invoice template for Excel and Google Sheets. "
            "Auto-calculates subtotal, tax, and total. Clean, professional layout — perfect for freelancers, "
            "consultants, agencies, and any small business that bills clients."
        ),
        big_title="Free Invoice Template",
        subtitle="Professional • Auto-Calculating",
        bullets=[
            "Auto subtotal, tax & total",
            "Clean professional layout",
            "Freelancer & small business ready",
        ],
        badge="Invoice",
        keywords="free invoice template, invoice template excel, professional invoice, freelance invoice, small business invoice",
    ),
    dict(
        slug="cash-book-template",
        url="/templates/cash-book-template",
        board="Accounting Templates",
        pin_title="Free Cash Book Template for Excel (Running Balance)",
        pin_desc=(
            "Free cash book template for Excel and Google Sheets. Log receipts and payments, "
            "get a running balance and closing balance automatically. Perfect for shops, small businesses, "
            "clubs, and anyone tracking daily cash."
        ),
        big_title="Free Cash Book Template",
        subtitle="With Running Balance",
        bullets=[
            "Auto running balance",
            "Receipts + payments in one sheet",
            "Closing balance auto-calculated",
        ],
        badge="Cash book",
        keywords="cash book template, cash book excel, daily cash book, small business accounting, cashbook",
    ),
    dict(
        slug="profit-and-loss-statement",
        url="/templates/profit-and-loss-statement",
        board="Accounting Templates",
        pin_title="Free Profit and Loss Statement Template for Excel",
        pin_desc=(
            "Free profit and loss (P&L) statement template for Excel. Revenue, COGS, gross profit, "
            "operating expenses, and net profit — all formulas built in. Perfect for small businesses, "
            "startups, and freelancers preparing for tax filing or loan applications."
        ),
        big_title="Profit & Loss Statement",
        subtitle="Free Excel Template",
        bullets=[
            "Revenue, COGS, gross profit built in",
            "Auto-calculates net profit",
            "Tax filing & loan-application ready",
        ],
        badge="P&L statement",
        keywords="profit and loss statement, profit and loss template excel, p&l statement, income statement, small business",
    ),
    dict(
        slug="business-expense-tracker",
        url="/templates/business-expense-tracker",
        board="Accounting Templates",
        pin_title="Free Business Expense Tracker Spreadsheet for Excel",
        pin_desc=(
            "Free business expense tracker template for Excel and Google Sheets. Log every expense once — "
            "monthly summary by category, grand total, and transaction count update automatically. "
            "Perfect for freelancers, small businesses, and startups."
        ),
        big_title="Expense Tracker",
        subtitle="For Small Business & Freelancers",
        bullets=[
            "Auto monthly summary (SUMIF)",
            "Built-in category dropdown",
            "Tax-ready categories included",
        ],
        badge="Expense tracker",
        keywords="business expense tracker, expense tracker excel, small business expenses, free spreadsheet, expense template",
    ),
    dict(
        slug="salary-slip-template",
        url="/templates/salary-slip-template",
        board="Payroll Templates",
        pin_title="Free Salary Slip Template for Excel (Auto Net Pay)",
        pin_desc=(
            "Free salary slip / pay slip template for Excel. Earnings, deductions (EPF, ESI, TDS), and net pay — "
            "all formulas ready. Perfect for small businesses and HR handling monthly payroll in India."
        ),
        big_title="Free Salary Slip Template",
        subtitle="For Excel — Auto Net Pay",
        bullets=[
            "EPF, ESI, TDS sections built in",
            "Net pay auto-calculated",
            "Print or export to PDF",
        ],
        badge="Salary slip",
        keywords="salary slip format, salary slip template excel, pay slip, payslip india, hr payroll",
    ),
    dict(
        slug="vlookup-formula-template",
        url="/templates/vlookup-formula-template",
        board="Excel Guides",
        pin_title="VLOOKUP Practice Template — Free Excel Download",
        pin_desc=(
            "Free VLOOKUP practice template for Excel with real examples. "
            "Product codes, prices, employee IDs — learn exact match, IFERROR, and common mistakes. "
            "Great for anyone learning Excel formulas."
        ),
        big_title="VLOOKUP Practice Template",
        subtitle="Learn Excel's Most-Used Formula",
        bullets=[
            "Real examples: prices, IDs, HR",
            "Exact match + IFERROR patterns",
            "Beginner-friendly setup",
        ],
        badge="Excel formula",
        keywords="vlookup formula, vlookup excel, excel formulas, learn excel, vlookup practice",
    ),
    dict(
        slug="wedding-budget-template",
        url="/templates/wedding-budget-template",
        board="Personal Finance",
        pin_title="Free Wedding Budget Planner Spreadsheet — Excel & Google Sheets",
        pin_desc=(
            "Free wedding budget planner spreadsheet for Excel and Google Sheets. Three linked sheets: "
            "budget overview with category summary and savings tracker, detailed line-item budget across "
            "11 wedding categories (venue, catering, attire, flowers, photo, decor, honeymoon, and more), "
            "and a per-head cost calculator that shows why guest count is the biggest cost lever. "
            "Currency-neutral — works for weddings anywhere."
        ),
        big_title="Wedding Budget Planner",
        subtitle="Free — Excel & Google Sheets",
        bullets=[
            "60+ line items across 11 categories",
            "Per-head cost calculator built in",
            "Savings + deposit tracking",
        ],
        badge="Wedding planner",
        keywords="wedding budget spreadsheet, wedding planner excel, wedding budget template, wedding checklist, wedding costs",
    ),
    dict(
        slug="monthly-budget-template",
        url="/templates/monthly-budget-template",
        board="Personal Finance",
        pin_title="Free Monthly Budget Spreadsheet for Excel & Google Sheets",
        pin_desc=(
            "Free monthly budget spreadsheet for Excel and Google Sheets. Track income, "
            "fixed and variable expenses, savings, and debt payoff — with budgeted vs actual "
            "columns, automatic savings rate, and a 12-month yearly summary. Currency-neutral, "
            "works with $ / € / £ / ₹ or any currency."
        ),
        big_title="Monthly Budget Spreadsheet",
        subtitle="Free — Excel & Google Sheets",
        bullets=[
            "50/30/20 sections built in",
            "Budgeted vs actual tracking",
            "12-month yearly summary",
        ],
        badge="Personal budget",
        keywords="monthly budget template, budget spreadsheet, 50/30/20 budget, personal finance, excel budget",
    ),
    dict(
        slug="rent-receipt-template",
        url="/templates/rent-receipt-template",
        board="Accounting Templates",
        pin_title="Free Rent Receipt Template for HRA in Excel (12-Month Log)",
        pin_desc=(
            "Free rent receipt template in Excel for HRA claims in India. Printable single-month receipt "
            "with landlord PAN, revenue stamp note, mode of payment, and signature block — plus a 12-month "
            "HRA log for the April to March financial year with auto annual total. Perfect for salaried "
            "employees claiming HRA under Section 10(13A)."
        ),
        big_title="Rent Receipt for HRA",
        subtitle="Free Excel Template — India",
        bullets=[
            "Printable single-month receipt",
            "12-month HRA log (auto total)",
            "Landlord PAN + stamp fields ready",
        ],
        badge="HRA receipt",
        keywords="rent receipt format, rent receipt for hra, hra receipt template, house rent receipt, rent receipt excel india",
    ),
]

BLOG_POSTS = [
    dict(
        slug="how-to-create-gst-invoice-in-excel",
        url="/blog/how-to-create-gst-invoice-in-excel",
        board="Excel Guides",
        pin_title="How to Create a GST Invoice in Excel (Step-by-Step)",
        pin_desc=(
            "Step-by-step guide to creating a GST-compliant invoice in Excel. Required fields, "
            "CGST/SGST vs IGST, common mistakes, and a free GST invoice template to download."
        ),
        big_title="Create a GST Invoice in Excel",
        subtitle="Step-by-Step Guide",
        bullets=[
            "All required GST fields explained",
            "CGST/SGST vs IGST cleared up",
            "Common mistakes to avoid",
        ],
        badge="GST guide",
        keywords="how to make gst invoice, gst invoice format, gst invoice in excel, tax invoice india, cgst sgst",
    ),
    dict(
        slug="how-to-make-profit-and-loss-statement-in-excel",
        url="/blog/how-to-make-profit-and-loss-statement-in-excel",
        board="Accounting Templates",
        pin_title="How to Make a Profit and Loss Statement in Excel",
        pin_desc=(
            "Step-by-step guide to building a profit and loss statement in Excel. Revenue, COGS, "
            "gross profit, expenses, net profit — plus a free P&L template to download."
        ),
        big_title="Profit and Loss in Excel",
        subtitle="Step-by-Step Guide",
        bullets=[
            "Revenue → COGS → Gross Profit",
            "Net profit calculation explained",
            "Free template linked inside",
        ],
        badge="P&L guide",
        keywords="how to make profit and loss statement, p&l in excel, income statement, small business accounting",
    ),
    dict(
        slug="how-to-track-business-expenses-in-excel",
        url="/blog/how-to-track-business-expenses-in-excel",
        board="Accounting Templates",
        pin_title="How to Track Business Expenses in Excel (Free Template)",
        pin_desc=(
            "Step-by-step guide to tracking business expenses in Excel. Categories, SUMIF summary, "
            "tax-time preparation, and a free expense tracker template you can download."
        ),
        big_title="Track Business Expenses",
        subtitle="In Excel — Step by Step",
        bullets=[
            "Which categories to use",
            "SUMIF monthly summary",
            "Tax-time preparation tips",
        ],
        badge="Expense guide",
        keywords="track business expenses, small business expenses, expense tracker guide, tax deductions, sumif",
    ),
    dict(
        slug="how-to-make-salary-slip-in-excel",
        url="/blog/how-to-make-salary-slip-in-excel",
        board="Payroll Templates",
        pin_title="How to Make a Salary Slip in Excel (India Format)",
        pin_desc=(
            "Complete guide to creating a monthly salary slip in Excel. Earnings, deductions, EPF, ESI, "
            "TDS, net pay — plus a free salary slip template to download."
        ),
        big_title="Salary Slip in Excel",
        subtitle="India Format — Step by Step",
        bullets=[
            "Earnings & deductions explained",
            "EPF, ESI, TDS calculations",
            "Net pay formula built in",
        ],
        badge="Payroll guide",
        keywords="salary slip in excel, pay slip india, hr payroll, salary slip format, epf esi tds",
    ),
    dict(
        slug="how-to-use-vlookup-formula-in-excel",
        url="/blog/how-to-use-vlookup-formula-in-excel",
        board="Excel Guides",
        pin_title="How to Use VLOOKUP Formula in Excel (with Examples)",
        pin_desc=(
            "Complete VLOOKUP guide — syntax, examples, exact match, IFERROR, common mistakes, "
            "and a free practice template you can download."
        ),
        big_title="Master VLOOKUP in Excel",
        subtitle="Syntax + Examples + Mistakes",
        bullets=[
            "Syntax explained clearly",
            "Exact match vs approximate",
            "Fix #N/A with IFERROR",
        ],
        badge="Excel formula",
        keywords="vlookup formula, vlookup excel, learn vlookup, vlookup examples, excel tutorial",
    ),
    dict(
        slug="how-to-create-self-invoice-under-gst-rcm-in-excel",
        url="/blog/how-to-create-self-invoice-under-gst-rcm-in-excel",
        board="GST Templates",
        pin_title="How to Create a Self Invoice Under GST (RCM) in Excel",
        pin_desc=(
            "Complete guide to raising a self invoice under GST Reverse Charge Mechanism. "
            "When it's mandatory, self invoice vs payment voucher, GSTR-3B reporting, and a free RCM template."
        ),
        big_title="Self Invoice Under GST (RCM)",
        subtitle="Step-by-Step Guide",
        bullets=[
            "When RCM self invoice is required",
            "Self invoice vs payment voucher",
            "GSTR-3B reporting rules",
        ],
        badge="RCM guide",
        keywords="self invoice under gst, rcm gst india, reverse charge mechanism, gst rcm invoice, unregistered dealer",
    ),
    dict(
        slug="how-to-make-wedding-budget-in-excel",
        url="/blog/how-to-make-wedding-budget-in-excel",
        board="Personal Finance",
        pin_title="How to Make a Wedding Budget in Excel (Step-by-Step Planner)",
        pin_desc=(
            "Complete step-by-step guide to making a wedding budget in Excel — total budget, "
            "11 wedding categories, percentage allocations, per-head cost logic, deposit tracking, "
            "common mistakes to avoid, and a free wedding budget planner template to download."
        ),
        big_title="Wedding Budget in Excel",
        subtitle="Step-by-Step Planner Guide",
        bullets=[
            "11 categories with % allocations",
            "Per-head cost logic explained",
            "Free planner template included",
        ],
        badge="Wedding guide",
        keywords="how to make wedding budget, wedding budget guide, wedding planning excel, wedding cost breakdown, wedding budget percentages",
    ),
    dict(
        slug="how-to-make-monthly-budget-in-excel",
        url="/blog/how-to-make-monthly-budget-in-excel",
        board="Personal Finance",
        pin_title="How to Make a Monthly Budget in Excel (Step-by-Step for Beginners)",
        pin_desc=(
            "Beginner-friendly guide to making a monthly budget in Excel — the 50/30/20 rule, "
            "the 5 sections every budget needs, step-by-step instructions, common mistakes to avoid, "
            "and a free monthly budget template to download."
        ),
        big_title="Monthly Budget in Excel",
        subtitle="Beginner Step-by-Step Guide",
        bullets=[
            "50/30/20 rule explained",
            "The 5 sections every budget needs",
            "Free template included",
        ],
        badge="Budget guide",
        keywords="how to make monthly budget, budget in excel, beginner budget, 50/30/20 rule, personal finance guide",
    ),
    dict(
        slug="how-to-create-rent-receipt-for-hra-in-excel",
        url="/blog/how-to-create-rent-receipt-for-hra-in-excel",
        board="Accounting Templates",
        pin_title="How to Create a Rent Receipt for HRA in Excel (India)",
        pin_desc=(
            "Step-by-step guide to creating a rent receipt in Excel for HRA claims in India. "
            "Required fields, landlord PAN rule, revenue stamp rule, HRA exemption calculation, "
            "common mistakes, and a free rent receipt template with 12-month log."
        ),
        big_title="Rent Receipt for HRA",
        subtitle="Step-by-Step Guide (India)",
        bullets=[
            "All required fields explained",
            "Landlord PAN + stamp rules",
            "HRA exemption formula",
        ],
        badge="HRA guide",
        keywords="rent receipt hra, hra claim, rent receipt format, house rent receipt, hra exemption",
    ),
]


def main():
    all_items = [(t, "template") for t in TEMPLATES] + [(p, "blog") for p in BLOG_POSTS]
    for item, kind in all_items:
        filename = f"{item['slug']}.png"
        path = draw_pin(
            title=item["big_title"],
            subtitle=item["subtitle"],
            bullets=item["bullets"],
            badge_text=item["badge"],
            filename=filename,
            kind=kind,
        )
        print(f"Saved: {path}")

    # ---- Content pack ------------------------------------------------------
    print("\n" + "=" * 78)
    print("PINTEREST CONTENT PACK — copy-paste per pin")
    print("=" * 78)
    for item, kind in all_items:
        print("\n" + "-" * 78)
        print(f"FILE:     pinterest-pins/{item['slug']}.png")
        print(f"BOARD:    {item['board']}")
        print(f"TITLE:    {item['pin_title']}")
        print(f"URL:      https://{SITE}{item['url']}")
        print(f"KEYWORDS: {item['keywords']}")
        print("DESCRIPTION:")
        for line in textwrap.wrap(item["pin_desc"], width=76):
            print(f"  {line}")


if __name__ == "__main__":
    main()
