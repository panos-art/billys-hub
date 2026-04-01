import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "greek"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Billys Hub",
  description: "Εσωτερική πλατφόρμα λειτουργιών Billys",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el" className={`${manrope.variable} h-full`}>
      <body className="min-h-full font-[family-name:var(--font-manrope)] bg-[#F4F7F9] antialiased">
        {children}
      </body>
    </html>
  );
}
