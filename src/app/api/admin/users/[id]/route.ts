import type { AdminUserChanges } from "@/lib/admin/users";
import {
  applyChanges,
  assertCanChange,
  errorResponse,
  getAdminUser,
  getAuthUser,
  requireAdmin,
} from "@/lib/admin/usersServer";

/** Changes an account. Body: `AdminUserChanges`. Admins only. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  try {
    const { id } = await ctx.params;
    const { me, supabase } = await requireAdmin();
    const target = await getAuthUser(supabase, id);
    const changes = (await request.json().catch(() => ({}))) as AdminUserChanges;
    await applyChanges(supabase, me, target, changes);
    return Response.json({ user: await getAdminUser(supabase, id) });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Deletes an account and (through the foreign key) its enrolment. Admins only. */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/users/[id]">) {
  try {
    const { id } = await ctx.params;
    const { me, supabase } = await requireAdmin();
    const target = await getAuthUser(supabase, id);
    await assertCanChange(supabase, me, target, { removesAdminAccess: true });
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
    return Response.json({ deleted: id });
  } catch (error) {
    return errorResponse(error);
  }
}
