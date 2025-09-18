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

// Icon mapping for each use case (inline SVG for fast load & easy theming)
const icons: Record<string, React.ReactNode> = {
  'Live Streams': (
    <svg className="w-5 h-5 text-cotton-pink" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M4 8h8m-8 4h8m-8 4h5" />
    </svg>
  ),
  'Communities': (
    <svg className="w-5 h-5 text-cotton-purple" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 20v-2a4 4 0 014-4h2a4 4 0 014 4v2M12 12a4 4 0 100-8 4 4 0 000 8zM6 8a6 6 0 1112 0 6 6 0 01-12 0z" />
    </svg>
  ),
  'Teams & Offsites': (
    <svg className="w-5 h-5 text-cotton-blue" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h10M3 17h6" />
    </svg>
  ),
  'Events & Workshops': (
    <svg className="w-5 h-5 text-cotton-mint" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M5 11h14M5 21h14a2 2 0 002-2v-9a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />
    </svg>
  ),
  'Education': (
    <svg className="w-5 h-5 text-cotton-purple" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4-9 4-9-4 9-4zm0 8l9-4v6M12 7v12" />
    </svg>
  ),
  'Product Feedback': (
    <svg className="w-5 h-5 text-cotton-pink" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5h6M7 9h10M7 13h6M5 21l2-4h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16z" />
    </svg>
  )
}

const UseCases: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 max-w-sm">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-app-primary">Perfect for decisions, vibes, and feedback.</h2>
            <p className="mt-4 text-app-secondary leading-relaxed">Sleek UI, real-time engagement, meaningful analytics and versatile use cases increase participation and valuable insights.</p>
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
                <h3 className="font-semibold text-app-primary text-lg flex items-center gap-2">
                  <span className="shrink-0 inline-flex items-center justify-center rounded-md bg-white/5 border border-white/10 p-2 backdrop-blur-sm">
                    {icons[c.title]}
                  </span>
                  <span>{c.title}</span>
                </h3>
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
