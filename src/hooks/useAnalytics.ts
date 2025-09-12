'use client'

import { useCallback } from 'react';
import { ANALYTICS_CONFIG } from '@/constants/config';

/**
 * Interface for analytics event data
 */
interface AnalyticsEvent {
  /** The action being tracked (e.g., 'click', 'submit') */
  action: string;
  /** The category of the event (e.g., 'engagement', 'social') */
  category: string;
  /** Optional label for additional context */
  label?: string;
  /** Optional numeric value associated with the event */
  value?: number;
}


/**
 * Custom hook for analytics tracking
 * 
 * Provides a convenient interface for tracking user interactions
 * with Google Analytics. Handles browser environment detection
 * and provides type-safe methods for common tracking scenarios.
 * 
 * Features:
 * - Type-safe event tracking
 * - Browser environment detection
 * - Predefined methods for common poll app events
 * - Graceful degradation when analytics is unavailable
 * 
 * @returns Object containing analytics tracking methods
 */
export const useAnalytics = () => {
  /**
   * Track a generic analytics event
   * 
   * @param event - Event data including action, category, label, and value
   */
  const trackEvent = useCallback(({ action, category, label, value }: AnalyticsEvent) => {
    // Only track events in browser environment when gtag is available
    if (typeof window !== 'undefined' && window.gtag) {
      try {
        window.gtag('event', action, {
          event_category: category,
          event_label: label,
          value: value,
          // Add timestamp for better data analysis
          custom_timestamp: Date.now(),
        });
        
        // Log in development for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Analytics event tracked:', { action, category, label, value });
        }
      } catch (error) {
        // Silently handle analytics errors to avoid breaking user experience
        console.warn('Failed to track analytics event:', error);
      }
    }
  }, []);

  /**
   * Track page views for navigation analytics
   * 
   * @param url - Page URL being viewed
   * @param title - Optional page title (defaults to document.title)
   */
  const trackPageView = useCallback((url: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      const trackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID;
      
      if (!trackingId) {
        console.warn('Google Analytics tracking ID not configured');
        return;
      }
      
      try {
        window.gtag('config', trackingId, {
          page_location: url,
          page_title: title || document.title,
          // Add additional context
          custom_timestamp: Date.now(),
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Page view tracked:', { url, title: title || document.title });
        }
      } catch (error) {
        console.warn('Failed to track page view:', error);
      }
    }
  }, []);

  /**
   * Track poll creation events
   * 
   * @param pollType - Type of poll created (e.g., 'single_choice', 'multiple_choice')
   */
  const trackPollCreation = useCallback((pollType: string) => {
    trackEvent({
      action: ANALYTICS_CONFIG.ACTIONS.CREATE_POLL,
      category: ANALYTICS_CONFIG.CATEGORIES.ENGAGEMENT,
      label: pollType,
      value: 1, // Count each poll creation as value 1
    });
  }, [trackEvent]);

  /**
   * Track voting events
   * 
   * @param pollId - ID of the poll being voted on
   */
  const trackVote = useCallback((pollId: string) => {
    trackEvent({
      action: ANALYTICS_CONFIG.ACTIONS.VOTE,
      category: ANALYTICS_CONFIG.CATEGORIES.ENGAGEMENT,
      label: pollId,
      value: 1, // Count each vote as value 1
    });
  }, [trackEvent]);

  /**
   * Track social sharing events
   * 
   * @param method - Sharing method (e.g., 'twitter', 'facebook', 'copy_link')
   * @param pollId - ID of the poll being shared
   */
  const trackShare = useCallback((method: string, pollId: string) => {
    trackEvent({
      action: ANALYTICS_CONFIG.ACTIONS.SHARE,
      category: ANALYTICS_CONFIG.CATEGORIES.SOCIAL,
      label: `${method}_${pollId}`,
      value: 1, // Count each share as value 1
    });
  }, [trackEvent]);
  
  /**
   * Track custom events with validation
   * 
   * @param eventData - Custom event data
   */
  const trackCustomEvent = useCallback((eventData: AnalyticsEvent) => {
    // Validate required fields
    if (!eventData.action || !eventData.category) {
      console.warn('Analytics event must have action and category');
      return;
    }
    
    trackEvent(eventData);
  }, [trackEvent]);

  // Return all tracking methods with consistent interface
  return {
    trackEvent,
    trackPageView,
    trackPollCreation,
    trackVote,
    trackShare,
    trackCustomEvent,
  };
};

// Export as default for convenient importing
export default useAnalytics;
