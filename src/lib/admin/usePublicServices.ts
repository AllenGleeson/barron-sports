"use client";

import { useEffect, useState } from "react";
import type { AdminService } from "@/lib/admin/models";
import { loadPublicServices } from "@/lib/admin/publicContent";
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

/**
 * Published services from the database.
 * `null` until loaded (or if the database isn't available): callers render
 * their built-in fallback until then.
 */
export function usePublicServices() {
  const [services, setServices] = useState<Service[] | null>(null);

  useEffect(() => {
    let active = true;
    void loadPublicServices().then((rows) => {
      if (active && rows) {
        setServices(
          rows
            .filter((service) => service.published)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map(adminServiceToPublic),
        );
      }
    });
    return () => {
      active = false;
    };
  }, []);

  return services;
}
