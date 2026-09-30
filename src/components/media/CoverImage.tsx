import Image from "next/image";
import { assetPath } from "@/lib/assetPath";

type CoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fit?: "cover" | "contain";
};

export function CoverImage({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "100vw",
  fit = "cover",
}: CoverImageProps) {
  return (
    <Image
      src={assetPath(src)}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
    />
  );
}
