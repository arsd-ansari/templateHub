# TemplateHub Playbook — How to Add a New Template Yourself

This is your complete, do-it-without-help manual for adding a new template (or
blog post) and publishing it live. Follow it top to bottom. Keep it open every
time you add content.

Live site: **https://templatehub.co.in**

---

## The golden rule: quality over quantity

One genuinely useful, accurate template/post beats fifty generic ones. Google
*rewards* helpful, original content and *buries* mass-produced AI filler — which
can drag your whole site down. Aim for **1–2 great pieces a week**, forever.
Never auto-publish unreviewed AI output.

---

## Step 0 — Pick a keyword (the 3-question filter)

Find ideas on [Google Trends](https://trends.google.com) or just by thinking
about what people search. Before building, the keyword must pass **all three**:

1. **Fit** — is it an Excel template? (not a tool/converter, not Word)
2. **Intent** — does the searcher want to *download a spreadsheet*?
3. **Winnable** — is it specific/long-tail, not a giant head term?

✅ Good: `salary slip template excel`, `rent receipt template excel`,
`profit and loss statement excel`, `proforma invoice template excel`
❌ Bad: `pdf to excel` (a tool, not a template), `accounting software` (not a
template), `invoice` (too broad/competitive on its own)

**Tip — build clusters:** group related templates (you have an *invoice* cluster
and an *accounting* cluster). Clusters rank better than scattered one-offs.

---

## Step 1 — Create the spreadsheet file

You have two ways. Pick whichever you're comfortable with.

### Option A — Make it in Excel / Google Sheets (no coding)
1. Build the template by hand in Excel or Google Sheets — real headings,
   real working formulas, a few sample rows, clean formatting.
2. Save / export it as **`.xlsx`**.
3. Put the file in the project at: **`public/files/<your-slug>.xlsx`**
   (e.g. `public/files/salary-slip-template.xlsx`).

> The slug is the lowercase, dash-separated name, e.g. `salary-slip-template`.

### Option B — Generate it with a script (repeatable, exact)
This is how the existing templates were made. Run the scaffolder (see Step 4)
or copy an existing generator in `scripts/` (e.g. `generate_invoice.py`), edit
the columns/formulas, then run it:

```bash
.venv-tools/bin/python scripts/generate_<your-slug>.py
```

It writes the file to `public/files/<your-slug>.xlsx`.

**🤖 AI prompt to write a generator for you** (paste into ChatGPT/Claude):
> "Write a Python script using openpyxl that generates a professional
> `<TEMPLATE NAME>` as an .xlsx file. Use a teal (#0F766E) header, bordered
> cells, a sample of 2–3 filled rows, and working formulas for [describe the
> calculations]. Save it to `public/files/<your-slug>.xlsx`. Match the style of
> this existing script: [paste the contents of scripts/generate_invoice.py]."

Then review the formulas, save it as `scripts/generate_<your-slug>.py`, and run it.

⚠️ **Always open the finished file and check the formulas actually work.** A
broken template = refunds of trust and bad reviews.

---

## Step 2 — Add the page content (in `prisma/seed.ts`)

Open `prisma/seed.ts`. Find the section with the comment
`--- Real, hand-made content (always seeded, not demo) ---`. Each template is a
block like the GST / invoice / cash-book ones. **Copy an existing block and
change the values**, or use the block the scaffolder prints for you (Step 4).

A template block looks like this — replace everything in CAPITALS:

```ts
const myCategory = await prisma.templateCategory.findUnique({
  where: { slug: "CATEGORY-SLUG" }   // see the category list below
});
if (myCategory) {
  const data = {
    title: "TEMPLATE TITLE",
    description: "ONE-SENTENCE SUMMARY WITH THE KEYWORD IN IT.",
    content: "2–4 SENTENCES EXPLAINING WHAT IT IS AND HOW IT HELPS.",
    fileUrl: "/files/YOUR-SLUG.xlsx",
    thumbnailUrl: null,
    categoryId: myCategory.id,
    seoTitle: "KEYWORD-RICH TITLE | TemplateHub",
    seoDescription: "1–2 SENTENCES WITH THE KEYWORD, UNDER 160 CHARACTERS.",
    features: ["FEATURE 1", "FEATURE 2", "FEATURE 3", "FEATURE 4"],
    instructions: ["STEP 1", "STEP 2", "STEP 3", "STEP 4"],
    faqs: [
      { question: "QUESTION 1?", answer: "ANSWER 1." },
      { question: "QUESTION 2?", answer: "ANSWER 2." }
    ]
  };
  await prisma.template.upsert({
    where: { slug: "YOUR-SLUG" },
    update: { fileUrl: data.fileUrl },
    create: { slug: "YOUR-SLUG", ...data }
  });
}
```

Paste your block just **above** the line `if (!seedDemo) {`.

**Category slugs you can use:**
`accounting-templates`, `finance-templates`, `gst-templates`,
`payroll-templates`, `hr-templates`, `inventory-templates`, `sales-templates`,
`business-templates`, `education-templates`.

**🤖 AI prompt to write the content fields** (paste into ChatGPT/Claude):
> "I'm adding a template called `<TEMPLATE NAME>` to my free Excel templates
> site. Target keyword: `<KEYWORD>`. Write me, in plain text I can paste into
> code: a one-sentence description, a 3–4 sentence content overview, an SEO
> title (under 60 chars) and SEO description (under 160 chars), 5 short
> features, 6 how-to instructions, and 4 FAQs with answers. Make it genuinely
> useful and accurate — no fluff. Naturally include the keyword."

---

## Step 3 — (Optional) Add a blog post that links to it

Blog posts are your biggest SEO engine. In `prisma/seed.ts`, find the
`blogPost.upsert` example and copy it. Write the content as **Markdown**
(headings with `##`, `-` bullet lists, `**bold**`, and links like
`[text](/templates/your-slug)`). Always **link to the matching template** — that
funnel is the whole point.

**🤖 AI prompt for a blog post:**
> "Write a genuinely useful, accurate, original blog post in Markdown titled
> `<TITLE>` targeting the keyword `<KEYWORD>`. Use ## headings, bullet/numbered
> lists, and bold. Include a step-by-step section. Naturally link to my template
> at `/templates/<your-slug>` with anchor text. ~600–900 words. No fluff or
> repetition."

Always read and fact-check it before using. For tax/GST/legal topics, verify
every claim.

---

## Step 4 — The helper script (scaffolder)

Instead of starting from scratch, run:

```bash
.venv-tools/bin/python scripts/new_template.py
```

It asks you a few questions (keyword, title, category) and then:
- creates a starter generator at `scripts/generate_<slug>.py` for you to edit,
- prints the exact `seed.ts` block to paste (already filled with your title,
  slug, category, and file path).

You still design the spreadsheet and write the content (Steps 1–2), but the
boilerplate is done for you.

---

## Step 5 — Deploy (publish it live)

From the project folder, run:

```bash
vercel --prod
```

That uploads your changes; Vercel builds the site, updates the database, and
publishes. It takes ~2 minutes. When it finishes it prints your live URL.

> The database tables, categories, admin login, and search are set up
> automatically during this build — you don't do anything extra. Adding a
> template only ever means: **a file in `public/files/` + a block in
> `seed.ts` + `vercel --prod`.**

---

## Step 6 — Tell Google about the new page

1. Open [Google Search Console](https://search.google.com/search-console).
2. Top bar → **URL inspection** → paste the new page URL
   (`https://templatehub.co.in/templates/<your-slug>`) → Enter.
3. Click **Request indexing**.

Do the same for any new blog post. This nudges Google to crawl it sooner.

---

## Quick checklist (every new template)

- [ ] Keyword passes the 3-question filter
- [ ] `.xlsx` file in `public/files/<slug>.xlsx`, formulas tested
- [ ] Content block added in `prisma/seed.ts` (above `if (!seedDemo)`)
- [ ] `vercel --prod` ran successfully
- [ ] Page loads: `/templates/<slug>` and the download works
- [ ] Requested indexing in Search Console

---

## Troubleshooting

- **Build fails:** run `vercel --prod` again and read the error near the bottom.
  Node version (22) and the build-hash fix are already set in the project, so
  most failures are typos in `seed.ts` — check your commas and quotes.
- **Download shows 404:** the file must be in `public/files/` (NOT
  `public/templates/`), and `fileUrl` in seed.ts must be `/files/<slug>.xlsx`.
- **Page not found:** make sure the `slug` in seed.ts matches the URL you're
  visiting, and that you deployed after adding it.
- **Site won't load on office wifi:** your office network blocks it — use mobile
  data. The public can still reach it.
- **Admin login:** email + password are in `.admin-credentials.txt` (private).

---

## What you can't (and shouldn't) automate

The thinking — choosing a good keyword, designing a real spreadsheet, writing
accurate content — is the part that makes your site *worth* visiting. Use AI to
*draft* (with the prompts above), but always review it. That review is the
difference between a site Google promotes and one it penalizes. There is no
shortcut around it, and that's a good thing — it's your moat.
