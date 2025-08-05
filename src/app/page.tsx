'use client'

import PollFeedInfiniteScroll from '@/components/PollFeedInfiniteScroll'
import CreatePoll from './create/page'
import HomeHeroBars from '@/components/HomeHeroBars'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <HomeHeroBars />
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Poll Creation Form */}
          <div>
            <CreatePoll />
          </div>

          {/* Right Column - Feed with Infinite Scroll */}
          <div id="feed" className="card h-[calc(100vh-510px)] flex flex-col overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cotton-purple/5 via-transparent to-cotton-mint/5 pointer-events-none"></div>
            <div className="relative flex-grow overflow-y-auto">
              <PollFeedInfiniteScroll />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
