import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  variable: "--font-dm-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PhotoShare AI — Premium Event Memories Platform",
  description: "AI-powered facial recognition & private event photo sharing platform.",
};

import { Toaster } from "@/components/ui/sonner";
import { NotificationProvider } from "@/context/NotificationContext";
import { UploadProvider } from "@/context/UploadContext";
import { FloatingUploadTray } from "@/components/upload/floating-upload-tray";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#FFFDF8] text-[#1A1A1A] selection:bg-[#FFB703]/20 selection:text-[#FB8500]">
        <NotificationProvider>
          <UploadProvider>
            {children}
            <FloatingUploadTray />
          </UploadProvider>
        </NotificationProvider>
        <Toaster />
      </body>
    </html>
  );
}
