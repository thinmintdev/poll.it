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
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                className="px-6"
                layout
                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
              >
                <motion.button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-cotton-purple focus-visible:ring-opacity-50 rounded-lg"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <span className="font-medium text-app-primary">{f.q}</span>
                  <motion.span
                    className="text-app-secondary text-lg font-semibold min-w-[20px] flex items-center justify-center"
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    +
                  </motion.span>
                </motion.button>

                <motion.div
                  id={`faq-panel-${i}`}
                  initial={false}
                  animate={{
                    height: isOpen ? "auto" : 0,
                    opacity: isOpen ? 1 : 0,
                    marginBottom: isOpen ? 16 : 0
                  }}
                  transition={{
                    height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                    opacity: { duration: 0.3, ease: "easeInOut", delay: isOpen ? 0.1 : 0 },
                    marginBottom: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }
                  }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ y: -10 }}
                    animate={{ y: isOpen ? 0 : -10 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: isOpen ? 0.15 : 0 }}
                    className="pb-1"
                  >
                    <p className="text-sm text-app-secondary leading-relaxed pl-1 pr-4">
                      {f.a}
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
