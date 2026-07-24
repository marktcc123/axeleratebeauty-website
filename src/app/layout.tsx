import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Dermabell K-Beauty Express Facial | Axelerate Beauty",
  description:
    "Exclusive US operator for Dermabell. Monetize existing salon traffic with a 40-minute Korean Express Facial — 3× ticket, 5× profit, zero new fixed costs.",
  openGraph: {
    title: "Dermabell K-Beauty Express Facial Program",
    description:
      "Add a premium Korean facial to your beauty store. Book a Store Evaluation with Axelerate Inc.",
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
      <body className="min-h-full flex flex-col font-sans text-charcoal">{children}</body>
    </html>
  );
}
