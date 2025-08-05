'use client'

import PollFeedInfiniteScroll from '@/components/PollFeedInfiniteScroll'
import CreatePoll from './create/page'
import HomeHeroBars from '@/components/HomeHeroBars'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Main Content - Two Column Layout */}
      <div id="create" className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <HomeHeroBars />
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:items-start">
          {/* Left Column - Poll Creation Form */}
          <div className="flex flex-col">
            <CreatePoll />
          </div>

          {/* Right Column - Feed with Infinite Scroll */}
          <div id="feed" className="flex flex-col overflow-hidden relative lg:h-[575px]">
            <PollFeedInfiniteScroll />
          </div>
        </div>
      </div>
    </div>
  );
}
