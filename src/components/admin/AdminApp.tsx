"use client";

import { AdminGate } from "@/components/admin/AdminGate";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminStoreProvider } from "@/lib/admin/store";

export function AdminApp({ children }: { children: React.ReactNode }) {
  return (
    <AdminGate>
      <AdminStoreProvider>
        <AdminShell>{children}</AdminShell>
      </AdminStoreProvider>
    </AdminGate>
  );
}
