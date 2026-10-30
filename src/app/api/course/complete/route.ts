import { getRequestUser, getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Records that the signed-in learner has finished the course. The date is set once and
 * never changed, which is what stops the course (and its record) being redone.
 */
export async function POST() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return Response.json({ error: "Not set up." }, { status: 503 });

  const user = await getRequestUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });

  const { data: row, error } = await supabase
    .from("course_enrolments")
    .select("status, completed_at")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return Response.json({ error: "Couldn't save." }, { status: 500 });
  if (row?.status !== "paid") return Response.json({ error: "Not enrolled." }, { status: 403 });
  if (row.completed_at) return Response.json({ completedAt: row.completed_at });

  const now = new Date().toISOString();
  // `is null` makes this safe if two requests race: only the first one sets the date.
  const { error: updateError } = await supabase
    .from("course_enrolments")
    .update({ completed_at: now, updated_at: now })
    .eq("user_id", user.id)
    .is("completed_at", null);
  if (updateError) return Response.json({ error: "Couldn't save." }, { status: 500 });

  const { data: saved } = await supabase
    .from("course_enrolments")
    .select("completed_at")
    .eq("user_id", user.id)
    .maybeSingle();
  return Response.json({ completedAt: saved?.completed_at ?? now });
}
