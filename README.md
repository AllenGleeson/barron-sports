# Barron Sports

Website for Barron Sports, a shooting and outdoor equipment shop in Ennis, Co. Clare. Built with Next.js 16, React 19, Tailwind CSS v4 and TypeScript, and hosted on Vercel.

Contributor and coding conventions are in [AGENTS.md](AGENTS.md).

## Run it locally

Requires Node.js 20.9 or newer.

```bash
npm install
npm run dev   # http://localhost:3000
```

Optional: create `.env.local` with `NEXT_PUBLIC_ADMIN_PASSWORD=your-password` to change the admin password (the default is `barron`).

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
3. Under **Environment Variables**, add `NEXT_PUBLIC_ADMIN_PASSWORD` with a password of your choice. `NEXT_PUBLIC_` values are visible in the browser, so treat it as a convenience gate, not security.
4. Click **Deploy**. The site gets a `*.vercel.app` address.

After that:

- Every push to `main` deploys the live site. Pushes to other branches get their own preview URL.
- To use the shop's own domain, add it under **Project → Settings → Domains** and follow the DNS instructions there.
- After changing an environment variable, redeploy (**Deployments → ⋯ → Redeploy**) for it to take effect.

## How content and admin work today

- Site content (products, offers, brands, services, course guides) lives in `src/lib/site.ts` and `src/lib/content/`. Changing it and pushing to `main` updates the live site.
- `/admin` is a preview CMS. It saves to the browser it's used in (`localStorage`), so its edits are not visible to other visitors yet. The planned Supabase database will make admin edits live.
- The course enrolment and payment flow is a preview too. It will use Supabase and Stripe once those are set up.
