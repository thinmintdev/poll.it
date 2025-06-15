import { useState, useCallback } from 'react';
import type { Poll } from '../types/admin'; // Assuming Poll type is defined here

export interface UseSharePollReturn {
  showShareModal: boolean;
  selectedPoll: Poll | null;
  copiedLink: boolean;
  copiedEmbed: boolean;
  handleShareClick: (poll: Poll) => void;
  handleCloseModal: () => void;
  handleCopyLink: () => void;
  handleCopyEmbed: () => void;
  generateEmbedCode: (pollId: string) => string;
}

export function useSharePoll(): UseSharePollReturn {
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  const handleShareClick = useCallback((poll: Poll) => {
    setSelectedPoll(poll);
    setShowShareModal(true);
    setCopiedLink(false);
    setCopiedEmbed(false);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowShareModal(false);
    setSelectedPoll(null);
  }, []);

  const handleCopyLink = useCallback(() => {
    if (selectedPoll && typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/poll/${selectedPoll.id}`);
      setCopiedLink(true);
      setCopiedEmbed(false);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [selectedPoll]);

  const generateEmbedCode = useCallback((pollId: string) => {
    if (typeof window !== 'undefined') {
      return `<iframe src="${window.location.origin}/poll/${pollId}?embed=true" width="100%" height="400px" frameborder="0"></iframe>`;
    }
    return '';
  }, []);

  const handleCopyEmbed = useCallback(() => {
    if (selectedPoll) {
      navigator.clipboard.writeText(generateEmbedCode(selectedPoll.id));
      setCopiedEmbed(true);
      setCopiedLink(false);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  }, [selectedPoll, generateEmbedCode]);

  return {
    showShareModal,
    selectedPoll,
    copiedLink,
    copiedEmbed,
    handleShareClick,
    handleCloseModal,
    handleCopyLink,
    handleCopyEmbed,
    generateEmbedCode,
  };
}
