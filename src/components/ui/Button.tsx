import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-brass text-ink hover:bg-[#dcc392] border border-brass",
  secondary:
    "bg-transparent text-cream border border-cream/35 hover:border-brass hover:text-brass",
  ghost:
    "bg-transparent text-brass border border-brass/40 hover:border-brass hover:bg-brass/10",
};

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center px-6 py-3 text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-200 ${variants[variant]} ${className}`;
  const isNative =
    href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");

  if (isNative) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
