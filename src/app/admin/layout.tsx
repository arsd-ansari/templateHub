import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ADMIN_LINKS } from "@/constants/site";
import { authOptions } from "@/lib/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") redirect("/admin/login");

  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">TemplateHub Admin</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Manage templates, blog content, categories, and analytics.</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {ADMIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--muted)]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
