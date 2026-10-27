import Link from "next/link";
import { buttonClass, type ButtonSize, type ButtonVariant } from "@/components/ui/styles";

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonProps = StyleProps & {
  href: string;
  children: React.ReactNode;
};

/** A link styled as a button. `tel:`, `mailto:` and external links use a plain `<a>`. */
export function Button({ href, children, variant, size, className }: ButtonProps) {
  const classes = buttonClass({ variant, size, className });
  const isNative =
    href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http");

  if (isNative) {
    const isHttp = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(isHttp ? { target: "_blank", rel: "noreferrer" } : {})}
      >
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

/** A `<button>` with the same styles as `Button`. Defaults to `type="button"`. */
export function ActionButton({
  variant,
  size,
  className,
  type = "button",
  ...props
}: StyleProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass({ variant, size, className })} {...props} />
  );
}
