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
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Poll Creation Form */}
          <div>
            <CreatePoll />
          </div>

          {/* Right Column - Feed with Infinite Scroll */}
          <div id="feed" className="h-[calc(100vh-510px)] flex flex-col overflow-hidden relative">
            <PollFeedInfiniteScroll />
          </div>
        </div>
      </div>
    </div>
  );
}
