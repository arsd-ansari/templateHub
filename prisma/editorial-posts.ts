export type EditorialPost = {
  slug: string;
  title: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
};

export const EDITORIAL_POSTS: EditorialPost[] = [
  {
    slug: "gst-rule-46-invoice-fields-checklist",
    title: "GST Rule 46 Invoice Fields: A Cell-by-Cell Checklist for Excel",
    excerpt:
      "What CGST Rule 46 actually requires on a tax invoice, which cells buyers and CAs check first, and how that maps to a working Excel GST invoice — with an 18% intra-state example.",
    seoTitle: "GST Rule 46 Invoice Fields Checklist for Excel",
    seoDescription:
      "Cell-by-cell GST Rule 46 checklist for Excel tax invoices: GSTIN, place of supply, HSN, CGST/SGST split, and an 18% worked example.",
    content: `A GST tax invoice in Excel is valid only if the **fields** are present — not because the file looks like Tally. Rule 46 of the CGST Rules lists those fields. This checklist is the one used when TemplateHub's GST invoice workbook was laid out: every label on the sheet maps to a rule item, then an 18% intra-state line is used to prove the maths.

This is not legal advice. It is the practical list CAs and AP teams actually reject invoices for.

## The fields that get invoices rejected

Work top to bottom. If a cell is blank, the buyer's ITC is the first thing at risk.

1. **Your legal name and address** — as on the GST registration, not a trading-name-only header.
2. **Your GSTIN** — 15 characters. A missing GSTIN is the fastest rejection.
3. **Invoice number** — unique for the financial year, consecutive, not more than 16 characters. Do not reuse INV-001 next April without a FY prefix (INV-26-001 is safer).
4. **Invoice date** — the date of supply, not the date you remembered to type the file.
5. **Recipient name, address, GSTIN** (if registered). For B2C above the notified threshold you still need enough identity to support the supply.
6. **Place of supply** — the state that decides CGST+SGST vs IGST. Wrong place of supply is how an intra-state sale is billed as IGST (or the reverse).
7. **HSN or SAC** on each line. Description-only lines fail many e-invoice and GSTR-1 mappings later.
8. **Taxable value**, **rate**, and **tax amount** shown separately — not a single "total with tax" cell.
9. **CGST and SGST split** for intra-state, or **IGST** for inter-state. Never both on the same intra-state line.
10. **Amount in words** and a signature / authorised-signatory space.

## Worked example: one 18% intra-state line

Suppose you sell **10 units** at **₹1,200** each, GST **18%**, buyer in the same state.

| Cell | Value |
|---|---|
| Quantity | 10 |
| Rate | 1,200 |
| Taxable value | 12,000 |
| GST rate | 18% |
| CGST 9% | 1,080 |
| SGST 9% | 1,080 |
| Line total | 14,160 |

If you instead type CGST as 18% of 12,000 (₹2,160) and leave SGST blank, the invoice is wrong even though the grand total might still be ₹14,160. The split is the compliance, not just the total.

For a buyer in another state, do **not** split. Charge **IGST 18% = ₹2,160** on the same taxable ₹12,000.

## What Excel must calculate (and what you must type)

Type: description, HSN/SAC, quantity, rate, GST %.  
Formula: taxable = qty × rate; CGST = taxable × (GST% / 2); SGST = the same; total = taxable + CGST + SGST.

Do not hard-code 9% in the formula if the rate cell can be 5% or 12%. A 5% intra-state line is 2.5% + 2.5%. GTA and other special rates are a different document — see the [self invoice format under GST (RCM)](/templates/self-invoice-rcm-template) when you are the recipient under Reverse Charge.

## Place of supply vs your state

- Same state as your GST registration: **CGST + SGST**.
- Different state: **IGST**.
- SEZ / export: usually IGST at 0% with a LUT or IGST paid — do not use the standard intra-state template without changing the tax block.

If you are unsure of the place of supply, stop and check the contract. Filling "Maharashtra" because that is where you sit, when the service is delivered in Karnataka, is how GSTR-1 and GSTR-3B disagree.

## Common Excel-specific failures

- **Merged cells in the item table** — inserting a row breaks SUM.
- **Tax as text** ("1,080") — SUM ignores it. Use numbers with 2 decimal places.
- **Invoice number as a date format** — Excel turns "03-04" into 3 April. Set the number cell to Text before typing.
- **GSTIN in a number format** — leading zeros vanish. GSTIN must be text.

## Download the mapped workbook

The [GST Invoice Template](/templates/gst-invoice-template) already has these labels. The [step-by-step GST invoice guide](/blog/how-to-create-gst-invoice-in-excel) walks through building the same structure from a blank sheet. If the supplier is unregistered and tax is under RCM, do not use this tax invoice at all.

## FAQ

### Is an Excel GST invoice legal?
Yes, if Rule 46 fields are present. The law does not require a particular software.

### Do I need e-invoicing as well?
If your turnover is above the current e-invoice threshold, you still need IRN/QR in addition to a well-formed invoice. Excel can feed the data; it does not replace the IRP.

### Can I edit an invoice after sending it?
Issue a credit note / debit note. Overwriting a sent PDF and keeping the same invoice number is how series integrity breaks.`
  },
  {
    slug: "rcm-self-invoice-gta-freight-worked-example",
    title: "RCM Self Invoice Worked Example: GTA Freight of ₹18,500",
    excerpt:
      "A full Reverse Charge self-invoice example for Goods Transport Agency freight — 5% GST, cash payment to government, GSTR-3B tables, and the Excel cells to fill.",
    seoTitle: "RCM Self Invoice Example: GTA Freight ₹18,500",
    seoDescription:
      "Worked RCM self invoice for GTA freight of ₹18,500 at 5% GST: CGST/SGST split, cash ledger, GSTR-3B 3.1(d) and 4A(3), Excel steps.",
    content: `Most RCM articles stop at "raise a self invoice". This one runs a **real freight bill** through the numbers so you can copy the same arithmetic into Excel.

Scenario: you are a registered business in one state. An **unregistered GTA** moves goods for you. The freight invoice (plain, no GSTIN) is **₹18,500**. You and the GTA agree the **5%** rate without ITC to the transporter (the common small-GTA case). You are the recipient: GST is yours under Reverse Charge.

This is a worked example for learning, not a ruling on your exact GTA notification. Confirm the rate (5% vs 12%) with your CA.

## Step 1 — decide that a self invoice is required

The GTA has **no GSTIN** on the freight bill. You cannot take a tax invoice from them. Under Section 31(3)(f) you issue a **self invoice** to yourself. You will also need a **payment voucher** when you pay the ₹18,500 to the GTA (Section 31(3)(g)). Two documents, one supply.

## Step 2 — the tax maths

Freight (taxable value) = **₹18,500**  
GST 5% = **₹925**  
Intra-state split:

| Component | Amount |
|---|---|
| Taxable value | 18,500.00 |
| CGST 2.5% | 462.50 |
| SGST 2.5% | 462.50 |
| GST total | 925.00 |
| Amount payable to GTA | 18,500.00 |
| Amount payable to government (cash ledger) | 925.00 |

You do **not** deduct ₹925 from the GTA. You pay the GTA the freight they billed. You pay ₹925 to the government from the **electronic cash ledger**. Existing ITC cannot be used to discharge this RCM.

If the GTA were in another state, you would charge **IGST 5% = ₹925** instead of the CGST/SGST split. Same cash outflow.

## Step 3 — what goes on the self invoice

- Invoice series of your own: **SI-014** (do not use your sales INV- series).
- Date: the date you received the service (the delivery date on the LR), not the date you opened Excel.
- Recipient block: **your** name, address, GSTIN (you are issuing it).
- Supplier block: GTA name and address, **GSTIN blank**.
- Reverse Charge: **Yes**.
- Line: "Road freight — GTA", HSN/SAC as applicable for GTA, qty 1, rate 18,500, GST 5%.
- Totals as in the table above.

Download the mapped file: [self invoice format under GST (RCM)](/templates/self-invoice-rcm-template).

## Step 4 — GSTR-3B (same tax period)

- **Table 3.1(d)** — inward supplies liable to Reverse Charge: **₹18,500** taxable, **₹925** tax.
- **Table 4A(3)** — ITC on inward supplies under RCM: **₹925**, once the tax is paid and the self invoice exists.

If you report 3.1(d) and forget 4A(3), you have paid tax and given up the credit. If you claim 4A(3) without paying in cash, the credit is the one that gets questioned.

## Step 5 — payment voucher

When you NEFT the GTA ₹18,500, raise a payment voucher with the same supplier details, amount, and a reference to SI-014. Keep LR copy + self invoice + voucher + bank proof in one folder. That bundle is what a GST officer asks for, not a screenshot of the Excel total.

## Mistakes this example is designed to prevent

- Charging 18% because "everything is 18%". GTA is often 5% in this structure.
- Putting the GTA's name in the **Bill To** box (that would look like you sold freight).
- Using INV- numbers so RCM disappears inside sales.
- Paying ₹925 by reducing ITC instead of cash ledger.
- Skipping the payment voucher because "the NEFT is enough". The NEFT is evidence of payment; the voucher is the prescribed document.

## FAQ

### Can I take ITC of the ₹925?
Yes, subject to the usual ITC conditions, after you pay the RCM in cash and hold the self invoice. Report it in Table 4A(3).

### The GTA gave me a consolidated monthly bill. One self invoice or many?
One self invoice per bill/document you treat as the supply, with a clear date. Do not merge two months to "save" a number in the SI- series.

### Where is the longer legal explainer?
[Self invoice format under GST (RCM) in Excel](/blog/how-to-create-self-invoice-under-gst-rcm-in-excel).`
  },
  {
    slug: "excel-vs-google-sheets-gst-invoices",
    title: "Excel vs Google Sheets vs LibreOffice for GST Invoices (What We Tested)",
    excerpt:
      "First-hand notes from opening TemplateHub GST workbooks in Excel 365, Google Sheets, and LibreOffice — what survives, what breaks, and how we design around it.",
    seoTitle: "Excel vs Google Sheets for GST Invoices: Test Notes",
    seoDescription:
      "What broke when we tested GST invoice Excel files in Google Sheets and LibreOffice: currency, print, GSTIN as text, and formulas we refuse to use.",
    content: `TemplateHub files are saved as **.xlsx** from Excel, then opened in **Google Sheets** and **LibreOffice Calc** before they are published. This page is the failure log — not a marketing comparison. If you only use one app, skip to the section that matches it.

I (Arshad Ansari) run this pass on every GST and bookkeeping workbook. The GST invoice and RCM self invoice both had to be redesigned once because of Sheets locale and once because of LibreOffice named ranges.

## What works in all three

- \`=B12*C12\` for taxable value.
- \`=D12*(E12/2)\` for CGST when E12 is the GST rate (0.18, not 18 — see below).
- \`=SUM()\` on a contiguous tax column.
- Data validation from a **cell range** on the same sheet (5%, 12%, 18%, 28%).

## Failure 1 — GST rate as 18 instead of 0.18

Excel will happily compute \`taxable * 18 / 2\` if you write it that way. In Sheets, people type **18** in a cell formatted as percent and get 1800%. Our sheets treat the GST rate cell as **0.18** with a percent format, and the formula is always \`taxable * rate / 2\`. If you type 18, the sample row looks absurd on purpose so you notice.

## Failure 2 — GSTIN stored as a number

Excel drops the 15th character or scientific-notates the GSTIN. Sheets is slightly more forgiving but still corrupts values that look like numbers. The GSTIN cells are **formatted as Text** before any sample GSTIN is typed. If you paste from a portal, paste with Text formatting on, or prefix with an apostrophe.

## Failure 3 — ₹ in the formula

\`="₹"&TEXT(G20,"#,##0.00")\` looks fine in Excel with an Indian locale. Sheets on a US account shows \`$ \` or breaks the TEXT pattern. Amount-in-words on our files is a **manual cell** plus a numeric grand total. That is less magical and survives locale changes.

## Failure 4 — Print titles and A4

Excel keeps **Print Titles** (repeat header row). Sheets ignores Excel print titles until you set them under File → Print. LibreOffice keeps page style but often loses Fit-to-1-page. We keep the invoice inside ~40 rows and avoid a second header table so a default A4 print from Sheets still fits.

## Failure 5 — Excel Tables and structured references

\`=SUM(Invoice[CGST])\` is pleasant in Excel and **does not reliably open** in LibreOffice. TemplateHub item blocks are ordinary ranges. Insert a row **inside** the block (not below the SUM) so totals still cover the new line.

## Failure 6 — VBA and macros

Macros are blocked in Sheets and scare email filters. There are none. If a "GST Excel" you downloaded elsewhere asks you to Enable Content, do not use it on a machine with your GST portal password saved.

## Which app should you standardise on?

| Situation | Use |
|---|---|
| You already file from Excel and print from Windows | Excel — native file |
| Two people edit the same invoice file | Google Sheets — one link, download .xlsx when sending PDF |
| Air-gapped office, no Microsoft licence | LibreOffice — open the same .xlsx |
| Customer demands a PDF | Any app → export PDF; do not send a live sheet they can edit |

For the publishing checklist behind these tests, see [how we build templates](/how-we-build).

## FAQ

### Will Google Sheets change my CGST formula?
Simple multiply/divide and SUM survive. What does not survive is Excel-only functions and structured Table names.

### Can I convert to Google Sheets and keep using it there?
Yes. File → Open in Sheets, then **Download → Microsoft Excel (.xlsx)** if you need to send a file. Re-check GSTIN cells after the round trip.

### Why not Google Sheets-native files?
Search users still type "Excel template". One .xlsx that opens in three apps is the distribution format. Native Sheets would be a second artefact to keep in sync.`
  },
  {
    slug: "three-excel-files-new-indian-business-needs",
    title: "The Three Excel Files a New Indian Business Actually Needs",
    excerpt:
      "Invoice, cash book, and P&L — what each file is for, a sample month with rupee figures, and when to add GST, salary slips, or accounting software.",
    seoTitle: "Three Excel Files Every New Indian Business Needs",
    seoDescription:
      "Invoice, cash book, and profit and loss in Excel: a sample month of figures for a new Indian firm, plus when to add GST and payroll files.",
    content: `A new proprietorship does not fail because it lacked a 12-tab "startup OS". It fails because nobody can say what was sold, what cash remains, and whether the month made money. Three Excel files answer those three questions. Everything else waits.

I use this stack when someone asks "what should I download first?" from TemplateHub.

## File 1 — Invoice (who owes you)

If you are GST-registered for **outward supplies**, that file is the [GST invoice](/templates/gst-invoice-template). If you only bill unregistered foreign clients, the [general invoice](/templates/invoice-template) is enough. If you **buy** from unregistered suppliers under RCM, that is a fourth file (self invoice) — do not mix it into sales invoices.

**Sample month:** 8 invoices, taxable ₹2,40,000, GST 18% collected ₹43,200, grand total ₹2,83,200. That ₹43,200 is not revenue. It is tax you will pay (net of ITC) on GSTR-3B.

## File 2 — Cash book (what money did)

The [cash book](/templates/cash-book-template) lists receipts and payments with a running balance. Opening cash 1 Apr: **₹80,000**. Receipts from customers (including GST): **₹2,10,000** (some invoices still unpaid). Payments: rent ₹25,000, stock ₹90,000, freight ₹18,500, drawings ₹20,000. Closing cash should be a formula, not a typed guess.

If closing cash is ₹1,36,500 on the sheet and ₹1,20,000 in the bank plus till, you have a reconciliation problem — not a "P&L problem". Find it before you file.

## File 3 — Profit and loss (did we make money)

The [P&L](/templates/profit-and-loss-statement) uses **taxable revenue**, not collections. Revenue for the sample month is ₹2,40,000 even if only ₹2,10,000 came in. Purchases and expenses follow the same accrual idea if you are not purely cash. Gross profit = revenue − direct costs. Net profit is after rent, freight, and other opex. Drawings are **not** an expense; they sit below profit.

A founder who reads only the bank app will think a high-collection month is a high-profit month. The P&L exists to stop that.

## What to add in month two or three

- **GST registered + unregistered inward supplies:** [RCM self invoice](/templates/self-invoice-rcm-template).
- **Spending too noisy in the cash book:** [expense tracker](/templates/business-expense-tracker).
- **First employee:** [salary slip](/templates/salary-slip-template) plus an attendance grid (see the HR category guide).
- **HRA on that salary:** [rent receipt](/templates/rent-receipt-template).

## When Excel is no longer enough

Move to accounting software when two people must post at once, when GSTR-1 has more invoices than you will retype, or when the CA spends more time cleaning Excel than reviewing it. Until then, three clean files beat one messy "accounts" workbook with 20 hidden sheets.

## FAQ

### Should the cash book include GST?
Record the **bank amount** that actually moved. Keep GST analysis on the invoice and on the return. Do not try to make the cash book into GSTR-3B.

### Cash basis or accrual?
If you are small and everything is cash-on-delivery, cash book ≈ P&L. The moment you give 15-day credit, you need invoices and a P&L that recognise sales when billed.

### Where is the longer P&L tutorial?
[How to make a profit and loss statement in Excel](/blog/how-to-make-profit-and-loss-statement-in-excel).`
  },
  {
    slug: "how-templatehub-checks-a-spreadsheet-before-publish",
    title: "How TemplateHub Checks a Spreadsheet Before It Goes Live",
    excerpt:
      "The publishing checklist behind every TemplateHub download: one job per file, Rule 46 or RCM fields, three-app formula tests, sample rows, and a written explainer.",
    seoTitle: "How TemplateHub Reviews Excel Templates Before Publishing",
    seoDescription:
      "Inside TemplateHub's spreadsheet QA: legal fields, Excel/Sheets/LibreOffice tests, sample GST numbers, A4 print, and why we reject clone pages.",
    content: `This site is easy to mistake for a folder of random Excel files. The difference is a **reject list**. If a workbook fails the checks below, it does not get a URL. The same list is written in prose on [how we build templates](/how-we-build); this article is the "why" with examples from files that are already public.

I am Arshad Ansari. I design the sheets. There is no offshore bulk-upload queue.

## One job per workbook

An early draft of the GST invoice had a cash-receipt column "because it would be useful". It made the document look like a cash book, and the place-of-supply box got shoved into a comment. That draft was deleted. The live GST invoice bills a supply. The cash book records money. The RCM file is only for inward Reverse Charge.

If you need both, download both. Do not ask one PDF to be three legal documents.

## Legal fields before colours

The GST invoice was labelled to **Rule 46** first: GSTIN, invoice number, place of supply, HSN, tax split. Teal headers came last. If a pretty template is missing place of supply, it is not a GST invoice.

The RCM file was labelled to **Section 31(3)(f)**: recipient GSTIN, blank supplier GSTIN, Reverse Charge = Yes, separate SI- numbering.

## Arithmetic you can audit without opening the formula bar

On the GST sample row, 10 × 1,200 = 12,000 taxable; 18% → 1,080 + 1,080. On the RCM GTA example, 18,500 × 5% = 925, split 462.50 + 462.50. If a reviewer cannot reproduce those numbers with a phone calculator, the sheet is not ready.

## Three applications

Excel 365 is the source. Google Sheets must not turn GSTIN into a number. LibreOffice must not drop SUM because we used an Excel Table. Those two bugs already happened; they are documented in [Excel vs Google Sheets for GST invoices](/blog/excel-vs-google-sheets-gst-invoices).

## Sample data that looks like a mistake if you skip the guide

Placeholders use **[square brackets]**. A GSTIN-shaped sample is obviously fake. We do not ship a real GSTIN of any business.

## A page that says when not to use the file

The GST invoice page tells you **not** to use it for unregistered RCM. That sentence exists because people Google "GST invoice" when they needed a self invoice. Internal links are part of quality, not SEO decoration.

## What we will not publish

- Fifty clones of the same invoice with a different H1.
- Locked sheets that require a password from a Telegram channel.
- Macros.
- "Coming soon" category URLs with no article. Empty HR/inventory/sales/business URLs were rewritten into actual Excel practice guides even before a downloadable file exists.

## FAQ

### Who do I email if a formula is wrong?
The [contact page](/contact). Name the URL and whether you opened the file in Sheets.

### Do you take guest templates?
Only if they pass this checklist and I can maintain them. Unmaintained guest files become the thin pages AdSense already rejected us for once.`
  },
  {
    slug: "excel-attendance-sheet-for-a-12-person-shop",
    title: "Excel Attendance Sheet for a 12-Person Shop (Codes, COUNTIF, Payable Days)",
    excerpt:
      "Build a month's attendance grid for a small shop: P/A/L/H codes, COUNTIF payable days, late remarks, and how that number reaches the salary slip.",
    seoTitle: "Excel Attendance Sheet for Small Shops (COUNTIF Guide)",
    seoDescription:
      "How to make an Excel attendance sheet for 12 employees: attendance codes, COUNTIF, payable days, and linking to a salary slip.",
    content: `A shop with 12 people does not need an HR app to know who came to work. It needs a grid that a supervisor can fill in two minutes at closing, and a payable-days number that matches the salary slip. This is the layout I recommend. A downloadable TemplateHub attendance file will follow the same rules when it ships; you can build it today in a blank workbook.

## Layout

- **Rows 1–3:** business name, month (e.g. September 2026), working days in month (26).
- **Column A:** employee code.
- **Column B:** name.
- **Columns C onward:** one column per calendar date (1–30/31).
- **Last three columns:** count of P, count of H, **payable days**.

Freeze column B so names stay visible when you scroll to the 28th.

## Codes (data validation only)

| Code | Meaning |
|---|---|
| P | Present, full day |
| A | Absent, unpaid |
| L | Paid leave (casual/earned as per your policy) |
| H | Half day |
| WO | Weekly off |
| PH | Paid public holiday |

Do **not** allow "late" as a code. Late is a remark. If you mark late as A, you will underpay people who worked seven hours.

## Formulas

For employee row 5, dates in C5:AG5:

- Present days: \`=COUNTIF(C5:AG5,"P")\`
- Half days: \`=COUNTIF(C5:AG5,"H")\`
- Payable days: \`=COUNTIF(C5:AG5,"P")+COUNTIF(C5:AG5,"L")+COUNTIF(C5:AG5,"PH")+COUNTIF(C5:AG5,"WO")+0.5*COUNTIF(C5:AG5,"H")\`

Adjust the payable formula to **your** policy. Many shops do **not** pay weekly offs as payable days; they treat WO as a calendar marker only. If WO is unpaid as a "day", remove it from payable days and keep it for rostering.

**Example:** Priya has 22 P, 2 H, 2 WO, 2 A. If WO counts as paid rest: payable = 22 + 1 + 2 = **25**. If WO does not count: payable = 22 + 1 = **23**. Write the policy in row 2 of the sheet so the formula and the owner agree.

## Joining mid-month

Do not COUNTIF the whole month. Either leave pre-joining dates blank (and do not use a default P) or start the COUNTIF range at the joining date. A blank is better than a WO you invented.

## Late arrivals

Column **Remarks** or a second grid: date, employee, time in. Do not overwrite P. Payroll can apply a late deduction as a **line on the salary slip**, not by turning a present day into a half day unless that is written policy.

## Month-end

1. Lock the sheet (or export PDF) on the 1st of the next month.
2. Copy payable days onto each [salary slip](/templates/salary-slip-template).
3. Keep the file for the period your state's Shops and Establishments rules require.

## What this sheet is not

It is not a biometric system. It is not a leave-encashment register (put opening/closing leave on **another** tab). It is not a Form 16. Keep PAN and Aadhaar off this printout.

## FAQ

### Can I use Google Sheets on a phone at the counter?
Yes. Data validation still works. Give the supervisor edit access to one tab only.

### How do I handle outdoor duty?
Add code **OD** and decide whether OD is payable like P. Document it in the header. Do not reuse P for outdoor — you will lose the audit trail.

### More HR practice notes
See the [HR templates category](/categories/hr-templates) for leave-balance structure and why attendance should stay separate from identity documents.`
  }
];
