import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MainLayout from "@/components/layout/MainLayout";
import { NotificationContainer } from "@/components/notifications/NotificationContainer";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";
import Chatbot from "@/components/chatbot/Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Jualin - Premium E-commerce for Modern Sellers",
    template: "%s | Jualin Store"
  },
  description: "Discover curated minimalist products from top global sellers. Jualin offers a secure, fast, and premium shopping experience for the modern lifestyle.",
  keywords: ["e-commerce", "minimalist store", "premium products", "curated marketplace", "online shopping", "minimalist design"],
  authors: [{ name: "Jualin Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jualin.com",
    title: "Jualin - Premium Curated Marketplace",
    description: "Discover extraordinary minimalist products. Secure checkout, fast shipping, and 24/7 support.",
    siteName: "Jualin",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jualin - Minimalist E-commerce",
    description: "The premium marketplace for modern living.",
    creator: "@jualin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthModalProvider>
          <MainLayout>{children}</MainLayout>
          <NotificationContainer />
          <Chatbot />
        </AuthModalProvider>
      </body>
    </html>
  );
}
