"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const tiers = [
  { name: 'Free', price: '$0', blurb: 'Core polling • realtime voting • image polls', highlight: true },
  { name: 'Pro', price: 'Coming soon', blurb: 'Custom branding • advanced analytics • export', highlight: false }
];

const PricingTeaser: React.FC = () => {
  return (
    <section className="relative py-16 md:py-24" id="pricing">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-app-primary">Fair & simple</h2>
        <p className="mt-4 text-app-secondary max-w-2xl mx-auto">Start free. Upgrade later if you need deeper control & insight. No credit card required.</p>
        <div className="mt-12 grid sm:grid-cols-2 gap-6 md:gap-8">
          {tiers.map((t,i) => (
            <motion.div
              key={t.name}
              initial={{opacity:0, y:16}}
              whileInView={{opacity:1, y:0}}
              viewport={{once:true, margin:'-60px'}}
              transition={{duration:0.5, delay:i*0.1}}
              className={`relative p-6 rounded-2xl border border-white/10 backdrop-blur bg-white/[0.04] flex flex-col ${t.highlight ? 'ring-1 ring-cotton-purple/40' : ''}`}
            >
              <h3 className="text-xl font-semibold text-app-primary">{t.name}</h3>
              <div className="mt-4 text-3xl font-bold bg-gradient-to-r from-cotton-pink via-cotton-purple to-cotton-blue bg-clip-text text-transparent">{t.price}</div>
              <p className="mt-3 text-sm text-app-secondary flex-1">{t.blurb}</p>
              {t.name === 'Free' && (
                <Link href="#create" className="btn-primary mt-6 inline-flex justify-center">Get Started</Link>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingTeaser;
