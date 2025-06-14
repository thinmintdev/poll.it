import React from "react";
import PollForm from "../components/PollForm";
import RecentPolls from "../components/RecentPolls";

const HomePage: React.FC = () => (
  <div className="bg-poll-dark text-poll-grey-100">
    {/* Logo and Header Section */}
    <div className="w-full text-center py-6">
      <h1 className="text-4xl font-bold mb-2">
        Poll<span className="text-[#14b8a6]">.it</span>
      </h1>
      <p className="text-poll-grey-400">
        Create engaging polls and get real-time insights from your community
      </p>
    </div>

    <div className="container max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 px-4 py-6">
      {/* Create Poll Section */}
      <div className="w-full lg:w-1/2">
        <div className="bg-poll-grey-800/50 border border-poll-grey-700 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[#14b8a6]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
            </span>
            <h2 className="text-xl font-semibold">Create New Poll</h2>
          </div>
          <PollForm />
        </div>
      </div>

      {/* Live Polls Section */}
      <div className="w-full lg:w-1/2 lg:sticky lg:top-20 self-start">
        <div className="bg-poll-grey-800/50 border border-poll-grey-700 rounded-lg p-6 h-[calc(100vh-280px)] flex flex-col">
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-poll-orange-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m12 8 6-3-6-3v14" />
                  <path d="m8 11-4 2 4 2" />
                </svg>
              </span>
              <h2 className="text-xl font-semibold">Live Polls</h2>
              <span className="text-sm text-gray-400 ml-2">(Last 24h)</span>
            </div>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-[#14b8a6]/50 text-white border-[#14b8a6]/80">
              LIVE
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            <RecentPolls />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default HomePage;