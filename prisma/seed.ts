import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils";
import { EDITORIAL_POSTS } from "./editorial-posts";

const prisma = new PrismaClient();

const templateCategories = [
  ["Accounting Templates", "accounting-templates", "Calculator", "Bookkeeping, ledgers, invoices, reconciliation, and financial records."],
  ["Finance Templates", "finance-templates", "ChartNoAxesCombined", "Budgeting, forecasting, loan, investment, and financial planning sheets."],
  ["GST Templates", "gst-templates", "ReceiptText", "GST invoices, returns, tax summaries, and Indian compliance spreadsheets."],
  ["Payroll Templates", "payroll-templates", "WalletCards", "Salary slips, payroll registers, deductions, and monthly payroll workflows."],
  ["HR Templates", "hr-templates", "Users", "Attendance, leave, performance, onboarding, and employee management."],
  ["Inventory Templates", "inventory-templates", "Boxes", "Stock tracking, reorder planning, warehouse logs, and inventory reports."],
  ["Sales Templates", "sales-templates", "TrendingUp", "Sales pipelines, targets, commission tracking, and CRM spreadsheets."],
  ["Business Templates", "business-templates", "BriefcaseBusiness", "Operations, planning, proposals, KPIs, and business management."],
  ["Education Templates", "education-templates", "GraduationCap", "Student trackers, lesson plans, gradebooks, and academic resources."]
] as const;

const templateTitles = [
  "GST Invoice Template", "Attendance Sheet Template", "Monthly Expense Tracker", "Balance Sheet Template", "Profit and Loss Statement",
  "Cash Flow Statement", "Payroll Register Template", "Salary Slip Template", "Employee Leave Tracker", "Inventory Management Template",
  "Stock Reorder Template", "Sales Pipeline Tracker", "Sales Commission Calculator", "Business Budget Template", "Project Timeline Template",
  "Student Gradebook Template", "Lesson Plan Template", "Purchase Order Template", "Vendor Payment Tracker", "Accounts Receivable Tracker",
  "Accounts Payable Tracker", "Bank Reconciliation Template", "Petty Cash Log", "Fixed Asset Register", "Depreciation Schedule",
  "Loan Amortization Calculator", "Investment Portfolio Tracker", "Personal Budget Template", "Business Forecast Template", "GST Return Summary",
  "GST Tax Invoice Format", "Payroll Deduction Calculator", "Timesheet Template", "Employee Onboarding Checklist", "Performance Review Template",
  "Warehouse Stock Ledger", "Inventory Audit Checklist", "Daily Sales Report", "Retail Sales Tracker", "Quotation Template",
  "Business Plan Financials", "KPI Dashboard Template", "Meeting Minutes Template", "CRM Lead Tracker", "Marketing Calendar Template",
  "Class Attendance Register", "Exam Result Analysis", "School Fee Tracker", "Study Planner Template", "Training Schedule Template"
];

const blogTitles = [
  "How to Create a GST Invoice in Excel",
  "Attendance Sheet Excel Tutorial for HR Teams",
  "Best Excel Templates for Small Business Accounting",
  "How to Build a Monthly Budget Spreadsheet",
  "Payroll Register Format Explained",
  "Inventory Tracking in Excel: A Practical Guide",
  "Sales Pipeline Spreadsheet Best Practices",
  "Profit and Loss Statement Template Guide",
  "Excel Formulas Every Finance Team Should Know",
  "How to Use Conditional Formatting for Dashboards",
  "GST Invoice Fields Required for Indian Businesses",
  "How to Track Employee Leave in Excel",
  "Accounts Receivable Aging Report in Excel",
  "Cash Flow Forecasting With Excel Templates",
  "Creating a Student Gradebook in Excel",
  "How to Analyze Exam Results in Excel",
  "Purchase Order Template Workflow",
  "Business KPI Dashboard Setup Guide",
  "Excel Templates for Freelancers and Consultants",
  "Preparing Data for Future AI Spreadsheet Tools"
];

const blogCategories = [
  ["Excel Guides", "excel-guides", "Tutorials for practical spreadsheet workflows."],
  ["Accounting", "accounting", "Accounting workflows, reports, and template usage."],
  ["Finance", "finance", "Finance planning, budgeting, and forecasting."],
  ["HR", "hr", "Human resources spreadsheets and people operations."],
  ["Business", "business", "Business operations, sales, and management resources."]
] as const;

function pickCategory(title: string) {
  const map: Record<string, string> = {
    gst: "gst-templates",
    invoice: "gst-templates",
    attendance: "hr-templates",
    employee: "hr-templates",
    leave: "hr-templates",
    payroll: "payroll-templates",
    salary: "payroll-templates",
    inventory: "inventory-templates",
    stock: "inventory-templates",
    warehouse: "inventory-templates",
    sales: "sales-templates",
    crm: "sales-templates",
    student: "education-templates",
    lesson: "education-templates",
    school: "education-templates",
    exam: "education-templates",
    cash: "finance-templates",
    loan: "finance-templates",
    investment: "finance-templates",
    budget: "finance-templates",
    accounts: "accounting-templates",
    balance: "accounting-templates",
    profit: "accounting-templates",
    bank: "accounting-templates"
  };
  const lowered = title.toLowerCase();
  return Object.entries(map).find(([key]) => lowered.includes(key))?.[1] || "business-templates";
}

// Demo templates/posts are inserted only when SEED_DEMO=true (local dev).
// Production runs `npm run db:seed` with the flag unset and gets a clean site:
// search indexes + admin user + categories, ready for the admin panel.
const seedDemo = process.env.SEED_DEMO === "true";

async function main() {
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS template_search_idx ON "Template" USING GIN (to_tsvector('english', coalesce("title",'') || ' ' || coalesce("description",'') || ' ' || coalesce("content",'')))`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS blog_post_search_idx ON "BlogPost" USING GIN (to_tsvector('english', coalesce("title",'') || ' ' || coalesce("excerpt",'') || ' ' || coalesce("content",'')))`
  );

  const adminEmail = process.env.ADMIN_EMAIL || "admin@excelhub.com";
  const adminPasswordHash = await hash(process.env.ADMIN_PASSWORD || "ChangeMe123!", 12);
  // Re-hash on every seed so changing ADMIN_PASSWORD in .env and re-seeding
  // actually updates the login, whether or not the admin already exists.
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", passwordHash: adminPasswordHash },
    create: {
      email: adminEmail,
      name: "TemplateHub Admin",
      role: "ADMIN",
      passwordHash: adminPasswordHash
    }
  });

  for (const [name, slug, icon, description] of templateCategories) {
    await prisma.templateCategory.upsert({
      where: { slug },
      update: { name, icon, description },
      create: { name, slug, icon, description }
    });
  }

  for (const [name, slug, description] of blogCategories) {
    await prisma.blogCategory.upsert({
      where: { slug },
      update: { name, description },
      create: { name, slug, description }
    });
  }

  // --- Real, hand-made content (always seeded, not demo) ----------------------
  // Genuine templates we have actually built and verified. The downloadable
  // .xlsx files live in public/templates/ (shipped with the site).
  const gstCategory = await prisma.templateCategory.findUnique({
    where: { slug: "gst-templates" }
  });
  if (gstCategory) {
    const gstData = {
      title: "GST Invoice Template",
      description:
        "A free, ready-to-use GST tax invoice template for Excel and Google Sheets. CGST and SGST are calculated automatically — just enter quantity, rate, and GST rate. Includes every field required by Indian GST law.",
      content:
        "A GST invoice is the document a registered business issues for a taxable sale in India — and under GST law it must contain specific details, or your buyer can be denied input tax credit. This template gives you a compliant format that does the tax maths for you. It is built for intra-state sales, where GST splits into CGST and SGST at half the rate each (an 18% item carries 9% + 9%). Enter the quantity, rate, and GST rate for each item, and the sheet calculates the taxable value, both taxes, and the grand total automatically. For inter-state sales you would instead charge a single IGST at the full rate. If you received goods or services from an **unregistered supplier** and GST is payable under Reverse Charge, do not use this tax invoice — download the [self invoice format under GST (RCM) Excel template](/templates/self-invoice-rcm-template) instead.",
      fileUrl: "/files/gst-invoice-template.xlsx",
      thumbnailUrl: null,
      categoryId: gstCategory.id,
      seoTitle: "Free GST Invoice Template for Excel (Auto CGST & SGST)",
      seoDescription:
        "Download a free GST invoice template for Excel and Google Sheets. Auto-calculates CGST, SGST and totals, with every GST-mandatory field included.",
      features: [
        "Auto-calculates CGST, SGST and totals",
        "Includes every GST-mandatory field (CGST Rule 46)",
        "Works in Excel, Google Sheets and LibreOffice",
        "Editable, printable and save-as-PDF ready",
        "Sample items included to follow"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Fill in your business details — replace every [ ] placeholder (name, address, GSTIN, state).",
        "Add the invoice number, date, and place of supply in the box on the right.",
        "Enter the customer's details in the Bill To (and Ship To if different) box.",
        "Add each item's description, HSN/SAC, quantity, rate, and GST rate — taxes fill in automatically.",
        "Check the Grand Total, write the amount in words, add bank details, and sign.",
        "Save as PDF before sending so the figures cannot be changed."
      ],
      faqs: [
        { question: "Is this GST invoice template free?", answer: "Yes. It is free to download and edit for personal and business use." },
        { question: "Does it work in Google Sheets?", answer: "Yes. Upload the file to Google Sheets and the formulas carry over; the calculations work the same." },
        { question: "How do I make an inter-state (IGST) invoice?", answer: "For a sale to a different state you charge one IGST at the full GST rate instead of splitting into CGST + SGST. Rename a tax column to IGST and use the full rate." },
        { question: "What GST rate should I use?", answer: "It depends on the item — common slabs are 5%, 12%, 18%, and 28%. The template works with any rate you enter." },
        {
          question: "What if the supplier is unregistered?",
          answer:
            "If GST is payable by you under Reverse Charge, you must issue a self invoice — not a regular GST tax invoice. Download the [RCM invoice format / self invoice](/templates/self-invoice-rcm-template), then the [RCM payment voucher](/templates/rcm-payment-voucher-template) when you pay."
        }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "gst-invoice-template" },
      update: {
        fileUrl: gstData.fileUrl,
        seoTitle: gstData.seoTitle,
        seoDescription: gstData.seoDescription,
        content: gstData.content,
        faqs: gstData.faqs
      },
      create: { slug: "gst-invoice-template", ...gstData }
    });

    const selfInvoiceData = {
      title: "RCM Invoice Format in Excel — Self Invoice Under GST",
      description:
        "Free RCM invoice format in Excel and Google Sheets. Download this self invoice / RCM bill format for unregistered dealer purchases. Auto-calculates CGST, SGST, and totals.",
      content: `This is a free **RCM invoice format in Excel** — the self invoice format under GST for Reverse Charge (RCM). Accountants also search for it as an **RCM bill format** or an **unregistered dealer invoice format**. Use it when you receive goods or services from an unregistered supplier and GST is payable by you as the recipient. Enter description, HSN/SAC, quantity, rate, and GST rate — Taxable Value, CGST, SGST, and Grand Total calculate automatically.

Under Section 31(3)(f) of the CGST Act, a registered business that receives goods or services from an **unregistered supplier** (where GST is payable under Reverse Charge Mechanism) must issue a **self invoice** to itself.

## When you need to issue a self invoice (RCM)

You must raise a self invoice whenever GST is payable by you under Reverse Charge, including:

- **Purchases from an unregistered supplier** of notified goods or services (Section 9(4) CGST Act)
- **Goods Transport Agency (GTA)** services — freight paid to a GTA
- **Legal services from an advocate or advocate firm**
- **Director's remuneration** paid by a company
- **Sponsorship services** received by a body corporate
- **Services from a foreign supplier** (import of services)
- Any other supply notified under Section 9(3) or 9(4) of the CGST Act

Missing the self invoice means the GST authority can disallow your **Input Tax Credit** on the RCM tax you paid — you lose the credit and the deduction.

## Self invoice vs regular tax invoice

| Point | Regular Tax Invoice | Self Invoice (RCM) |
|---|---|---|
| Who issues it | The supplier | The recipient (buyer) |
| Supplier GSTIN | Required | Not applicable — supplier is unregistered |
| Who pays GST | Supplier collects from buyer, remits to government | Recipient pays GST directly in cash |
| Input Tax Credit | Claimed by buyer on the supplier's invoice | Claimed by recipient on their own self invoice |
| Return reporting | GSTR-1 by supplier, appears in GSTR-2B for buyer | GSTR-3B Table 3.1(d) by recipient |

## Self invoice vs payment voucher — you need both

This confuses everyone at first:

- **Self invoice** is raised when you **receive** the goods or services — it is the tax document.
- **Payment voucher** is raised when you **pay** the supplier — it is the payment record.

Section 31(3)(g) makes the payment voucher mandatory whenever tax is payable under Reverse Charge. Both go in your records; the self invoice is what supports your ITC claim. Download the matching [RCM payment voucher format](/templates/rcm-payment-voucher-template) and fill it on the day you pay.

## Step-by-step: how to use this template

1. **Fill in your business details** (recipient) — name, address, GSTIN, state and code.
2. **Enter a unique self invoice number** and the invoice date. Keep a consecutive series separate from your regular sales invoices (e.g. SI-001, SI-002).
3. **Add the unregistered supplier's details** — name, address, state and code. Leave the GSTIN blank.
4. **Mark the reason for RCM** — GTA, advocate, unregistered dealer, director's remuneration, etc.
5. **Enter each line item** — description, HSN/SAC code, quantity, rate, GST rate. Taxable Value, CGST, SGST, and Total auto-fill.
6. **Verify the Grand Total** and note the amount in words.
7. **Follow the RCM compliance checklist** at the bottom — pay the GST in cash (ITC cannot be used to pay RCM), report it in GSTR-3B Table 3.1(d), and claim ITC of the same amount.

## Common mistakes to avoid

- **Using the same invoice series as regular sales invoices** — keep RCM self invoices in a separate SI-xxx series.
- **Trying to pay RCM tax by adjusting Input Tax Credit** — RCM tax is always paid in cash from the electronic cash ledger.
- **Skipping the Payment Voucher** — the self invoice covers receipt; you still need a [payment voucher](/templates/rcm-payment-voucher-template) when you pay.
- **Not claiming ITC in the same or next tax period** — the credit lapses if you miss the deadline (September following the financial year).
- **Applying the wrong GST rate** — RCM uses the same rate as if the supplier were registered (e.g. GTA is 5% without ITC to supplier or 12% with ITC).

When you pay the supplier, raise the matching [RCM payment voucher](/templates/rcm-payment-voucher-template) — Section 31(3)(g) requires both documents.

For a regular tax invoice where the supplier is registered, use the [GST Invoice Template](/templates/gst-invoice-template). For general (non-GST) invoicing, see the [Invoice Template](/templates/invoice-template). Step-by-step guide: [Self Invoice Format Under GST (RCM) in Excel](/blog/how-to-create-self-invoice-under-gst-rcm-in-excel).`,
      fileUrl: "/files/self-invoice-rcm-template.xlsx",
      thumbnailUrl: null,
      categoryId: gstCategory.id,
      seoTitle: "RCM Invoice Format in Excel — Self Invoice Under GST (Free Download)",
      seoDescription:
        "Free RCM invoice format in Excel. Self invoice and RCM bill format for unregistered dealer invoice in Excel. Auto CGST and SGST. Free download.",
      features: [
        "Fully compliant with Section 31(3)(f) of the CGST Act",
        "Auto-calculates CGST, SGST, taxable value, and grand total",
        "Reverse Charge flag pre-set to Yes and highlighted",
        "Built-in RCM compliance checklist (GSTR-3B, ITC, payment voucher)",
        "Fields for unregistered supplier, reason for RCM, and place of supply",
        "Works in Excel, Google Sheets and LibreOffice"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Fill in your (recipient) business details, GSTIN, and state.",
        "Assign a unique Self Invoice number (keep a separate SI-xxx series from regular invoices).",
        "Enter the unregistered supplier's name, address, and state — leave GSTIN blank.",
        "Select the reason for RCM (unregistered dealer, GTA, advocate, director's remuneration, etc.).",
        "Add each line item — description, HSN/SAC, quantity, rate, and GST rate.",
        "Verify Grand Total and write the amount in words.",
        "Download the matching RCM payment voucher and fill it when you pay the supplier."
      ],
      faqs: [
        {
          question: "What is a self invoice under GST?",
          answer:
            "A self invoice is a tax invoice raised by a registered recipient (buyer) when they receive goods or services from an unregistered supplier and GST is payable under Reverse Charge Mechanism. Under Section 31(3)(f) of the CGST Act, it is mandatory in these cases because the supplier cannot issue a GST invoice."
        },
        {
          question: "What is self invoicing under GST?",
          answer:
            "Self invoicing under GST is the same process: you issue the GST invoice to yourself for an inward supply where Reverse Charge applies. The self invoice format under GST for RCM includes your GSTIN as recipient, the unregistered supplier's name (no GSTIN), Reverse Charge = Yes, and tax lines for CGST/SGST or IGST."
        },
        {
          question: "What is the RCM invoice format / RCM bill format in Excel?",
          answer:
            "The RCM invoice format (also called RCM bill format) is a self invoice you raise when GST is payable under Reverse Charge. This page is a free Excel download of that format: recipient GSTIN, unregistered supplier block, SI-series number, HSN/SAC lines, and auto CGST/SGST."
        },
        {
          question: "Is this an unregistered dealer invoice format in Excel?",
          answer:
            "Yes. Use this file as the unregistered dealer invoice format when you buy from a dealer who has no GSTIN and tax is under RCM. Fill their name and address, leave GSTIN blank, and mark Reverse Charge as Yes."
        },
        {
          question: "Is there a free self invoice format under GST Excel download?",
          answer:
            "Yes. This page is a free self invoice format under GST for RCM in Excel. Click Download Free Template for the .xlsx file — it also opens in Google Sheets. No signup or email required."
        },
        {
          question: "When is a self invoice mandatory?",
          answer:
            "Whenever GST is payable under Reverse Charge on inward supplies from an unregistered supplier. Common scenarios include purchases from unregistered dealers, freight from Goods Transport Agencies (GTA), legal services from advocates, director's remuneration, sponsorship services, and import of services."
        },
        {
          question: "What is the difference between a self invoice and a payment voucher under RCM?",
          answer:
            "A self invoice is raised when you receive the goods or services and is the tax document that supports your Input Tax Credit claim. A payment voucher is raised separately when you pay the supplier and is required under Section 31(3)(g). Download the free [RCM payment voucher](/templates/rcm-payment-voucher-template) and keep both files for every RCM transaction."
        },
        {
          question: "Can I claim Input Tax Credit on RCM tax paid?",
          answer:
            "Yes. You can claim ITC of the CGST, SGST, or IGST paid under Reverse Charge, but the RCM tax itself must be paid in cash from the electronic cash ledger — you cannot use existing ITC to pay it. Report the RCM liability in Table 3.1(d) of GSTR-3B and claim the corresponding ITC in Table 4A(3) of the same return."
        },
        {
          question: "Do I need a separate invoice series for self invoices?",
          answer:
            "Yes, best practice is to maintain a separate consecutive series for self invoices (for example SI-001, SI-002) distinct from your regular outward tax invoices. This makes RCM transactions easy to identify during return filing and audits."
        }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "self-invoice-rcm-template" },
      update: {
        title: selfInvoiceData.title,
        fileUrl: selfInvoiceData.fileUrl,
        description: selfInvoiceData.description,
        content: selfInvoiceData.content,
        seoTitle: selfInvoiceData.seoTitle,
        seoDescription: selfInvoiceData.seoDescription,
        features: selfInvoiceData.features,
        instructions: selfInvoiceData.instructions,
        faqs: selfInvoiceData.faqs
      },
      create: { slug: "self-invoice-rcm-template", ...selfInvoiceData }
    });

    const paymentVoucherData = {
      title: "RCM Payment Voucher Format in Excel",
      description:
        "Free GST payment voucher for Reverse Charge in Excel. Record payment to an unregistered supplier, link the self invoice number, and see RCM GST payable to government. Works in Google Sheets.",
      content: `This is a free **RCM payment voucher format in Excel**. Use it when you pay an unregistered supplier and GST is payable by you under Reverse Charge. Section 31(3)(g) of the CGST Act (and Rule 52) requires a payment voucher for every such payment. It is not a tax invoice and it is not a substitute for the [RCM invoice format / self invoice](/templates/self-invoice-rcm-template).

Fill voucher number, payment date, mode (NEFT / UPI / cheque / cash), UTR, and the matching Self Invoice No. Enter each line's amount paid to the supplier and the GST rate. The sheet totals what you send the supplier, then shows CGST and SGST you must pay separately to the government from the cash ledger.

## Why a payment voucher is mandatory under RCM

The self invoice is raised when you **receive** the goods or services. The payment voucher is raised when you **pay**. A bank statement proves money moved. It does not replace the prescribed voucher. A GST officer asks for the bundle: plain supplier bill + self invoice + payment voucher + UTR.

You need this voucher for the same inward supplies as the self invoice:

- Purchases from an **unregistered dealer**
- **GTA freight** paid to an unregistered transporter
- **Advocate** or advocate-firm fees
- Director's remuneration, sponsorship, import of services, and other notified Reverse Charge supplies

## What you pay the supplier vs what you pay the government

Do not add GST to the supplier's NEFT. They are unregistered; they cannot collect tax.

| Payment | Who receives it | Source on this sheet |
|---|---|---|
| Billed amount (taxable value) | Unregistered supplier | Total paid to supplier |
| CGST + SGST (or IGST) under RCM | Government | Total GST under RCM |

Existing Input Tax Credit cannot discharge the RCM tax. Pay it in cash, report it in GSTR-3B Table 3.1(d), and claim the same amount as ITC in Table 4A(3) using the self invoice.

## Step-by-step: how to use this template

1. **Fill your (recipient) details** — legal name, address, GSTIN, state and code. You issue and sign this voucher.
2. **Number it in a PV-xxx series** — keep it separate from sales invoices and from the SI-xxx self invoice series.
3. **Enter payment date, mode, and UTR / cheque number.**
4. **Copy the Self Invoice No.** from the matching [RCM self invoice](/templates/self-invoice-rcm-template) so the two documents join.
5. **Add the unregistered supplier (payee)** — name, address, state. Leave GSTIN blank.
6. **Enter each line** — description, HSN/SAC, amount paid to the supplier, GST %. CGST and SGST fill in as tax you owe the government, not as an add-on to the supplier.
7. **Check both totals** — supplier payment vs RCM GST — then write the supplier amount in words and sign.

## Common mistakes

- **Treating the NEFT as the voucher.** The transfer is evidence. The voucher is the document.
- **Adding GST to the supplier payment.** Column D is what they receive. RCM GST goes to the cash ledger.
- **Leaving Self Invoice No. blank.** Without it, an auditor cannot match receipt and payment.
- **Using the same number series as sales invoices or self invoices.**
- **Skipping the voucher because you already have a self invoice.** You need both.

For the tax document raised at receipt, use the [RCM invoice format (self invoice under GST)](/templates/self-invoice-rcm-template). For a registered supplier's outward tax invoice, use the [GST Invoice Template](/templates/gst-invoice-template). Guide: [How to create a payment voucher under GST (RCM) in Excel](/blog/how-to-create-payment-voucher-under-gst-rcm-in-excel).`,
      fileUrl: "/files/rcm-payment-voucher-template.xlsx",
      thumbnailUrl: null,
      categoryId: gstCategory.id,
      seoTitle: "RCM Payment Voucher Format in Excel — Free GST Download",
      seoDescription:
        "Free GST payment voucher for RCM in Excel. Record payment to an unregistered supplier, link the self invoice, and calculate Reverse Charge GST. Free download.",
      features: [
        "Matches Section 31(3)(g) and Rule 52 payment-voucher fields",
        "Self Invoice No. field so the voucher joins the RCM tax document",
        "Payment mode, UTR / cheque number, and PV-xxx series",
        "Separates amount paid to supplier from CGST/SGST owed to government",
        "Reverse Charge flag pre-set to Yes",
        "Works in Excel, Google Sheets, and LibreOffice"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Fill in your (recipient) business details, GSTIN, and state.",
        "Assign a unique Payment Voucher number in a PV-xxx series.",
        "Enter payment date, mode (NEFT / UPI / cheque / cash), and UTR or cheque number.",
        "Copy the matching Self Invoice No. from your RCM self invoice.",
        "Enter the unregistered supplier's name, address, and state — leave GSTIN blank.",
        "Add each line — description, HSN/SAC, amount paid to the supplier, GST rate.",
        "Check Total paid to supplier vs Total GST under RCM, write the supplier amount in words, and sign."
      ],
      faqs: [
        {
          question: "What is a payment voucher under GST RCM?",
          answer:
            "A payment voucher is the document a registered recipient must issue when they pay an unregistered supplier and GST is payable under Reverse Charge. Section 31(3)(g) and Rule 52 require it. It records who was paid, how much, on which date, and that tax is on reverse charge. It is not a tax invoice."
        },
        {
          question: "Is a payment voucher the same as a self invoice?",
          answer:
            "No. Raise the self invoice when you receive the goods or services (Section 31(3)(f)). Raise the payment voucher when you pay (Section 31(3)(g)). Keep both. Download the [RCM invoice format / self invoice](/templates/self-invoice-rcm-template) for the tax document."
        },
        {
          question: "Do I add GST to the amount I pay the unregistered supplier?",
          answer:
            "No. Pay the supplier only their billed amount. You pay CGST and SGST (or IGST) separately to the government from the electronic cash ledger. This template shows those two totals on different rows so they are not mixed."
        },
        {
          question: "Is a bank UTR enough instead of this voucher?",
          answer:
            "No. The UTR proves the transfer. The payment voucher is the prescribed GST document. Keep UTR + voucher + self invoice + the supplier's plain bill in one folder."
        },
        {
          question: "Which number series should I use?",
          answer:
            "Use a consecutive PV-xxx series for payment vouchers, a separate SI-xxx series for self invoices, and keep both away from your outward sales INV- series."
        }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "rcm-payment-voucher-template" },
      update: {
        title: paymentVoucherData.title,
        fileUrl: paymentVoucherData.fileUrl,
        description: paymentVoucherData.description,
        content: paymentVoucherData.content,
        seoTitle: paymentVoucherData.seoTitle,
        seoDescription: paymentVoucherData.seoDescription,
        features: paymentVoucherData.features,
        instructions: paymentVoucherData.instructions,
        faqs: paymentVoucherData.faqs
      },
      create: { slug: "rcm-payment-voucher-template", ...paymentVoucherData }
    });
  }

  const financeCategory = await prisma.templateCategory.findUnique({
    where: { slug: "finance-templates" }
  });
  if (financeCategory) {
    const expenseData = {
      title: "Business Expense Tracker",
      description:
        "A free business expense tracker spreadsheet for Excel and Google Sheets. Log every expense on one sheet and watch the monthly summary — spend by category, grand total, and transaction count — update automatically. Works for freelancers, small businesses, and startups.",
      content: `Keeping track of where money goes is the simplest habit that separates businesses that stay profitable from those that quietly bleed cash. This free business expense tracker for Excel makes it painless: enter each expense once on the **Expenses** sheet (date, category, description, payment method, amount) and the linked **Summary** sheet recalculates instantly using SUMIF formulas. The Month column fills in automatically from the date, and the Category column has a built-in dropdown so your data stays consistent.

## Who this expense tracker is for

- **Freelancers and consultants** logging billable and reimbursable expenses
- **Small businesses and startups** tracking spend before they can afford accounting software
- **Shopkeepers, service providers, agencies** managing monthly outflows in India, US, UK, Australia, and worldwide
- **Anyone** who wants a clear monthly picture without learning QuickBooks, Zoho, or Tally

## Which expense categories should a small business use?

Consistent categories are what make an expense tracker useful. Start with these and adjust for your business:

- **Rent & utilities** — office rent, electricity, water, internet
- **Salaries & wages** — employee pay, contractor fees, professional charges
- **Marketing & advertising** — ads, SEO, content, promotional material
- **Software & subscriptions** — SaaS tools, hosting, domains, cloud storage
- **Office supplies** — stationery, printing, small equipment
- **Travel** — flights, taxis, fuel, hotel stays for business
- **Meals & entertainment** — client lunches, team meals
- **Professional fees** — accountant, lawyer, consultant
- **Bank charges & interest** — fees, loan interest, transaction charges
- **Taxes & compliance** — GST paid, professional tax, filing fees
- **Repairs & maintenance** — office repairs, equipment servicing
- **Miscellaneous** — anything that does not fit above (keep this small)

Rule of thumb: 8-12 categories is the sweet spot. Fewer and you cannot see trends; more and every expense feels like a decision.

## Expense tracker vs cash book vs profit and loss statement

These three often get confused, but they answer different questions:

- **Expense tracker** — where is my money going? Only outflows, grouped by category.
- **[Cash book](/templates/cash-book-template)** — how much cash do I have right now? Both inflows and outflows with a running balance.
- **[Profit and Loss statement](/templates/profit-and-loss-statement)** — did I make a profit this period? Revenue minus COGS minus expenses = net profit.

Most small businesses need all three. The expense tracker feeds the P&L (your expenses section) and the cash book (as outflow entries).

## How to claim business expenses at tax time

An expense tracker is your first line of defence at tax filing. To make an expense deductible:

1. **Record the date, vendor, category, and amount** — this tracker captures all four automatically.
2. **Keep the receipt or invoice** — save PDFs in a folder named after the month.
3. **Only claim genuine business expenses** — personal purchases from the business account are not deductible.
4. **Match to your P&L** — the total in each category should tie to the corresponding expense line in your Profit and Loss statement.

In India, business expenses reduce your taxable income under the Income Tax Act (Section 37 for revenue expenses). Similar rules apply in most countries. If your accountant asks for an "expense schedule," this tracker with a printed Summary sheet is exactly what they need.

## Common mistakes to avoid

- **Waiting until the end of the month to enter expenses** — receipts get lost. Enter them the same day or every few days.
- **Mixing personal and business expenses** — always keep them in separate files.
- **Creating a new category for every unique expense** — stick to your defined list; use description for detail.
- **Ignoring small recurring costs** — a ₹500 monthly SaaS subscription is ₹6,000 a year.
- **Never reviewing the Summary sheet** — the tracker's whole point is the monthly review.

## Why an Excel expense tracker beats an app

Apps look modern but come with tradeoffs: monthly fees, vendor lock-in, sync issues, and privacy concerns. A spreadsheet you own has real advantages:

- **Free forever** — no subscription, no ads, no upsells
- **Your data stays with you** — no cloud account required
- **Fully customisable** — add columns, categories, or formulas any time
- **Works everywhere** — Excel, Google Sheets, LibreOffice Calc, Numbers, WPS
- **Prints cleanly** — for physical filing, audits, or accountant handoff

If your business ever outgrows a spreadsheet, you can export from any accounting tool that imports Excel. Starting simple with a tracker is the right call for anyone doing under a few hundred transactions per month.`,
      fileUrl: "/files/business-expense-tracker.xlsx",
      thumbnailUrl: null,
      categoryId: financeCategory.id,
      seoTitle: "Free Business Expense Tracker Excel Spreadsheet (Auto Summary)",
      seoDescription:
        "Free business expense tracker template for Excel and Google Sheets. Category dropdown, SUMIF monthly summary, tax-ready categories. Download instantly, no signup.",
      features: [
        "Two linked sheets: expense log + auto summary",
        "Spend-by-category totals update automatically (SUMIF)",
        "Built-in category dropdown keeps data clean",
        "Month auto-fills from each date",
        "Works in Excel, Google Sheets and LibreOffice"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Go to the Expenses sheet and enter each expense on its own row.",
        "Pick a category from the dropdown so the summary groups it correctly.",
        "Type the amount — the running total at the bottom updates automatically.",
        "Open the Summary sheet to see spending by category and your grand total.",
        "Add or rename categories to fit your business if needed."
      ],
      faqs: [
        { question: "Is this expense tracker free?", answer: "Yes. It is free to download and edit for personal and business use." },
        { question: "Does the summary update automatically?", answer: "Yes. The Summary sheet uses SUMIF formulas, so totals recalculate as soon as you add or change an expense." },
        { question: "Can I add my own categories?", answer: "Yes. Edit the category list in the dropdown and add a matching row on the Summary sheet to total it." },
        { question: "Does it work in Google Sheets?", answer: "Yes. Upload it to Google Sheets and the formulas and dropdown carry over." }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "business-expense-tracker" },
      update: {
        fileUrl: expenseData.fileUrl,
        description: expenseData.description,
        content: expenseData.content,
        seoTitle: expenseData.seoTitle,
        seoDescription: expenseData.seoDescription
      },
      create: { slug: "business-expense-tracker", ...expenseData }
    });

    const monthlyBudgetData = {
      title: "Monthly Budget Spreadsheet",
      description:
        "A free monthly budget spreadsheet for Excel and Google Sheets. Track income, fixed expenses, variable expenses, savings, and debt payments — with budgeted vs actual columns, automatic totals, and a 12-month yearly summary. Currency-neutral and works for personal finance worldwide.",
      content: `A **monthly budget spreadsheet** is the simplest, most effective tool for taking control of your money. This free monthly budget template gives you a working structure for tracking every dollar (or your local currency) — income coming in, expenses going out, savings set aside, and debt being paid down — with live formulas that recalculate as you edit. Two sheets: a detailed **Monthly Budget** for the current month, and a **Yearly Summary** that rolls up all 12 months to show trends and your annual savings rate.

## Who this monthly budget template is for

- **Individuals and couples** starting a first budget — see exactly where your paycheck goes
- **Freelancers and side-hustlers** with variable monthly income
- **Anyone paying off debt** — snowball or avalanche approach with a dedicated debt section
- **Savers with goals** — emergency fund, down payment, vacation, retirement
- **People switching from budgeting apps** (Mint, YNAB, EveryDollar) who want more control and no subscription

## What's in this budget template

The Monthly Budget sheet has 5 clearly-separated sections, each with a **Budgeted** column (what you planned) and an **Actual** column (what really happened) so you can track variance:

- **Income** — Primary salary, secondary income, investment income, other
- **Fixed Expenses** — Rent/mortgage, utilities, insurance, loans, subscriptions
- **Variable Expenses** — Groceries, dining out, transportation, entertainment, shopping
- **Savings & Investments** — Emergency fund, retirement, brokerage, custom goals
- **Debt Payments** — Credit cards, minimum payments, extra payoff amounts

At the top, a **Monthly Summary card** shows Total Income, Total Planned Spending, and Money Left Over — updated live as you edit. Below the sections, a **Savings Rate** cell calculates what percentage of income you're actually saving.

The **Yearly Summary sheet** has 12 rows (January to December) with columns for Income, Fixed, Variable, Savings, and Debt totals. Fill in each month's totals and see annual roll-up, net cash flow, and annual savings rate at a glance.

## How to build a monthly budget — the 50/30/20 method

If you're new to budgeting, the simplest framework is 50/30/20:

- **50% of take-home pay** goes to **needs** — rent, utilities, groceries, insurance, transportation to work, minimum debt payments
- **30% goes to wants** — dining out, entertainment, hobbies, non-essential shopping, subscriptions
- **20% goes to savings and debt payoff** — emergency fund, retirement, extra debt payments, investments

This template's five sections map onto the framework: Fixed Expenses ≈ needs, Variable Expenses ≈ mostly wants, Savings + Debt Payments = the 20% target. If your Variable + Fixed totals cross 80%, that's your signal to trim.

Other popular budgeting frameworks that work with this template:

- **Zero-based budgeting** — every dollar of income is assigned to a category (Income − All Categories = 0). Fill in Budgeted amounts until Money Left Over = 0.
- **Envelope method** — treat each Variable category as an "envelope"; stop spending when Actual hits Budgeted.
- **Pay-yourself-first** — fill in the Savings section first, then everything else fits into what's left.

## Step-by-step: using the template

1. **Download the file** and open in Excel or Google Sheets.
2. **Fill in Budgeted amounts** for each category based on your last 1-2 months of spending (start with realistic numbers, not aspirational ones).
3. **Set at least one savings goal** — even $50/month starts the habit.
4. **Enter Actual amounts as they happen** — weekly is ideal; monthly at minimum.
5. **Watch the Diff column** — positive means you're under budget (good), negative means you overspent that category.
6. **Review the Savings Rate at month-end** — anything above 20% is strong; below 10% signals room to trim variable spending.
7. **Copy the sheet for next month** and update the month label. Roll income and fixed expenses forward; reset actuals to zero.
8. **Fill in the Yearly Summary** at the end of each month to build a 12-month trend view.

## Common budgeting mistakes to avoid

- **Budgeting for who you wish you were, not who you are** — if your last 3 months' groceries were $650, don't budget $400. Start real, then trim.
- **Forgetting irregular expenses** — annual insurance renewals, car registration, holiday gifts, birthdays. Divide the annual amount by 12 and budget a small monthly allocation.
- **No savings category** — a budget that has income = expenses and no savings is just a spending plan. Always include a savings line, even if small.
- **Tracking only expenses, not income** — variable-income earners especially should track actual income to catch shortfalls early.
- **Not reviewing until end of month** — problems are cheaper to spot on day 10 than day 30.
- **Budgeting solo when you share finances** — households should build the budget together, or one person will feel ambushed by the numbers.

## What to pair with this monthly budget

Once you have your monthly budget running, three related tools help extend it:

- **[Business Expense Tracker](/templates/business-expense-tracker)** — if you're a freelancer or run a side business, keep business spending in a separate file (never mix with personal).
- **[Cash Book Template](/templates/cash-book-template)** — for anyone dealing in cash frequently, tracks running cash balance day by day.
- **[Profit and Loss Statement](/templates/profit-and-loss-statement)** — for side-business or freelance income, summarizes monthly profitability.

## Frequently asked questions about monthly budgets

Below are quick answers to common budgeting questions. This template is currency-neutral — enter amounts in your local currency ($, €, £, ₹, whatever), and every formula still works.`,
      fileUrl: "/files/monthly-budget-template.xlsx",
      thumbnailUrl: null,
      categoryId: financeCategory.id,
      seoTitle: "Free Monthly Budget Spreadsheet Template Excel (Google Sheets Ready)",
      seoDescription:
        "Free monthly budget spreadsheet for Excel and Google Sheets. Income, fixed and variable expenses, savings, debt payoff, budgeted vs actual, plus 12-month yearly summary and savings rate. Currency-neutral.",
      features: [
        "Two sheets: Monthly Budget + 12-month Yearly Summary",
        "5 clear sections: Income, Fixed, Variable, Savings, Debt",
        "Budgeted vs Actual columns with automatic variance",
        "Live formulas — totals and money-left-over recalculate as you edit",
        "Automatic Savings Rate calculation (target 20%+)",
        "Currency-neutral — works with $, €, £, ₹, or any currency",
        "Works in Excel, Google Sheets, Numbers, and LibreOffice"
      ],
      instructions: [
        "Download the file and open in Excel, Google Sheets, or LibreOffice.",
        "Update the month label at the top of the Monthly Budget sheet.",
        "Fill in your income sources in the Income section with realistic monthly amounts.",
        "Enter Budgeted amounts for each category based on your last 1-2 months of actual spending.",
        "As transactions happen, enter the Actual amount in the corresponding row.",
        "Check the Monthly Summary card at the top — it updates automatically.",
        "Review the Savings Rate cell at month-end — aim for 20% or higher.",
        "At the start of a new month, copy the sheet and reset the Actual column."
      ],
      faqs: [
        {
          question: "Is this monthly budget template free to use?",
          answer:
            "Yes. It is 100% free to download and use for personal or commercial purposes. No signup, no email required, no watermark. You can also edit and share it freely."
        },
        {
          question: "Does the template work in Google Sheets?",
          answer:
            "Yes. Upload the .xlsx file to Google Drive and open it with Google Sheets. All formulas — SUM totals, budgeted-vs-actual variance, and the savings rate calculation — work identically. You get real-time collaboration too, which is useful for couples budgeting together."
        },
        {
          question: "Which currency does the template use?",
          answer:
            "The template is currency-neutral — numbers are formatted with two decimal places but no currency symbol. Enter amounts in your local currency ($, €, £, ₹, or any other) and every formula still works. If you want a currency symbol displayed, use Format > Currency in your spreadsheet app."
        },
        {
          question: "What is a good monthly savings rate?",
          answer:
            "The 50/30/20 rule targets 20% of take-home pay going to savings and debt payoff. Anything above 20% is strong. Below 10% is a warning sign — usually variable expenses (dining out, subscriptions, shopping) are the fastest to trim. The template calculates your savings rate automatically."
        },
        {
          question: "How do I roll this budget over to next month?",
          answer:
            "Right-click the Monthly Budget sheet tab and choose 'Duplicate' (or 'Move or Copy' > check 'Create a copy'). Rename the new sheet to next month, update the month label at the top, keep the Budgeted amounts (adjust if needed), and clear the Actual column. Fill in the Yearly Summary sheet with this month's totals before starting the new one."
        },
        {
          question: "Can I add or remove categories?",
          answer:
            "Yes. Insert a new row within any section (Income, Fixed Expenses, etc.), then extend the SUM formula in the total row to include the new row. Delete unused sample rows the same way. The Summary card and Savings Rate automatically reflect any category changes."
        }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "monthly-budget-template" },
      update: {
        fileUrl: monthlyBudgetData.fileUrl,
        description: monthlyBudgetData.description,
        content: monthlyBudgetData.content,
        seoTitle: monthlyBudgetData.seoTitle,
        seoDescription: monthlyBudgetData.seoDescription
      },
      create: { slug: "monthly-budget-template", ...monthlyBudgetData }
    });

    const weddingBudgetData = {
      title: "Wedding Budget Planner Spreadsheet",
      description:
        "A free wedding budget planner spreadsheet for Excel and Google Sheets. Three sheets: at-a-glance budget overview with category summary and savings tracker, detailed line-item budget across 11 categories (venue, catering, attire, flowers, photography, and more), and a guest-count per-head cost calculator. Currency-neutral — works for weddings anywhere in the world.",
      content: `Planning a wedding is one of the biggest budgeting exercises most couples will ever do — and unlike other purchases, you can't return an over-the-top venue if the credit card starts hurting. A **wedding budget spreadsheet** keeps every deposit, vendor quote, and per-head cost in one place so you know exactly where you stand at any moment. This free planner gives you a working structure with 60+ line items across every wedding category, a category-by-category summary, a savings tracker, and a per-head cost calculator that shows why the guest list is the single biggest lever in wedding cost.

## What's in this wedding budget template

Three linked sheets that work together automatically:

- **Budget Overview** — the big picture. Total budget you've set, total estimated based on line items, total spent so far, remaining in budget, and % of budget spent. Category summary rolls up 11 categories at a glance. Savings tracker shows contributions from couple, family, and expected gifts.
- **Detailed Budget** — 60+ line items across 11 wedding categories (Venue, Catering, Attire, Flowers, Photo/Video, Stationery, Music, Transportation, Rings, Honeymoon, Miscellaneous). Each row has Category, Item, Vendor, Estimated cost, Paid so far, Balance due, and Due Date.
- **Guest & Per-Head** — guest count tracker (invited, confirmed, declined, awaiting) plus a per-head cost calculator that shows how catering, bar, favors, chair rentals, and stationery all scale with headcount.

## The 11 categories every wedding budget needs

Almost every wedding cost falls into one of these categories. Use them consistently and you won't miss anything:

1. **Venue & Ceremony** — venue rental, officiant, ceremony chairs, marriage license
2. **Catering & Bar** — meal per head, cocktail hour, cake, bar service, service fees
3. **Attire & Beauty** — dress + alterations, suit, shoes, accessories, hair, makeup
4. **Flowers & Decor** — bouquets, centerpieces, arch, aisle runner, reception decor
5. **Photography & Video** — photographer, videographer, engagement shoot, album
6. **Stationery** — save-the-dates, invitations, RSVP cards, programs, place cards
7. **Music & Entertainment** — DJ or band, ceremony music, sound rental, photo booth
8. **Transportation** — bride & groom car, guest shuttle, valet parking
9. **Rings & Gifts** — wedding rings, gifts for parents, favors for guests
10. **Honeymoon** — flights, accommodation, activities, spending money
11. **Miscellaneous** — wedding insurance, rehearsal dinner, welcome bags, tips, emergency fund

## How wedding costs typically break down (as a % of budget)

If you're not sure how to allocate, this is roughly how the average wedding splits:

- **Venue & Catering:** 45-50% (largest single category)
- **Photography & Video:** 12-15%
- **Attire & Beauty:** 8-10%
- **Flowers & Decor:** 8-10%
- **Music & Entertainment:** 8-10%
- **Stationery, Rings, Gifts, Transportation:** 5-8%
- **Honeymoon:** varies wildly — budget separately if desired
- **Miscellaneous & buffer:** always keep 5-10% for surprises

Use these as sanity-check ratios, not rules. A destination wedding shifts more to Venue and Honeymoon; a backyard wedding puts more into Catering and Decor.

## Why the guest list is your #1 cost lever

If your budget is tight, cutting 20 guests saves more than negotiating hard on any single vendor. Because so many costs scale linearly with head count:

- Catering meal per head (typically the biggest per-guest cost)
- Bar service (per head, per hour)
- Chair and linen rentals
- Cocktail-hour appetizers
- Stationery (menu cards, place cards, favors)
- Cake portion sizing

The **Guest & Per-Head sheet** in this template shows exactly how much each guest costs across all these lines. Change the guest number in one cell and watch the totals recalculate. A ₹4,000 (or $50) per-head cocktail-hour + meal + bar becomes ₹80,000 (or $1,000) across 20 fewer guests — usually more than any single vendor discount.

## Step-by-step: use the wedding budget template

1. **Download the file** and open in Excel or Google Sheets.
2. **Enter your total budget** in the "Total Budget" cell on the Budget Overview sheet.
3. **Fill the Savings Tracker** — how much you and family have committed. This tells you if your target budget is realistic.
4. **Go to Detailed Budget.** Update Estimated costs based on real vendor quotes (delete the sample numbers). Add vendor names as you book them.
5. **As you pay deposits, enter them in the Paid column** — the Balance column auto-calculates what's still owed.
6. **Set Due Dates** for each remaining balance so you don't miss vendor deadlines.
7. **Check Budget Overview weekly** — you'll see % of budget spent grow, and can catch categories that are drifting over early.
8. **Use the Guest & Per-Head sheet** whenever anyone suggests adding people to the list. Show them the number.

## Common wedding budgeting mistakes to avoid

- **Underestimating tax and service charges.** Most caterers and venues add 15-25% on top of quoted prices for tax + service. Always ask for the "all-in" price before comparing quotes.
- **No buffer for surprises.** Keep at least 5-10% of budget as an "Emergency" line in Miscellaneous. Something always goes over.
- **Booking the biggest ticket last.** Book venue and caterer first — they lock down the biggest chunk. Everything else fits around them.
- **Not tracking deposits.** Wedding vendors typically require 25-50% deposits months in advance. Use the Paid + Balance + Due Date columns religiously.
- **Ignoring hidden costs.** Alterations on the dress, vendor tips, marriage license fees, wedding-day emergency kit, thank-you card postage — all real, all frequently forgotten.
- **Forgetting who's paying for what.** If parents contribute, agree in writing (or clear conversation) what they're paying for. Vague "we'll help" turns into fights later.
- **Impulse spending on Pinterest inspiration.** Save ideas, but only add them to the Estimated column when you're ready to actually source them.

## What to pair with your wedding budget

Two of our other templates work well alongside this planner:

- **[Monthly Budget Spreadsheet](/templates/monthly-budget-template)** — for tracking how much of each month's paycheck you're saving toward the wedding. Set a "Wedding Savings" goal and watch it grow.
- **[Business Expense Tracker](/templates/business-expense-tracker)** — if you're using a business account for anything wedding-related (unusual but possible), keep those expenses documented cleanly.

## Frequently asked questions

Below are quick answers to the most common wedding-budgeting questions. This template is currency-neutral — the numbers work in your local currency ($, €, £, ₹, or any other).`,
      fileUrl: "/files/wedding-budget-template.xlsx",
      thumbnailUrl: null,
      categoryId: financeCategory.id,
      seoTitle: "Free Wedding Budget Planner Spreadsheet Excel (Google Sheets Ready)",
      seoDescription:
        "Free wedding budget planner spreadsheet for Excel and Google Sheets. 60+ line items across 11 categories, per-head cost calculator, savings tracker, budget-vs-actual by category. Currency-neutral.",
      features: [
        "Three linked sheets: Overview + Detailed Budget + Guest/Per-Head",
        "60+ pre-filled line items across 11 wedding categories",
        "Category summary auto-rolls up from detailed budget (SUMIF)",
        "Per-head cost calculator — see how guest count drives total spend",
        "Savings tracker with couple + family + gifts contributions",
        "Deposit & balance tracking with due dates per line item",
        "Currency-neutral — works with $, €, £, ₹, or any currency",
        "Works in Excel, Google Sheets, Numbers, and LibreOffice"
      ],
      instructions: [
        "Download the file and open in Excel, Google Sheets, or LibreOffice.",
        "On the Budget Overview sheet, enter your total budget in the Total Budget cell.",
        "Fill the Savings Tracker with contributions from couple, family, and expected gifts.",
        "Go to Detailed Budget. Update Estimated costs with real vendor quotes as you research.",
        "Add vendor names in the Vendor column as you book each service.",
        "As you pay deposits, enter the amount in the Paid column — Balance auto-calculates.",
        "Set Due Dates for outstanding balances so you don't miss vendor deadlines.",
        "Use the Guest & Per-Head sheet whenever anyone suggests changing the guest count.",
        "Check the Budget Overview weekly — % Spent tells you if you're on track."
      ],
      faqs: [
        {
          question: "How much should a wedding budget be?",
          answer:
            "There is no single right answer — wedding budgets range from a few thousand dollars for a small intimate ceremony to hundreds of thousands for a large destination wedding. Start by adding up realistic contributions from the couple, family, and expected gifts (the Savings Tracker in this template does this). The total available is your budget — build the wedding within it, not the other way around."
        },
        {
          question: "What percentage of a wedding budget goes to which category?",
          answer:
            "Rough averages: Venue + Catering 45-50%, Photography/Video 12-15%, Attire 8-10%, Flowers/Decor 8-10%, Music 8-10%, and Stationery/Rings/Transportation/Miscellaneous filling the rest. Keep 5-10% as an emergency buffer. The Category Summary in this template auto-calculates your actual percentages so you can compare to these ratios."
        },
        {
          question: "Why does the guest list affect the budget so much?",
          answer:
            "Many costs scale linearly with guest count — meals, drinks, chair and linen rentals, favors, cake, stationery. In practice, 20 fewer guests can save more than negotiating with any single vendor. The Guest & Per-Head sheet in this template shows exactly how much each guest costs across all per-head line items."
        },
        {
          question: "Does the template work in Google Sheets?",
          answer:
            "Yes. Upload the .xlsx file to Google Drive and open with Google Sheets. All formulas — SUMIF category rollups, per-head calculations, savings tracking — work identically. Real-time collaboration is useful for couples planning together, or for sharing progress with parents who are contributing."
        },
        {
          question: "Can I add my own vendors and line items?",
          answer:
            "Yes. Insert a new row in any category on the Detailed Budget sheet. Set the Category column to match one of the existing category names exactly (Venue & Ceremony, Catering & Bar, etc.) so the SUMIF formulas on the Overview sheet pick it up automatically. Delete sample rows you don't need in the same way."
        },
        {
          question: "How do I track vendor deposits and final payments?",
          answer:
            "Each row in the Detailed Budget sheet has an Estimated column (total cost), a Paid column (deposits and partial payments so far), and a Balance column that auto-calculates what's still owed. Set a Due Date for each balance so you don't miss vendor deadlines. The Budget Overview sums all balances across all categories so you always know your total remaining commitment."
        }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "wedding-budget-template" },
      update: {
        fileUrl: weddingBudgetData.fileUrl,
        description: weddingBudgetData.description,
        content: weddingBudgetData.content,
        seoTitle: weddingBudgetData.seoTitle,
        seoDescription: weddingBudgetData.seoDescription
      },
      create: { slug: "wedding-budget-template", ...weddingBudgetData }
    });
  }

  const accountingCategory = await prisma.templateCategory.findUnique({
    where: { slug: "accounting-templates" }
  });
  if (accountingCategory) {
    const invoiceData = {
      title: "Invoice Template",
      description:
        "A free, professional invoice template for Excel and Google Sheets. Add your items and the line amounts, subtotal, tax, and total calculate automatically — ready to send in minutes.",
      content:
        "Every business needs to bill clients, and a clean, professional invoice gets you paid faster. This free invoice template works for freelancers, agencies, shops, and service providers of any kind. Fill in your company and client details, list what you're charging for, and the spreadsheet does the maths: each line's amount, the subtotal, an optional tax, and the final total all calculate automatically. Set the tax rate to 0% if you don't charge tax, or enter your rate and the tax amount updates instantly. When you're done, save it as a PDF and send it. It's a simple, reliable invoice you can reuse for every client.",
      fileUrl: "/files/invoice-template.xlsx",
      thumbnailUrl: null,
      categoryId: accountingCategory.id,
      seoTitle: "Free Invoice Template for Excel — Download (Auto Totals)",
      seoDescription:
        "Free invoice template for Excel and Google Sheets, free download. Auto-calculates line amounts, subtotal, tax and total. Professional layout for any business.",
      features: [
        "Auto-calculates amounts, subtotal, tax and total",
        "Editable tax rate (set 0% if not applicable)",
        "Clean, professional layout for any business",
        "Works in Excel, Google Sheets and LibreOffice",
        "Save as PDF and send in minutes"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Fill in your company details under 'From' and the client details under 'Bill To'.",
        "Add the invoice number, date, and due date in the box on the right.",
        "List each item with a description, quantity, and rate — the amount fills in automatically.",
        "Set the tax rate (or leave it 0%) — subtotal, tax, and total update on their own.",
        "Save as PDF and send it to your client."
      ],
      faqs: [
        { question: "Is this invoice template free?", answer: "Yes. It is free to download and edit for personal and business use." },
        { question: "Do the totals calculate automatically?", answer: "Yes. Line amounts, the subtotal, tax, and the final total are all formula-driven and update as you type." },
        { question: "How do I add tax like GST or VAT?", answer: "Enter your rate in the Tax Rate cell and the tax amount and total update automatically. For a full GST invoice with CGST/SGST, use our GST Invoice Template." },
        { question: "Does it work in Google Sheets?", answer: "Yes. Upload it to Google Sheets and the formulas carry over." }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "invoice-template" },
      update: { fileUrl: invoiceData.fileUrl, seoTitle: invoiceData.seoTitle, seoDescription: invoiceData.seoDescription },
      create: { slug: "invoice-template", ...invoiceData }
    });

    const cashBookData = {
      title: "Cash Book Template",
      description:
        "A free fully automatic cash book template for Excel and Google Sheets. Record every cash receipt and payment — the running balance, totals, and closing balance update automatically with built-in formulas. Ideal for small businesses, shops, freelancers, clubs, and anyone tracking daily cash.",
      content: `A cash book is a simple, day-by-day record of the cash coming in and going out of your business. It is one of the most important records a small business or shop can keep because it tells you exactly how much cash you have at any moment. This **fully automatic cash book template** makes it effortless: enter the date, a short description, the voucher number, and the amount received or paid — the **Balance** column updates automatically using a running-total formula. Set your opening balance at the top, and the template tracks every transaction, totals your receipts and payments, and calculates your closing balance for you. No accounting software needed.

## Who should use a cash book

- **Small shops and retailers** — daily cash-in / cash-out and end-of-day closing
- **Freelancers and consultants** taking cash payments from clients
- **Restaurants, salons, cafes, and service businesses** — high volume of small cash transactions
- **Trusts, societies, and small clubs** required to maintain a cash record
- **Anyone** who deals in cash and wants to know their true balance without guessing

## Cash book vs day book vs ledger — which do you actually need?

These three sound similar but do different things:

- **Cash book** — records only cash and bank transactions in chronological order with a running balance. This is what you use daily.
- **Day book (journal)** — records every transaction of every kind (cash, credit, purchases, sales) in date order, but does NOT keep a running balance.
- **Ledger** — a summary of every account (customer, supplier, expense head) with debits, credits, and closing balances per account.

A cash book is a specialised day book focused only on cash and bank. For a small business, the cash book plus an [expense tracker](/templates/business-expense-tracker) covers 90% of what you need.

## Single-column vs double-column vs triple-column cash book

- **Single-column cash book** — records only cash (receipts on one side, payments on the other). Simplest.
- **Double-column cash book** — adds a bank column so cash and bank transactions live in the same book. Best for shops that deposit cash daily.
- **Triple-column cash book** — adds a discount column for cash discounts given or received. Used mostly by traders.

This template is a modern single-column format optimised for spreadsheets — receipts and payments in adjacent columns with a running balance. Add a **Bank In / Bank Out** pair of columns if you want the double-column version.

## What the "running balance" really does

Every row's Balance cell contains a formula like \`= previous balance + Receipt − Payment\`. This means:

- The balance never falls behind — you always see cash on hand at any point in the day.
- If the physical cash in your drawer does not match the closing balance, you have an entry missing or entered wrong. This is called **cash reconciliation**.
- At month-end, the closing balance rolls into the opening balance of the next month — no fresh setup required.

## Step-by-step: how to use this template

1. **Download the file** and open it in Excel, Google Sheets, or LibreOffice.
2. **Enter your opening balance** in the top cell — the exact cash you have on hand right now.
3. **For each transaction, add** the date, a short description (e.g. "Sale — Invoice 042", "Rent paid"), the voucher number, and the amount in either **Receipt (In)** or **Payment (Out)**.
4. **The Balance column recalculates automatically** — no manual maths.
5. **At end of day** or end of period, count physical cash in the drawer and compare with the closing balance. Any mismatch is a missing entry.
6. **Roll over** — copy the closing balance into the opening balance cell of a new sheet for the next month.

## Common cash book mistakes to avoid

- **Recording cash entries days later** — receipts get lost, memory fails. Enter as they happen.
- **Skipping small transactions** — a hundred ₹10 entries adds up to a real cash gap.
- **Mixing personal cash with business cash** — keeps the balance meaningless. Keep them in separate files.
- **Editing an old entry without noting it** — you lose the ability to reconcile. Add a correction row instead.
- **No voucher / bill reference** — cash entries without a supporting document are the first thing an auditor questions.

## Cash book and GST — what you need to know

Under GST, every registered business must maintain proper books of accounts including a cash book that reflects all cash receipts and payments (CGST Rule 56). Even for a shop that mostly runs on cash, this template gives you an auditor-friendly record: date, particulars, voucher, receipt, payment, running balance. Print at month-end and file it alongside your bills for a complete trail.

## What to pair with your cash book

Your cash book gives you the day-by-day movement, but three related templates round out your accounting stack:

- **[Business Expense Tracker](/templates/business-expense-tracker)** — groups your payments into categories (rent, salaries, marketing) so you can see where money goes each month.
- **[Profit and Loss Statement](/templates/profit-and-loss-statement)** — takes your revenue and expenses and tells you if the business made money.
- **[GST Invoice Template](/templates/gst-invoice-template)** — for issuing tax invoices whose totals then land in your cash book as receipts.

For step-by-step guidance, read: [How to Track Business Expenses in Excel](/blog/how-to-track-business-expenses-in-excel) and [How to Make a Profit and Loss Statement in Excel](/blog/how-to-make-profit-and-loss-statement-in-excel).`,
      fileUrl: "/files/cash-book-template.xlsx",
      thumbnailUrl: null,
      categoryId: accountingCategory.id,
      seoTitle: "Free Fully Automatic Cash Book Template Excel Download (Running Balance)",
      seoDescription:
        "Free fully automatic cash book template in Excel and Google Sheets. Records cash in and out with auto running balance, totals, and closing balance. Perfect for shops, small businesses, and freelancers.",
      features: [
        "Automatic running balance after every entry",
        "Opening and closing balance calculated for you",
        "Totals receipts and payments automatically",
        "Simple columns: date, particulars, voucher, in, out",
        "Works in Excel, Google Sheets and LibreOffice"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Enter your opening balance in the cell at the top.",
        "For each transaction, add the date, a short description, and the voucher number.",
        "Put money received in the 'Receipt (In)' column and money paid in 'Payment (Out)'.",
        "The Balance column updates automatically after every entry.",
        "Check the totals and closing balance at the bottom at the end of the period."
      ],
      faqs: [
        { question: "Is this cash book template free?", answer: "Yes. It is free to download and edit for personal and business use." },
        { question: "Does the balance update automatically?", answer: "Yes. The Balance column uses a running-total formula, so it recalculates after every receipt or payment you enter." },
        { question: "What is the difference between this and an expense tracker?", answer: "A cash book is a chronological record of cash in and out with a running balance. An expense tracker groups spending by category. Many businesses use both." },
        { question: "Does it work in Google Sheets?", answer: "Yes. Upload it to Google Sheets and the formulas carry over." }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "cash-book-template" },
      update: {
        fileUrl: cashBookData.fileUrl,
        description: cashBookData.description,
        content: cashBookData.content,
        seoTitle: cashBookData.seoTitle,
        seoDescription: cashBookData.seoDescription
      },
      create: { slug: "cash-book-template", ...cashBookData }
    });

    const plData = {
      title: "Profit and Loss Statement Template",
      description:
        "A free profit and loss statement (income statement) template for Excel and Google Sheets. Enter your revenue and expenses and the gross profit and net profit calculate automatically.",
      content:
        "A profit and loss statement (also called an income statement or P&L) shows whether your business made money over a period. It is one of the most important reports for any small business, and the basis for filing taxes and understanding your margins. This template lays it out cleanly: list your revenue, your cost of goods sold, and your operating expenses, and the spreadsheet calculates Total Revenue, Gross Profit, Total Expenses, and your final Net Profit automatically. Just replace the sample figures with your own — perfect for small businesses that want a clear financial picture without paying for accounting software.",
      fileUrl: "/files/profit-and-loss-statement.xlsx",
      thumbnailUrl: null,
      categoryId: accountingCategory.id,
      seoTitle: "Free Profit and Loss Statement Template for Excel",
      seoDescription:
        "Download a free profit and loss statement template for Excel and Google Sheets. Auto-calculates gross profit and net profit from your revenue and expenses.",
      features: [
        "Auto-calculates gross profit and net profit",
        "Clear revenue, COGS and expense sections",
        "Totals update as you type",
        "Spare lines to add your own items",
        "Works in Excel, Google Sheets and LibreOffice"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Add your business name and the period at the top.",
        "Enter your revenue lines under REVENUE.",
        "Enter your cost of goods sold and operating expenses in their sections.",
        "Gross Profit and Net Profit calculate automatically at the bottom.",
        "Use the spare '[Add line]' rows for anything specific to your business."
      ],
      faqs: [
        { question: "Is this P&L template free?", answer: "Yes. It is free to download and edit for personal and business use." },
        { question: "What is the difference between gross profit and net profit?", answer: "Gross profit is revenue minus the cost of goods sold. Net profit is gross profit minus all operating expenses — your actual bottom line." },
        { question: "Does it calculate automatically?", answer: "Yes. Totals, gross profit, and net profit are all formula-driven and update as you enter figures." },
        { question: "Does it work in Google Sheets?", answer: "Yes. Upload it to Google Sheets and the formulas carry over." }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "profit-and-loss-statement" },
      update: { fileUrl: plData.fileUrl, seoTitle: plData.seoTitle, seoDescription: plData.seoDescription },
      create: { slug: "profit-and-loss-statement", ...plData }
    });

    const rentReceiptData = {
      title: "Rent Receipt Template for HRA (India)",
      description:
        "A free rent receipt template for Excel and Google Sheets — designed for House Rent Allowance (HRA) tax claims in India. Includes a printable single receipt and a 12-month rent log with auto totals. Every field the employer or income-tax officer expects: landlord PAN, revenue stamp note, mode of payment, and signature block.",
      content: `Salaried employees in India can claim exemption on House Rent Allowance (HRA) under Section 10(13A) of the Income Tax Act — but only if you have proper rent receipts. This free rent receipt template gives you two things: a **printable single-month receipt** you can sign and hand over, and a **12-month HRA log** (April to March) that summarises your entire financial year for your employer's HRA claim.

## Who needs this rent receipt template

- **Salaried employees living in rented accommodation** claiming HRA exemption
- **Landlords** providing receipts to tenants each month
- **Anyone** who needs proof of rent payment for tax filing, loan applications, or visa documentation

## When are rent receipts mandatory for HRA?

If your monthly HRA exceeds **₹3,000**, employers require rent receipts as proof to grant the HRA exemption at payroll time. During Income Tax Return (ITR) filing, the tax department can also ask for these receipts. Two rules to remember:

- **PAN of the landlord is mandatory** if your annual rent exceeds **₹1,00,000** (roughly ₹8,333 a month). If the landlord refuses to share PAN, a written declaration is required — most employers will not accept the HRA claim without either.
- **A revenue stamp is required** on cash rent receipts above **₹5,000**. For rent paid via cheque, NEFT, UPI, or bank transfer, no stamp is needed.

## What every rent receipt must contain

- Receipt number and date
- Tenant's full name
- Amount of rent (in figures and words)
- Period covered by the receipt (from date to date)
- Full address of the rented property
- Mode of payment (cash / cheque / NEFT / UPI / bank transfer)
- Landlord's name, address, and PAN (if annual rent exceeds ₹1,00,000)
- Landlord's signature
- Revenue stamp (for cash payments above ₹5,000)

Missing any of these fields can cause the employer or the income-tax officer to reject the HRA claim. This template captures every one of them.

## How the HRA exemption is calculated

The HRA exemption you can actually claim is the **least** of these three amounts:

1. Actual HRA received from your employer
2. Rent paid minus 10% of your Basic Salary + DA
3. **50%** of Basic + DA (if you live in a **metro** city: Delhi, Mumbai, Kolkata, Chennai) OR **40%** of Basic + DA (all other cities, including Bengaluru, Hyderabad, Pune, Ahmedabad)

The 12-month log sheet in this template sums up your annual rent so you can plug that number straight into the calculation.

## How to use this template

1. **Download the file** and open it in Excel or Google Sheets — it opens in both.
2. **Fill in the "Rent Receipt" sheet** for one month: receipt number, date, tenant name, amount, period, address, mode of payment, landlord name and PAN, landlord signature.
3. **Print the receipt**, get it signed and stamped (if paying cash above ₹5,000), and keep a copy.
4. **Fill in the "12-Month HRA Log" sheet** once at the start of the year with tenant, landlord, and property details. Fill in the monthly rent, payment date, and receipt number as you go — the total updates automatically.
5. **Attach both the individual receipts and the 12-month summary** to your HRA declaration to the employer.

## Common mistakes to avoid

- **Skipping the landlord's PAN** when annual rent exceeds ₹1,00,000 — this alone will get your HRA claim rejected.
- **Missing revenue stamps on cash receipts above ₹5,000** — required under the Indian Stamp Act.
- **Backdated receipts prepared in bulk at the end of the year** — the tax department can spot this pattern; issue them monthly.
- **Paying rent to a family member without proof of ownership** — legally allowed, but requires the relative to be the actual owner and to report the rental income in their own ITR.
- **Not matching the amount in words with the figures** — verifies the receipt is genuine.

## Rent receipt vs rent agreement

A **rent agreement** is a one-time contract between landlord and tenant covering the term, monthly rent, and conditions. A **rent receipt** is issued every month as proof that a specific month's rent was paid. Both are commonly asked for at HRA-claim time: the agreement establishes the arrangement, the receipts prove ongoing payment.

For related templates: our [Cash Book Template](/templates/cash-book-template) helps landlords track rental income and other receipts alongside expenses, and the [Profit and Loss Statement](/templates/profit-and-loss-statement) is useful if you rent out multiple properties as a business.`,
      fileUrl: "/files/rent-receipt-template.xlsx",
      thumbnailUrl: null,
      categoryId: accountingCategory.id,
      seoTitle: "Free Rent Receipt Template for HRA in Excel (12-Month Log Included)",
      seoDescription:
        "Free rent receipt template in Excel for HRA claims in India. Printable single receipt + 12-month HRA log with auto totals. Landlord PAN, revenue stamp, all fields ready.",
      features: [
        "Printable single-month receipt (one per month, HRA-ready)",
        "12-month HRA log — April to March — with auto annual total",
        "Every HRA-required field: landlord PAN, revenue stamp note, mode of payment",
        "HRA exemption calculation guide built into the log sheet",
        "Works in Excel, Google Sheets, and LibreOffice",
        "Print or save as PDF for employer submission"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Open the 'Rent Receipt' sheet and fill in one month's receipt.",
        "Add receipt number, date, tenant name, rent amount (figures + words), and payment period.",
        "Enter the full property address and mode of payment.",
        "Add landlord's name, address, PAN (mandatory if annual rent > ₹1,00,000), and contact.",
        "Print the receipt, get it signed, and affix a revenue stamp if cash exceeds ₹5,000.",
        "Open the '12-Month HRA Log' sheet and fill in tenant / landlord / property details once.",
        "Log each month's payment as it happens — the annual total updates automatically.",
        "Submit both the individual signed receipts and the 12-month summary to your employer."
      ],
      faqs: [
        {
          question: "Is landlord PAN mandatory for HRA claim?",
          answer:
            "Landlord PAN is mandatory when your annual rent exceeds ₹1,00,000 (approximately ₹8,333 per month). If the landlord refuses to share PAN, a signed declaration from the landlord is required, but most employers will not accept the HRA claim without a PAN. Include the PAN on every rent receipt to avoid problems at year-end."
        },
        {
          question: "Is a revenue stamp required on rent receipts?",
          answer:
            "Yes, if the rent is paid in cash and the amount exceeds ₹5,000 per receipt, a revenue stamp of ₹1 must be affixed and the landlord must sign across the stamp. For rent paid by cheque, NEFT, UPI, or bank transfer, no revenue stamp is required — the bank statement itself serves as additional proof."
        },
        {
          question: "Can I claim HRA if I pay rent to my parents or relatives?",
          answer:
            "Yes, you can pay rent to parents or a relative and claim HRA, provided the property is genuinely owned by them, an actual rent agreement exists, payment is made via bank transfer, and the recipient declares the rental income in their own Income Tax Return. Paying rent to a spouse is generally disallowed by courts and tax authorities."
        },
        {
          question: "How is the HRA exemption calculated?",
          answer:
            "The exemption is the least of three: (1) actual HRA received from employer, (2) rent paid minus 10% of basic salary plus DA, (3) 50% of basic + DA if you live in a metro city (Delhi, Mumbai, Kolkata, Chennai) or 40% for non-metro cities. The 12-month log in this template sums your annual rent so you can plug it into this calculation."
        },
        {
          question: "Do I need rent receipts for every month or is annual proof enough?",
          answer:
            "Best practice is one signed receipt per month — that is what employers and the income-tax department expect. A single lump-sum receipt for the whole year raises red flags. Issue receipts monthly as you pay rent; use the 12-month log in this template as the consolidated summary you attach along with them."
        }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "rent-receipt-template" },
      update: {
        fileUrl: rentReceiptData.fileUrl,
        description: rentReceiptData.description,
        content: rentReceiptData.content,
        seoTitle: rentReceiptData.seoTitle,
        seoDescription: rentReceiptData.seoDescription
      },
      create: { slug: "rent-receipt-template", ...rentReceiptData }
    });
  }

  // --- Real, hand-written blog post (supporting content that links to templates) ---
  const guidesCategory = await prisma.blogCategory.findUnique({
    where: { slug: "excel-guides" }
  });
  if (guidesCategory) {
    const postContent = `A GST invoice is more than just a bill — under Indian GST law it is a legal document that must contain specific details. Get the format right and your customer can claim input tax credit (ITC) smoothly; get it wrong and you risk penalties and rejected claims. This guide walks you through creating a fully GST-compliant invoice in Excel, step by step.

## What every GST invoice must include

The CGST Rules (Rule 46) require a tax invoice to show:

- Your business name, address, and **GSTIN**
- A unique, consecutive **invoice number** (up to 16 characters) and the invoice date
- The customer's name, address, and GSTIN (if they are registered)
- The **place of supply** and the state code
- The **HSN/SAC code** for each item or service
- Description, quantity, rate, and taxable value of each item
- The **tax rate and amount**, split into CGST + SGST (or IGST)
- Whether tax is payable on a reverse-charge basis
- The signature of the supplier or an authorised signatory

Miss any of these and the invoice may not be valid for input tax credit.

## Step-by-step: build a GST invoice in Excel

1. **Set up the header.** In the top rows, add your company name, address, GSTIN, and contact details. On the right, leave cells for the invoice number, date, and place of supply.
2. **Add a "Bill To" block.** Create labelled cells for the customer's name, address, GSTIN, and state.
3. **Create the item table.** Add columns for S.No, Description, HSN/SAC, Quantity, Rate, Taxable Value, GST %, CGST, SGST, and Total.
4. **Add the formulas.** Set Taxable Value to Quantity multiplied by Rate. For an 18% item, CGST and SGST are 9% each — so each tax equals Taxable Value times 9% (or Taxable Value times GST% divided by 2).
5. **Total everything up.** Below the table, use SUM formulas to total the taxable value, CGST, SGST, and the grand total.
6. **Finish the invoice.** Add the amount in words, your bank details, terms, and a signature line. Save it as a PDF before sending so the numbers cannot be changed.

## CGST + SGST, or IGST?

This trips up a lot of people. It depends on the **place of supply** versus your own state:

- **Same state (intra-state):** split the GST into **CGST + SGST**, half each.
- **Different state (inter-state):** charge a single **IGST** at the full rate.

So an 18% GST item is 9% CGST + 9% SGST for a local sale, or 18% IGST for an inter-state sale.

## Common mistakes to avoid

- **Repeating or skipping invoice numbers** — they must be a clean, consecutive series.
- **Charging CGST + SGST on an inter-state sale** (or IGST on a local one).
- **Leaving out the HSN/SAC code** or the place of supply.
- Editing an invoice after sending it — always send a non-editable PDF.

## The faster way: use a free template

Building the formulas from scratch takes time, and it is easy to make a mistake. Instead, you can download our [free GST Invoice Template](/templates/gst-invoice-template) — it already includes every required field and calculates CGST, SGST, and the total automatically. Just fill in your details and send it.

If the supplier is **unregistered** and GST is payable under Reverse Charge, do not use a regular tax invoice. Use the [self invoice format under GST (RCM) Excel template](/templates/self-invoice-rcm-template) instead.

If you do not need GST, or you bill international clients, our [general invoice template](/templates/invoice-template) works too.

## Summary

A compliant GST invoice needs your GSTIN, a unique invoice number, the place of supply, HSN/SAC codes, and the correct CGST/SGST or IGST split. Set it up once in Excel with formulas — or save the effort and start from a ready-made template.

## FAQ

### Is a hand-written or Excel GST invoice legal?
Yes. GST law does not require special software — the invoice can be printed, hand-written, or generated from Excel, as long as it contains every mandatory field (GSTIN, invoice number, date, place of supply, HSN/SAC, taxable value, and the correct GST split). The format matters, not the tool.

### What is the difference between CGST + SGST and IGST?
CGST + SGST applies to intra-state sales (buyer and seller in the same state), split half and half. IGST applies to inter-state sales (different states) and is charged as a single tax at the full rate. The place of supply determines which one you charge.

### How many copies of a GST invoice do I need?
For the supply of goods, three copies: original for the buyer, duplicate for the transporter, triplicate for your records. For services, two copies: original for the buyer and duplicate for your records.

### Can I use this Excel invoice template for GSTR-1 filing?
Yes. The template captures every field required for GSTR-1 return filing — invoice number, date, GSTIN of the recipient, taxable value, and CGST/SGST/IGST amounts. You can enter each invoice into the template and use it as a source for your monthly return.

### What if I buy from an unregistered supplier?
Then you need a self invoice under Reverse Charge, not a regular GST tax invoice. Use the [self invoice format under GST (RCM) Excel template](/templates/self-invoice-rcm-template).`;

    const postData = {
      title: "How to Create a GST Invoice in Excel (Step-by-Step Guide)",
      excerpt:
        "A step-by-step guide to creating a GST-compliant invoice in Excel — the required fields, CGST/SGST vs IGST, common mistakes, and a free template to download.",
      content: postContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "How to Create a GST Invoice in Excel (Step-by-Step)",
      seoDescription:
        "Learn how to create a GST-compliant invoice in Excel step by step — required fields, CGST/SGST vs IGST, common mistakes, and a free GST invoice template.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-create-gst-invoice-in-excel" },
      update: { content: postData.content, seoTitle: postData.seoTitle, seoDescription: postData.seoDescription },
      create: { slug: "how-to-create-gst-invoice-in-excel", ...postData }
    });

    const plPostContent = `A profit and loss statement (P&L) tells you the most important thing about your business: did it make money? It is also called an income statement, and you will need one for tax filing, loan applications, and simply understanding whether your business is healthy. The good news is you do not need accounting software to make one — Excel works perfectly. Here is how to build a profit and loss statement in Excel, step by step.

## What a profit and loss statement shows

A P&L summarises your income and spending over a period (a month, quarter, or year) and works down to your profit in a few clear stages:

- **Revenue** — all the money your business earned
- **Cost of Goods Sold (COGS)** — the direct cost of producing what you sold
- **Gross Profit** — Revenue minus COGS
- **Operating Expenses** — rent, salaries, marketing, utilities, and so on
- **Net Profit** — Gross Profit minus Operating Expenses (your bottom line)

## Step-by-step: build a P&L in Excel

1. **List your revenue.** In a column, add each income source (sales, services, other income) and the amount. Total them with a SUM formula.
2. **List your cost of goods sold.** Add the direct costs of what you sold — materials, direct labour — and total them.
3. **Calculate gross profit.** Subtract Total COGS from Total Revenue. This shows how much you make before running costs.
4. **List your operating expenses.** Add rent, salaries, utilities, marketing, software, and any other running costs, then total them.
5. **Calculate net profit.** Subtract Total Operating Expenses from Gross Profit. This is your actual profit (or loss).
6. **Review your margins.** Compare net profit to revenue to see your profit margin, and compare periods to spot trends.

## Gross profit vs net profit

People mix these up. **Gross profit** is what is left after the direct cost of your products or services. **Net profit** is what is left after *everything*, including rent and salaries. A business can have a healthy gross profit but a small (or negative) net profit if its running costs are high — which is exactly why the P&L is so useful.

## Common mistakes to avoid

- **Mixing COGS with operating expenses** — keep direct product costs separate from running costs, or your gross profit will be wrong.
- **Forgetting some expenses** — small recurring costs add up; include them all.
- **Not doing it regularly** — a P&L is most useful when you update it every month.

## Save time with a free template

You can set all of this up from scratch, or start from our [free Profit and Loss Statement template](/templates/profit-and-loss-statement) — it already has the revenue, COGS, and expense sections with the gross profit and net profit formulas built in. Just enter your figures.

To track the day-to-day numbers that feed your P&L, our [business expense tracker](/templates/business-expense-tracker) and [cash book template](/templates/cash-book-template) work well alongside it.

## Summary

A profit and loss statement walks from revenue down to net profit through gross profit and expenses. Build it once in Excel with SUM and subtraction formulas — or download a ready-made template and just fill in your numbers.

## FAQ

### What is the difference between a P&L statement and a balance sheet?
A P&L (or income statement) covers a period of time and shows whether your business made a profit or a loss during that period. A balance sheet is a snapshot on a single date and shows what you own (assets) and what you owe (liabilities). You need both, but the P&L is what tells you if the business is actually earning money.

### How often should I prepare a P&L statement?
Monthly is ideal for internal decisions — you spot problems early. Quarterly is fine for a small business, and annual P&L is the minimum for tax filing and loan applications. Most owners who track it monthly make better spending calls than those who only look at it once a year.

### What counts as COGS versus operating expense?
COGS (Cost of Goods Sold) is the direct cost of what you actually sold — materials, direct labour, packaging. Operating expenses are the running costs of the business regardless of sales — rent, salaries of office staff, marketing, utilities, software. If the cost only happens when you make a sale, it is usually COGS.

### Do I need a P&L statement for tax filing?
For sole proprietors and freelancers, an income summary is required to compute business income for your tax return. Companies must prepare a formal P&L as part of their financial statements. A clean Excel P&L is enough to give to your accountant.`;

    const plPostData = {
      title: "How to Make a Profit and Loss Statement in Excel (Step-by-Step)",
      excerpt:
        "Learn how to build a profit and loss statement in Excel step by step — revenue, COGS, gross profit, expenses, net profit, plus a free template to download.",
      content: plPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "How to Make a Profit and Loss Statement in Excel",
      seoDescription:
        "Step-by-step guide to creating a profit and loss statement in Excel — gross profit vs net profit, common mistakes, and a free P&L template to download.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-make-profit-and-loss-statement-in-excel" },
      update: { content: plPostData.content, seoTitle: plPostData.seoTitle, seoDescription: plPostData.seoDescription },
      create: { slug: "how-to-make-profit-and-loss-statement-in-excel", ...plPostData }
    });

    const expPostContent = `If you do not know where your money goes, you cannot control it. Tracking business expenses is the simplest habit that separates businesses that stay profitable from those that quietly bleed cash. You do not need expensive software — Excel does the job perfectly. Here is how to track your business expenses in Excel, step by step.

## Why track your expenses

- **Control spending** — you spot waste and recurring costs you forgot about.
- **Save on taxes** — well-recorded expenses are deductions you can actually claim.
- **Understand your business** — your expenses feed straight into your profit and loss statement.
- **Make better decisions** — you see which areas cost the most and where to cut.

## What to record for every expense

Keep it simple. For each expense, capture:

- **Date** of the expense
- **Category** (rent, utilities, salaries, marketing, travel, and so on)
- **Description** — a short note on what it was
- **Payment method** — cash, card, bank transfer, UPI
- **Amount**

## Step-by-step: set up an expense tracker in Excel

1. **Create the columns.** Add headings: Date, Category, Description, Payment Method, and Amount.
2. **Make a category list.** Decide on a fixed set of categories and use a dropdown so every entry is consistent. Consistency is what makes your totals meaningful.
3. **Enter expenses as they happen.** The habit matters more than the format — add each expense the day it occurs so nothing is forgotten.
4. **Add a summary.** On a second sheet, use a SUMIF formula to total spending by category. This instantly shows where your money goes.
5. **Review monthly.** At month end, look at the category totals, compare with previous months, and act on anything that crept up.

## Categories most small businesses use

Rent, utilities, salaries and wages, inventory or materials, marketing, travel, office supplies, software and subscriptions, taxes, and a "miscellaneous" catch-all. Keep the list short enough to be practical but detailed enough to be useful.

## Tips to actually stay consistent

- **Record daily, not monthly** — catching up on a month of receipts is painful and error-prone.
- **Keep your receipts** — note the voucher or receipt number so you can find proof later.
- **Separate business and personal** — never mix the two; it makes tax time a nightmare.

## Save time with a free template

Setting up the formulas yourself takes time. Instead, download our [free business expense tracker](/templates/business-expense-tracker) — it already has the category dropdown and an automatic summary that totals your spending by category. Just start entering expenses.

To track cash specifically, our [cash book template](/templates/cash-book-template) records cash in and out with a running balance, and your totals feed neatly into a [profit and loss statement](/templates/profit-and-loss-statement).

## Summary

Tracking business expenses comes down to recording every expense consistently with a date, category, and amount, then summarising by category each month. Set it up in Excel with a dropdown and a SUMIF summary — or start from a ready-made template and just enter your numbers.

## FAQ

### Which business expenses are tax deductible?
Ordinary and necessary business expenses are deductible — rent, utilities, office supplies, professional fees, marketing, business travel, staff salaries, and depreciation on business assets. Personal expenses are not, even if paid from the business account. Keep a receipt or invoice for every entry so you can defend the deduction if asked.

### Should I track personal and business expenses in the same file?
No. Keep them completely separate. Mixing them makes tax filing painful, confuses your P&L, and can cause problems if your business is ever audited. Use one spreadsheet for the business and a separate one for personal finance.

### What is the difference between an expense tracker and a cash book?
An expense tracker records only outgoing money by category — useful for spotting where you spend. A cash book records both inflows (income received) and outflows (expenses paid) with a running balance, giving you an accurate view of cash on hand. Many small businesses use both.

### Can I use this Excel expense template in Google Sheets?
Yes. Upload the .xlsx file to Google Drive and open with Google Sheets. Formulas, categories, and the SUMIF summary continue to work. You will get real-time collaboration too, which is useful if more than one person logs expenses.`;

    const expPostData = {
      title: "How to Track Business Expenses in Excel (Step-by-Step + Free Template)",
      excerpt:
        "Learn how to track business expenses in Excel — what to record, how to set up a category summary, tips to stay consistent, and a free expense tracker template.",
      content: expPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "How to Track Business Expenses in Excel (Free Template)",
      seoDescription:
        "Step-by-step guide to tracking business expenses in Excel — what to record, a category summary with SUMIF, consistency tips, and a free expense tracker.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-track-business-expenses-in-excel" },
      update: { content: expPostData.content, seoTitle: expPostData.seoTitle, seoDescription: expPostData.seoDescription },
      create: { slug: "how-to-track-business-expenses-in-excel", ...expPostData }
    });
  }

  const payrollCategory = await prisma.templateCategory.findUnique({
    where: { slug: "payroll-templates" }
  });
  if (payrollCategory) {
    const salarySlipData = {
      title: "Salary Slip Template",
      description:
        "A free salary slip template for Excel and Google Sheets. Enter earnings and deductions once, and gross pay, total deductions, and net salary calculate automatically.",
      content:
        "A salary slip is the monthly pay statement an employer gives to an employee, showing earnings, deductions, and the final net salary payable. This template keeps the format simple and professional: fill in company details, employee details, salary month, earnings such as basic pay and HRA, and deductions such as provident fund, professional tax, or TDS. The sheet automatically totals gross earnings, total deductions, and net salary payable. It is useful for small businesses, HR teams, accountants, and founders who need a clean payroll document without setting up full payroll software.",
      fileUrl: "/files/salary-slip-template.xlsx",
      thumbnailUrl: null,
      categoryId: payrollCategory.id,
      seoTitle: "Free Salary Slip Template for Excel (Auto Net Pay)",
      seoDescription:
        "Download a free salary slip template for Excel and Google Sheets. Auto-calculates gross earnings, deductions, and net salary payable.",
      features: [
        "Auto-calculates gross earnings, deductions, and net salary",
        "Separate earnings and deductions sections",
        "Includes employee, company, bank, and salary month fields",
        "Editable for PF, professional tax, TDS, bonus, and allowances",
        "Works in Excel, Google Sheets, and LibreOffice"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Replace the company name, address, and contact details at the top.",
        "Fill in the employee name, ID, designation, department, bank account, and salary month.",
        "Enter earnings such as basic salary, HRA, conveyance allowance, special allowance, or bonus.",
        "Enter deductions such as provident fund, professional tax, TDS, loan recovery, or other deductions.",
        "Review the gross earnings, total deductions, and net salary payable before sharing the slip.",
        "Save a copy as PDF before sending it to the employee."
      ],
      faqs: [
        { question: "Is this salary slip template free?", answer: "Yes. It is free to download and edit for personal and business use." },
        { question: "Does the net salary calculate automatically?", answer: "Yes. Gross earnings, total deductions, and net salary payable are formula-driven and update as soon as you change the amounts." },
        { question: "Can I edit the earnings and deduction names?", answer: "Yes. You can rename every component, add allowances, remove unused rows, and adapt the template to your payroll structure." },
        { question: "Does it work in Google Sheets?", answer: "Yes. Upload the file to Google Sheets and the formulas carry over." }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "salary-slip-template" },
      update: { fileUrl: salarySlipData.fileUrl, seoTitle: salarySlipData.seoTitle, seoDescription: salarySlipData.seoDescription },
      create: { slug: "salary-slip-template", ...salarySlipData }
    });
  }

  if (guidesCategory) {
    const salarySlipPostContent = `A **salary slip** — also called a pay slip or salary payslip — is one of the most important documents an Indian employee receives every month. It proves your income, breaks down your earnings and deductions, and is what banks, tax officers, and visa authorities ask for as evidence of employment. If you're an employer paying salaries, issuing one is legally required. This guide shows you how to make a clean, compliant salary slip in Excel — with a **simple salary slip format** you can adapt, real calculations for HRA, EPF, ESI, and TDS, and a **free salary slip template** to download.

## Who needs a salary slip

- **Employees** — to verify your pay is correct, claim HRA at tax time, and prove income for loans, credit cards, or visas
- **Employers and HR teams** — to comply with the Payment of Wages Act and state Shops and Establishments Acts, which require issuing a slip each pay period
- **Small business owners** paying even a single employee — the law does not exempt small businesses; a proper salary slip protects both parties
- **Freelancers or consultants** — even if you don't get a formal slip, a self-issued "salary/income statement" in this format works for loan and visa applications

## What a salary slip should include

A practical salary slip must include the following sections. Missing any of these can cause the slip to be rejected by a bank or tax officer:

- **Company details** — company name, registered address, email, phone number, and (optionally) logo
- **Employee details** — employee name, employee ID, designation, department, date of joining, and bank account number
- **Salary period** — the month and year the slip belongs to (e.g. "Salary for July 2026")
- **Earnings** — basic salary, House Rent Allowance (HRA), Dearness Allowance (DA), conveyance, medical, special allowance, bonus, and any other earnings
- **Deductions** — Employee Provident Fund (EPF), Employees' State Insurance (ESI), professional tax, TDS (income tax), loan recovery, and any other deductions
- **Gross earnings** — the total of all earnings (a formula, not a hard-coded number)
- **Total deductions** — the total of all deductions
- **Net salary payable** — gross earnings minus total deductions, the amount actually credited to the bank

The exact components vary by company, industry, and country, so treat the format as a payroll document you can adapt — but keep every section labelled clearly.

## Salary slip vs pay slip vs salary certificate vs Form 16

These four terms confuse a lot of people. They are related but different:

- **Salary slip / Pay slip** — the two are the same thing. Different companies use different names. It is a monthly document showing one month's earnings, deductions, and net pay.
- **Salary certificate** — a summary letter from the employer stating designation, duration of employment, and annual salary. Usually issued on request (for a bank loan, visa, or new job).
- **Form 16** — an annual tax document issued by employers under the Income Tax Act showing salary paid and TDS deducted across the financial year. Required for ITR filing.
- **Offer letter / appointment letter** — the initial employment contract stating agreed pay and terms. Not proof of ongoing salary.

Banks and visa officers usually ask for **3 recent salary slips + latest Form 16 + bank statement**. Salary certificate is requested separately if needed.

## Basic salary vs gross salary vs net salary — what's the difference?

This is where most people get confused. Three numbers appear on every salary slip:

- **Basic salary** — the fixed base component decided at hiring. Most other components (HRA, EPF, gratuity) are calculated as a percentage of basic. Typically 40–50% of gross for most private companies.
- **Gross salary (Gross earnings)** — Basic + HRA + DA + all allowances + bonus. The full "cost to company" before any deductions. This is what banks look at for loan eligibility.
- **Net salary (Take-home / In-hand)** — Gross salary minus all deductions (EPF, ESI, professional tax, TDS). This is the amount actually credited to your bank account.

Example for an employee with ₹50,000 gross salary:
- Basic: ₹20,000 | HRA: ₹10,000 | Conveyance: ₹1,600 | Special allowance: ₹18,400
- **Gross: ₹50,000**
- EPF (12% of basic): ₹2,400 | Professional tax: ₹200 | TDS: ₹2,000
- **Net take-home: ₹45,400**

## Step-by-step: create a salary slip in Excel

1. **Create the header.** Add your company name, address, contact details, and the title "Salary Slip" or "Pay Slip". Add "For the month of [Month] [Year]" prominently.
2. **Add employee information.** Include employee name, employee ID, designation, department, joining date, bank account, PAN, and UAN (for EPF).
3. **Build the earnings table.** Add rows for basic salary, HRA, DA, conveyance allowance, medical allowance, special allowance, bonus, and any other earnings. Amount column on the right.
4. **Build the deductions table.** Add rows for EPF, ESI, professional tax, TDS, loan recovery, and any other deductions.
5. **Add formulas.** Use SUM to calculate gross earnings and total deductions. Then calculate net salary as Gross Earnings minus Total Deductions.
6. **Add signature space.** Employer/HR signature line at the bottom right; "This is a system-generated slip" line if you don't sign physically.
7. **Review before sharing.** Check employee details, salary month, tax deductions, and final net salary. Save as a password-protected PDF before sending.

## Useful Excel formulas

You only need simple formulas — no complex macros:

- Gross earnings: \`=SUM(earnings_range)\`
- Total deductions: \`=SUM(deductions_range)\`
- Net salary: \`=gross_earnings-total_deductions\`

For per-component calculations, common patterns are:

- HRA = 40% or 50% of basic (metro vs non-metro): \`=basic_salary*0.50\`
- EPF (employee contribution, 12% of basic): \`=basic_salary*0.12\`
- Professional tax (varies by state, flat monthly): a hard-coded amount is fine, e.g. \`=200\` for most Maharashtra/Karnataka bands
- Round-off net salary to nearest rupee: \`=ROUND(net_salary,0)\`

Keep formula cells in locked/protected ranges if multiple people edit the sheet.

## How each component is calculated (with example numbers)

Understanding the maths helps you (as employee) verify your slip or (as employer) explain it. Using ₹50,000 gross monthly salary:

- **HRA exemption for tax:** the exempt portion is the least of (i) actual HRA received, (ii) rent paid − 10% of basic, (iii) 50% of basic in metros / 40% in non-metros. Use monthly rent receipts to prove rent paid — our [Rent Receipt Template](/templates/rent-receipt-template) is designed for this.
- **EPF (Employee Provident Fund):** 12% of basic salary from both employee and employer. On ₹20,000 basic, that's ₹2,400 from each side. Employer's ₹2,400 splits into ₹1,750 to EPS (pension) and ₹650 to EPF.
- **ESI (Employees' State Insurance):** applies only if gross salary ≤ ₹21,000/month. Employee contributes 0.75% of gross, employer 3.25%. Skip this line if the employee earns more than ₹21,000.
- **Professional tax:** state-specific, flat monthly amount (₹200 in Maharashtra/Karnataka on higher slabs; nil in Delhi/UP). Check your state's slab.
- **TDS (Income tax deducted at source):** based on the employee's declared investments and annual tax slab, divided by 12 for monthly deduction. Actual calculation is done by HR using the current year's income-tax slabs — the salary slip just shows the monthly amount deducted.

## What can you do with a salary slip?

A salary slip is not just an HR formality — it unlocks several real-world uses:

- **HRA claim at tax time** — submit last 12 months of slips (plus rent receipts) to your employer to reduce TDS, or use them to compute HRA exemption when filing ITR
- **Home loan / personal loan / credit card** — banks universally require last 3 months of slips as income proof
- **Visa application** — most tourist and work visas need 3-6 months of slips
- **ITR filing** — cross-check TDS deducted in your Form 26AS against your salary slips
- **Provident Fund withdrawal / transfer** — need slips as proof of employment period
- **New job negotiation** — recruiters often ask for a recent slip to verify your CTC

Given this, keep a well-organised folder of your monthly slips — ideally as PDFs named "salary-slip-2026-07.pdf" for each month.

## Common mistakes to avoid

- **Forgetting the salary month** — old slips become impossible to file when the period is missing
- **Mixing earnings and reimbursements** — reimbursements (travel expenses, phone bill) are NOT salary; keep them in a separate reimbursement voucher
- **Using hard-coded totals instead of formulas** — one wrong entry corrupts the net pay; formulas catch this
- **Sending editable Excel files** — always export to PDF before sending; the recipient (bank, employer, tax officer) expects PDF
- **Not password-protecting** — salary is sensitive data; add a password (usually employee's PAN or DOB in DDMMYYYY format) before emailing
- **Ignoring EPF/ESI/PT rules for your state** — statutory deductions vary; verify PF, ESI, and professional tax rules for your state before official use
- **Skipping the employer signature or system-generated note** — an unsigned slip can be rejected by banks

## Save time with a free template

Instead of building the layout and formulas from scratch, download our [free salary slip template](/templates/salary-slip-template). It includes company header, employee details, standard earnings and deductions sections, automatic gross pay, total deductions, and net salary payable — all with live formulas. Just enter the numbers for your employee.

If you also manage cash flow and expenses, our [cash book template](/templates/cash-book-template) and [business expense tracker](/templates/business-expense-tracker) keep payroll-related spending organized. For rent-receipt-based HRA claims, use the [Rent Receipt Template for HRA](/templates/rent-receipt-template) alongside your salary slip.

## Summary

A good salary slip is clear, formula-driven, statutorily compliant, and easy to verify. Create separate sections for company details, employee details, earnings (basic + HRA + allowances), and deductions (EPF, ESI, professional tax, TDS). Use SUM formulas for gross and totals, then subtract to get net salary. Save as password-protected PDF each month — you'll need those slips for HRA, loans, visas, and ITR filing over the coming years.

## FAQ

### Is a salary slip legally required in India?
Yes. Under the Payment of Wages Act and state Shops and Establishments Acts, employers must provide a salary slip (or pay slip) to every employee for each pay period. It must show earnings, deductions, and net pay. Both physical and electronic (PDF) formats are accepted.

### Which deductions must appear on a salary slip?
Statutory deductions that must be shown separately include Employee Provident Fund (EPF), Employees' State Insurance (ESI) where applicable, professional tax, and TDS (income tax deducted). Other deductions such as loan repayments or advances should also be listed as separate line items so the employee can verify each one.

### Can I email a salary slip in Excel format?
Better to export the Excel salary slip as a password-protected PDF before emailing. PDF prevents accidental edits, looks the same on every device, and is what banks and other institutions expect when the employee submits it for loans or visa applications.

### How do I calculate net salary?
Net salary is gross earnings minus total deductions. Gross earnings usually include basic pay, HRA, conveyance, medical, and any allowances or bonuses. Deductions include EPF, ESI, professional tax, and TDS. In Excel, set net pay as a simple SUM(earnings) minus SUM(deductions) formula so it updates automatically as you edit the components.`;

    const salarySlipPostData = {
      title: "How to Make a Salary Slip in Excel (Simple Format + Free Template)",
      excerpt:
        "Complete guide to making a salary slip in Excel — simple format, basic vs gross vs net salary explained, EPF/ESI/TDS calculations with examples, real-world uses (HRA, loans, visa), plus a free salary slip template to download.",
      content: salarySlipPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "Simple Salary Slip Format in Excel — How to Make One (Free Template)",
      seoDescription:
        "How to make a salary slip in Excel with a simple format — basic vs gross vs net salary, EPF/ESI/TDS calculations with examples, real-world uses, plus a free salary slip template download.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-make-salary-slip-in-excel" },
      update: { content: salarySlipPostData.content, seoTitle: salarySlipPostData.seoTitle, seoDescription: salarySlipPostData.seoDescription },
      create: { slug: "how-to-make-salary-slip-in-excel", ...salarySlipPostData }
    });
  }

  const educationCategory = await prisma.templateCategory.findUnique({
    where: { slug: "education-templates" }
  });
  if (educationCategory) {
    const vlookupData = {
      title: "VLOOKUP Formula Template",
      description:
        "A free VLOOKUP formula practice template for Excel and Google Sheets. Learn exact-match VLOOKUP with product price and employee detail examples, dropdowns, and ready-made formulas.",
      content:
        "VLOOKUP is one of the most useful Excel formulas for finding related information from a table. This template gives you working examples instead of a blank explanation: enter a product code to return product name, category, price, and stock, or enter an employee ID to return department, location, and manager. The workbook also includes a quick guide sheet that explains each part of the VLOOKUP syntax, why exact match matters, and how to avoid common errors such as #N/A. It is ideal for beginners, office teams, students, and anyone who wants to understand lookup formulas by editing a real spreadsheet.",
      fileUrl: "/files/vlookup-formula-template.xlsx",
      thumbnailUrl: null,
      categoryId: educationCategory.id,
      seoTitle: "Free VLOOKUP Formula Template for Excel",
      seoDescription:
        "Download a free VLOOKUP formula template for Excel. Practice exact-match VLOOKUP with product and employee lookup examples.",
      features: [
        "Working exact-match VLOOKUP formulas",
        "Product price lookup with line total calculation",
        "Employee details lookup by employee ID",
        "Dropdown sample lookup values to reduce typing errors",
        "Quick guide sheet explaining VLOOKUP syntax and mistakes"
      ],
      instructions: [
        "Download the file and open it in Excel, Google Sheets, or LibreOffice.",
        "Open the Product Lookup sheet and choose a product code in column A.",
        "Review how VLOOKUP returns product name, category, price, and stock from the lookup table.",
        "Change the quantity to see the line total update automatically.",
        "Open the Employee Lookup sheet and choose an employee ID to return employee details.",
        "Read the Quick Guide sheet to understand lookup_value, table_array, col_index_num, and exact match.",
        "Replace the sample lookup tables with your own codes, names, prices, or staff records."
      ],
      faqs: [
        { question: "Is this VLOOKUP formula template free?", answer: "Yes. It is free to download and edit for personal, study, and business use." },
        { question: "What does VLOOKUP do in Excel?", answer: "VLOOKUP searches for a value in the first column of a table and returns a matching value from another column in the same row." },
        { question: "Why does the formula use FALSE?", answer: "FALSE tells Excel to find an exact match, which is usually what you want for product codes, employee IDs, invoice numbers, and other fixed lookup values." },
        { question: "Does it work in Google Sheets?", answer: "Yes. VLOOKUP formulas, dropdowns, and formatting work after uploading the file to Google Sheets." }
      ]
    };
    await prisma.template.upsert({
      where: { slug: "vlookup-formula-template" },
      update: { fileUrl: vlookupData.fileUrl, seoTitle: vlookupData.seoTitle, seoDescription: vlookupData.seoDescription },
      create: { slug: "vlookup-formula-template", ...vlookupData }
    });
  }

  if (guidesCategory) {
    const vlookupPostContent = `VLOOKUP is one of the classic Excel formulas people learn when they need to connect two tables. It helps you type one value, such as a product code or employee ID, and return related information from a lookup table. Once you understand the structure, you can use it for price lists, staff records, invoice sheets, stock files, student records, and many everyday spreadsheet tasks.

## What VLOOKUP means

VLOOKUP stands for "vertical lookup". It searches down the first column of a table, finds the value you ask for, and returns a value from another column in the same row.

The basic formula is:

\`=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])\`

Here is what each part means:

- **lookup_value** - the value you want Excel to search for, such as \`P-1001\`
- **table_array** - the table that contains your lookup value and the result columns
- **col_index_num** - the column number to return from inside the selected table
- **range_lookup** - use \`FALSE\` for exact match, which is best for most office work

## Simple example

Imagine you have a product table:

| Code | Product | Price |
| --- | --- | --- |
| P-1001 | Wireless Mouse | 699 |
| P-1002 | USB-C Cable | 299 |
| P-1003 | Laptop Stand | 1499 |

If cell A2 contains \`P-1001\`, this formula returns the product name:

\`=VLOOKUP(A2,$A$6:$C$8,2,FALSE)\`

To return the price instead, change the column number from 2 to 3:

\`=VLOOKUP(A2,$A$6:$C$8,3,FALSE)\`

## Step-by-step: how to use VLOOKUP in Excel

1. **Put the lookup value in the first column of your table.** VLOOKUP can only search the first column of the table range you select.
2. **Select the full lookup table.** Include the lookup column and the columns you want to return.
3. **Count the return column.** If your selected table starts at Code, then Code is column 1, Product is column 2, Price is column 3, and so on.
4. **Use FALSE for exact match.** For product codes, IDs, invoice numbers, and names, exact match avoids wrong results.
5. **Lock the table range.** Use dollar signs like \`$A$6:$C$8\` so the range does not move when you copy the formula.
6. **Wrap with IFERROR if needed.** \`IFERROR\` lets you show a blank cell or friendly message instead of \`#N/A\`.

## Why exact match matters

The last part of VLOOKUP is easy to ignore, but it matters. If you use \`TRUE\` or leave the final argument blank, Excel performs an approximate match. That can be useful for grading bands or tax slabs, but it can return surprising results if your table is not sorted.

For most business templates, use:

\`FALSE\`

This forces Excel to return a result only when it finds the exact lookup value.

## Common VLOOKUP mistakes

- **The lookup value is not in the first column.** VLOOKUP searches only the first column of the selected table.
- **The column number is wrong.** Count from the left edge of your selected table, not from column A of the worksheet.
- **The table range moves when copied.** Use absolute references such as \`$A$6:$C$8\`.
- **Extra spaces break the match.** \`P-1001\` and \`P-1001 \` are not the same value to Excel.
- **Numbers are stored as text.** Make sure both lookup values use the same data type.
- **Approximate match is used by accident.** Add \`FALSE\` as the final argument.

## VLOOKUP with IFERROR

When Excel cannot find a match, VLOOKUP returns \`#N/A\`. That is useful while checking errors, but it can look messy in a final template.

Use this pattern to show a blank cell instead:

\`=IFERROR(VLOOKUP(A2,$A$6:$C$8,2,FALSE),"")\`

Or show a message:

\`=IFERROR(VLOOKUP(A2,$A$6:$C$8,2,FALSE),"Not found")\`

## Practice with a free template

The fastest way to learn VLOOKUP is to edit a working file. Download our [free VLOOKUP formula template](/templates/vlookup-formula-template) and open the Product Lookup sheet. Choose a product code, watch the formula return product name, category, price, and stock, then inspect the formula cells.

The same workbook also includes an Employee Lookup sheet and a Quick Guide sheet, so you can practice the formula in more than one real-world context.

## VLOOKUP vs XLOOKUP

Newer versions of Excel include XLOOKUP, which is more flexible because it can look left, return multiple columns, and has built-in not-found handling. Still, VLOOKUP remains common in older workbooks, office templates, shared spreadsheets, and interviews. If you understand VLOOKUP, you will read and fix many existing Excel files more confidently.

## Summary

Use VLOOKUP when you need Excel to search for a value in a table and return related information from the same row. Keep the lookup value in the first column, lock your table range, count the return column carefully, and use \`FALSE\` for exact match. For practice, start with the [VLOOKUP formula template](/templates/vlookup-formula-template), then replace the sample lookup tables with your own data.

## FAQ

### When should I use VLOOKUP versus XLOOKUP?
Use XLOOKUP if you are on Excel 2021 or Microsoft 365 — it is easier, searches in any direction, and does not depend on column position. Use VLOOKUP if you are on an older version of Excel, if your team shares files with people on older versions, or if you already have working VLOOKUPs you do not want to rewrite.

### Why does my VLOOKUP return #N/A?
Almost always one of four reasons: the lookup value has extra spaces (use TRIM), it is stored as text while the table has numbers (or the other way around), the lookup column is not the first column of the table range, or the value simply does not exist in the table. Wrap in IFERROR to display a friendly message instead of #N/A.

### What does FALSE mean at the end of VLOOKUP?
FALSE (or 0) tells VLOOKUP to find an exact match. TRUE (or 1) tells it to find an approximate match, which requires the lookup column to be sorted and is mostly used for tax slabs or grade bands. For almost every everyday lookup — product codes, IDs, prices — always use FALSE.

### Can VLOOKUP search from right to left?
No. VLOOKUP can only look up values in the first column of the table range and return a column to its right. To search leftwards, either rearrange the table so the lookup column comes first, use INDEX + MATCH, or use XLOOKUP if available.`;

    const vlookupPostData = {
      title: "How to Use VLOOKUP Formula in Excel",
      excerpt:
        "Learn how to use VLOOKUP in Excel with syntax, examples, exact match, IFERROR, common mistakes, and a free practice template.",
      content: vlookupPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "How to Use VLOOKUP Formula in Excel",
      seoDescription:
        "Learn how to use VLOOKUP formula in Excel with examples, exact match, IFERROR, common mistakes, and a free practice template.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-use-vlookup-formula-in-excel" },
      update: { content: vlookupPostData.content, seoTitle: vlookupPostData.seoTitle, seoDescription: vlookupPostData.seoDescription },
      create: { slug: "how-to-use-vlookup-formula-in-excel", ...vlookupPostData }
    });

    const rcmPostContent = `Need a **self invoice format under GST for RCM in Excel**? This guide shows when a self invoice is mandatory, how it differs from a regular tax invoice, and how to fill the format. You can also [download the free Excel template](/templates/self-invoice-rcm-template) and skip building the formulas.

If you are a registered business in India and you receive goods or services from an unregistered supplier, you cannot skip the paperwork by pretending the transaction did not happen. Under GST, you are the one who has to pay the tax — and you have to issue an invoice to yourself. This is called a **self invoice under Reverse Charge Mechanism (RCM)**. Here is how it works and how to raise one in Excel.

## What is a self invoice under GST?

A self invoice is a tax invoice raised by a registered recipient (the buyer) when they receive goods or services from an **unregistered supplier** and GST is payable under Reverse Charge. Because the supplier is not registered, they cannot issue a GST-compliant invoice — so Section 31(3)(f) of the CGST Act requires you, the recipient, to raise one on your own behalf.

Without a valid self invoice, the tax department can disallow the Input Tax Credit you claim on the RCM tax you pay. You lose the credit, and the RCM tax becomes a real cost.

## When is a self invoice required?

You must raise a self invoice for any inward supply on which GST is payable under Reverse Charge, including:

- **Purchases from an unregistered supplier** of notified goods or services (Section 9(4))
- **Goods Transport Agency (GTA)** — freight charges paid to a transporter
- **Legal services from an advocate** or advocate firm
- **Director's remuneration** paid by a company
- **Sponsorship services** received by a body corporate or partnership firm
- **Import of services** from a supplier located outside India
- Any other supply notified by the government under Section 9(3)

## Self invoice vs regular tax invoice — what changes

- The **recipient** issues the invoice, not the supplier.
- The **supplier's GSTIN is blank** (they are unregistered).
- The **Reverse Charge** field is marked **Yes**.
- The **recipient pays GST in cash** directly to the government — you cannot pay RCM tax by using existing Input Tax Credit.
- The RCM liability is reported in **Table 3.1(d) of GSTR-3B**, and the corresponding ITC is claimed in Table 4A(3) of the same return.

## Self invoice vs payment voucher — you need both

This trips up a lot of people. Section 31(3)(f) requires the **self invoice** at the time you receive the goods or services. Section 31(3)(g) separately requires a **payment voucher** when you make the payment. So every RCM transaction produces two documents — one for the receipt, one for the payment. Keep both in your records.

## Step-by-step: create a self invoice in Excel

1. **Add your business details** at the top — legal name, address, GSTIN, and state code. You are both the issuer and the recipient.
2. **Number your self invoices in a separate series.** Use something like SI-001, SI-002 so RCM invoices are easy to identify. Do not mix them into your regular sales invoice numbers.
3. **Enter the invoice date** — the date you received the goods or services.
4. **Add the unregistered supplier's details** — name, address, state and code. Leave GSTIN blank.
5. **Record the reason for RCM** — unregistered dealer, GTA, advocate, director's remuneration, and so on.
6. **List each item** — description, HSN/SAC, quantity, rate, and GST rate. The taxable value, CGST, SGST, and total should calculate automatically if you set up the formulas (or use a ready-made template).
7. **Verify the Grand Total** and note the amount in words.
8. **Raise a separate Payment Voucher** when you pay the supplier.
9. **Report the RCM liability** in Table 3.1(d) of GSTR-3B and claim ITC in Table 4A(3).

## Common mistakes to avoid

- **Using the same numbering series as regular sales invoices** — keep RCM self invoices in their own SI-xxx series.
- **Trying to pay RCM tax using Input Tax Credit** — RCM tax must be paid in cash from the electronic cash ledger.
- **Skipping the payment voucher** — both self invoice and payment voucher are required.
- **Applying the wrong GST rate** — RCM uses the same rate as if the supplier were registered.
- **Missing the ITC deadline** — you must claim ITC of RCM tax by the September following the financial year, or the return of the following year, whichever is earlier.

## Save time with a free template

Setting up the RCM self invoice from scratch — with the Reverse Charge flag, the unregistered supplier block, and all the tax formulas — takes time and there are places to slip up. Instead, download our [free RCM invoice format / self invoice under GST](/templates/self-invoice-rcm-template). It has every required field, the Reverse Charge flag pre-set, live CGST + SGST formulas, and a built-in RCM compliance checklist. When you pay the supplier, fill the matching [RCM payment voucher](/templates/rcm-payment-voucher-template).

If the supplier IS registered and issues their own invoice, you do not need a self invoice — you use their regular tax invoice. For that, our [GST Invoice Template](/templates/gst-invoice-template) is what you want.

## Summary

A self invoice under GST is mandatory whenever you receive goods or services from an unregistered supplier and pay GST under Reverse Charge. Number them in a separate SI-xxx series, mark Reverse Charge as Yes, leave the supplier's GSTIN blank, pay the tax in cash, report it in GSTR-3B Table 3.1(d), and claim ITC in the same return. And always raise a Payment Voucher alongside when you pay.

## FAQ

### What is a self invoice under GST?
A self invoice is a tax invoice raised by a registered recipient when they receive goods or services from an unregistered supplier where GST is payable under Reverse Charge Mechanism. It is mandatory under Section 31(3)(f) of the CGST Act because the unregistered supplier cannot issue a GST-compliant invoice.

### Who has to issue a self invoice under RCM?
The registered recipient (the buyer) issues it. This applies to purchases from unregistered suppliers, GTA freight, advocate services, director's remuneration, sponsorship services, and import of services — any inward supply where GST is payable under Reverse Charge.

### Can I claim Input Tax Credit on RCM tax paid via self invoice?
Yes. The RCM tax you pay in cash becomes ITC once the self invoice is raised and the tax is paid. Report the RCM liability in Table 3.1(d) of GSTR-3B and the ITC in Table 4A(3) of the same return. The ITC deadline is the September of the following financial year or the annual return filing date, whichever is earlier.

### What is the difference between a self invoice and a payment voucher?
A self invoice is the tax document raised when you receive the goods or services — it is what supports your ITC claim. A payment voucher is a separate document raised when you make the payment to the supplier. Section 31(3)(g) makes the payment voucher mandatory for every RCM transaction, so you need both documents. Download the [RCM payment voucher format](/templates/rcm-payment-voucher-template).

### Do I need a separate invoice series for RCM self invoices?
Yes. Best practice is to maintain a distinct consecutive series (for example SI-001, SI-002) separate from your regular outward tax invoices. This makes RCM transactions easy to identify during return filing, reconciliation, and audits.

### Is there a free self invoice format under GST Excel download?
Yes. Download the [self invoice format under GST (RCM) Excel template](/templates/self-invoice-rcm-template). It is free, works in Excel and Google Sheets, and includes CGST/SGST formulas plus an RCM checklist.`;

    const rcmPostData = {
      title: "Self Invoice Format Under GST (RCM) in Excel — Free Download",
      excerpt:
        "Self invoice format under GST for RCM in Excel: when it is mandatory, vs a regular tax invoice, payment voucher rules, GSTR-3B, and a free Excel download.",
      content: rcmPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "Self Invoice Format Under GST (RCM) in Excel — Free Template",
      seoDescription:
        "How to create a self invoice format under GST for RCM in Excel — when it is mandatory, vs payment voucher, GSTR-3B, and a free RCM Excel download.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-create-self-invoice-under-gst-rcm-in-excel" },
      update: {
        title: rcmPostData.title,
        excerpt: rcmPostData.excerpt,
        content: rcmPostData.content,
        seoTitle: rcmPostData.seoTitle,
        seoDescription: rcmPostData.seoDescription
      },
      create: { slug: "how-to-create-self-invoice-under-gst-rcm-in-excel", ...rcmPostData }
    });

    const paymentVoucherPostContent = `A bank UTR is not a GST payment voucher. When you pay an unregistered supplier and tax is under Reverse Charge, Section 31(3)(g) requires a **payment voucher**. This guide shows what goes on the voucher, how it differs from the self invoice, and how to fill the format in Excel. You can also [download the free RCM payment voucher](/templates/rcm-payment-voucher-template).

## What is a payment voucher under GST?

A payment voucher is the document the **registered recipient** issues when they pay for an inward supply on which GST is payable under Reverse Charge. Rule 52 lists the fields: your GSTIN, the supplier's name and address, a consecutive voucher number, the date, a description, the amount paid, the place of supply, and whether tax is on reverse charge.

It is a payment record. It is not a tax invoice. ITC still sits on the [self invoice / RCM invoice format](/templates/self-invoice-rcm-template) you raised when you received the goods or services.

## Self invoice vs payment voucher

| Document | When | Law | Job |
|---|---|---|---|
| Self invoice | Receipt of goods or services | Section 31(3)(f) | Tax document for GSTR-3B and ITC |
| Payment voucher | Payment to the supplier | Section 31(3)(g) / Rule 52 | Proof of payment in the prescribed form |

Every RCM deal produces both. Skipping the voucher because "the NEFT is enough" is the usual mistake.

## What you pay whom

Pay the unregistered supplier **only their billed amount**. They cannot collect GST. You pay CGST + SGST (or IGST) to the government from the **electronic cash ledger**. Existing ITC cannot discharge Reverse Charge.

Example — GTA freight of ₹18,500 at 5%:

- NEFT to GTA: **₹18,500**
- Cash ledger to government: **₹925** (CGST ₹462.50 + SGST ₹462.50 if intra-state)
- Self invoice SI-014 records the tax
- Payment voucher PV-014 records the ₹18,500 and points at SI-014

## Step-by-step in Excel

1. **Header.** Your legal name, address, GSTIN, state. You are the issuer.
2. **Number.** Use a PV-xxx series. Do not reuse INV- or SI- numbers.
3. **Payment block.** Date, mode (NEFT / UPI / cheque / cash), UTR or cheque number.
4. **Self Invoice No.** Copy it from the matching self invoice so an auditor can join the two files.
5. **Payee.** Unregistered supplier name, address, state. GSTIN stays blank.
6. **Lines.** Description, HSN/SAC, amount paid to the supplier, GST %. Formulas should show CGST/SGST as tax **to government**, not as an add-on to the supplier total.
7. **Sign.** Amount in words for the supplier payment. Authorised signatory.

## Common mistakes

- Adding 18% on top of the supplier NEFT
- Leaving Self Invoice No. empty
- Using one number series for sales, self invoices, and vouchers
- Filing GSTR-3B Table 3.1(d) with no voucher in the folder
- Treating a screenshot of the bank app as the document

## Free template

Download the [RCM payment voucher format](/templates/rcm-payment-voucher-template). Pair it with the [RCM invoice format (self invoice under GST)](/templates/self-invoice-rcm-template). For a registered supplier's outward invoice, use the [GST Invoice Template](/templates/gst-invoice-template) instead.

## FAQ

### Is a payment voucher required if I already have a self invoice?
Yes. Receipt and payment are two events. The Act asks for two documents.

### Can I pay RCM GST to the supplier?
No. Pay them the billed amount only. Pay tax to the government in cash.

### What series should I use?
PV-001, PV-002 for vouchers. SI-001, SI-002 for self invoices. Keep both away from sales INV- numbers.

### Where is the longer self-invoice guide?
[Self invoice format under GST (RCM) in Excel](/blog/how-to-create-self-invoice-under-gst-rcm-in-excel).`;

    const paymentVoucherPostData = {
      title: "How to Create a Payment Voucher Under GST (RCM) in Excel",
      excerpt:
        "GST payment voucher for Reverse Charge: what Rule 52 requires, vs a self invoice, what you pay the supplier vs the government, and a free Excel download.",
      content: paymentVoucherPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "Payment Voucher Under GST (RCM) in Excel — Free Format",
      seoDescription:
        "How to make a GST payment voucher for RCM in Excel — Rule 52 fields, vs self invoice, cash-ledger GST, and a free payment voucher download.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-create-payment-voucher-under-gst-rcm-in-excel" },
      update: {
        title: paymentVoucherPostData.title,
        excerpt: paymentVoucherPostData.excerpt,
        content: paymentVoucherPostData.content,
        seoTitle: paymentVoucherPostData.seoTitle,
        seoDescription: paymentVoucherPostData.seoDescription
      },
      create: { slug: "how-to-create-payment-voucher-under-gst-rcm-in-excel", ...paymentVoucherPostData }
    });

    const rentReceiptPostContent = `If you live in a rented house and receive House Rent Allowance (HRA) from your employer, rent receipts are the single most important document at tax time. They are what unlock the HRA exemption under Section 10(13A) of the Income Tax Act — and without them the entire HRA in your salary becomes taxable. Here is how to make a rent receipt in Excel that your employer and the income-tax department will accept.

## When are rent receipts required?

Employers ask for rent receipts whenever your monthly HRA is more than ₹3,000. During Income Tax Return filing, the tax officer can also demand them. Two rules to keep in mind:

- **Landlord PAN is mandatory** when your annual rent crosses **₹1,00,000** (roughly ₹8,333 per month). Without PAN — or a signed declaration from the landlord — the HRA claim can be rejected.
- **A revenue stamp of ₹1** must be affixed on cash rent receipts exceeding ₹5,000. For cheque, NEFT, UPI, or bank transfer, no stamp is required — the bank record itself is your extra proof.

## What every rent receipt must contain

To be valid for HRA, every rent receipt needs these fields. Missing any of them can cause the employer or the tax officer to reject the claim:

- Receipt number and date
- Full name of the tenant
- Rent amount (in figures and in words)
- Period covered by the receipt (from date to date)
- Full address of the rented property
- Mode of payment — cash, cheque, NEFT, UPI, or bank transfer
- Landlord's name, address, and PAN (when annual rent > ₹1,00,000)
- Landlord's signature — over the revenue stamp for cash > ₹5,000

## Step-by-step: make a rent receipt in Excel

1. **Open a blank spreadsheet.** Set page layout to A4 or letter so the receipt prints cleanly.
2. **Add a title bar** — RENT RECEIPT in bold at the top. Below it, add a one-line note: "For claiming HRA under Section 10(13A) of the Income Tax Act."
3. **Create the receipt meta row** — Receipt Number and Date, in two cells side by side.
4. **Write the main text** — a sentence like: "Received a sum of ₹[amount] from Mr./Ms. [tenant name] towards the monthly rent for the period from [date] to [date] for the property situated at [address]."
5. **Add an amount block** — three rows: Rent Amount (in figures), Amount in words, and Mode of Payment.
6. **Add a landlord details block** — Name, Address, PAN, Contact Number. Highlight PAN visually because it is the field most often missed.
7. **Add a signature block** with a small placeholder for the revenue stamp on the left, and a signature line + "Signature of Landlord" label on the right.
8. **Print the receipt monthly**, get it signed, and file a copy with your own records.

## Rent receipt vs rent agreement

A **rent agreement** is a one-time contract that establishes the arrangement — parties, term, monthly rent, deposit, notice period. A **rent receipt** is issued every month as proof that a specific month's rent was actually paid. Both are commonly asked for at HRA-claim time — the agreement establishes the arrangement, the receipts prove ongoing payment.

## How the HRA exemption is calculated

The HRA exemption you can actually claim is the **least** of these three amounts:

1. Actual HRA received from employer
2. Rent paid minus 10% of your Basic Salary + DA
3. **50%** of Basic + DA if you live in a **metro city** — Delhi, Mumbai, Kolkata, Chennai; or **40%** of Basic + DA for **non-metro cities**, which includes Bengaluru, Hyderabad, Pune, Ahmedabad, and all other cities

Sum up all 12 months of rent for the number to plug into that formula. A 12-month HRA log makes this trivial.

## Common mistakes to avoid

- **Skipping the landlord PAN** when annual rent exceeds ₹1,00,000 — the most common HRA-rejection reason.
- **Missing revenue stamps on cash receipts above ₹5,000** — required under the Indian Stamp Act.
- **Preparing all 12 receipts in one sitting at year-end** — obvious to the tax department; issue them monthly.
- **Paying rent to a spouse and claiming HRA** — courts and tax authorities disallow this.
- **Paying rent in cash without any bank proof** — technically allowed but risky; NEFT / UPI is much safer.
- **Missing revenue stamp signature** — the landlord must sign **across** the revenue stamp, not just beside it.

## Save time — download our free rent receipt template

Instead of building the format from scratch, download our [free Rent Receipt Template for HRA (India)](/templates/rent-receipt-template). It gives you two sheets: a printable single-month receipt with every HRA-required field, and a 12-month HRA log for the full April–March financial year that auto-sums your annual rent for the exemption calculation.

For related tools: the [Salary Slip Template](/templates/salary-slip-template) helps you verify HRA in your monthly pay, and the [Cash Book Template](/templates/cash-book-template) is useful for landlords tracking rental income from multiple properties.

## Summary

Rent receipts are what turn HRA in your salary from a taxable amount into an exemption. Every receipt needs the tenant name, rent amount, period, property address, mode of payment, and landlord's name, PAN, and signature. Add a revenue stamp for cash above ₹5,000 and always include the landlord's PAN if annual rent exceeds ₹1,00,000. Issue one receipt per month — never bulk at year-end — and keep them alongside your rent agreement for a clean HRA claim.

## FAQ

### Is landlord PAN mandatory for HRA claim?
Landlord PAN is mandatory when your annual rent exceeds ₹1,00,000 (approximately ₹8,333 per month). If the landlord refuses to share PAN, a written declaration from the landlord is required — but most employers will not accept the HRA claim without an actual PAN. Include the PAN on every rent receipt for the entire year to be safe.

### Is a revenue stamp required on every rent receipt?
No. A revenue stamp of ₹1 is only required when the rent is paid in cash and the receipt amount exceeds ₹5,000. For payments made via cheque, NEFT, UPI, or bank transfer, no revenue stamp is needed — the bank record provides additional proof of payment.

### Can I claim HRA if I pay rent to my parents?
Yes, you can pay rent to parents or a relative and claim HRA, provided (1) the property is genuinely owned by them, (2) an actual rent agreement exists, (3) payment is made via bank transfer, and (4) the recipient declares the rental income in their own Income Tax Return. Paying rent to a spouse is generally not accepted by courts and tax authorities.

### How is the HRA exemption calculated?
The exemption you can claim is the least of these three: (1) actual HRA received from employer, (2) rent paid minus 10% of basic salary plus DA, (3) 50% of basic + DA if you live in a metro city (Delhi, Mumbai, Kolkata, Chennai) or 40% for non-metro cities. Adding up all 12 months of rent gives you the "rent paid" figure for the second calculation.

### Do I need monthly receipts or is one annual receipt enough?
Best practice is one signed receipt per month — that is what employers and the income-tax department expect. A single lump-sum receipt for the whole year raises red flags during scrutiny. Issue monthly receipts and attach them along with a consolidated 12-month summary when submitting your HRA declaration.`;

    const rentReceiptPostData = {
      title: "How to Create a Rent Receipt for HRA in Excel (India)",
      excerpt:
        "Step-by-step guide to creating a rent receipt in Excel for HRA claims in India — required fields, landlord PAN rule, revenue stamp rule, HRA calculation, common mistakes, and a free rent receipt template with a 12-month log to download.",
      content: rentReceiptPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "How to Create a Rent Receipt for HRA in Excel (India)",
      seoDescription:
        "Step-by-step guide to a rent receipt for HRA claims in India. Required fields, landlord PAN rule, revenue stamp rule, HRA calculation formula, and a free rent receipt template.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-create-rent-receipt-for-hra-in-excel" },
      update: { content: rentReceiptPostData.content, seoTitle: rentReceiptPostData.seoTitle, seoDescription: rentReceiptPostData.seoDescription },
      create: { slug: "how-to-create-rent-receipt-for-hra-in-excel", ...rentReceiptPostData }
    });

    const monthlyBudgetPostContent = `Most people avoid making a **monthly budget** because they think it means spending less. It doesn't. A budget is just a plan for the money you already have — a way to know where it goes instead of wondering. Once you see the pattern, you can decide what to do about it. This guide shows you how to make a monthly budget in Excel from scratch, using a simple structure that works whether you earn a regular salary, freelance, or have variable income.

## Why a monthly budget matters

Without a budget, three things happen almost universally: (1) you underestimate variable spending like dining out and subscriptions, (2) you save whatever is left at month-end, which is usually nothing, and (3) irregular expenses like insurance renewals or holiday gifts sneak up and land on credit cards. A budget fixes all three by turning "somehow" into "on purpose."

A good monthly budget gives you:

- A clear picture of income vs spending
- An emergency fund and savings goals that actually get funded
- Early warning when a category is drifting over
- Confidence to say "yes" to spending — because you know it fits

## The 50/30/20 rule — the simplest budget framework

If you've never budgeted before, start here. Take your monthly take-home pay (after tax) and split it:

- **50% for needs** — rent or mortgage, utilities, groceries, insurance, transportation to work, minimum debt payments. The must-pay items.
- **30% for wants** — dining out, entertainment, hobbies, subscriptions, non-essential shopping, travel. The nice-to-have items.
- **20% for savings and debt payoff** — emergency fund, retirement contributions, extra debt payments, investments. The future-you items.

You don't have to hit these percentages exactly on month one — the point is knowing whether you're at 50/30/20 or 60/38/2. If your savings percentage is under 10%, that's the signal to look at variable spending.

## The 5 sections every monthly budget needs

Whether you use the 50/30/20 rule or your own framework, structure your budget with these five sections:

### 1. Income
List every source with its expected monthly amount. Include:
- Primary salary (after tax)
- Secondary income (freelance, side gig, rental income)
- Investment income (dividends, interest)
- Other regular income (child support, alimony, refunds)

For variable income (freelancers), budget based on your last 6 months' average — not your best month.

### 2. Fixed expenses
Bills that are roughly the same amount every month:
- Rent or mortgage
- Utilities (electricity, water, gas, internet, phone)
- Insurance (health, auto, home, life)
- Loan payments (car, student, personal)
- Subscriptions (streaming, cloud, software, gym)
- Childcare or school fees

Fixed expenses are your baseline "cost of existence." Track them separately because they're hard to change month-to-month.

### 3. Variable expenses
The big opportunity area — spending that changes month to month based on your choices:
- Groceries
- Dining out (restaurants, coffee, takeout, delivery)
- Transportation (fuel, transit, rideshare, parking)
- Entertainment (movies, concerts, hobbies, events)
- Personal care (haircut, gym, skincare)
- Shopping (clothing, household items, gifts)
- Medical (copays, prescriptions, over-the-counter)
- Miscellaneous

If you're going to trim, this section is where you have the most control.

### 4. Savings and investments
Every budget must have this line — even if the amount is small:
- Emergency fund (target: 3-6 months of expenses)
- Retirement (401(k), IRA, pension contributions)
- Investments (brokerage, index funds)
- Specific goals (down payment, vacation, wedding, business seed money)

If you save whatever's left over, you'll save nothing. Assign the amount at the start of the month.

### 5. Debt payments
List each debt separately so you see progress:
- Credit card minimum payments
- Extra payments toward the debt you're focused on (snowball or avalanche method)
- Student loan payments
- Any personal or family loans

## Step-by-step: build a monthly budget in Excel

1. **Open Excel or Google Sheets** and create a new file called "Monthly Budget — [current month]".
2. **Set up 5 sections** in columns for Income, Fixed Expenses, Variable Expenses, Savings, Debt Payments.
3. **In each section, use these columns:** Category | Note | Budgeted | Actual | Diff.
4. **Fill Budgeted amounts** based on your last 1-2 months of actual spending. Look at your bank and credit card statements to get real numbers — don't guess.
5. **Add SUM formulas** at the bottom of each section for Budgeted and Actual columns.
6. **Add a summary card at the top** showing: Total Income, Total Planned Spending, Money Left Over (Income − Spending).
7. **Calculate Savings Rate:** \`=Total Savings / Total Income\`, formatted as a percentage. Target 20% or higher.
8. **Enter Actual amounts as they happen** — ideally weekly, minimum monthly. The Diff column shows where you're on or off track.

## How to actually stick to a budget (the hard part)

The template is easy. The habit is what matters. A few things that work in practice:

- **Look at it more than once a month.** A budget you check on the 30th is a report, not a tool. Check weekly.
- **Automate savings first.** Set up an automatic transfer to savings the day after payday, before you can spend it. The savings section becomes a fixed expense.
- **Round expenses UP when budgeting.** If groceries were $487 last month, budget $520. Room for reality prevents "failed month" fatigue.
- **Have a monthly review with your partner** if you share finances. 20 minutes over coffee. Compare notes on categories that drifted.
- **Give yourself a "fun money" line.** Wants that require no explanation. A budget with zero fun money is a diet — sustainable for weeks, not years.
- **Roll the surplus.** If you had money left over, don't spend it. Move it to savings or debt payoff before the next month starts.

## Common monthly budget mistakes

- **Budgeting who you wish you were.** If you spent $300 on dining out last month, budget $250 — not $80.
- **Forgetting irregular expenses.** Annual insurance renewals, car registration, birthdays, holidays. Divide the yearly total by 12 and allocate a small monthly amount.
- **Not tracking actuals.** Budgeting without tracking is a wish list. The Actual column is where real change happens.
- **Setting goals with no timeline.** "Save more" isn't a goal. "Save $6,000 for emergency fund by December" is.
- **Not talking about it with your partner.** Money is the #1 topic couples argue about. Budgets built together stick; budgets imposed by one person fail.

## Save time — download the free monthly budget template

Instead of building the layout and formulas from scratch, download our [free Monthly Budget Spreadsheet](/templates/monthly-budget-template). It has all 5 sections pre-built with sample data, Budgeted vs Actual columns, a Monthly Summary card at the top, automatic Savings Rate calculation, and a 12-month Yearly Summary sheet. Currency-neutral — works with dollars, euros, pounds, or any currency.

For related planning: our [Business Expense Tracker](/templates/business-expense-tracker) is what to use if you're a freelancer keeping side-business expenses separate from personal, and the [Cash Book Template](/templates/cash-book-template) works well if you deal in cash frequently.

## Summary

A monthly budget is a plan for the money you already have. Split your take-home pay into needs (50%), wants (30%), and savings + debt payoff (20%). Structure the plan into 5 sections — income, fixed expenses, variable expenses, savings, and debt — with Budgeted and Actual columns. Track weekly, review monthly, and roll surplus into savings instead of spending it. Start realistic; adjust as you learn your actual patterns.

## FAQ

### How do I make a monthly budget for beginners?
Start with the 50/30/20 rule: 50% of take-home pay for needs (rent, utilities, groceries, insurance), 30% for wants (dining, entertainment, shopping), 20% for savings and debt payoff. In a spreadsheet, list each category with a Budgeted amount and an Actual amount. Fill in actuals as transactions happen. At month-end, review categories where you overspent and adjust for next month.

### What is the 50/30/20 budget rule?
The 50/30/20 rule is a simple framework where 50% of your take-home pay goes to needs, 30% to wants, and 20% to savings and debt payoff. It's a starting benchmark — you can adjust the percentages to your situation (some people use 60/20/20 or 70/20/10), but the discipline of assigning every category to a bucket is what makes it work.

### How much should I save each month?
A common target is 20% of take-home pay. If you're just starting, even 5% is better than 0% — the habit matters more than the amount. As you pay off debt and increase income, aim to grow your savings rate over time. This template calculates your savings rate automatically so you can track progress.

### What's the difference between fixed and variable expenses?
Fixed expenses are roughly the same amount every month — rent or mortgage, insurance, loan payments, subscriptions. Variable expenses change based on your choices — groceries, dining out, entertainment, shopping. Variable expenses are usually the easiest to trim when you need to save more.

### Should I use a budgeting app or a spreadsheet?
Both work. Apps (Mint, YNAB, EveryDollar) auto-sync with your bank and are easier to maintain. Spreadsheets give you full control, work offline, don't require a subscription, and are portable. If you've tried apps and they didn't stick, a spreadsheet often does — because manually entering each transaction forces awareness.`;

    const monthlyBudgetPostData = {
      title: "How to Make a Monthly Budget in Excel (Step-by-Step for Beginners)",
      excerpt:
        "Complete beginner-friendly guide to making a monthly budget in Excel — the 50/30/20 rule, the 5 sections every budget needs, step-by-step instructions, common mistakes to avoid, and a free monthly budget template to download.",
      content: monthlyBudgetPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "How to Make a Monthly Budget in Excel (Free Template + 50/30/20 Guide)",
      seoDescription:
        "Learn how to make a monthly budget in Excel step by step — the 50/30/20 rule, income, fixed and variable expenses, savings, debt payoff, plus a free monthly budget template.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-make-monthly-budget-in-excel" },
      update: { content: monthlyBudgetPostData.content, seoTitle: monthlyBudgetPostData.seoTitle, seoDescription: monthlyBudgetPostData.seoDescription },
      create: { slug: "how-to-make-monthly-budget-in-excel", ...monthlyBudgetPostData }
    });

    const weddingBudgetPostContent = `The average wedding is one of the biggest coordinated purchases most people ever make — and unlike a house or a car, it's spread across dozens of vendors, deposits, and deadlines. Without a written budget, small overruns pile up quietly until the day arrives and you realize you're 30% over what you meant to spend. This guide shows you how to make a wedding budget in Excel that actually holds up under the reality of planning — with the right categories, per-head cost logic, and simple habits that keep you honest.

## Why a wedding budget is different from a regular budget

Regular budgets track recurring monthly income and expenses. Wedding budgets are the opposite — a **one-time**, **project-based** budget with:

- Big deposits due at very different times (venue 12 months out, florist 1 month out)
- Costs that scale with guest count in unpredictable ways
- Tax and service charges hidden inside vendor quotes
- Multiple contributors (couple, both sets of parents, expected gifts)
- Emotional pressure that pushes toward "just one more thing"

A regular monthly budget spreadsheet won't do — you need something built around vendors, deposits, and category subtotals.

## Step 1: figure out your total budget

Before you list a single cost, add up what's actually available:

- **Couple's savings and monthly contribution.** How much you've saved plus what you can add each month until the wedding.
- **Family contributions.** Get specific commitments — "we'll help" is not a number. If parents will pay for a specific category (e.g. "we'll cover the catering"), note it separately.
- **Expected wedding gifts.** Some regions and cultures have significant cash-gift traditions; some don't. Be realistic — don't count on gifts you might not get.
- **Any other sources.** Personal loans (usually a bad idea for a wedding), business bonuses, tax refunds.

Add these up. That total is your budget. Build the wedding within it — don't inflate it because you saw something on Pinterest.

## Step 2: pick a target style

Roughly, weddings fall into a few style tiers, each with its own realistic cost floor:

- **Micro / elopement** — under 20 guests, minimal venue, focus on photography and honeymoon
- **Intimate** — 30-60 guests, one venue, catered, professional photos
- **Standard** — 80-150 guests, full venue + reception, DJ or band, floral, photo + video
- **Large** — 150+ guests, upscale venue, extensive vendor list
- **Destination** — travel + venue + accommodation combined; guest count usually smaller

Which tier fits your budget determines which categories dominate. A micro-wedding puts more into photography and honeymoon; a large wedding puts more into catering and rentals.

## Step 3: use the standard wedding cost categories

Every wedding cost fits into one of these 11 categories. Use them consistently or you'll miss things:

1. **Venue & Ceremony** — venue rental, officiant, ceremony chairs, marriage license
2. **Catering & Bar** — meal per head, cocktail hour, cake, bar service, service fees
3. **Attire & Beauty** — dress + alterations, suit, shoes, accessories, hair, makeup
4. **Flowers & Decor** — bouquets, centerpieces, arch, aisle runner, reception decor
5. **Photography & Video** — photographer, videographer, engagement shoot, album
6. **Stationery** — save-the-dates, invitations, RSVP cards, programs, place cards
7. **Music & Entertainment** — DJ or band, ceremony music, sound rental, photo booth
8. **Transportation** — bride & groom car, guest shuttle, valet parking
9. **Rings & Gifts** — wedding rings, gifts for parents, favors for guests
10. **Honeymoon** — flights, accommodation, activities, spending money
11. **Miscellaneous** — wedding insurance, rehearsal dinner, welcome bags, tips, emergency fund

## Step 4: allocate percentages, then research real vendor prices

A rough allocation of the average wedding budget:

- **Venue + Catering:** 45-50%
- **Photography/Video:** 12-15%
- **Attire + Beauty:** 8-10%
- **Flowers + Decor:** 8-10%
- **Music + Entertainment:** 8-10%
- **Stationery + Rings + Gifts + Transportation:** 5-8%
- **Buffer for surprises:** 5-10%
- **Honeymoon:** typically budgeted separately

Start with these percentages, then replace with real quotes from vendors in your area. Nothing beats calling 3 photographers, 3 caterers, and 3 venues to know what "normal" costs in your region.

## Step 5: understand per-head costs (the biggest lever)

Many costs scale linearly with guest count:

- Catering (meal per head is usually the biggest line)
- Bar service (per head per hour of open bar)
- Chair, linen, and place setting rentals
- Cocktail-hour appetizers
- Cake portion sizing
- Stationery (menu cards, place cards)
- Favors per guest

**Multiply an all-in per-head figure by number of guests** to see the real cost of the guest list. If your all-in per-head is $80 (or ₹4,000) and you cut 20 guests, that's $1,600 (or ₹80,000) — usually more than any single vendor negotiation would save.

## Step 6: build the spreadsheet

If you want to build it from scratch, structure it with three sheets:

**Sheet 1 — Budget Overview:**
- Total budget (a single cell you set)
- Total estimated (SUM of estimated column on sheet 2)
- Total spent so far (SUM of paid column on sheet 2)
- Remaining in budget (budget − spent)
- Category summary table — one row per category with SUMIF formulas that pull totals from sheet 2

**Sheet 2 — Detailed Budget:**
- One row per line item
- Columns: Category, Item, Vendor, Estimated cost, Paid so far, Balance (formula: Estimated − Paid), Due Date
- Group rows by category (Venue rows together, Catering rows together, etc.)

**Sheet 3 — Guest & Per-Head Calculator:**
- Guest count breakdown (invited, confirmed, declined, awaiting)
- Per-head cost items (catering per plate, bar per head, favors per guest)
- Multiply guests × per-head to see total impact per category

## Step 7: track deposits and due dates religiously

Wedding vendors typically require 25-50% deposits months in advance, with the balance due weeks before the wedding. Missed deposits mean lost bookings. Use the **Due Date column** ruthlessly:

- 12 months out — venue deposit
- 9-10 months out — photographer, videographer, catering, DJ deposits
- 6 months out — florist, stationery
- 3 months out — cake, transportation, hair/makeup trials
- 1 month out — final balances on most vendors
- 2 weeks out — final guest count locked in

Sort the Detailed Budget by Due Date whenever you check it. Anything red = pay this week.

## Common wedding budgeting mistakes to avoid

- **Underestimating tax and service charges.** Most caterers add 15-25% on top of quoted per-head price for service and tax. Always ask for the "all-in" price.
- **Booking the biggest ticket last.** Venue and caterer should be booked first — they set the constraints for everything else.
- **No emergency buffer.** Keep 5-10% of budget unallocated. Something always goes over.
- **Vague "we'll help" contributions.** If a family member is contributing, get a specific amount or category committed in writing (or clear conversation).
- **Impulse Pinterest additions.** Save ideas, but only add them to your Estimated column when you're ready to source them.
- **Forgetting vendor tips.** In many regions, tips are expected for photographers, DJs, catering staff — budget 15-20% on top of vendor invoices where tipping is normal.

## Save time — download the free wedding budget template

Instead of building all three sheets from scratch, download our [free Wedding Budget Planner Spreadsheet](/templates/wedding-budget-template). It comes pre-built with:

- Budget Overview with category summary and savings tracker
- Detailed Budget with 60+ pre-filled line items across all 11 categories
- Guest & Per-Head cost calculator
- All SUMIF, deposit, and balance formulas ready to go

Currency-neutral — enter amounts in your local currency ($, €, £, ₹) and every formula works.

For personal-finance tracking alongside your wedding, our [Monthly Budget Spreadsheet](/templates/monthly-budget-template) helps you save toward the wedding each month with automatic savings-rate calculation.

## Summary

A wedding budget is a project budget, not a monthly budget. Add up realistic contributions first, then allocate the total across 11 standard categories using rough percentages (Venue+Catering 45-50%, Photo 12-15%, and so on). Get real vendor quotes to replace the estimates. Track deposits and balances line-by-line with due dates. Keep 5-10% buffer for surprises. And remember — the guest list is the single biggest cost lever, so use per-head math whenever the number changes.

## FAQ

### How do I make a wedding budget in Excel?
Start with the total available budget (couple's savings + family contributions + expected gifts). Then build three sheets in Excel: (1) a Budget Overview with total, spent, and remaining, (2) a Detailed Budget with rows per line item grouped by category (venue, catering, attire, etc.) with Estimated, Paid, and Balance columns, and (3) a Guest & Per-Head calculator. Use SUMIF formulas to auto-total each category on the Overview sheet.

### What percentage of a wedding budget goes to catering?
Catering and venue combined typically eat 45-50% of the wedding budget. Catering alone is often the single largest line item — 25-35% of total budget depending on the region and style of wedding. The per-head meal cost is the biggest driver, which is why cutting guest count saves more than most vendor negotiations.

### What is a realistic wedding budget?
There's no universal "realistic" number — wedding budgets range from a few thousand dollars for a small intimate ceremony to hundreds of thousands for large destination weddings. A realistic budget is one where the total you can actually spend (savings + family contributions + expected gifts) matches or exceeds the total your desired guest count and style would cost. Start with what you have, then design the wedding to fit it — not the other way around.

### How can I stick to my wedding budget?
Four things work in practice: (1) book venue and catering first so the biggest costs are locked in early, (2) use a per-head cost calculator so you feel the impact of every guest-list change, (3) leave 5-10% of budget as an unallocated buffer for surprises, and (4) track deposits and balances weekly, not monthly — problems are cheaper to catch early. This template has all four built in.

### Should we include the honeymoon in the wedding budget?
Either approach works. Many couples budget the honeymoon separately because it's a distinct trip with its own contribution sources (some parents contribute to the honeymoon specifically) and its own timing (paid after the wedding). Others include it as one of the 11 categories in a single wedding budget for a cleaner "total" picture. This template includes a Honeymoon category on the Detailed Budget — leave it in or delete it based on how you're thinking about it.`;

    const weddingBudgetPostData = {
      title: "How to Make a Wedding Budget in Excel (Step-by-Step Planner)",
      excerpt:
        "Complete step-by-step guide to making a wedding budget in Excel — total budget, 11 wedding categories, percentage allocations, per-head cost logic, deposit tracking, common mistakes, and a free wedding budget planner template.",
      content: weddingBudgetPostContent,
      featuredImage: null,
      categoryId: guidesCategory.id,
      seoTitle: "How to Make a Wedding Budget in Excel (Free Planner Template)",
      seoDescription:
        "Step-by-step guide to a wedding budget in Excel — total budget, 11 categories, percentage allocations, per-head cost logic, deposit tracking, and a free wedding budget planner template.",
      published: true
    };
    await prisma.blogPost.upsert({
      where: { slug: "how-to-make-wedding-budget-in-excel" },
      update: { content: weddingBudgetPostData.content, seoTitle: weddingBudgetPostData.seoTitle, seoDescription: weddingBudgetPostData.seoDescription },
      create: { slug: "how-to-make-wedding-budget-in-excel", ...weddingBudgetPostData }
    });
  }

  if (guidesCategory) {
    for (const post of EDITORIAL_POSTS) {
      await prisma.blogPost.upsert({
        where: { slug: post.slug },
        update: {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          published: true
        },
        create: {
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          featuredImage: null,
          categoryId: guidesCategory.id,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          published: true
        }
      });
    }
  }

  if (!seedDemo) {
    console.log("Seeded essentials (admin user + categories + search indexes). Skipping demo content. Set SEED_DEMO=true to include sample templates and posts.");
    await prisma.setting.upsert({
      where: { key: "site" },
      update: {},
      create: { key: "site", value: { name: "TemplateHub", adsenseReady: true, storage: "local" } }
    });
    return;
  }

  const categoryLookup = Object.fromEntries(
    (await prisma.templateCategory.findMany()).map((category) => [category.slug, category.id])
  );

  for (let index = 0; index < templateTitles.length; index += 1) {
    const title = templateTitles[index];
    const slug = slugify(title);
    const categorySlug = pickCategory(title);
    const tagNames = [categorySlug.replace("-templates", ""), "excel", index % 2 ? "business" : "free"];
    const tags = await Promise.all(
      tagNames.map((name) =>
        prisma.tag.upsert({
          where: { slug: slugify(name) },
          update: { name },
          create: { name, slug: slugify(name) }
        })
      )
    );

    await prisma.template.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        description: `Download a professionally structured ${title.toLowerCase()} for Excel. Built for small businesses, teams, consultants, and educators who need a clean spreadsheet workflow.`,
        content: `${title} helps teams organize spreadsheet work with predefined fields, formulas, formatting, and practical instructions. Use it as a starting point, customize the columns, and keep records consistent across months.`,
        fileUrl: `/uploads/templates/${slug}.xlsx`,
        thumbnailUrl: `/uploads/images/${slug}.jpg`,
        categoryId: categoryLookup[categorySlug],
        downloadCount: 80 + index * 37,
        viewCount: 250 + index * 91,
        seoTitle: `${title} Free Download`,
        seoDescription: `Free ${title.toLowerCase()} download for Excel with instructions, features, FAQs, and related spreadsheet resources.`,
        features: ["Excel-ready layout", "Editable fields", "Printable format", "Built-in calculation areas", "Small business friendly"],
        instructions: ["Download the spreadsheet file.", "Open it in Microsoft Excel, Google Sheets, or LibreOffice.", "Update the sample fields with your own business data.", "Review formulas before using the file for official reporting."],
        faqs: [
          { question: `Is the ${title} free?`, answer: "Yes, TemplateHub templates are free to download for personal and business use." },
          { question: "Can I edit the template?", answer: "Yes, every spreadsheet is designed to be customized for your workflow." }
        ],
        tags: { connect: tags.map((tag) => ({ id: tag.id })) }
      }
    });
  }

  const blogCategoryLookup = Object.fromEntries(
    (await prisma.blogCategory.findMany()).map((category) => [category.slug, category.id])
  );

  for (let index = 0; index < blogTitles.length; index += 1) {
    const title = blogTitles[index];
    const lowered = title.toLowerCase();
    const categorySlug = lowered.includes("hr") || lowered.includes("attendance") || lowered.includes("employee") ? "hr" : lowered.includes("finance") || lowered.includes("budget") || lowered.includes("cash") ? "finance" : lowered.includes("account") || lowered.includes("gst") ? "accounting" : lowered.includes("business") || lowered.includes("sales") ? "business" : "excel-guides";
    const slug = slugify(title);

    await prisma.blogPost.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        excerpt: `A practical guide from TemplateHub covering ${title.toLowerCase()} with examples, template tips, and spreadsheet workflow advice.`,
        content: `## ${title}\n\nSpreadsheets remain one of the fastest ways to organize operational data. This guide explains the core fields to include, common mistakes to avoid, and how to adapt an TemplateHub template for real work.\n\n### Recommended workflow\n\nStart with a clean template, keep source data separate from calculations, protect formula cells, and review totals before sharing files with stakeholders.\n\n### SEO and operations note\n\nReusable spreadsheet systems help businesses standardize reporting and reduce manual errors while keeping the workflow accessible to non-technical teams.`,
        featuredImage: `/uploads/images/${slug}.jpg`,
        categoryId: blogCategoryLookup[categorySlug],
        viewCount: 400 + index * 123,
        seoTitle: title,
        seoDescription: `Learn ${title.toLowerCase()} with TemplateHub's practical spreadsheet guide and free template recommendations.`
      }
    });
  }

  await prisma.setting.upsert({
    where: { key: "site" },
    update: {},
    create: {
      key: "site",
      value: {
        name: "TemplateHub",
        adsenseReady: true,
        storage: "local"
      }
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
