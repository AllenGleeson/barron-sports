import { SiteChrome } from "@/components/layout/SiteChrome";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
