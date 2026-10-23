"use client";

import { useEffect, useState } from "react";
import type { AdminService, AdminStoreData } from "@/lib/admin/models";
import { readAdminStoreData } from "@/lib/admin/store";
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

export function usePublicServices(fallback: Service[]) {
  const [rows, setRows] = useState<Service[] | null>(null);

  useEffect(() => {
    const store = readAdminStoreData();
    setRows(store ? publicServicesFromStore(store) : fallback);
  }, [fallback]);

  return rows;
}
