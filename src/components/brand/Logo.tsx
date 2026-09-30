import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/assetPath";

type LogoProps = {
  className?: string;
  priority?: boolean;
  compact?: boolean;
};

export function Logo({ className = "", priority = false, compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center ${className}`}
      aria-label="Barron Sports home"
    >
      <span
        className={
          compact
            ? "inline-flex h-10 sm:h-11"
            : "inline-flex h-16 sm:h-[4.5rem] lg:h-20"
        }
      >
        <Image
          src={assetPath("/logo.png")}
          alt=""
        width={656}
        height={201}
          priority={priority}
          className="h-full w-auto object-contain"
          style={{ width: "auto", height: "100%" }}
        />
      </span>
    </Link>
  );
}
