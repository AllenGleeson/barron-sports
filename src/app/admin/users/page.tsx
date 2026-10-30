import type { Metadata } from "next";
import { UsersAdmin } from "@/components/admin/UsersAdmin";

export const metadata: Metadata = {
  title: "Users",
  description: "Learner accounts and firearms safety course progress.",
};

export default function AdminUsersPage() {
  return <UsersAdmin />;
}
