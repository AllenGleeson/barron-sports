"use client";

import { useEffect, useState } from "react";
import { loadOfferBrandNames } from "@/lib/admin/publicContent";

/**
 * Brand names on live special offers from the database.
 * `null` until loaded (or if the database isn't available).
 */
export function usePublicOfferBrands() {
  const [names, setNames] = useState<string[] | null>(null);

  useEffect(() => {
    let active = true;
    void loadOfferBrandNames().then((result) => {
      if (active && result) setNames(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return names;
}
