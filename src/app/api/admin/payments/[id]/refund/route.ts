import { errorResponse, getAdminUser, refundShopPayment, requireAdmin } from "@/lib/admin/usersServer";

/**
 * Marks an in-shop payment as refunded and removes the course access it gave.
 * Body: { reason?: string }. Admins only. Online payments are refunded in Stripe.
 * Returns the learner's updated account (null if it has been deleted).
 */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/payments/[id]/refund">) {
  try {
    const { id } = await ctx.params;
    const { supabase } = await requireAdmin();
    const body = (await request.json().catch(() => ({}))) as { reason?: string };
    const userId = await refundShopPayment(supabase, id, body.reason);
    const user = userId ? await getAdminUser(supabase, userId).catch(() => null) : null;
    return Response.json({ refunded: id, user });
  } catch (error) {
    return errorResponse(error);
  }
}
