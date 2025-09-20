'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

/**
 * Advanced analytics tracking hook with privacy-conscious data collection
 * Extends the basic analytics system with detailed behavioral tracking
 */

interface AdvancedAnalyticsOptions {
  pollId: string;
  trackScrollDepth?: boolean;
  trackTimeOnPage?: boolean;
  trackHover?: boolean;
  trackClicks?: boolean;
}

interface ScrollDepthTracker {
  depths: Set<number>;
  maxDepth: number;
}

interface TimeTracker {
  startTime: number;
  activeTime: number;
  isActive: boolean;
  lastActiveTime: number;
}

interface HoverTracker {
  optionHovers: Map<number, number>; // option index -> hover duration
  currentHover?: {
    optionIndex: number;
    startTime: number;
  };
}

interface ClickTracker {
  clicks: Array<{
    optionIndex: number;
    timestamp: number;
    timeFromPageLoad: number;
  }>;
}

export const useAdvancedAnalytics = (options: AdvancedAnalyticsOptions) => {
  const { pollId, trackScrollDepth = true, trackTimeOnPage = true, trackHover = true, trackClicks = true } = options;

  // Session tracking
  const [sessionId] = useState(() => uuidv4());
  const [pageLoadTime] = useState(() => Date.now());

  // Tracking states
  const scrollTracker = useRef<ScrollDepthTracker>({ depths: new Set(), maxDepth: 0 });
  const timeTracker = useRef<TimeTracker>({
    startTime: Date.now(),
    activeTime: 0,
    isActive: true,
    lastActiveTime: Date.now()
  });
  const hoverTracker = useRef<HoverTracker>({ optionHovers: new Map() });
  const clickTracker = useRef<ClickTracker>({ clicks: [] });

  // Refs for event listeners
  const isUnloading = useRef(false);
  const lastScrollDepth = useRef(0);

  /**
   * Track page view with initial session data
   */
  const trackPageView = useCallback(async () => {
    try {
      const utmParams = new URLSearchParams(window.location.search);
      const referrer = document.referrer;

      await fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          sessionId,
          referrer,
          utmParams: {
            source: utmParams.get('utm_source'),
            medium: utmParams.get('utm_medium'),
            campaign: utmParams.get('utm_campaign')
          }
        })
      });
    } catch (error) {
      console.warn('Failed to track page view:', error);
    }
  }, [pollId, sessionId]);

  /**
   * Track vote event with behavioral context
   */
  const trackVote = useCallback(async (
    optionIndex: number,
    voteId: string,
    isFirstVoteInSession: boolean = true
  ) => {
    try {
      const timeToVote = Date.now() - timeTracker.current.startTime;
      const previousOptionsViewed = Array.from(hoverTracker.current.optionHovers.keys());

      await fetch('/api/analytics/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          voteId,
          optionIndex,
          sessionId,
          timeToVote,
          previousOptionsViewed,
          isFirstVoteInSession
        })
      });

      // Track click event if enabled
      if (trackClicks) {
        clickTracker.current.clicks.push({
          optionIndex,
          timestamp: Date.now(),
          timeFromPageLoad: Date.now() - pageLoadTime
        });
      }
    } catch (error) {
      console.warn('Failed to track vote:', error);
    }
  }, [pollId, sessionId, pageLoadTime, trackClicks]);

  /**
   * Track share event
   */
  const trackShare = useCallback(async (
    platform: string,
    shareMethod: 'button_click' | 'url_copy' | 'native_share',
    sharedUrl?: string
  ) => {
    try {
      await fetch('/api/analytics/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          sessionId,
          platform,
          shareMethod,
          sharedUrl
        })
      });
    } catch (error) {
      console.warn('Failed to track share:', error);
    }
  }, [pollId, sessionId]);

  /**
   * Track option hover for engagement analysis
   */
  const trackOptionHover = useCallback((optionIndex: number, isHovering: boolean) => {
    if (!trackHover) return;

    const now = Date.now();
    const tracker = hoverTracker.current;

    if (isHovering) {
      // Start hover tracking
      tracker.currentHover = {
        optionIndex,
        startTime: now
      };
    } else if (tracker.currentHover && tracker.currentHover.optionIndex === optionIndex) {
      // End hover tracking
      const hoverDuration = now - tracker.currentHover.startTime;
      const existingDuration = tracker.optionHovers.get(optionIndex) || 0;
      tracker.optionHovers.set(optionIndex, existingDuration + hoverDuration);
      tracker.currentHover = undefined;
    }
  }, [trackHover]);

  /**
   * Send final analytics data before page unload
   */
  const sendBeaconData = useCallback(() => {
    if (isUnloading.current) return;
    isUnloading.current = true;

    const finalData = {
      pollId,
      sessionId,
      timeOnPage: timeTracker.current.activeTime + (
        timeTracker.current.isActive
          ? Date.now() - timeTracker.current.lastActiveTime
          : 0
      ),
      scrollDepth: scrollTracker.current.maxDepth,
      optionHovers: Object.fromEntries(hoverTracker.current.optionHovers),
      clicks: clickTracker.current.clicks
    };

    // Use sendBeacon for reliable data transmission during page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/session-end', JSON.stringify(finalData));
    } else {
      // Fallback for browsers without sendBeacon
      fetch('/api/analytics/session-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
        keepalive: true
      }).catch(() => {
        // Ignore errors during page unload
      });
    }
  }, [pollId, sessionId]);

  /**
   * Handle scroll depth tracking
   */
  const handleScroll = useCallback(() => {
    if (!trackScrollDepth) return;

    const scrollTop = window.pageYOffset;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = Math.round((scrollTop / documentHeight) * 100);

    if (scrollPercent > lastScrollDepth.current) {
      lastScrollDepth.current = scrollPercent;
      scrollTracker.current.maxDepth = Math.max(scrollTracker.current.maxDepth, scrollPercent);

      // Track milestone scroll depths
      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !scrollTracker.current.depths.has(milestone)) {
          scrollTracker.current.depths.add(milestone);
        }
      });
    }
  }, [trackScrollDepth]);

  /**
   * Handle page visibility changes for accurate time tracking
   */
  const handleVisibilityChange = useCallback(() => {
    if (!trackTimeOnPage) return;

    const now = Date.now();
    const tracker = timeTracker.current;

    if (document.hidden) {
      // Page became hidden
      if (tracker.isActive) {
        tracker.activeTime += now - tracker.lastActiveTime;
        tracker.isActive = false;
      }
    } else {
      // Page became visible
      if (!tracker.isActive) {
        tracker.lastActiveTime = now;
        tracker.isActive = true;
      }
    }
  }, [trackTimeOnPage]);

  /**
   * Handle mouse/keyboard activity for accurate engagement tracking
   */
  const handleUserActivity = useCallback(() => {
    if (!trackTimeOnPage) return;

    const now = Date.now();
    const tracker = timeTracker.current;

    if (!tracker.isActive) {
      tracker.lastActiveTime = now;
      tracker.isActive = true;
    } else {
      // Reset activity timer
      tracker.lastActiveTime = now;
    }
  }, [trackTimeOnPage]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    // Track initial page view
    trackPageView();

    // Scroll tracking
    if (trackScrollDepth) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // Time tracking
    if (trackTimeOnPage) {
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Activity tracking
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity, { passive: true });
      });

      // Inactivity timer (30 seconds)
      const inactivityTimer = setInterval(() => {
        const now = Date.now();
        const tracker = timeTracker.current;

        if (tracker.isActive && now - tracker.lastActiveTime > 30000) {
          tracker.activeTime += 30000; // Add the active time before going inactive
          tracker.isActive = false;
        }
      }, 30000);

      return () => {
        clearInterval(inactivityTimer);
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity);
        });
      };
    }

    // Cleanup function
    return () => {
      if (trackScrollDepth) {
        window.removeEventListener('scroll', handleScroll);
      }
      if (trackTimeOnPage) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [trackPageView, handleScroll, handleVisibilityChange, handleUserActivity, trackScrollDepth, trackTimeOnPage]);

  /**
   * Setup page unload tracking
   */
  useEffect(() => {
    // Track data before page unload
    const handleBeforeUnload = () => {
      sendBeaconData();
    };

    const handlePageHide = () => {
      sendBeaconData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);

      // Send final data on unmount
      sendBeaconData();
    };
  }, [sendBeaconData]);

  /**
   * Get current session analytics
   */
  const getSessionAnalytics = useCallback(() => {
    const now = Date.now();
    const tracker = timeTracker.current;

    return {
      sessionId,
      timeOnPage: tracker.activeTime + (
        tracker.isActive ? now - tracker.lastActiveTime : 0
      ),
      maxScrollDepth: scrollTracker.current.maxDepth,
      optionHovers: Object.fromEntries(hoverTracker.current.optionHovers),
      clickCount: clickTracker.current.clicks.length,
      isActive: tracker.isActive
    };
  }, [sessionId]);

  return {
    sessionId,
    trackVote,
    trackShare,
    trackOptionHover,
    getSessionAnalytics,
    // Expose raw trackers for advanced use cases
    scrollTracker: scrollTracker.current,
    timeTracker: timeTracker.current,
    hoverTracker: hoverTracker.current,
    clickTracker: clickTracker.current
  };
};

export default useAdvancedAnalytics;