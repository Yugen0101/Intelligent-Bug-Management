import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BugMind — AI-Powered Bug Management for Modern Teams",
  description: "BugMind uses AI to automatically detect, classify, and prioritize bugs so your team ships faster and resolves issues smarter. Start free today.",
  keywords: ["AI bug management", "bug tracking", "NLP classification", "developer tools", "QA platform"],
  openGraph: {
    title: "BugMind — AI-Powered Bug Management",
    description: "Intelligent bug tracking with NLP classification, duplicate detection, and AI prioritization.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>{children}</body>
    </html>
  );
}
