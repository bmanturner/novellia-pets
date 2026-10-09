import type { Metadata } from "next";
import { Overpass_Mono, Public_Sans } from "next/font/google";
import { Suspense } from "react";
import { ChatPanel } from "@/components/chat/chat-panel";
import { NoticeToast } from "@/components/notice-toast";
import { TopBar } from "@/components/top-bar";
import { chatEnabled } from "@/lib/chat/agent";
import { ChatProvider } from "@/lib/chat/chat-provider";
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

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const chat = chatEnabled();
  const content = (
    <>
      <TopBar chat={chat} />
      {chat && <ChatPanel />}
      <div data-app-shell className="@container flex flex-1 flex-col">
        {children}
      </div>
      {modal}
      <Suspense fallback={null}>
        <NoticeToast />
      </Suspense>
    </>
  );

  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${overpassMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {chat ? <ChatProvider>{content}</ChatProvider> : content}
      </body>
    </html>
  );
}
