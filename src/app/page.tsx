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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Poll Creation Form */}
          <div className="flex-1 lg:max-w-2xl">
            <CreatePoll />
          </div>

          {/* Right Column - Feed with Infinite Scroll */}
          <div id="feed" className="flex-1 flex flex-col overflow-hidden relative lg:max-h-[700px]">
            <PollFeedInfiniteScroll />
          </div>
        </div>
      </div>
    </div>
  );
}
