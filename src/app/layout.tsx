import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from '@/components/Header';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Poll.it - Real-time Polling Made Simple",
  description: "Create instant polls, get real-time results, and make decisions together. No sign-up required.",
  icons: {
    icon: '/poll_logo.svg',
    shortcut: '/poll_logo.svg',
    apple: '/poll_logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-app-primary text-app-primary min-h-screen`}
      >
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-1/4 -left-40 w-80 h-80 bg-cotton-pink/10 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 -right-40 w-80 h-80 bg-cotton-blue/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/3 w-60 h-60 bg-cotton-purple/10 rounded-full blur-3xl"></div>
          
          {/* Animated particles */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cotton-mint rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cotton-peach rounded-full opacity-40 animate-ping"></div>
            <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-cotton-lavender rounded-full opacity-50 animate-pulse"></div>
          </div>
        </div>
        
        <Header />
        <main className="pt-20 relative z-0">
          {children}
        </main>
      </body>
    </html>
  );
}
