import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: 'swap',
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
  const gaTrackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;

  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased bg-app-primary text-app-primary min-h-screen flex flex-col font-poppins`}
      >
        {/* Google Analytics */}
        {gaTrackingId && <GoogleAnalytics trackingId={gaTrackingId} />}
        
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
        <main className="pt-20 relative z-0 flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
