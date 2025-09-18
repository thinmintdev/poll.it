"use client";

import PollFeedInfiniteScroll from '@/components/PollFeedInfiniteScroll';
import CreatePoll from './create/page';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import UseCases from '@/components/landing/UseCases';
import SocialProof from '@/components/landing/SocialProof';
import PricingTeaser from '@/components/landing/PricingTeaser';
import FAQ from '@/components/landing/FAQ';
import FinalCTA from '@/components/landing/FinalCTA';

export default function Home() {
  return (
    <main className="flex flex-col">
      {/* Marketing Landing Sections */}
      <Hero />
      <Features />
      <UseCases />
      <SocialProof />
      <PricingTeaser />
      <FAQ />
      <FinalCTA />

      {/* Product Interaction Section (existing create + feed) */}
      <section id="create" className="relative py-20 border-t border-white/10 bg-white/[0.02]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_70%)]" />
        <div className="relative container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-app-primary mb-10 text-center">Try it instantly</h2>
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
            <div className="flex-1 lg:max-w-2xl">
              <CreatePoll />
            </div>
            <div id="feed" className="flex-1 flex flex-col overflow-hidden relative lg:max-h-[720px] rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur p-2">
              <PollFeedInfiniteScroll />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
