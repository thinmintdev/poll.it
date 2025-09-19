"use client";
import React from 'react';
import HomeHeroBars from "../HomeHeroBars";
import CreatePoll from "../../app/create/page";
import Link from "next/link";
import { motion } from "framer-motion";

// SaaS style hero leveraging existing animated bar background
const Hero: React.FC = () => {
  return (
    <section className="relative w-full pt-20 sm:pt-24 md:pt-28 pb-12 md:pb-28 overflow-hidden">
      {/* Full-bleed subtle gradient + noise backdrop - extended to top */}
      <div className="absolute inset-0 -top-20 bg-[radial-gradient(circle_at_top_left,rgba(255,107,157,0.18),transparent_60%)]" />
      <div className="absolute inset-0 -top-20 bg-[radial-gradient(circle_at_bottom_right,rgba(79,172,254,0.20),transparent_65%)]" />
      <div className="absolute inset-0 -top-20 opacity-[0.08] mix-blend-screen" style={{backgroundImage:'url("/noise.png")'}} />
      <div className="absolute -top-60 -left-40 w-[560px] h-[560px] rounded-full bg-cotton-pink/10 blur-3xl" />
      <div className="absolute -bottom-32 -right-40 w-[600px] h-[600px] rounded-full bg-cotton-blue/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="w-full flex flex-col items-start justify-center">
            {/* Hero bars animation replacing the main heading */}
            <div className="w-full mb-8">
              <HomeHeroBars />
            </div>
            <motion.p
              className="text-lg md:text-xl lg:text-2xl text-app-secondary leading-relaxed max-w-2xl px-4 sm:px-0"
              initial={{opacity:0, y:18}}
              animate={{opacity:1, y:0}}
              transition={{duration:0.65, delay:0.15}}
            >Create a poll in seconds and watch the collective pulse update instantly. Built for communities, teams, streams & events.</motion.p>
            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-5 items-center sm:items-start lg:justify-left sm:justify-center w-full"
              initial={{opacity:0, y:18}}
              animate={{opacity:1, y:0}}
              transition={{duration:0.65, delay:0.3}}
            >
              <Link href="#feed" className="btn-primary inline-flex items-center justify-center gap-2 min-w-[170px] text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Live Feed
              </Link>
              <Link href="#features" className="btn-secondary inline-flex items-center justify-center gap-2 min-w-[170px] text-base">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                See Features
              </Link>
            </motion.div>
          </div>
          <div className="relative w-full">
            {/* Create poll form on the right side */}
            <motion.div
              initial={{opacity:0, x:24}}
              animate={{opacity:1, x:0}}
              transition={{duration:0.75, delay:0.2}}
            >
              <CreatePoll />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
