import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GST_PACK } from "@/constants/pack";

export function PackCta() {
  return (
    <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="text-sm font-semibold text-[var(--muted-foreground)]">Paid pack — ₹{GST_PACK.priceInr}</div>
      <p className="mt-2 text-sm leading-6">
        This page stays free. The ₹{GST_PACK.priceInr} pack is only extras you cannot download here: IGST invoice, filled GTA example, and an RCM SI/PV register.
      </p>
      <Button asChild className="mt-4">
        <Link href={GST_PACK.href}>See the GST pack</Link>
      </Button>
    </aside>
  );
}
