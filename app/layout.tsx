import type { Metadata } from "next";
import { Overpass_Mono, Public_Sans } from "next/font/google";
import { TopBar } from "@/components/top-bar";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

const overpassMono = Overpass_Mono({
  variable: "--font-overpass-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Novellia Pets",
  description:
    "Your pets' medical records, with what's overdue or due soon up front.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${overpassMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TopBar />
        {children}
      </body>
    </html>
  );
}
