"use client";

import { useMemo } from "react";
import type { AdminService, AdminStoreData } from "@/lib/admin/models";
import { useAdminStoreData } from "@/lib/admin/store";
import type { Service } from "@/lib/site";

export function adminServiceToPublic(service: AdminService): Service {
  return {
    title: service.title,
    description: service.description,
    image: {
      src: service.imageUrl,
      alt: service.imageAlt,
    },
  };
}

export function publicServicesFromStore(store: AdminStoreData): Service[] {
  return store.services
    .filter((service) => service.published)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(adminServiceToPublic);
}

/**
 * Published services from this browser's admin data.
 * `null` until hydrated: callers render their static fallback until then.
 */
export function usePublicServices() {
  const store = useAdminStoreData();
  return useMemo(() => (store ? publicServicesFromStore(store) : null), [store]);
}
