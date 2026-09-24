import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GST_PACK } from "@/constants/pack";

export function PackCta() {
  return (
    <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5" style={{ borderLeftColor: "var(--gold)", borderLeftWidth: 4 }}>
      <div className="text-sm font-semibold text-[var(--gold-foreground)]">Paid pack — ₹{GST_PACK.priceInr}</div>
      <p className="mt-2 text-sm leading-6">
        This page stays free. The ₹{GST_PACK.priceInr} pack is only extras you cannot download here: IGST invoice, filled GTA example, and an RCM SI/PV register.
      </p>
      <Button asChild variant="accent" className="mt-4">
        <Link href={GST_PACK.href}>See the GST pack</Link>
      </Button>
    </aside>
  );
}

export function PackHomeSection() {
  return (
    <aside className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6" style={{ borderLeftColor: "var(--gold)", borderLeftWidth: 4 }}>
      <div className="text-sm font-semibold text-[var(--gold-foreground)]">Paid extras — not the free files</div>
      <h2 className="mt-2 text-2xl font-bold">GST pack — ₹{GST_PACK.priceInr}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
        The GST invoice, RCM self invoice, and payment voucher above stay free. This zip is only the three files you cannot download on those pages.
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-3">
        {GST_PACK.extras.map((item) => (
          <li key={item.name} className="rounded-md border border-[var(--border)] px-4 py-3 text-sm leading-6">
            <strong>{item.name}</strong>
            <span className="mt-1 block text-[var(--muted-foreground)]">{item.note}</span>
          </li>
        ))}
      </ul>
      <Button asChild variant="accent" className="mt-5">
        <Link href={GST_PACK.href}>See the GST pack</Link>
      </Button>
    </aside>
  );
}
