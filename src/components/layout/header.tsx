import Link from "next/link";
import { FileSpreadsheet, Search } from "lucide-react";
import { NAV_LINKS } from "@/constants/site";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)]">
            <FileSpreadsheet size={20} />
          </span>
          <span className="font-heading">TemplateHub</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--muted-foreground)] md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[var(--foreground)]">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" title="Search">
            <Link href="/search">
              <Search size={18} />
            </Link>
          </Button>
          <ThemeToggle />
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/templates">Browse Templates</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
