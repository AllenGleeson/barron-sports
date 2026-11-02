import type { Metadata } from "next";
import { PaymentsAdmin } from "@/components/admin/PaymentsAdmin";

export const metadata: Metadata = {
  title: "Payments",
  description: "Firearms safety course payments: online, in the shop and free.",
};

export default function AdminPaymentsPage() {
  return <PaymentsAdmin />;
}
