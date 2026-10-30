import { AdminError, errorResponse, getAdminUser, listAdminUsers, requireAdmin } from "@/lib/admin/usersServer";

/** Every account (students and admins) with its course enrolment. Admins only. */
export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return Response.json({ users: await listAdminUsers(supabase) });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Adds an account and emails an invite link; the person chooses their own password on
 * /course/reset-password. Body: { name, email, role }.
 */
export async function POST(request: Request) {
  try {
    const { supabase } = await requireAdmin();
    const body = (await request.json().catch(() => ({}))) as { name?: string; email?: string; role?: string };
    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    if (!name) throw new AdminError("Name is required.", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AdminError("Enter a valid email.", 400);

    const origin = new URL(request.url).origin;
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name },
      redirectTo: `${origin}/course/reset-password/`,
    });
    if (error) {
      if (error.code === "email_exists") throw new AdminError("An account already uses this email.", 400);
      if (error.code === "over_email_send_rate_limit") {
        throw new AdminError("Too many emails sent recently. Wait a while and try again.", 429);
      }
      throw error;
    }
    if (body.role === "admin") {
      const { error: roleError } = await supabase.auth.admin.updateUserById(data.user.id, {
        app_metadata: { role: "admin" },
      });
      if (roleError) throw roleError;
    }
    return Response.json({ user: await getAdminUser(supabase, data.user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}
