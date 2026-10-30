# Barron Sports

Website for Barron Sports, a shooting and outdoor equipment shop in Ennis, Co. Clare. Built with Next.js 16, React 19, Tailwind CSS v4 and TypeScript, and hosted on Vercel.

Contributor and coding conventions are in [AGENTS.md](AGENTS.md).

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev   # http://localhost:3000
```

For admin sign-in to work locally, create `.env.local` with the Supabase project URL and publishable key (Supabase dashboard → **Project Settings → API Keys**):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint (there is no test suite) |
| `npm run build` | Production build, the same one Vercel runs |
| `npm run preview` | Production build, then serve it on http://localhost:3000 |
| `npm run db:seed` | Add the built-in site content to the Supabase database (only adds missing rows; needs `SUPABASE_SECRET_KEY` in `.env.local`) |
| `npm run db:test-students` | Add test student accounts at each stage of the course (password `Course-Test-2026`); `npm run db:test-students -- --remove` deletes them. Needs `SUPABASE_SECRET_KEY` |
| `npm run import-stock` | Regenerate `src/data/firearm-stock.ts` from `documents/products/Stock.xlsx` (needs Python 3) |

## Deploy on Vercel

The first deploy takes a few minutes in the Vercel dashboard:

1. Sign in at [vercel.com](https://vercel.com) with GitHub and choose **Add New → Project**.
2. Import the `AllenGleeson/barron-sports` repository. Vercel detects Next.js; leave the build settings as they are.
3. Click **Deploy**. The site gets a `*.vercel.app` address.
4. Add Supabase from the Vercel Marketplace (**Storage → Supabase**), connected to this project. It adds the Supabase environment variables for you.

After that:

- Every push to `main` deploys the live site. Pushes to other branches get their own preview URL.
- To use the shop's own domain, add it under **Project → Settings → Domains** and follow the DNS instructions there.
- After changing an environment variable, redeploy (**Deployments → ⋯ → Redeploy**) for it to take effect.

## How content and admin work today

- Site content (products, offers, brands, services, course guides) lives in `src/lib/site.ts` and `src/lib/content/`. Changing it and pushing to `main` updates the live site.
- `/admin` requires signing in with a Supabase account that has the admin role (see below). It saves to the Supabase database: special offers, packages and services update on the live site straight away. Other catalogue pages still come from the site files.
- The online course: learners register at `/course/register` (Supabase Auth), buy the course from `/course/dashboard` with Stripe Checkout, then take the lessons at `/course/learn`. Lesson progress still saves only on the learner's device. See **Course payments (Stripe)** below.
- `/admin/users` lists the real accounts (students and admins) with their course payment and completion. Admins can edit, disable, delete, invite and send password reset emails there.

## Database setup

The database tables and access rules are in [supabase/migrations/](supabase/migrations/). For a new Supabase project:

1. Open each migration file in order and run it in the Supabase **SQL Editor**.
2. Add `SUPABASE_SECRET_KEY` (Supabase → **Project Settings → API Keys**) to `.env.local`, run `npm run db:seed`, then remove the key again if you don't need it locally.

## Course payments (Stripe)

The course is sold with Stripe Checkout, embedded on `/course/checkout`. Until the keys below are set, the site shows "Payments aren't set up yet".

1. Run the `course_enrolments` migration in the Supabase SQL Editor (see **Database setup**).
2. In Supabase, **Authentication → Sign In / Providers → Email**: turn **Confirm email** off for now. Supabase's built-in mail sender only allows a few emails an hour; turn confirmation back on once a proper email service is set up.
3. In the Stripe dashboard, switch to **Test mode** and copy the keys from **Developers → API keys** into `.env.local`:

   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   SUPABASE_SECRET_KEY=sb_secret_...   # lets the server record payments
   ```

4. Webhook (backs up the return page if a learner closes the tab after paying):
   - Locally: install the [Stripe CLI](https://docs.stripe.com/stripe-cli), run `stripe listen --forward-to localhost:3000/api/stripe/webhook/`, and put the `whsec_...` it prints in `.env.local` as `STRIPE_WEBHOOK_SECRET`.
   - On Vercel: in Stripe, **Developers → Webhooks → Add endpoint**, URL `https://<your-domain>/api/stripe/webhook/` (keep the trailing slash), events `checkout.session.completed` and `checkout.session.async_payment_succeeded`. Use its signing secret as `STRIPE_WEBHOOK_SECRET`.
5. Add the same variables in Vercel (**Project → Settings → Environment Variables**) and redeploy.

Test cards: `4242 4242 4242 4242`, any future date, any CVC. `4000 0025 0000 3155` asks for 3-D Secure; `4000 0000 0000 9995` is declined. Switching to live payments means swapping in the live keys and a live webhook.

## Admin accounts

Admins sign in at `/admin` with an email and password from Supabase Auth.

1. In the Supabase dashboard, go to **Authentication → Users → Add user → Create new user**. Enter the email and a password and tick **Auto Confirm User**.
2. Give the account the admin role in **SQL Editor** (replace the email):

   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'
   where email = 'owner@example.com';
   ```

3. Sign in at `/admin`. If the account was already signed in, sign out and in again so it picks up the role.

After that, more admins can be added from **Admin → Users → Admins → Add admin** (they get an email invite).

**Super admin (the owner):** other admins can see this account but can't change, disable or delete it. Set it in SQL:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data || '{"super_admin": true}'
where email = 'owner@example.com';
```

**Emails with links (invites, password resets):** in Supabase, **Authentication → URL Configuration**, set **Site URL** to the live address and add `http://localhost:3000/**` and `https://<your-domain>/**` under **Redirect URLs**. Otherwise the links go to the wrong site. Supabase's built-in mail only sends a few emails an hour; set up custom SMTP (Authentication → Emails) before relying on it.

To remove admin access, run the same query with `'{"role": null}'`, or delete the user. Passwords can be reset from the same Users page.
