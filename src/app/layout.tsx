import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/source-sans-3/wght.css";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: [{ url: "/brand/mini-logo.PNG", type: "image/png" }],
    apple: "/brand/mini-logo.PNG",
  },
};

export const viewport = {
  themeColor: "#1e271c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IE" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-ink font-sans text-cream">
        {children}
      </body>
    </html>
  );
}
