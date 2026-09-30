import Image from "next/image";
import type { Brand } from "@/lib/site";

export function BrandLogo({ brand }: { brand: Brand }) {
  return (
    <figure className="flex h-full min-h-[7.25rem] flex-col items-center justify-center gap-3 bg-cream/70 px-4 py-5">
      <span className="relative flex h-12 w-full items-center justify-center sm:h-14">
        <Image
          src={brand.logo}
          alt=""
          fill
          sizes="180px"
          className="object-contain"
        />
      </span>
      <figcaption className="text-center text-[11px] uppercase leading-snug tracking-[0.12em] text-ink/80">
        {brand.name}
      </figcaption>
    </figure>
  );
}
