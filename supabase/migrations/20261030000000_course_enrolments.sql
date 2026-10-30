-- Course enrolments: one row per learner (a Supabase Auth user) who has started or
-- finished paying for the online firearms safety course.
--
-- Access rules:
--   - A learner can read their own row; admins can read every row.
--   - Nobody can write from the browser. Rows are written only by the site's server
--     code (with the secret key) after Stripe confirms the payment, so a learner
--     can't mark themselves as paid.

create table public.course_enrolments (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'checkout_created'
    check (status in ('checkout_created', 'paid')),
  amount_cents integer,
  currency text,
  stripe_customer_id text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.course_enrolments enable row level security;

create policy "Learners read their own enrolment" on public.course_enrolments
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.course_enrolments to authenticated;
