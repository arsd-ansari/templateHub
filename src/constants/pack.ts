export const GST_PACK = {
  slug: "gst-compliance",
  title: "GST Compliance Excel Pack",
  priceInr: 299,
  pricePaise: 29900,
  zipFileName: "th-gst-pack-k8m2n4p6q8r0.zip",
  href: "/pack/gst-compliance",
  extras: [
    { name: "Inter-state IGST tax invoice", note: "One IGST column when the buyer is in another state." },
    { name: "Filled GTA freight example", note: "₹18,500 at 5% — cash to the GTA vs cash to the government." },
    { name: "RCM document register", note: "Year log that joins Self Invoice No. and Payment Voucher No." }
  ]
} as const;

export function showGstPackCta(text: string) {
  return /\b(gst|rcm|igst|gta|self[- ]?invoice|reverse charge)\b/i.test(text);
}
