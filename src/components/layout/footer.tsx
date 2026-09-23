import Link from "next/link";
import { LEGAL_LINKS, NAV_LINKS, SITE_DESCRIPTION } from "@/constants/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)]">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="font-bold">TemplateHub</div>
          <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">{SITE_DESCRIPTION}</p>
        </div>
        <div>
          <div className="text-sm font-semibold">Explore</div>
          <div className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--foreground)]">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold">Resources</div>
          <div className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
            <Link href="/pack/gst-compliance" className="hover:text-[var(--foreground)]">
              GST pack ₹299
            </Link>
            <Link href="/how-we-build" className="hover:text-[var(--foreground)]">
              How we build templates
            </Link>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[var(--foreground)]">
                {link.label}
              </Link>
            ))}
            <Link href="/sitemap.xml" className="hover:text-[var(--foreground)]">Sitemap</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted-foreground)]">
        © 2026 TemplateHub. All rights reserved.
      </div>
    </footer>
  );
}
