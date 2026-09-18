"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/prisma/client";
import { authOptions } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { blogPostSchema, categorySchema, templateSchema } from "@/schemas/template";
import { storage } from "@/services/storage-service";

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") throw new Error("Unauthorized");
}

function parseTags(tags = "") {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function isUpload(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

export async function upsertTemplate(formData: FormData) {
  await assertAdmin();
  const raw = Object.fromEntries(formData);
  const templateFile = formData.get("templateFile");
  const thumbnailFile = formData.get("thumbnailFile");

  if (isUpload(templateFile)) {
    raw.fileUrl = await storage.upload(templateFile, "templates");
  }

  if (isUpload(thumbnailFile)) {
    raw.thumbnailUrl = await storage.upload(thumbnailFile, "images");
  }

  const parsed = templateSchema.parse(raw);
  const tags = await Promise.all(
    parseTags(parsed.tags).map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: { name, slug: slugify(name) }
      })
    )
  );
  await prisma.template.upsert({
    where: { slug: parsed.slug },
    update: {
      ...parsed,
      thumbnailUrl: parsed.thumbnailUrl || null,
      tags: { set: tags.map((tag) => ({ id: tag.id })) }
    },
    create: {
      ...parsed,
      thumbnailUrl: parsed.thumbnailUrl || null,
      features: ["Editable Excel layout", "Formula-ready fields", "Printable format"],
      instructions: ["Download the file.", "Open it in Excel.", "Customize the sample fields."],
      faqs: [{ question: "Is this template free?", answer: "Yes, it is free to download." }],
      tags: { connect: tags.map((tag) => ({ id: tag.id })) }
    }
  });
  revalidatePath("/templates");
  revalidatePath(`/templates/${parsed.slug}`);
}

export async function deleteTemplate(slug: string) {
  await assertAdmin();
  await prisma.template.delete({ where: { slug } });
  revalidatePath("/templates");
}

export async function upsertBlogPost(formData: FormData) {
  await assertAdmin();
  const parsed = blogPostSchema.parse(Object.fromEntries(formData));
  const tags = await Promise.all(
    parseTags(parsed.tags).map((name) =>
      prisma.tag.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: { name, slug: slugify(name) }
      })
    )
  );
  await prisma.blogPost.upsert({
    where: { slug: parsed.slug },
    update: { ...parsed, featuredImage: parsed.featuredImage || null, tags: { set: tags.map((tag) => ({ id: tag.id })) } },
    create: { ...parsed, featuredImage: parsed.featuredImage || null, tags: { connect: tags.map((tag) => ({ id: tag.id })) } }
  });
  revalidatePath("/blog");
  revalidatePath(`/blog/${parsed.slug}`);
}

export async function upsertTemplateCategory(formData: FormData) {
  await assertAdmin();
  const parsed = categorySchema.parse(Object.fromEntries(formData));
  await prisma.templateCategory.upsert({
    where: { slug: parsed.slug },
    update: parsed,
    create: parsed
  });
  revalidatePath("/templates");
}
