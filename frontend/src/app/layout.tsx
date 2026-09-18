import type { Metadata } from "next";
import { Newsreader, Public_Sans } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legal Document Creator",
  description:
    "Chat with an assistant to draft a legal agreement and download a ready-to-sign document.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${publicSans.variable} h-dvh overflow-hidden antialiased print:h-auto print:overflow-visible`}
    >
      <body
        className="flex h-dvh flex-col overflow-hidden bg-panel print:h-auto print:overflow-visible print:bg-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
