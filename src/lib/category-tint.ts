const TINTS: Record<string, string> = {
  "gst-templates": "#0f766e",
  "accounting-templates": "#1d4ed8",
  "finance-templates": "#b45309",
  "payroll-templates": "#6d28d9",
  "hr-templates": "#be123c",
  "inventory-templates": "#c2410c",
  "sales-templates": "#15803d",
  "business-templates": "#334155",
  "education-templates": "#4338ca"
};

export function categoryTint(slug?: string | null) {
  return (slug && TINTS[slug]) || "#0f766e";
}
