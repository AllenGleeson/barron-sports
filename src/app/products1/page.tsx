import type { Metadata } from "next";
import { CategoryGrid } from "@/components/home/CategoryGrid";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Rifles, shotguns, DogTrace systems, night vision, flashlights and accessories from Barron Sports in Ennis.",
};

export default function ProductsIndexPage() {
  return <CategoryGrid />;
}
