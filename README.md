# Neo Vision Team — Portfolio & Studio Platform

A professional portfolio and business website for **Neo Vision Team**, a digital
architecture and 3D visualization studio. Built as a database-driven platform
with a full admin CMS — every category, project, image, PDF, and page of copy
is managed from `/admin`, not hardcoded in the source.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, TypeScript, Tailwind CSS v4)
- **Firebase Admin SDK** — Firestore (data), Cloud Storage (images/PDFs/files), Authentication (admin login)
- **pdfjs-dist + @napi-rs/canvas** — server-side PDF page-1 rasterization, so uploaded PDFs get a real visual preview instead of a generic icon
- No client-side Firebase SDK is used: every read and write goes through the Next.js server (Server Components / Server Actions) using the Admin SDK, which is why `firestore.rules` and `storage.rules` deny all direct client access by default (defense in depth).

## Project structure

```
src/
  app/
    (site)/            Public website: home, about, contact, portfolio, project pages
    admin/
      login/            Admin sign-in (outside the auth guard)
      (protected)/       Everything behind the session cookie: dashboard, categories,
                          projects, messages, site content settings
  components/
    site/               Public-facing UI (navbar, footer, project cards, gallery lightbox, contact form)
    admin/               Admin dashboard UI (forms, tables, sidebar)
  lib/
    actions/            Server Actions — every mutation (auth, categories, projects, messages, site content, contact)
    data/                Firestore data-access functions
    firebase-admin.ts    Firebase Admin SDK initialization (supports emulators)
    auth.ts              Session cookie creation/verification
    upload.ts             Cloud Storage upload helpers
    pdf.ts                PDF → PNG preview generation
    validation.ts         File type/size validation
  proxy.ts               Route guard for /admin/* (Next.js 16 renamed "middleware" to "proxy")
scripts/
  seed.ts                 Seeds the 5 initial portfolio categories + permit-drawings subcategory
  create-admin.ts          Creates/updates the admin user and grants the admin custom claim
firestore.rules / storage.rules / firestore.indexes.json / firebase.json
```

## Portfolio data model

- **Category** — name, slug, description, page intro, capabilities list, optional
  parent category (used for "City Permit / Permit Drawing Services" as a
  subcategory of 2D Architectural Design), sort order.
- **Project** — title, description, category, cover image, gallery images,
  PDF + auto-generated preview image, additional files, year, client,
  project type, featured flag, draft/published status, sort order.
- **ContactMessage** — submissions from the public contact form.
- **SiteContent** — a single document holding homepage copy (hero, why-choose-us,
  featured project selection), About page copy, and business contact info —
  all editable from `/admin/settings`.

Publishing a project (`status: published`) makes it appear immediately on its
category page, the portfolio index, and — if featured — the homepage. Every
public content page renders dynamically per-request (`export const dynamic =
"force-dynamic"`), so there is no cache to invalidate: what's in Firestore is
what visitors see.

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Choose a backend: local emulators or a real Firebase project

**Option A — Firebase Emulator Suite (fastest way to try it out, no Firebase project needed):**

```bash
cp .env.example .env.local
```

Then uncomment the three `*_EMULATOR_HOST` lines in `.env.local` and set
`FIREBASE_PROJECT_ID=demo-neovision` (any `demo-*` id works, no credentials
needed). In one terminal:

```bash
npm run emulators   # Auth :9099, Firestore :8080, Storage :9199, UI :4000
```

In another terminal, seed the initial categories/content and create the admin user:

```bash
npm run seed
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=your-password npm run create-admin
# (or set ADMIN_EMAIL / ADMIN_PASSWORD in .env.local first, then just `npm run create-admin`)
```

> Avoid a `#` character in `ADMIN_PASSWORD` when set via `.env.local` — Node's
> `--env-file` loader treats it as a comment marker and will truncate the value.

Then start the app:

```bash
npm run dev
```

**Option B — a real Firebase project (for production or to test against real data):**

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication → Email/Password**, **Firestore**, and **Storage**.
3. Project settings → Service accounts → Generate new private key.
4. Fill in `.env.local` from `.env.example` with `FIREBASE_PROJECT_ID`,
   `FIREBASE_API_KEY` (Project settings → General), `FIREBASE_CLIENT_EMAIL`,
   and `FIREBASE_PRIVATE_KEY` from the downloaded service account key. Leave
   the `*_EMULATOR_HOST` lines commented out.
5. Deploy the security rules and indexes: `npx firebase deploy --only firestore:rules,firestore:indexes,storage --project <your-project-id>`.
6. Run `npm run seed` and `npm run create-admin` as above.

### 3. Sign in

Visit `/admin/login` with the email/password from `create-admin`.

## The core workflow

Portfolio → pick a category → **Add project** → upload a cover image, gallery
images, and a PDF → set status to **Published** → the project immediately
appears on that category's public page, the portfolio index, and the
homepage (if marked Featured). No code changes, no redeploy.

## File uploads

- Images: JPG, PNG, WebP — 15MB limit each. Responsive sizing/optimization is
  handled by `next/image` at render time.
- PDFs: 40MB limit. On upload, the server rasterizes page 1 with
  `pdfjs-dist` + `@napi-rs/canvas` and stores the result as the project's
  preview image — this is what appears on project cards instead of a generic
  PDF icon.
- All uploads are validated for MIME type and size server-side before being
  written to Storage.

## Deployment

The app is a standard Next.js app (`npm run build && npm run start`) and can
be deployed to Vercel, Firebase App Hosting, or any Node.js host. Whichever
host you choose:

- Set the `FIREBASE_*` environment variables from `.env.example` (production
  service account credentials, not the emulator).
- Deploy `firestore.rules`, `firestore.indexes.json`, and `storage.rules` to
  your Firebase project (`npx firebase deploy --only firestore,storage`).
- Run `npm run create-admin` once (from an environment with the production
  env vars set) to create the admin account.
