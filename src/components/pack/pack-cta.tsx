import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GST_PACK } from "@/constants/pack";

export function PackCta() {
  return (
    <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="text-sm font-semibold text-[var(--muted-foreground)]">Paid pack — ₹{GST_PACK.priceInr}</div>
      <p className="mt-2 text-sm leading-6">
        The free file on this page stays free. The pack adds the IGST invoice, a filled GTA example, and an RCM register that joins SI and PV numbers — plus the three free files in one zip.
      </p>
      <Button asChild className="mt-4">
        <Link href={GST_PACK.href}>See the GST pack</Link>
      </Button>
    </aside>
  );
}
