import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import "./globals.css";
import { Toaster } from 'sonner';

const geist = Geist({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACM Tcehinal Round",
  description: "Test your knowledge with ACM Tcehinal Round, the ultimate quiz experience",
    generator: 'v0.app'
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
