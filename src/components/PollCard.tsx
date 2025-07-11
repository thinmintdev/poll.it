import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { PollData, ChoiceWithStats } from '../hooks/useRecentPolls';
import { useSharePoll } from '../hooks/useSharePoll';
import {
  ShareIcon,
  ChartBarIcon,
  LinkIcon,
  CodeBracketIcon,
  CheckIcon, // For copy feedback
} from '@heroicons/react/24/outline';
import { Calendar1Icon } from 'lucide-react';

interface PollCardProps {
  poll: PollData;
  voteStats: ChoiceWithStats[];
  totalVotes: number;
  onOpenShareModal: (e: React.MouseEvent, poll: PollData) => void;
}

const PollCard: React.FC<PollCardProps> = React.memo(({ poll, voteStats, totalVotes, onOpenShareModal }) => {
  const router = useRouter();
  const {
    copiedLinkPollId,
    copiedEmbedPollId,
    handleCopyLink,
    handleCopyEmbed,
    shareOnTwitter,
    shareOnFacebook,
    shareOnLinkedIn,
  } = useSharePoll();

  const handleVoteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/poll/${poll.id}`);
  }, [poll.id, router]);

  const handleCopyLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleCopyLink(poll);
  }, [poll, handleCopyLink]);

  const handleCopyEmbedClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    handleCopyEmbed(poll);
  }, [poll, handleCopyEmbed]);

  const handleTwitterClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    shareOnTwitter(poll);
  }, [poll, shareOnTwitter]);

  const handleFacebookClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    shareOnFacebook(poll);
  }, [poll, shareOnFacebook]);

  const handleLinkedInClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    shareOnLinkedIn(poll);
  }, [poll, shareOnLinkedIn]);

  return (
    <div
      className="bg-[#202734] p-4 rounded-lg border border-[#3A4455] shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-teal-500/70 flex flex-col"
    >
      <div className="flex justify-between items-start mb-2">
        <Link href={`/poll/${poll.id}`} passHref legacyBehavior>
          <a className="text-md font-semibold text-gray-100 flex-grow mr-3 break-words cursor-pointer hover:text-teal-400 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500/50 rounded-sm">
            {poll.question}
          </a>
        </Link>
      </div>

      <div className="flex items-center space-x-2 text-[10px] text-gray-400 mb-3">
        {poll.category?.name && (
            <span className="px-2 py-0.5 bg-teal-500 text-white rounded-full font-semibold text-[10px]">
                LIVE
            </span>
        )}
        <span>{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</span>
        <span>&bull;</span>
        <span><Calendar1Icon ></Calendar1Icon>{new Date(poll.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      
      <div className="space-y-2 mb-4 flex-grow">
        {voteStats.map((choice) => (
          <div key={choice.id} className="text-sm">
            <div className="flex justify-between text-gray-200 mb-1">
              <span className="truncate max-w-[calc(100%-4rem)]">{choice.text}</span>
              <span className="font-medium text-gray-300">{choice.percentage}%</span>
            </div>
            <div className="h-2 bg-[#3A4455] rounded-full overflow-hidden">
              <div 
                className="h-full bg-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${choice.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-[#3A4455]/70 flex justify-between items-center">
        <div className="flex items-center space-x-1 text-gray-400">
          <button onClick={handleCopyEmbedClick} className="p-1.5 rounded-full hover:bg-[#3A4455]/80 hover:text-teal-400 transition-colors" aria-label="Copy embed code">
            {copiedEmbedPollId === poll.id ? <CheckIcon className="w-4 h-4 text-teal-500" /> : <CodeBracketIcon className="w-4 h-4" />}
          </button>
          <button onClick={handleCopyLinkClick} className="p-1.5 rounded-full hover:bg-[#3A4455]/80 hover:text-teal-400 transition-colors" aria-label="Copy link">
            {copiedLinkPollId === poll.id ? <CheckIcon className="w-4 h-4 text-teal-500" /> : <LinkIcon className="w-4 h-4" />}
          </button>
          <button onClick={handleTwitterClick} className="p-1.5 rounded-full hover:bg-[#3A4455]/80 hover:text-sky-500 transition-colors" aria-label="Share on Twitter">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
          </button>
          <button onClick={handleFacebookClick} className="p-1.5 rounded-full hover:bg-[#3A4455]/80 hover:text-blue-600 transition-colors" aria-label="Share on Facebook">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
          </button>
          <button onClick={handleLinkedInClick} className="p-1.5 rounded-full hover:bg-[#3A4455]/80 hover:text-sky-700 transition-colors" aria-label="Share on LinkedIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
          </button>
          <button 
            onClick={(e) => onOpenShareModal(e, poll)}
            className="p-1.5 rounded-full hover:bg-[#3A4455]/80 transition-colors text-gray-400 hover:text-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            aria-label="Open share options"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
        </div>
        
        <button
          className="px-3 py-1.5 rounded-md bg-[#3A4455] text-white text-xs font-semibold hover:bg-[#4A5568] transition-all duration-200 ease-in-out flex items-center justify-center gap-1.5 transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50"
          onClick={handleVoteClick}
          aria-label={`Vote on poll: ${poll.question}`}
        >
          <ChartBarIcon className="w-3.5 h-3.5" />
          Vote Now
        </button>
      </div>
    </div>
  );
});

PollCard.displayName = 'PollCard';

export default PollCard;
