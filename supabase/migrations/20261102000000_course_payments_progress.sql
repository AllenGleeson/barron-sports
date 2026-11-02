-- Course payments, access and progress.
--
--   course_payments:    one row per payment (Stripe, in the shop, or free access).
--                       Kept when an account is deleted (user_id becomes null), with the
--                       name and email copied in, so the payment history stays complete.
--   course_enrolments:  one row per learner per course: whether they have access, the
--                       payment it came from, the name on their record, completion.
--   course_progress:    one row per learner per lesson: read, watched, quiz attempts.
--
-- Every table has a course_id so a second course can be added later.
-- Access rules: learners read their own rows, admins read everything, and only the
-- site's server code (secret key) writes, so nobody can mark themselves paid or passed.

-- ---------------------------------------------------------------------------
-- Payments
-- ---------------------------------------------------------------------------
create table public.course_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  course_id text not null default 'firearms-safety',
  method text not null check (method in ('stripe', 'in_shop', 'free')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'refunded')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  refunded_cents integer not null default 0 check (refunded_cents >= 0),
  currency text not null default 'eur',
  -- Copied from the account when the payment is made.
  name text not null default '',
  email text not null default '',
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  -- The admin who recorded an in-shop or free payment.
  recorded_by uuid references auth.users (id) on delete set null,
  note text,
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.course_payments enable row level security;

create index course_payments_user_id_idx on public.course_payments (user_id);
create index course_payments_payment_intent_idx on public.course_payments (stripe_payment_intent_id);

create policy "Learners read their own payments" on public.course_payments
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.course_payments to authenticated;

-- Copy the payment details out of the old enrolment rows.
insert into public.course_payments (
  user_id, method, status, amount_cents, currency, name, email,
  stripe_checkout_session_id, stripe_payment_intent_id, stripe_customer_id,
  paid_at, created_at, updated_at
)
select
  e.user_id,
  case when e.stripe_checkout_session_id is null then 'in_shop' else 'stripe' end,
  case when e.status = 'paid' then 'paid' else 'pending' end,
  coalesce(e.amount_cents, 0),
  coalesce(e.currency, 'eur'),
  coalesce(e.certificate_name, u.raw_user_meta_data ->> 'full_name', ''),
  coalesce(u.email, ''),
  e.stripe_checkout_session_id,
  e.stripe_payment_intent_id,
  e.stripe_customer_id,
  e.paid_at,
  e.created_at,
  e.updated_at
from public.course_enrolments e
join auth.users u on u.id = e.user_id;

-- ---------------------------------------------------------------------------
-- Enrolments: access only (payment details now live in course_payments)
-- ---------------------------------------------------------------------------
-- Unpaid rows were only there to track a started checkout; that's a pending payment now.
delete from public.course_enrolments where status <> 'paid';

alter table public.course_enrolments
  add column course_id text not null default 'firearms-safety',
  add column payment_id uuid references public.course_payments (id) on delete set null,
  add column enrolled_at timestamptz,
  add column revoked_at timestamptz,
  add column revoke_reason text;

update public.course_enrolments e
set payment_id = p.id,
    enrolled_at = coalesce(e.paid_at, e.created_at)
from public.course_payments p
where p.user_id = e.user_id and p.status = 'paid';

update public.course_enrolments set enrolled_at = coalesce(enrolled_at, created_at);
alter table public.course_enrolments alter column enrolled_at set not null;
alter table public.course_enrolments alter column enrolled_at set default now();

-- status: "active" (can take the course) or "revoked" (refunded or removed by an admin).
alter table public.course_enrolments drop constraint course_enrolments_status_check;
update public.course_enrolments set status = 'active';
alter table public.course_enrolments alter column status set default 'active';
alter table public.course_enrolments
  add constraint course_enrolments_status_check check (status in ('active', 'revoked'));

alter table public.course_enrolments
  drop column amount_cents,
  drop column currency,
  drop column stripe_customer_id,
  drop column stripe_checkout_session_id,
  drop column stripe_payment_intent_id,
  drop column paid_at;

alter table public.course_enrolments drop constraint course_enrolments_pkey;
alter table public.course_enrolments add primary key (user_id, course_id);

-- ---------------------------------------------------------------------------
-- Progress: one row per learner per lesson
-- ---------------------------------------------------------------------------
create table public.course_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null default 'firearms-safety',
  lesson_slug text not null,
  read_at timestamptz,
  watched_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  best_score integer check (best_score between 0 and 100),
  last_score integer check (last_score between 0 and 100),
  -- The learner's answers on their latest attempt ({ questionId: optionId }).
  last_answers jsonb,
  passed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, course_id, lesson_slug)
);
alter table public.course_progress enable row level security;

create policy "Learners read their own progress" on public.course_progress
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

grant select on public.course_progress to authenticated;
