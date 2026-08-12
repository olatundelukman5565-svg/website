# Neo Vision Team — Portfolio & Studio Platform

A professional portfolio and business website for **Neo Vision Team**, a digital
architecture and 3D visualization studio. Built as a database-driven platform
with a full admin CMS — every category, project, image, PDF, and page of copy
is managed from `/admin`, not hardcoded in the source.

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, TypeScript, Tailwind CSS v4)
- **Firebase Admin SDK** — Firestore (data) + Authentication (admin login), both free (no billing account required)
- **Cloudinary** — image/PDF/file storage and delivery (free tier, no billing account required)
- **pdfjs-dist + @napi-rs/canvas** — server-side PDF page-1 rasterization, so uploaded PDFs get a real visual preview instead of a generic icon
- No client-side Firebase SDK is used: every read and write goes through the Next.js server (Server Components / Server Actions) using the Admin SDK, which is why `firestore.rules` denies all direct client access by default (defense in depth).

> **Why Cloudinary instead of Firebase Storage?** Firebase Storage requires the
> paid Blaze plan even for small projects. Firestore and Authentication are
> free on Firebase's Spark plan, so this app splits the backend: data lives in
> Firestore, files live in Cloudinary — both free tiers, no card required.

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
    cloudinary.ts         Cloudinary SDK configuration (lazy — only required when a file is actually uploaded)
    auth.ts              Session cookie creation/verification
    upload.ts             File upload/delete helpers (Cloudinary)
    pdf.ts                PDF → PNG preview generation
    validation.ts         File type/size validation
  proxy.ts               Route guard for /admin/* (Next.js 16 renamed "middleware" to "proxy")
scripts/
  seed.ts                 Seeds the 5 initial portfolio categories + permit-drawings subcategory
  create-admin.ts          Creates/updates the admin user and grants the admin custom claim
firestore.rules / firestore.indexes.json / firebase.json
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

### 2. Set up Firestore + Authentication (Firebase, free Spark plan)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) — **do not** enable Storage, it isn't needed.
2. Enable **Build → Authentication → Email/Password**.
3. Enable **Build → Firestore Database** (production mode, any region).
4. Project settings → Service accounts → **Generate new private key** (downloads a JSON file).
5. Project settings → General → copy the **Web API Key**.

Or, to skip creating a project entirely for local dev, use the Firebase
Emulator Suite instead (see below).

### 3. Set up Cloudinary (file storage, free tier)

1. Sign up at [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free) (email only, no card).
2. On your **Dashboard**, copy the **Cloud name**, **API Key**, and **API Secret** shown under "Product Environment Credentials".

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the `CLOUDINARY_*` values from step 3. For Firebase, either:

- **Use a real project**: fill in `FIREBASE_PROJECT_ID`, `FIREBASE_API_KEY`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` from step 2, leave the `*_EMULATOR_HOST` lines commented out, and deploy rules/indexes: `npx firebase deploy --only firestore:rules,firestore:indexes --project <your-project-id>`.
- **Use the local emulator** (fastest way to try the app without a Firebase project): set `FIREBASE_PROJECT_ID=demo-neovision`, uncomment the two `*_EMULATOR_HOST` lines, and run `npm run emulators` (Auth on :9099, Firestore on :8080, UI on :4000) in a separate terminal before `npm run dev`. Cloudinary is still required either way — file uploads always go to your real Cloudinary account, emulator or not.

> Avoid a `#` character in `ADMIN_PASSWORD` — Node's `--env-file` loader treats it as a comment marker and will truncate the value.

### 5. Seed data and create your admin account

```bash
npm run seed
npm run create-admin   # reads ADMIN_EMAIL / ADMIN_PASSWORD from .env.local
```

### 6. Run it

```bash
npm run dev
```

Visit `/admin/login` with the email/password from `create-admin`.

## The core workflow

Portfolio → pick a category → **Add project** → upload a cover image, gallery
images, and a PDF → set status to **Published** → the project immediately
appears on that category's public page, the portfolio index, and the
homepage (if marked Featured). No code changes, no redeploy.

## File uploads

- Images: JPG, PNG, WebP — 15MB limit each. Cloudinary applies automatic
  format/quality optimization (`q_auto,f_auto`) on top of `next/image`'s own
  responsive resizing at render time.
- PDFs: 40MB limit. On upload, the server rasterizes page 1 with
  `pdfjs-dist` + `@napi-rs/canvas` and stores the result as the project's
  preview image — this is what appears on project cards instead of a generic
  PDF icon.
- All uploads are validated for MIME type and size server-side before being
  uploaded to Cloudinary.

## Deployment

The app is a standard Next.js app (`npm run build && npm run start`) and can
be deployed to Vercel, Firebase App Hosting, or any Node.js host. Whichever
host you choose:

- Set the `FIREBASE_*` and `CLOUDINARY_*` environment variables from
  `.env.example` (production credentials, not the emulator).
- Deploy `firestore.rules` and `firestore.indexes.json` to your Firebase
  project (`npx firebase deploy --only firestore --project <your-project-id>`).
- Run `npm run create-admin` once (from an environment with the production
  env vars set) to create the admin account.
