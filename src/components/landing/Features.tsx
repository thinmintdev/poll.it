"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, BoltIcon, ChartBarIcon, GlobeAltIcon, ShieldCheckIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

const features = [
  {
    title: 'Instant Updates',
    description: 'Votes stream in live—no manual refresh. Built on efficient realtime architecture.',
    icon: BoltIcon
  },
  {
    title: 'Frictionless Creation',
    description: 'Create and share a poll in under 10 seconds with a clean, focused flow.',
    icon: SparklesIcon
  },
  {
    title: 'Visual Insights',
    description: 'Auto-animated charts highlight shifting sentiment as votes arrive.',
    icon: ChartBarIcon
  },
  {
    title: 'Global Scale',
    description: 'Edge-deployed for fast result delivery across regions.',
    icon: GlobeAltIcon
  },
  {
    title: 'Privacy Respectful',
    description: 'No creepy tracking. Just the data required to power the poll.',
    icon: ShieldCheckIcon
  },
  {
    title: 'Configurable',
    description: 'Single / multi-select, image choices, visibility controls and more.',
    icon: AdjustmentsHorizontalIcon
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="relative py-16 md:py-24 bg-gradient-to-b from-transparent via-white/2 to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-cotton-pink via-cotton-purple to-cotton-blue bg-clip-text text-transparent">Everything you need</h2>
          <p className="mt-4 text-app-secondary text-base md:text-lg">Opinion flows are dynamic—your poll tool should be too. These core capabilities make collecting sentiment feel effortless.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((f,i) => (
            <motion.div
              key={f.title}
              initial={{opacity:0, y:16}}
              whileInView={{opacity:1, y:0}}
              viewport={{once:true, margin:'-50px'}}
              transition={{duration:0.5, delay:i*0.05}}
              className="group relative p-6 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] backdrop-blur shadow-inner overflow-hidden"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-cotton-pink/10 via-cotton-purple/10 to-cotton-blue/10" />
              <div className="relative flex items-start gap-4">
                <div className="shrink-0 p-2 rounded-xl bg-white/10 ring-1 ring-white/10">
                  <f.icon className="w-6 h-6 text-cotton-purple" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-app-primary">{f.title}</h3>
                  <p className="mt-2 text-sm text-app-secondary leading-relaxed">{f.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
