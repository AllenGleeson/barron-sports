import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/source-sans-3/wght.css";
import { BackToTop } from "@/components/layout/BackToTop";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  icons: {
    icon: [{ url: "/mini-logo.PNG", type: "image/png" }],
    apple: "/mini-logo.PNG",
  },
};

export const viewport = {
  themeColor: "#1e271c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IE" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-ink font-sans text-cream">
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-[60] -translate-y-20 bg-brass px-4 py-2 text-sm text-ink transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
