-- Locks what goes on a learner's completion record.
--   certificate_name: the learner's name when they started paying. The record always
--                     uses this, so changing the account name later can't change it.
--   completed_at:     set once, by the server, when the learner first finishes the
--                     course. After that the course can't be taken again.
-- Both are written only by server code (secret key); learners can only read their row.

alter table public.course_enrolments
  add column certificate_name text,
  add column completed_at timestamptz;
