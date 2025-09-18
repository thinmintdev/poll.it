"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { q: 'Is it really real-time?', a: 'Yes—votes propagate near instantly using a low-latency data layer so everyone sees the same evolving result.' },
  { q: 'Do I need an account to vote?', a: 'Currently no account is required to vote, keeping participation frictionless.' },
  { q: 'Can I embed polls?', a: 'Embeds are on the near-term roadmap—drop them into docs, community portals or streams.' },
  { q: 'Will there be analytics?', a: 'A richer insights dashboard is planned for the Pro tier including temporal vote velocity.' }
];

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative py-16 md:py-24" id="faq">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-app-primary text-center">Questions</h2>
        <div className="mt-10 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur">
          {faqs.map((f,i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="px-6">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                >
                  <span className="font-medium text-app-primary">{f.q}</span>
                  <span className="text-app-secondary text-sm">{isOpen ? '−' : '+'}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      key="content"
                      initial={{height:0, opacity:0}}
                      animate={{height:'auto', opacity:1}}
                      exit={{height:0, opacity:0}}
                      transition={{duration:0.35, ease:'easeInOut'}}
                      className="overflow-hidden pb-4"
                    >
                      <p className="text-sm text-app-secondary leading-relaxed pl-1 pr-4">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
