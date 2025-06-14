import React from "react";
import PollForm from "../components/PollForm";
import RecentPolls from "../components/RecentPolls";

const HomePage: React.FC = () => (
  <div className="bg-poll-dark text-poll-grey-100">
    {/* Logo and Header Section */}
    <div className="w-full text-center py-14">
      <h1 className="text-6xl font-bold mb-2">
        Poll<span className="text-[#14b8a6]">.it</span>
      </h1>
      <p className="text-poll-grey-400 text-2xl">
        Engaging polls and real-time insights from your community
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
                width="32"
                height="32"
                viewBox="0 0 24 20"
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
            <h2 className="text-3xl font-semibold">Create New Poll</h2>
          </div>
          <PollForm />
        </div>
      </div>

      {/* Live Polls Section */}
      <div className="w-full lg:w-1/2 lg:sticky lg:top-20 self-start mb-8">
        <div className="h-[calc(50vh)] flex flex-col">
          <div className="flex items-center justify-between flex-shrink-0">
            
            
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