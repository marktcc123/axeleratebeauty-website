import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SiteChrome } from "@/components/site/SiteChrome";
import "./globals.css";

const emilio = Cormorant_Garamond({
  variable: "--font-emilio",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const avenir = Manrope({
  variable: "--font-avenir",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dermabell Professional | Korean Skincare for Beauty Businesses",
  description:
    "Dermabell Professional offers complete salon facial systems and curated professional skincare kits for U.S. beauty businesses. Operated by Axelerate Inc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${emilio.variable} ${avenir.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-charcoal">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
