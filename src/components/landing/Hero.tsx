"use client";
import React from 'react';
import HomeHeroBars from "../HomeHeroBars";
import Link from "next/link";
import { motion } from "framer-motion";

// SaaS style hero leveraging existing animated bar background
const Hero: React.FC = () => {
  return (
    <section className="relative pt-10 sm:pt-16 md:pt-20 pb-12 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="order-2 lg:order-1">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight bg-gradient-to-br from-cotton-pink via-cotton-purple to-cotton-blue bg-clip-text text-transparent"
              initial={{opacity:0, y:24}}
              animate={{opacity:1, y:0}}
              transition={{duration:0.7, ease:'easeOut'}}
            >Realtime polls that actually feel alive.</motion.h1>
            <motion.p
              className="mt-6 text-lg md:text-xl text-app-secondary leading-relaxed max-w-xl"
              initial={{opacity:0, y:16}}
              animate={{opacity:1, y:0}}
              transition={{duration:0.6, delay:0.15}}
            >Create a poll in seconds and watch the collective pulse update instantly. Built for communities, teams, streams & events.</motion.p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row gap-4"
              initial={{opacity:0, y:16}}
              animate={{opacity:1, y:0}}
              transition={{duration:0.6, delay:0.25}}
            >
              <Link href="#create" className="btn-primary inline-flex justify-center">Start Free</Link>
              <Link href="#features" className="btn-secondary inline-flex justify-center">See Features</Link>
            </motion.div>
            <motion.div
              className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center"
              initial="hidden"
              animate="visible"
              variants={{hidden:{opacity:0}, visible:{opacity:1, transition:{staggerChildren:0.12}}}}
            >
              {[
                {label:'Votes Cast', value:'120K+'},
                {label:'Polls Created', value:'8.5K+'},
                {label:'Avg. Latency', value:'<120ms'},
                {label:'Uptime', value:'99.9%'}
              ].map(stat => (
                <motion.div key={stat.label} variants={{hidden:{opacity:0, y:8}, visible:{opacity:1, y:0}}} className="p-3 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                  <div className="text-xl font-semibold text-app-primary">{stat.value}</div>
                  <div className="text-xs uppercase tracking-wide text-app-secondary/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="order-1 lg:order-2">
            <HomeHeroBars />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
