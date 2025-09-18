"use client";
import React from 'react';
import { motion } from 'framer-motion';

// Placeholder testimonial data (could later integrate from DB / CMS)
const testimonials = [
  { quote: 'We swapped static forms for live polls—engagement spiked 3x overnight.', author: 'Community Lead', org: 'Tech Discord' },
  { quote: 'Honestly the smoothest poll UX we\'ve tried. People actually keep it open.', author: 'Streaming Host', org: 'Twitch Channel' },
  { quote: 'Captured alignment in under 60 seconds during our product sync.', author: 'PM', org: 'SaaS Startup' }
];

const SocialProof: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-app-primary">People keep the tab open</h2>
        <p className="mt-4 text-app-secondary max-w-2xl mx-auto">Retention signals belong here. Real-time feedback loops reward repeat glances and micro-interactions.</p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t,i) => (
            <motion.div
              key={t.quote}
              initial={{opacity:0, y:16}}
              whileInView={{opacity:1, y:0}}
              viewport={{once:true, margin:'-60px'}}
              transition={{duration:0.5, delay:i*0.1}}
              className="p-6 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur text-left flex flex-col"
            >
              <p className="text-sm text-app-secondary italic flex-1">“{t.quote}”</p>
              <div className="mt-4 text-xs uppercase tracking-wide text-app-secondary/70">{t.author} · {t.org}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
