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
- `/admin` requires signing in with a Supabase account that has the admin role (see below). Its data is still saved in the browser it's used in (`localStorage`), so edits aren't visible to other visitors yet; moving that data to the Supabase database is the next step.
- The course enrolment and payment flow is a preview too. It will use Supabase and Stripe once those are set up.

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

To remove admin access, run the same query with `'{"role": null}'`, or delete the user. Passwords can be reset from the same Users page.
