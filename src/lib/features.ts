/**
 * Switches for unfinished features. Kept free of imports so `next.config.ts`
 * can read them too (it redirects hidden pages to the home page).
 */

/**
 * Shows the firearms safety course in the nav, footer and home page.
 * While false, every /course page redirects to the home page. The course
 * pages are also switched off by their folder name, `src/app/(site)/_course`
 * (a private folder isn't routed): to bring the course back, rename it to
 * `course` and set this to true.
 */
export const SHOW_COURSE = false;

/**
 * Shows the contact page in the nav and the "Contact" / "Ask about…" buttons.
 * Off until the contact form can send email; while false, /contact-us
 * redirects to the home page.
 */
export const SHOW_CONTACT_PAGE = false;
