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

const PASSWORD = "Course-Test-2026";
const DISABLED_BAN = "876000h";
const COURSE_PRICE_CENTS = 4900;

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
  | { kind: "paid-online"; paidDaysAgo: number }
  | { kind: "paid-shop"; paidDaysAgo: number }
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
    stage: { kind: "paid-online", paidDaysAgo: 3 },
  },
  { email: "liam.test@example.ie", name: "Liam Test", stage: { kind: "paid-shop", paidDaysAgo: 10 } },
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

function enrolmentRow(userId: string, student: TestStudent): Record<string, unknown> | null {
  const { stage } = student;
  const fake = `test_${userId.slice(0, 8)}`;
  const base = { user_id: userId, updated_at: new Date().toISOString() };
  switch (stage.kind) {
    case "registered":
      return null;
    case "checkout":
      return { ...base, status: "checkout_created", stripe_checkout_session_id: `cs_${fake}`, certificate_name: student.name };
    case "paid-online":
    case "completed":
      return {
        ...base,
        status: "paid",
        amount_cents: COURSE_PRICE_CENTS,
        currency: "eur",
        stripe_checkout_session_id: `cs_${fake}`,
        stripe_payment_intent_id: `pi_${fake}`,
        certificate_name: student.name,
        paid_at: daysAgo(stage.paidDaysAgo),
        completed_at: stage.kind === "completed" ? daysAgo(stage.completedDaysAgo) : null,
      };
    case "paid-shop":
      return { ...base, status: "paid", certificate_name: student.name, paid_at: daysAgo(stage.paidDaysAgo) };
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

    const row = enrolmentRow(user.id, student);
    if (row) {
      const { error: rowError } = await supabase.from("course_enrolments").upsert(row);
      if (rowError) throw new Error(`${student.email} enrolment: ${rowError.message}`);
    }
    console.log(`added  ${student.email.padEnd(26)} ${student.stage.kind}${student.disabled ? " (disabled)" : ""}`);
  }
  console.log(`\nSign in as any of them with the password: ${PASSWORD}`);
}

async function remove() {
  const tests = (await allUsers()).filter((user) => user.user_metadata?.test_account === true);
  for (const user of tests) {
    // Enrolment rows go with the user (on delete cascade).
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
