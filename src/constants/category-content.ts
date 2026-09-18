// Per-category rich content (intro, guidance, FAQs, cross-links) rendered on
// the /categories/[slug] pages. Populated categories get full content;
// currently-empty categories get a "coming soon" placeholder that points
// visitors toward the closest populated alternatives.
//
// Add a new key whenever a new template category is seeded in Prisma.

export type CategoryFaq = { question: string; answer: string };

export type CategoryContent = {
  /** Longer version of the DB description, used as the hero subtitle. */
  longDescription: string;
  /** 2-4 paragraphs of intro copy that explain what the category covers and who benefits. */
  intro: string[];
  /** Bullets describing what a good template of this kind should include. Empty for placeholder categories. */
  whatToLookFor: string[];
  /** Category-level FAQs (also emitted as FAQPage JSON-LD). Empty for placeholder categories. */
  faqs: CategoryFaq[];
  /** Slugs of 2-3 related categories to cross-link at the bottom. */
  relatedCategorySlugs: string[];
  /** If true, this category has no templates yet — render coming-soon layout. */
  comingSoon?: boolean;
  /** For coming-soon categories: 1-2 sentences describing what will land here. */
  comingSoonNote?: string;
};

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  "gst-templates": {
    longDescription:
      "Fully-compliant GST invoice, RCM self-invoice, and Indian tax-compliance templates for Excel and Google Sheets — with CGST, SGST, IGST calculations built in.",
    intro: [
      "Under Indian GST law, every registered business must issue invoices in a specific format — with your GSTIN, place of supply, HSN/SAC codes, and the correct CGST/SGST or IGST split. Get the format wrong and your customers can be denied Input Tax Credit; get it right and you stay audit-ready with no extra effort.",
      "These GST templates give you compliant formats out of the box. Every field required by CGST Rule 46 is included, and the tax maths (CGST, SGST, IGST, totals) is done by live formulas — you enter the item, quantity, and rate and the invoice completes itself. Start with the GST Invoice Template for registered sales, or the Self Invoice Format Under GST (RCM) when you buy from an unregistered supplier. All templates work in Excel, Google Sheets, and LibreOffice."
    ],
    whatToLookFor: [
      "Includes all fields mandated by CGST Rule 46 (GSTIN, invoice number, place of supply, HSN/SAC)",
      "Auto-calculates CGST + SGST for intra-state and IGST for inter-state sales",
      "Supports Reverse Charge (RCM) flag for self-invoices from unregistered suppliers",
      "Editable line items with tax-rate column per row (5%, 12%, 18%, 28%)",
      "Amount-in-words field, bank details block, signature space, and clean print layout",
      "Works in Excel, Google Sheets, and LibreOffice without formula loss"
    ],
    faqs: [
      {
        question: "Are these GST templates free to use?",
        answer:
          "Yes. Every template in this category is 100% free to download and use for personal or commercial purposes. No signup, no email, no watermark. You can also modify them for your business branding."
      },
      {
        question: "Is a hand-written or Excel GST invoice legal in India?",
        answer:
          "Yes. GST law does not mandate any specific software — the invoice can be printed, hand-written, or generated from Excel, as long as it contains every mandatory field required by CGST Rule 46 (GSTIN, invoice number, HSN/SAC, taxable value, correct GST split). The format matters, not the tool."
      },
      {
        question: "Do these templates work for both intra-state (CGST + SGST) and inter-state (IGST) sales?",
        answer:
          "The standard GST Invoice Template covers intra-state (CGST + SGST) out of the box. For inter-state IGST, you can either rename the tax column to IGST and use the full rate, or use a dedicated IGST-format variant. The templates are designed to be easy to adapt to either scenario."
      },
      {
        question: "When do I need to raise a self invoice under GST?",
        answer:
          "You must raise a self invoice whenever GST is payable under Reverse Charge Mechanism — typically for purchases from unregistered suppliers, GTA freight, advocate fees, director's remuneration, sponsorship services, or import of services. Use the free Self Invoice Format Under GST (RCM) Excel template in this category."
      }
    ],
    relatedCategorySlugs: ["accounting-templates", "finance-templates", "payroll-templates"]
  },

  "accounting-templates": {
    longDescription:
      "Bookkeeping, invoicing, cash books, profit and loss statements, and receipt templates for small businesses, freelancers, and accountants in Excel and Google Sheets.",
    intro: [
      "Every business needs three basic accounting records: who owes what (invoices), where money went in and out (cash book), and whether the business actually made money (profit and loss). This category gives you a working template for each — with live formulas so totals, balances, and net profit calculate as you enter data.",
      "These templates are designed for small businesses, freelancers, consultants, and anyone who wants clean books without paying for accounting software. Use them stand-alone, or as a pipeline: invoice a client → log the receipt in the cash book → summarise everything at month-end in the P&L."
    ],
    whatToLookFor: [
      "Live formulas — running balance, subtotals, tax, and grand total update automatically",
      "Auditor-friendly columns: date, particulars, voucher/reference, amounts",
      "Sensible starting layout with sample rows you can edit",
      "Supports both cash-based and accrual bookkeeping approaches",
      "Print-ready formatting, save-as-PDF friendly, and clean when handed to an accountant",
      "Works in Excel, Google Sheets, LibreOffice, and Apple Numbers"
    ],
    faqs: [
      {
        question: "Which accounting template should a small business start with?",
        answer:
          "Start with three: an Invoice Template (to bill customers), a Cash Book Template (to record daily receipts and payments with a running balance), and a Profit and Loss Statement (to summarise revenue vs expenses monthly). Together these cover 90% of what a small business needs before graduating to accounting software."
      },
      {
        question: "Do I need Tally or Zoho Books, or is Excel enough?",
        answer:
          "Excel is enough for most businesses under ~200 transactions per month, especially in the first year. Move to accounting software when reconciliation becomes tedious, you need GST return automation, or multiple people edit the books. Until then, well-designed spreadsheet templates give you the same clarity with zero subscription cost."
      },
      {
        question: "Can I use these accounting templates for tax filing?",
        answer:
          "Yes. Print the completed Profit and Loss Statement and Cash Book at year-end to hand to your CA — they contain exactly the columns needed for computing business income under the Income Tax Act. Individual Invoice and Rent Receipt records also serve as source documents."
      },
      {
        question: "Are these templates suitable for accountants and CAs handling client books?",
        answer:
          "Yes. Many CAs use spreadsheet-based cash books and P&L formats for small clients who don't justify full software. These templates are clean, well-labelled, and produce printable, auditor-friendly output."
      }
    ],
    relatedCategorySlugs: ["gst-templates", "finance-templates", "payroll-templates"]
  },

  "finance-templates": {
    longDescription:
      "Budgeting, expense tracking, cash flow, and financial planning spreadsheets for small businesses, freelancers, and personal finance in Excel and Google Sheets.",
    intro: [
      "Finance templates answer the everyday questions: where is my money going, will I have enough cash next month, and how do I plan for the year ahead? This category focuses on practical forecasting and tracking tools — starting with expense trackers that group your spending by category so you can spot waste at a glance.",
      "Whether you're a freelancer wanting to know your monthly burn, a small business owner planning next quarter's expenses, or an individual budgeting household finances, these templates cut the manual work. Everything is formula-driven, so you enter numbers and the summaries update themselves."
    ],
    whatToLookFor: [
      "Category-based grouping so you see spend by area (rent, salaries, marketing, etc.)",
      "SUMIF or pivot-style summaries that update as you enter new rows",
      "Monthly and cumulative views for trend spotting",
      "Category dropdowns to keep data consistent (no typos, no duplicate categories)",
      "Room for both business and personal use (with separation for tax reasons)",
      "Works in Excel, Google Sheets, and LibreOffice"
    ],
    faqs: [
      {
        question: "What is the difference between an expense tracker and a cash book?",
        answer:
          "An expense tracker records only outgoing money grouped by category — useful for seeing where spending goes. A cash book records both inflows (income) and outflows (expenses) chronologically with a running balance — useful for knowing cash on hand at any time. Most businesses use both."
      },
      {
        question: "Which business expenses are tax deductible in India?",
        answer:
          "Under Section 37 of the Income Tax Act, ordinary and necessary business expenses are deductible — rent, utilities, professional fees, marketing, staff salaries, business travel, software subscriptions, and depreciation on business assets. Personal expenses are not, even if paid from the business account. Keep a receipt or invoice for every entry."
      },
      {
        question: "Should I track personal and business finances in the same spreadsheet?",
        answer:
          "No. Keep them completely separate. Mixing personal and business transactions makes tax filing painful, confuses your P&L, and creates problems if the business is ever audited. Use one file for business, a separate file for personal."
      }
    ],
    relatedCategorySlugs: ["accounting-templates", "gst-templates", "payroll-templates"]
  },

  "payroll-templates": {
    longDescription:
      "Salary slip, pay slip, and payroll templates for Indian small businesses and HR teams — with earnings, deductions, EPF, ESI, TDS, and net pay formulas built in.",
    intro: [
      "Under the Payment of Wages Act and various state Shops and Establishments Acts, employers must issue a salary slip to every employee for each pay period showing earnings, statutory deductions, and net pay. This category gives you compliant salary slip and payroll formats you can run manually — no payroll software required.",
      "Ideal for small businesses, agencies, shops, and HR teams handling monthly payroll for a handful of employees. Every template is designed to be printable, PDF-exportable, and clean when submitted to banks (for loan documentation) or during audits."
    ],
    whatToLookFor: [
      "Separate sections for employee details, earnings, deductions, and net pay",
      "Statutory line items shown separately: EPF, ESI, professional tax, TDS",
      "Formulas that auto-calculate gross pay, total deductions, and net pay",
      "Support for common allowances: HRA, conveyance, medical, special allowance",
      "Company header block with logo space and pay period",
      "Print-ready layout that fits on a single A4 page"
    ],
    faqs: [
      {
        question: "Is a salary slip legally required in India?",
        answer:
          "Yes. Under the Payment of Wages Act and state Shops and Establishments Acts, employers must provide a salary slip (or pay slip) to every employee for each pay period showing earnings, deductions, and net pay. Both physical and electronic (PDF) formats are accepted."
      },
      {
        question: "Which deductions must appear on an Indian salary slip?",
        answer:
          "Statutory deductions include Employee Provident Fund (EPF), Employees' State Insurance (ESI) where applicable, professional tax, and TDS (income tax deducted at source). Other deductions such as loan repayments or advances should be listed as separate line items so the employee can verify each one."
      },
      {
        question: "How is net salary calculated?",
        answer:
          "Net salary is gross earnings minus total deductions. Gross earnings usually include basic pay, HRA, conveyance, medical, and other allowances. Deductions include EPF, ESI, professional tax, and TDS. In Excel, set net pay as a simple SUM(earnings) minus SUM(deductions) formula so it updates automatically."
      },
      {
        question: "Can I use a rent receipt template alongside the salary slip for HRA?",
        answer:
          "Yes. To claim HRA exemption, employees typically submit both their salary slip (showing HRA received) and monthly rent receipts (proving rent paid). Our Rent Receipt Template in the Accounting category is designed specifically for this purpose."
      }
    ],
    relatedCategorySlugs: ["hr-templates", "accounting-templates", "finance-templates"]
  },

  "education-templates": {
    longDescription:
      "Excel learning templates, formula practice files, and educational resources for students, teachers, and office professionals learning spreadsheets.",
    intro: [
      "Education templates teach spreadsheet skills by giving you a working file to explore, not a blank page and a manual. Every template in this category is a practical example — real formulas you can inspect, edit, and reuse — for learning the workflows that show up in daily office and business work.",
      "Ideal for students, first-time Excel users, office staff being onboarded, and anyone who learns better by doing than by reading. Start with the VLOOKUP formula practice file — it's the single most-used lookup formula in business spreadsheets."
    ],
    whatToLookFor: [
      "Real, working formulas — not just theory diagrams",
      "Sample data you can edit to test edge cases",
      "Explanatory notes or a guide sheet inside the workbook",
      "Common-mistake examples so you learn what NOT to do",
      "Beginner-friendly labelling and clear structure",
      "Works in Excel, Google Sheets, and LibreOffice"
    ],
    faqs: [
      {
        question: "Which Excel formula should a beginner learn first?",
        answer:
          "Start with SUM, AVERAGE, IF, and VLOOKUP (or its modern replacement XLOOKUP). These four cover ~80% of everyday spreadsheet work — totals, conditional logic, and looking up related information. Once these feel natural, move to SUMIF, COUNTIF, and INDEX + MATCH."
      },
      {
        question: "Should I learn VLOOKUP or XLOOKUP first?",
        answer:
          "Both. VLOOKUP is still used everywhere — on older Excel versions, in files shared with people who don't have Microsoft 365, and in almost every business template. XLOOKUP is the modern, easier replacement (works right-to-left, easier syntax) but is only available on Excel 2021 and Microsoft 365. Knowing VLOOKUP first makes XLOOKUP easy to pick up later."
      },
      {
        question: "Are these templates suitable for schools and colleges?",
        answer:
          "Yes. Teachers and instructors are welcome to use these templates in the classroom, share them with students, or adapt them for exercises and assignments. The templates use real business data patterns so students see how spreadsheet skills apply outside the classroom."
      }
    ],
    relatedCategorySlugs: ["finance-templates", "accounting-templates", "business-templates"]
  },

  "hr-templates": {
    longDescription:
      "How small Indian teams keep attendance, leave, and employee records in Excel — column layouts, COUNTIF formulas, and the payroll files that already sit next to HR work.",
    intro: [
      "A 12-person shop does not need an HRIS. It needs a grid that answers three questions at month-end: who was present, who took leave, and what number goes on the salary slip. The mistake is a WhatsApp group of 'P' and 'A' messages that nobody can total. A single attendance sheet with employee names down the side and calendar dates across the top, plus COUNTIF for Present / Absent / Half-day, is enough to feed payroll.",
      "Mark attendance with a short code list — P, A, L, H, WO — not free text. Free text ('came late', 'half') breaks every COUNTIF. Late arrival belongs in a separate remarks column; it should not overwrite the attendance code. For a 26-day working month, net payable days = COUNTIF(P) + 0.5 × COUNTIF(H). That figure is what the salary slip uses when you prorate a joiner.",
      "Leave balances are a second sheet, not extra columns on attendance. Opening balance + credited leave − approved leave = closing balance. Mixing leave into the daily grid is how shops lose track of casual leave carried into the next year. Until a dedicated attendance workbook is published here, use the Salary Slip template for the pay document and keep the attendance grid in the same folder as that file.",
      "Onboarding checklists (ID proof, bank details, UAN, ESI number) belong on a third tab with a date completed. Do not hide PAN and Aadhaar on the attendance sheet — that file gets printed and left on desks."
    ],
    whatToLookFor: [
      "One code list (P/A/L/H/WO) with data validation so COUNTIF stays accurate",
      "Employee ID, name, and department as locked header columns",
      "Separate leave-balance sheet; do not mix casual leave into daily marks",
      "A remarks column for late entry that does not overwrite the attendance code",
      "Month and year in the header so last year's file is not reused by accident",
      "A payroll-ready payable-days formula you can paste into the salary slip"
    ],
    faqs: [
      {
        question: "Is an Excel attendance sheet legally valid in India?",
        answer:
          "Yes, as a muster roll for a small establishment, provided it is filled daily and retained. Shops and Establishments rules vary by state, but inspectors look for names, dates, and in/out or present-absent marks — not for a branded HR app. Keep the file for at least the period your state requires for wage records."
      },
      {
        question: "How do I calculate payable days for a salary slip?",
        answer:
          "Payable days = number of Present codes + half of Half-day codes. Unpaid leave and absent days drop out. If the employee joined on the 10th, do not COUNTIF the whole month — start the range at the joining date. Then net pay on the salary slip is (monthly CTC / paid days in month) × payable days, or your firm's own proration rule."
      },
      {
        question: "Should biometric logs replace the Excel sheet?",
        answer:
          "Biometric data is a source, not a pay document. Export the month, reconcile exceptions (missed punch, outdoor duty) in Excel, then lock that reconciled sheet. Payroll should never read raw punch logs without a human pass."
      }
    ],
    relatedCategorySlugs: ["payroll-templates", "accounting-templates", "business-templates"]
  },

  "inventory-templates": {
    longDescription:
      "How shops keep a stock register in Excel — SKU, inward, outward, closing stock, and a reorder flag — without warehouse software.",
    intro: [
      "Closing stock is not 'what I think is on the shelf'. It is opening stock + inward − outward, with a physical count at month-end to catch theft and billing errors. An Excel stock register with one row per SKU does that job for a kirana, a spare-parts counter, or a clinic dispensary until volumes justify dedicated inventory software.",
      "Use columns: SKU code, item name, unit (pcs/kg), opening qty, inward qty, outward qty, closing qty (= opening + inward − outward), reorder level, and a flag = IF(closing < reorder, \"REORDER\", \"\"). Never type closing stock by hand if inward and outward exist — that is how two versions of the truth appear. Inward should tie to purchase bills; outward should tie to invoices or a daily sales export.",
      "Negative closing stock means you sold something you never received, or a unit mismatch (pcs vs box). Fix the source document; do not hide the minus with MAX(0, closing). A yellow flag on negatives is more useful than a pretty dashboard.",
      "Physical count belongs on a separate date-stamped sheet. Variance = book closing − counted qty. Large shortages on high-value SKUs are an operations problem, not a formula problem. For the money side of the same shop, use the cash book and GST invoice templates already on this site."
    ],
    whatToLookFor: [
      "Closing stock as a formula, never a typed number",
      "Reorder level per SKU and a visible REORDER flag",
      "Unit of measure on every row (pcs, kg, box) to stop 12-piece-box errors",
      "A physical-count sheet with a variance column",
      "SKU codes that match the HSN you use on GST invoices where possible",
      "Month-end freeze: copy values to an archive tab before starting the next month"
    ],
    faqs: [
      {
        question: "Can Excel replace a barcode inventory system?",
        answer:
          "For under a few hundred SKUs and one location, yes. The failure mode is multiple people editing the same Google Sheet at the billing counter. Use one owner for the register, or switch to software when two counters sell the same SKU at once."
      },
      {
        question: "How often should I do a physical count?",
        answer:
          "Fast movers and high-value items weekly; the full list at least monthly. Count after hours so outward is not moving while you count. Enter counted qty on the count sheet the same night — memory is not a control."
      },
      {
        question: "Where does GST fit into a stock register?",
        answer:
          "The register tracks quantity. Tax sits on the purchase bill and the tax invoice. Do not mix GST amounts into the qty columns. If you need input tax from stock purchases, that belongs in the purchase invoice / GST records, not in closing stock."
      }
    ],
    relatedCategorySlugs: ["accounting-templates", "finance-templates", "gst-templates"]
  },

  "sales-templates": {
    longDescription:
      "How a small sales team tracks pipeline and commissions in Excel — stages, next action dates, and why the invoice file is still the source of booked revenue.",
    intro: [
      "A pipeline spreadsheet is a list of open deals with a stage and a next action date. It is not revenue. Revenue is the tax invoice (or the cash receipt). Mixing 'verbal yes' into the same column as 'GST invoice raised' is how founders think they hit target when the cash book says otherwise.",
      "Use stages you can defend: Lead, Qualified, Proposal sent, Negotiation, Won, Lost. Won must require an invoice number. Amount in pipeline should be exclusive of GST so it matches taxable value on the invoice template. Next action date is a real date; conditional formatting can highlight anything older than seven days.",
      "Commission is a second sheet: invoice number, taxable value, rate %, commission = taxable × rate, paid date. Pay commission on collected invoices if your policy is cash-based — otherwise you will pay out on debtors who never pay. Do not calculate commission on grand total including GST; tax is not your margin.",
      "Until a dedicated pipeline workbook is listed, run pipeline in a simple table and raise every Won deal on the GST Invoice or general Invoice template. The invoice number is the join key between sales talk and books."
    ],
    whatToLookFor: [
      "Stages that end in Won only when an invoice number exists",
      "Taxable value, not GST-inclusive totals, as the pipeline amount",
      "A next-action date with overdue highlighting",
      "Commission on taxable value, with a collected-vs-invoiced switch",
      "One owner for the sheet, or a Google Sheet with a changelog",
      "Lost reason as a short code (price, timing, no-budget) for a monthly review"
    ],
    faqs: [
      {
        question: "Should pipeline include GST?",
        answer:
          "No. Track taxable value. GST is collected for the government. If you pitch ₹1,18,000 including 18% GST, the pipeline amount is ₹1,00,000. That is what lands on the tax invoice and on commission."
      },
      {
        question: "When do I move a deal to Won?",
        answer:
          "When you have issued the invoice, not when the customer said yes on a call. If you issue proforma invoices, keep those in Proposal — a proforma is not a tax invoice and does not belong in GSTR-1."
      }
    ],
    relatedCategorySlugs: ["accounting-templates", "gst-templates", "business-templates"]
  },

  "business-templates": {
    longDescription:
      "Operating cadences for a small firm in Excel — weekly cash, monthly P&L, and a one-page KPI list — using the bookkeeping files already published on TemplateHub.",
    intro: [
      "A business 'dashboard' with twelve charts and no cash figure is decoration. The operating rhythm that actually keeps a small Indian firm alive is: invoice quickly, record cash daily, read a P&L monthly, and know two or three numbers (receivable days, cash on hand, gross margin) without opening Tally.",
      "Weekly: update the cash book, list invoices older than 15 days, and note GST payable if you are monthly. Monthly: complete the profit and loss, reconcile the bank to the cash book, and lock last month's files so they cannot be quietly edited. Quarterly: skim whether one customer is more than 30% of revenue — concentration is a risk even if the P&L looks fine.",
      "Project timelines and meeting notes can live in Excel, but they are not a substitute for the three financial files. If you only have time for one habit, keep the cash book. Businesses fail from cash, not from an unfilled Gantt chart.",
      "Use the Invoice, Cash Book, and Profit and Loss templates as the spine. Add a one-tab KPI sheet with opening cash, closing cash, revenue, and expenses for the month — four numbers, not a BI tool."
    ],
    whatToLookFor: [
      "A weekly cash number taken from the cash book, not from memory",
      "Aged invoices (0–15 / 16–30 / 30+ days) next to the invoice register",
      "A monthly P&L that uses the same revenue figures as the invoice list",
      "Bank reconciliation at least monthly",
      "One page of KPIs, not a dashboard that nobody updates",
      "Locked prior-month copies so history cannot be rewritten"
    ],
    faqs: [
      {
        question: "What is the minimum Excel stack for a new private limited or proprietorship?",
        answer:
          "GST invoice (or self invoice under RCM), cash book, and monthly P&L. Add an expense tracker if the cash book is too noisy. Add a salary slip when you hire. Everything else waits."
      },
      {
        question: "Can I run a Pvt Ltd on Excel alone?",
        answer:
          "You can for books and invoices at low volume. You still need a CA for company filings, and you should move to accounting software when more than one person must post entries at once or when GST return preparation from Excel becomes error-prone."
      }
    ],
    relatedCategorySlugs: ["accounting-templates", "finance-templates", "gst-templates"]
  }
};

/** Safe accessor with a minimal fallback so unknown category slugs don't crash the page. */
export function getCategoryContent(slug: string): CategoryContent {
  return (
    CATEGORY_CONTENT[slug] ?? {
      longDescription: "",
      intro: [],
      whatToLookFor: [],
      faqs: [],
      relatedCategorySlugs: []
    }
  );
}
