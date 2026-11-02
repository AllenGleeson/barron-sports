/**
 * Adds test student accounts at different stages of the online course, so the admin
 * Users page and the course pages can be tried out. Remove them again with --remove.
 *
 *   npm run db:test-students            # add (skips any that already exist)
 *   npm run db:test-students -- --remove
 *
 * Every test account has user_metadata.test_account = true (that's how --remove finds
 * them) and the password below, so you can sign in as any of them at /course/sign-in.
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
 */
import { createClient, type User } from "@supabase/supabase-js";
import { learnerCourse } from "@/lib/course/curriculum";
import { COURSE_ID, courseEnrolmentOffer } from "@/lib/course/enrolment";

const PASSWORD = "Course-Test-2026";
const DISABLED_BAN = "876000h";
const COURSE_PRICE_CENTS = courseEnrolmentOffer.priceCents;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (e.g. in .env.local).");
  process.exit(1);
}
const supabase = createClient(url, secretKey, { auth: { persistSession: false } });

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

type Stage =
  | { kind: "registered" }
  | { kind: "checkout" }
  | { kind: "paid-online"; paidDaysAgo: number; lessonsPassed: number }
  | { kind: "paid-shop"; paidDaysAgo: number }
  | { kind: "free"; paidDaysAgo: number }
  | { kind: "refunded"; paidDaysAgo: number }
  | { kind: "completed"; paidDaysAgo: number; completedDaysAgo: number };

type TestStudent = {
  email: string;
  name: string;
  phone?: string;
  stage: Stage;
  disabled?: boolean;
};

const students: TestStudent[] = [
  { email: "aine.test@example.ie", name: "Áine Test", stage: { kind: "registered" } },
  { email: "noname.test@example.ie", name: "", stage: { kind: "registered" } },
  { email: "conor.test@example.ie", name: "Conor Test", stage: { kind: "checkout" } },
  {
    email: "siobhan.test@example.ie",
    name: "Siobhán Test",
    phone: "087 000 0001",
    stage: { kind: "paid-online", paidDaysAgo: 3, lessonsPassed: 2 },
  },
  { email: "liam.test@example.ie", name: "Liam Test", stage: { kind: "paid-shop", paidDaysAgo: 10 } },
  { email: "orla.test@example.ie", name: "Orla Test", stage: { kind: "free", paidDaysAgo: 5 } },
  { email: "cian.test@example.ie", name: "Cian Test", stage: { kind: "refunded", paidDaysAgo: 20 } },
  {
    email: "meabh.test@example.ie",
    name: "Méabh Test",
    stage: { kind: "completed", paidDaysAgo: 30, completedDaysAgo: 14 },
  },
  {
    email: "padraig.test@example.ie",
    name: "Pádraig Test",
    stage: { kind: "completed", paidDaysAgo: 60, completedDaysAgo: 45 },
    disabled: true,
  },
];

async function allUsers() {
  const users: User[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

/** Writes a test student's payments, enrolment and lesson progress for their stage. */
async function addCourseRows(userId: string, student: TestStudent) {
  const { stage } = student;
  if (stage.kind === "registered") return;
  const fake = `test_${userId.slice(0, 8)}`;
  const now = new Date().toISOString();
  const online = stage.kind === "checkout" || stage.kind === "paid-online" || stage.kind === "completed" || stage.kind === "refunded";
  const paidAt = "paidDaysAgo" in stage ? daysAgo(stage.paidDaysAgo) : null;

  const { data: payment, error } = await supabase
    .from("course_payments")
    .insert({
      user_id: userId,
      course_id: COURSE_ID,
      method: online ? "stripe" : stage.kind === "free" ? "free" : "in_shop",
      status: stage.kind === "checkout" ? "pending" : stage.kind === "refunded" ? "refunded" : "paid",
      amount_cents: stage.kind === "free" ? 0 : COURSE_PRICE_CENTS,
      refunded_cents: stage.kind === "refunded" ? COURSE_PRICE_CENTS : 0,
      currency: "eur",
      name: student.name,
      email: student.email,
      stripe_checkout_session_id: online ? `cs_${fake}` : null,
      stripe_payment_intent_id: online && stage.kind !== "checkout" ? `pi_${fake}` : null,
      note: stage.kind === "free" ? "Test: free place" : stage.kind === "paid-shop" ? "Test: receipt 0001" : null,
      paid_at: paidAt,
      refunded_at: stage.kind === "refunded" ? daysAgo(stage.paidDaysAgo - 2) : null,
      created_at: paidAt ?? now,
      updated_at: now,
    })
    .select("id")
    .single();
  if (error) throw new Error(`${student.email} payment: ${error.message}`);
  if (stage.kind === "checkout") return;

  const { error: enrolError } = await supabase.from("course_enrolments").insert({
    user_id: userId,
    course_id: COURSE_ID,
    status: stage.kind === "refunded" ? "revoked" : "active",
    payment_id: payment.id,
    certificate_name: student.name,
    enrolled_at: paidAt,
    completed_at: stage.kind === "completed" ? daysAgo(stage.completedDaysAgo) : null,
    revoked_at: stage.kind === "refunded" ? daysAgo(stage.paidDaysAgo - 2) : null,
    revoke_reason: stage.kind === "refunded" ? "Refunded" : null,
    updated_at: now,
  });
  if (enrolError) throw new Error(`${student.email} enrolment: ${enrolError.message}`);

  const passedCount =
    stage.kind === "completed" ? learnerCourse.lessons.length : stage.kind === "paid-online" ? stage.lessonsPassed : 0;
  const rows = learnerCourse.lessons.slice(0, passedCount).map((lesson, index) => ({
    user_id: userId,
    course_id: COURSE_ID,
    lesson_slug: lesson.slug,
    read_at: paidAt,
    watched_at: paidAt,
    attempts: index % 2 ? 2 : 1,
    best_score: 100,
    last_score: 100,
    passed_at: paidAt,
    updated_at: now,
  }));
  if (rows.length) {
    const { error: progressError } = await supabase.from("course_progress").insert(rows);
    if (progressError) throw new Error(`${student.email} progress: ${progressError.message}`);
  }
}

async function add() {
  const existing = new Map((await allUsers()).map((user) => [user.email?.toLowerCase(), user]));
  for (const student of students) {
    let user = existing.get(student.email);
    if (user) {
      console.log(`skip   ${student.email} (already exists)`);
      continue;
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email: student.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: student.name, phone: student.phone ?? null, test_account: true },
      ...(student.disabled ? { ban_duration: DISABLED_BAN } : {}),
    });
    if (error) throw new Error(`${student.email}: ${error.message}`);
    user = data.user;

    await addCourseRows(user.id, student);
    console.log(`added  ${student.email.padEnd(26)} ${student.stage.kind}${student.disabled ? " (disabled)" : ""}`);
  }
  console.log(`\nSign in as any of them with the password: ${PASSWORD}`);
}

async function remove() {
  const tests = (await allUsers()).filter((user) => user.user_metadata?.test_account === true);
  for (const user of tests) {
    // Enrolment and progress rows go with the user (on delete cascade). Payments are kept
    // for real accounts, but test payments are deleted too.
    const { error: paymentError } = await supabase.from("course_payments").delete().eq("user_id", user.id);
    if (paymentError) throw new Error(`${user.email} payments: ${paymentError.message}`);
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error(`${user.email}: ${error.message}`);
    console.log(`removed ${user.email}`);
  }
  if (!tests.length) console.log("No test accounts found.");
}

(process.argv.includes("--remove") ? remove() : add()).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
