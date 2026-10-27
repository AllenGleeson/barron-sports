<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Barron Sports

Website for Barron Sports, a shooting and outdoor equipment shop in Ennis, Co. Clare, Ireland. Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + TypeScript. Irish English in copy (e.g. "enrol", "colour"), prices in euro.

## Commands

- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build (what Vercel runs)
- `npm run preview` — production build, then serve it on http://localhost:3000
- `npm run lint` — ESLint (no test suite exists)
- `npm run import-stock` — regenerates `src/data/firearm-stock.ts` from `documents/products/Stock.xlsx` (Python 3). Don't hand-edit the generated file.

## Hosting (read before adding features)

- Deployed on **Vercel** from GitHub: every push to `main` deploys production, other branches get preview URLs. No `vercel.json`; Vercel detects Next.js. Setup steps are in `README.md`.
- Environment variables live in the Vercel project settings (locally in `.env.local`); env files are gitignored. The site uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; the Supabase integration also adds `SUPABASE_SECRET_KEY` (server only) and Postgres connection strings. `NEXT_PUBLIC_` values are public (built into the browser bundle); server secrets must not use that prefix. Changing a variable needs a redeploy.
- **Supabase** (project `supabase-barron-sports`, Dublin) was added through the Vercel Marketplace, which manages its keys in Vercel. Vercel Functions run in `dub1`, next to the database. Use the publishable/secret keys, not the legacy anon/service-role ones.
- All pages are currently static (prerendered at build time). Server features (Route Handlers, Server Actions, `proxy`/middleware) are now possible but none exist yet; they're planned for the Supabase and Stripe work. `products/[slug]` uses `generateStaticParams` with `dynamicParams = false`, so unknown slugs 404.
- Images are `unoptimized` because admin users can enter any image URL. `images.remotePatterns` still lists the known hosts; add new ones there.
- `trailingSlash: true`: URLs end in `/` (Next redirects the bare form). Internal `href`s are written without the slash (`/products/dogtrace`).

## Layout

- `src/app/(site)/` — public pages (home, about, brands, contact-us, special-offers, course). Wrapped in `SiteChrome` (header/footer).
- `src/app/products/` — category listing and `products/[slug]` category pages (own layout, also uses `SiteChrome`).
- `src/app/admin/` — admin area (products, services, brands), wrapped in `AdminApp`, `noindex`. Special offers and packages are managed on the products page (`?view=offers` / `?view=packages`).
- `src/components/` — grouped by area: `admin`, `home`, `products`, `course`, `cards`, `layout`, `ui`, etc.
- `src/lib/site.ts` — the content entry point. Holds shop details, nav, services and `pageImages`, and re-exports everything in `src/lib/content/` (categories, offers, brands, products, catalogues, course). Always import content from `@/lib/site`; edit it in the matching `content/` file. Most copy changes happen here.
- `src/lib/admin/` — admin data model, store, validation, seed data, sign-in.
- `src/lib/supabase/` — Supabase clients.
- `src/lib/course/` — firearms safety course: curriculum, progress, certificate, enrolment.
- `public/` — images by section (`brand/`, `categories/`, `products/`, `offers/`, ...).
- `documents/` — local working files (stock spreadsheet etc.), gitignored.

Import alias: `@/*` → `src/*`.

## How data works (important)

Admin content lives in **Supabase**; there is still no server code (the browser talks to Supabase, and database access rules do the protecting).

- **Tables:** `categories`, `brands`, `services`, `products` (special offers and packages are products). The schema and access rules are in `supabase/migrations/`; apply a new migration in the Supabase SQL Editor and commit the file. Columns are the admin model's fields in snake_case; `src/lib/admin/rows.ts` converts by name, so a new field needs a matching column.
- **Access rules (RLS):** visitors read published rows only; admins (`public.is_admin()`) read everything and write. Never rely on the admin UI alone for protection.
- **Admin:** `AdminStoreProvider` (`src/lib/admin/store.tsx`) loads all tables when the admin opens, applies changes on screen straight away, and writes them to Supabase; on a failed write it alerts and reloads.
- **Seeding:** `npm run db:seed` (`scripts/seed-supabase.ts`) inserts the built-in content from `site.ts` via `seed.ts`. It only adds missing rows (by id), never overwrites admin edits. Needs `SUPABASE_SECRET_KEY` in `.env.local`.
- **Admin sign-in** uses Supabase Auth (email + password) via `src/lib/admin/auth.ts`. An account is an admin when its `app_metadata.role` is `"admin"`; only SQL or the secret key can set that. `AdminGate` hides the admin UI from everyone else, but that's UI only: database access rules (RLS) must check the same role. The browser client is `getSupabaseBrowser()` in `src/lib/supabase/client.ts` (cookie sessions via `@supabase/ssr`, so server code can read them later). It returns null when the env vars are missing.
- **Public pages** are prerendered from `site.ts`, then `usePublicOffers` / `usePublicServices` (`src/lib/admin/publicContent.ts`) fetch published special offers, packages and services from Supabase and replace the built-in ones. If Supabase is unreachable or not set up (no categories), the built-in content stays. Other catalogue pages (products, brands, categories) still come from `site.ts` only.
- **Course enrolment** (`src/lib/course/enrolment.ts`) is a preview that mimics a planned Stripe Checkout + Supabase flow using `localStorage` only. Stripe/Supabase environment variables will be added with that work.
- The contact form does not send anything to a server.

## Styling

- Tailwind v4, configured in CSS (`src/app/globals.css` `@theme`), no `tailwind.config`. Use the theme colour tokens: `ink`, `forest`, `moss`, `panel`, `brass`, `brass-light` (hover), `brass-dim`, `cream`, `parchment`, `stone`, `line`, `line-soft`, `danger`. No hex values in components; add a token instead.
- Fonts: `font-sans` (Source Sans 3) for body, `font-display` (Cormorant Garamond) for headings, loaded via `@fontsource-variable`.
- Dark, heritage look: dark green/ink backgrounds, cream text, brass accents. Reuse the shared pieces rather than restyling from scratch:
  - `ui/Button` (links) and `ActionButton` (`<button>`), with `variant` (`primary`, `secondary`, `ghost`, `danger`) and `size` (`md`, `sm`). Anything else that needs button styles uses `buttonClass()` from `ui/styles.ts`; admin uses `adminButton` (the `sm` size).
  - `ui/styles.ts`: `focusRing`, `fieldClass` (public form inputs), `fieldLabelClass`.
  - `ui/Eyebrow` (`wide` above page and section titles), `ui/SectionHeading`, `ui/Container`, `interior/PageHero`, `ui/Accordion` (`AccordionList` / `AccordionItem` / `Chevron` for mobile `<details>` lists), and the `cards/*` components.
- No `clsx`/`cn` helper: compose classes with template strings and accept an optional `className = ""` prop.
- Site-specific CSS (marquees, header hover) lives as plain classes in `globals.css`; everything else is Tailwind utilities inline.

## Conventions

### Code style

- Named exports everywhere (`export function OfferCard`). `export default` only for `page.tsx` / `layout.tsx`.
- Use `type`, not `interface`. Component props are a `type FooProps = {...}` above the component, or inline for one or two props.
- Imports use the `@/` alias, never relative paths across folders. Use `import type` / `type X` for type-only imports.
- Constants are `UPPER_SNAKE_CASE` (`STORAGE_KEY`, `MIN_PRODUCTS_FOR_SEARCH`); data lists are camelCase (`categories`, `brands`).
- Use `null` (not `undefined`) for "no value" in data shapes (`imageUrl: string | null`). Dates are ISO strings (`new Date().toISOString()`).

### Pages and components

- `page.tsx` files are thin Server Components. They export `metadata` (or `generateMetadata`) with a `title` and a `description`, then render a client component when interactivity is needed (e.g. `admin/products/page.tsx` → `<ProductsAdmin />`, `course/learn/page.tsx` → `<EnrolmentGate />`).
- Page titles use the root template (`%s | Barron Sports`), so set only the page name.
- Interior pages start with `PageHero` (eyebrow, title, description, image, optional `actions`), then `<section className="bg-ink py-…"><Container>…</Container></section>`.
- Use `Button` for links styled as buttons (handles `tel:`, `mailto:`, and external links). Use `CoverImage` for images (wraps `next/image`). Plain `<img>` is only for admin previews.
- Give sections a heading id and `aria-labelledby`.

### Server Components and browser storage

- Server Components by default. Add `"use client"` only where browser state or storage is needed (all admin and course components are client).
- Pages are prerendered, so storage doesn't exist on the first render. Don't read storage in a `useEffect` and copy it into state (the `react-hooks/set-state-in-effect` lint rule rejects it). Instead:
  - For values that should stay in sync, use `useStorageItem` (`src/lib/useBrowserStorage.ts`). It returns `undefined` before hydration and re-renders after every `writeStorage`/`writeJson`. See `useAdminStoreData`, `useAdminUnlocked`.
  - For state that is loaded once and then edited locally, render inside `<ClientOnly fallback={…}>` and read storage in a `useState` initialiser. See `EnrolCheckout`, and `EnrolmentGate` → `LearnCourse`.
  - Use `useHydrated()` for anything else that needs to know whether it's running in the browser yet.
- Public overlay hooks (`usePublicOffers`, `usePublicServices`) return `null` until hydrated. Callers render `fromStore ?? staticData`, and treat `null` as "not loaded yet", not "empty".
- Keep React hooks out of `src/lib/browserStorage.ts`: server pages import modules that use it (e.g. `course/enrolment.ts`), and the build fails if it pulls in a hook.

### Stored data (`localStorage`)

- Keys are prefixed `barron-` and end with a version (`barron-learn-preview-v1`, `barron-course-enrol-preview-v2`). Only the course preview uses `localStorage` now. Each module keeps its key in a local `STORAGE_KEY` constant.
- Read and write only through `src/lib/browserStorage.ts` (`readJson`, `writeJson`, `writeStorage`), never `localStorage` directly. The helpers cope with blocked storage and re-render subscribed components.
- Each module provides `load…`/`save…` functions that check the shape and fall back to fresh/seed data instead of throwing. Write a `normalize…` function for older or partial records (`normalizeAdminOffer`, `normalizeProgress`).

### Admin

- Admin records share these fields: `id`, `slug`, `sortOrder`, `published`, `createdAt`, `updatedAt`. Create IDs with `newAdminId()` and set `updatedAt` on every save.
- Special offers and packages are products, not a separate collection. `AdminProduct.kind` is `"product"` or `"package"` (a package lists other products in `productIds`). Any product or package with `specialOffer` shows on the Special Offers pages while published and inside its `offerStartsAt`/`offerEndsAt` window (`offerStatus()` in `productOffer.ts`). For packages, `priceCents` is the full price and `discountPriceCents` the package price.
- The store API is generic: `upsert(collection, row)`, `patch(collection, ids, fn)` (stamps `updatedAt`), `remove(collection, id)`. To add a collection, add it to `AdminRows` in `store.tsx`; don't write per-collection functions.
- Each `*Admin.tsx` editor follows the same pattern: `useAdminStore()` for data, a `draft` state for the open form, and the shared pieces from `admin/fields.tsx` (`AdminField`, `AdminInput`, …, `adminButton`), `admin/list.tsx` (`AdminListHeader`, `AdminTable`, `AdminFormActions`) and `admin/bulk.tsx` (`useRowSelection`, `SelectAllRow`, `SelectRowCell`, `BulkPublishPanel`). Confirm deletes with `AdminConfirmModal`. Copy an existing editor (`ServicesAdmin` is the simplest) rather than building a new pattern.
- Image inputs use `AdminImageField` (URL, gallery or upload, with preview). Uploads go through `imageLibrary` in `src/lib/admin/imageLibrary.ts`: for now it resizes them and keeps them in this browser's IndexedDB as `data:` URLs, which are then saved inside the database row. Moving uploads to Supabase Storage only needs that file swapped.
- Validation helpers in `src/lib/admin/validation.ts` return a message string or `undefined` (`"Name is required."`). Collect them into `FieldErrors` with `compactErrors`.

### Domain helpers

- Money is stored as integer cents (`priceCents`, `discountPriceCents`). Use `src/lib/admin/money.ts` for parsing, `formatEuro` (`en-IE`, EUR) and discounts. Never do float euro maths inline.
- Slugs come from `slugify` / `uniqueSlug` in `src/lib/admin/slug.ts`.
- Category links come from `categoryHref(slug)`, and the header's Products menu is built from `categories`. Don't hand-write `/products/<slug>` paths.
- Firearm categories (`rifles`, `shotguns`) are special-cased only through `isFirearmCategory` / `FIREARM_CATEGORY_SLUGS` (list layout, no product images).
- Catalogue products have no ids, so offers are matched to products by title: always compare with `sameTitle()`. Offer category labels map to categories through `OFFER_CATEGORY_SLUGS`. 
- Page photos that don't belong to a category, offer or course entry live in `pageImages`. Don't inline image URLs in components.
- Course features that aren't built yet say so in the copy ("Preview", "Placeholder film"). Keep that wording until the real feature ships. Use `COURSE_PASS_PERCENT` and `courseEnrolmentOffer` rather than writing the pass mark or price into copy.
