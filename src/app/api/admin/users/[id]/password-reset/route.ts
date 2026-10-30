import {
  AdminError,
  assertCanChange,
  errorResponse,
  getAuthUser,
  requireAdmin,
} from "@/lib/admin/usersServer";

/**
 * Emails the user a link to choose a new password (on /course/reset-password).
 * Their current password keeps working until they do. Admins only.
 */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/users/[id]/password-reset">) {
  try {
    const { id } = await ctx.params;
    const { me, supabase } = await requireAdmin();
    const target = await getAuthUser(supabase, id);
    await assertCanChange(supabase, me, target, { removesAdminAccess: false });
    if (!target.email) throw new AdminError("This account has no email address.", 400);

    const origin = new URL(request.url).origin;
    const { error } = await supabase.auth.resetPasswordForEmail(target.email, {
      redirectTo: `${origin}/course/reset-password/`,
    });
    if (error) {
      if (error.code === "over_email_send_rate_limit") {
        throw new AdminError("Too many emails sent recently. Wait a while and try again.", 429);
      }
      throw error;
    }
    return Response.json({ sentTo: target.email, sentAt: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error);
  }
}
