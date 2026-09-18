import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma/client";
import { getTemplateBySlug } from "@/services/template-service";

function csvEscape(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function buildStarterCsv(template: Awaited<ReturnType<typeof getTemplateBySlug>>) {
  if (!template) return "";
  const rows = [
    ["TemplateHub Template", template.title],
    ["Description", template.description],
    [],
    ["Field", "Sample Value", "Notes"],
    ["Date", new Date().toISOString().slice(0, 10), "Update this date"],
    ["Reference Number", "EXH-001", "Use your own numbering"],
    ["Party / Employee / Item", "Sample name", "Replace with real data"],
    ["Amount / Quantity", "100", "Adjust for your workflow"],
    ["Status", "Open", "Customize status values"],
    [],
    ["Instructions"],
    ...template.instructions.map((instruction, index) => [`${index + 1}. ${instruction}`])
  ];
  return rows.map((row) => row.map((cell) => csvEscape(cell ?? "")).join(",")).join("\n");
}

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  // Best-effort analytics: count the download. Never block the file on this.
  try {
    const headerStore = await headers();
    await prisma.$transaction([
      prisma.template.update({ where: { slug }, data: { downloadCount: { increment: 1 } } }),
      prisma.download.create({
        data: {
          templateId: template.id,
          ipHash: headerStore.get("x-forwarded-for")?.split(",")[0] || null,
          userAgent: headerStore.get("user-agent")
        }
      })
    ]);
  } catch {}

  // If the template has a real file, redirect to it. This works everywhere —
  // static files in /public are served by the CDN (Vercel can't read them from
  // a serverless function's filesystem), and external URLs work too.
  if (template.fileUrl) {
    const target = template.fileUrl.startsWith("http")
      ? template.fileUrl
      : new URL(template.fileUrl, request.url).toString();
    return NextResponse.redirect(target, 302);
  }

  // Fallback for templates that have no file yet: a starter CSV.
  return new NextResponse(buildStarterCsv(template), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${template.slug}.csv"`
    }
  });
}
