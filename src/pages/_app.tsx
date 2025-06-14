import React from "react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <Header />
    <div className="pt-16 min-h-screen bg-background text-foreground transition-colors duration-300 flex flex-col">
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
      <Footer />
    </div>
  </>
);

export default MyApp;