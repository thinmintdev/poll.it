import React from "react";
import {
  XMarkIcon as CloseIcon,
  ClipboardIcon,
  CheckIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import type { Poll } from "../types/admin"; // Ensure this path is correct

interface ShareModalProps {
  poll: Poll | null;
  isOpen: boolean;
  onClose: () => void;
  copiedLink: boolean;
  copiedEmbed: boolean;
  onCopyLink: () => void;
  onCopyEmbed: () => void;
  generateEmbedCode: (pollId: string) => string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  poll,
  isOpen,
  onClose,
  copiedLink,
  copiedEmbed,
  onCopyLink,
  onCopyEmbed,
  generateEmbedCode,
}) => {
  if (!isOpen || !poll) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-poll-grey-800 p-6 rounded-lg shadow-xl w-full max-w-md relative border border-poll-grey-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-poll-grey-400 hover:text-white transition-colors"
          aria-label="Close share modal"
        >
          <CloseIcon className="h-6 w-6" />
        </button>
        <h3 className="text-2xl font-semibold mb-6 text-white">Share Poll</h3>
        <p className="text-poll-grey-300 mb-1 truncate" title={poll.question}>{poll.question}</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="poll-link" className="block text-sm font-medium text-poll-grey-300 mb-1">Direct Link</label>
            <div className="flex items-center">
              <input
                id="poll-link"
                type="text"
                readOnly
                value={`${window.location.origin}/poll/${poll.id}`}
                className="flex-grow bg-poll-grey-900 border border-poll-grey-700 text-poll-grey-200 rounded-l-md p-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none"
              />
              <button
                onClick={onCopyLink}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-r-md text-sm font-medium transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-poll-grey-800"
                aria-label={copiedLink ? "Link copied" : "Copy link"}
              >
                {copiedLink ? <CheckIcon className="h-5 w-5" /> : <ClipboardIcon className="h-5 w-5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="embed-code" className="block text-sm font-medium text-poll-grey-300 mb-1">Embed Code</label>
            <div className="flex items-center">
              <textarea
                id="embed-code"
                readOnly
                value={generateEmbedCode(poll.id)}
                className="flex-grow bg-poll-grey-900 border border-poll-grey-700 text-poll-grey-200 rounded-l-md p-2.5 text-sm h-24 resize-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none no-scrollbar"
              />
              <button
                onClick={onCopyEmbed}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-r-md text-sm font-medium transition-colors flex items-center space-x-2 self-start focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-poll-grey-800"
                aria-label={copiedEmbed ? "Embed code copied" : "Copy embed code"}
              >
                {copiedEmbed ? <CheckIcon className="h-5 w-5" /> : <CodeBracketIcon className="h-5 w-5" />}
                <span>{copiedEmbed ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-poll-grey-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-poll-grey-700 hover:bg-poll-grey-600 text-poll-grey-200 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-poll-grey-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
