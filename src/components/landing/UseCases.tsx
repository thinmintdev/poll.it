"use client";
import React from 'react';
import { motion } from 'framer-motion';

const useCases = [
  { title: 'Live Streams', body: 'Engage viewers in real time—guide content decisions while on air.' },
  { title: 'Communities', body: 'Capture the vibe without labor-intensive mod forms or slow discussion threads.' },
  { title: 'Teams & Offsites', body: 'Lightweight alignment tool for fast internal decisions and retro energy checks.' },
  { title: 'Events & Workshops', body: 'Keep audiences active with instant pulse checks and session feedback.' },
  { title: 'Education', body: 'Gauge understanding or spark debate mid‑lesson.' },
  { title: 'Product Feedback', body: 'Test positioning, naming, or roadmap ideas with a targeted audience.' }
];

const UseCases: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 max-w-sm">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-app-primary">Built for real contexts</h2>
            <p className="mt-4 text-app-secondary leading-relaxed">A single interaction model that flexes across domains. High signal, low friction.</p>
          </div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6 md:gap-8">
            {useCases.map((c,i) => (
              <motion.div
                key={c.title}
                initial={{opacity:0, y:16}}
                whileInView={{opacity:1, y:0}}
                viewport={{once:true, margin:'-80px'}}
                transition={{duration:0.5, delay:(i%3)*0.08}}
                className="p-5 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur hover:bg-white/[0.07] transition-colors"
              >
                <h3 className="font-semibold text-app-primary text-lg">{c.title}</h3>
                <p className="mt-2 text-sm text-app-secondary leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
