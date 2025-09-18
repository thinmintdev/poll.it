"use client";

import PollFeedInfiniteScroll from '@/components/PollFeedInfiniteScroll';
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
      <FinalCTA />
      <UseCases />
      <SocialProof />
      {/* <PricingTeaser /> */}
      
      

      {/* Live Poll Feed Section */}
      <section id="create" className="relative py-20 border-t border-white/10 bg-white/[0.02]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_70%)]" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div id="feed" className="flex flex-col overflow-hidden relative lg:max-h-[950px]">
              <PollFeedInfiniteScroll />
            </div>
          </div>
        </div>
      </section>
      <FAQ />
    </main>
  );
}
