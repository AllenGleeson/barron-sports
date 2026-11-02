import { errorResponse, listPayments, requireAdmin } from "@/lib/admin/usersServer";

/** Every course payment (online, in the shop and free), newest first. Admins only. */
export async function GET() {
  try {
    const { supabase } = await requireAdmin();
    return Response.json({ payments: await listPayments(supabase) });
  } catch (error) {
    return errorResponse(error);
  }
}
