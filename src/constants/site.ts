export const SITE_NAME = "TemplateHub";
export const SITE_DESCRIPTION =
  "Free Excel templates for GST invoices, RCM self invoices, accounting, payroll, budgets, and business spreadsheets. Download .xlsx files for Excel and Google Sheets.";
export const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

export const SITE_AUTHOR = {
  name: "Arshad Ansari",
  role: "Software engineer",
  shortBio:
    "Software engineer who designs TemplateHub's Excel templates and writes the GST, accounting, and spreadsheet guides."
};

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@templatehub.co.in";

// Google AdSense publisher ID. Override with NEXT_PUBLIC_ADSENSE_CLIENT_ID if needed.
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-7632787932597038";

// Ad unit (slot) IDs created in the AdSense dashboard, one per placement.
export const ADSENSE_SLOTS = {
  inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE || "5957507403",
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR || "8840540241"
};

// Pinterest domain verification code, e.g. "abc123def456...".
// Get this from Pinterest Business → Settings → Claim → Websites → Add HTML tag.
// Set PINTEREST_VERIFICATION in your Vercel env to activate the meta tag.
export const PINTEREST_VERIFICATION = process.env.PINTEREST_VERIFICATION || "";

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" }
];

export const NAV_LINKS = [
  { href: "/templates", label: "Templates" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export const ADMIN_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/templates", label: "Templates" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/analytics", label: "Analytics" }
];
