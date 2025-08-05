'use client'

import { useCallback } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const useAnalytics = () => {
  const trackEvent = useCallback(({ action, category, label, value }: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }, []);

  const trackPageView = useCallback((url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID || '', {
        page_location: url,
        page_title: title || document.title,
      });
    }
  }, []);

  const trackPollCreation = useCallback((pollType: string) => {
    trackEvent({
      action: 'create_poll',
      category: 'engagement',
      label: pollType,
    });
  }, [trackEvent]);

  const trackVote = useCallback((pollId: string) => {
    trackEvent({
      action: 'vote',
      category: 'engagement',
      label: pollId,
    });
  }, [trackEvent]);

  const trackShare = useCallback((method: string, pollId: string) => {
    trackEvent({
      action: 'share',
      category: 'social',
      label: `${method}_${pollId}`,
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackPollCreation,
    trackVote,
    trackShare,
  };
};

export default useAnalytics;
