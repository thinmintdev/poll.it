import React from "react";
import type { AppProps } from "next/app";
import "../styles/globals.css";
import Header from "../components/Header";

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <Header />
    <div className="pt-16 min-h-screen bg-background text-foreground transition-colors duration-300">
      <Component {...pageProps} />
    </div>
  </>
);

export default MyApp;