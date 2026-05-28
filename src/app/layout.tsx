import type { Metadata } from "next";
import { Geist, Geist_Mono, Host_Grotesk, Oxygen } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const hostGrotesk = Host_Grotesk({
  weight: ["600", "800"],
  subsets: ["latin"],
  variable: "--font-host-grotesk",
});

const oxygen = Oxygen({
  weight: ["300"],
  subsets: ["latin"],
  variable: "--font-oxygen",
});

export const metadata: Metadata = {
  title: "ArtCal — Art Events Calendar",
  description: "Discover art events, exhibitions, fairs, auctions, and performances across Europe and the US",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${hostGrotesk.variable} ${oxygen.variable} h-full antialiased`}
    >
      <body className="h-full bg-white text-zinc-900">{children}</body>
    </html>
  );
}
