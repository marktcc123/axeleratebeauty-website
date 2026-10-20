import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { AuthUrlErrorBridge } from "@/components/auth/AuthUrlErrorBridge";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Dermabell Professional | Korean Skincare for Beauty Businesses",
    template: "%s | Dermabell Professional",
  },
  description:
    "Dermabell Professional offers complete salon facial systems and curated professional skincare kits for U.S. beauty businesses. Operated by Axelerate Inc.",
  openGraph: {
    title: "Dermabell Professional | Korean Skincare for Beauty Businesses",
    description:
      "Complete salon facial systems and professional programs for U.S. beauty businesses. Operated by Axelerate Inc.",
    siteName: "Dermabell Professional",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${emilio.variable} ${avenir.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans text-charcoal">
        <AuthUrlErrorBridge />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
