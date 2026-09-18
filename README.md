# TemplateHub

TemplateHub is a SaaS-ready Next.js 15 platform for free Excel templates, spreadsheet resources, SEO template pages, blog content, and future AI spreadsheet tools.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- Shadcn-style UI primitives
- Lucide Icons
- Prisma ORM
- PostgreSQL
- NextAuth credentials auth
- Local file storage abstraction for MVP

## Local Setup

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

To also load sample templates and blog posts for local testing:

```bash
SEED_DEMO=true npm run db:seed
```

Default seeded admin credentials use `.env`:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Production setup

`npm run db:seed` (with `SEED_DEMO` unset) creates only the essentials — the
admin user, template/blog categories, and full-text search indexes. No demo
content. Log in at `/admin` and add real templates, files, and posts there;
they appear on the live site immediately.

## Key Routes

- `/` homepage
- `/templates`
- `/templates/gst-invoice-template`
- `/blog`
- `/search`
- `/admin`

## Future AI Modules

The app keeps business logic in `src/services`, mutations in `src/actions`, and UI in reusable components so Phase 2 can add:

- AI Formula Generator
- AI Formula Explainer
- AI Spreadsheet Assistant

Phase 3 can extend users, saved templates, and premium downloads using the existing NextAuth and Prisma models.
