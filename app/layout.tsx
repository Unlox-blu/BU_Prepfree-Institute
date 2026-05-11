import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/soner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepFree Institute",
  description: "Institute Dashboard",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "PrepFree Institute",
    description: "Institute Dashboard",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "PrepFree Institute Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PrepFree Institute",
    description: "Institute Dashboard",
    images: ["/favicon.png"],
  },
};

// deployment comment

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}