"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const FinalCTA: React.FC = () => {
  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          initial={{opacity:0, y:24}}
            whileInView={{opacity:1, y:0}}
          viewport={{once:true, margin:'-80px'}}
          transition={{duration:0.65}}
          className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cotton-pink via-cotton-purple to-cotton-blue bg-clip-text text-transparent"
        >Spin up your first live poll now</motion.h2>
        <motion.p
          className="mt-6 text-app-secondary max-w-2xl mx-auto text-lg"
          initial={{opacity:0, y:20}}
          whileInView={{opacity:1, y:0}}
          viewport={{once:true, margin:'-80px'}}
          transition={{duration:0.55, delay:0.15}}
        >It takes less than a minute. No onboarding labyrinths. Just ask & watch the crowd respond.</motion.p>
        <motion.div
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{opacity:0, y:20}}
          whileInView={{opacity:1, y:0}}
          viewport={{once:true, margin:'-80px'}}
          transition={{duration:0.55, delay:0.25}}
        >
          <Link href="#create" className="btn-primary inline-flex justify-center">Create a Poll</Link>
          <Link href="#features" className="btn-secondary inline-flex justify-center">Explore Features</Link>
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
    </section>
  );
};

export default FinalCTA;
