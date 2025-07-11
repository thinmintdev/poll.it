import { useRef, useEffect, useState, RefObject } from 'react';

interface UseAutoScrollOptions {
  scrollSpeed?: number;
  pauseOnHover?: boolean;
  enabled?: boolean;
}

function useAutoScroll<T extends HTMLElement>(
  dependencies: any[],
  options: UseAutoScrollOptions = {}
): RefObject<T> {
  const { scrollSpeed = 0.5, pauseOnHover = true, enabled = true } = options;
  const scrollContainerRef = useRef<T>(null);
  const [isScrollInitialized, setIsScrollInitialized] = useState(false);
  const animationFrameIdRef = useRef<number | null>(null);
  const scrollingRef = useRef(true);
  const lastScrollTopRef = useRef(0);
  const isManualScrollingRef = useRef(false);
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current && !isScrollInitialized) {
      setIsScrollInitialized(true);
    }
  }, [isScrollInitialized]);

  useEffect(() => {
    if (!enabled || !isScrollInitialized || !scrollContainerRef.current || dependencies.length === 0) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    const container = scrollContainerRef.current;
    // Reset scroll position to the top if dependencies change significantly (e.g., new items loaded)
    // This is a simple heuristic; you might need a more sophisticated check
    if (container.scrollTop > 0 && dependencies.some(dep => typeof dep === 'number' && dep > 3)) {
        // container.scrollTop = 0; // Optional: Reset scroll on new data
    }


    const scroll = () => {
      if (!scrollingRef.current || !container || isManualScrollingRef.current) return;

      container.scrollTop += scrollSpeed;
      lastScrollTopRef.current = container.scrollTop;

      // For infinite scroll with 5x duplicated content: [...items, ...items, ...items, ...items, ...items]
      // Reset when we reach the end of the 3rd set (before the 4th set)
      const totalHeight = container.scrollHeight;
      const singleContentHeight = totalHeight / 5; // Height of one set of items
      
      // When we reach the end of the 3rd set, jump back to the beginning of the 2nd set
      // This creates a buffer zone and truly seamless infinite scrolling
      if (container.scrollTop >= singleContentHeight * 3 - 20) { // Larger buffer
        container.scrollTop = singleContentHeight; // Jump to start of 2nd set
        lastScrollTopRef.current = singleContentHeight;
        if (process.env.NODE_ENV === 'development') {
          console.log('Infinite scroll reset - jumped from 3rd set back to 2nd set');
        }
      }
      
      animationFrameIdRef.current = requestAnimationFrame(scroll);
    };

    // Start scrolling only if content is taller than container
    if (container.scrollHeight > container.clientHeight) {
        // For 5x duplicated content, start from the 2nd set to allow seamless infinite scroll
        const singleContentHeight = container.scrollHeight / 5;
        if (container.scrollTop < singleContentHeight && dependencies.some(dep => typeof dep === 'number' && dep > 0)) {
          container.scrollTop = singleContentHeight; // Start from 2nd set
          lastScrollTopRef.current = singleContentHeight; // Initialize tracking
          if (process.env.NODE_ENV === 'development') {
            console.log('Initialized scroll position to 2nd set:', singleContentHeight);
          }
        }
        
        scrollingRef.current = true;
        if (!animationFrameIdRef.current) {
            animationFrameIdRef.current = requestAnimationFrame(scroll);
        }
    } else {
        // Content is not scrollable, ensure scrolling is stopped
        scrollingRef.current = false;
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
    }
    

    const handleMouseEnter = () => {
      if (!pauseOnHover) return;
      scrollingRef.current = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };

    const handleMouseLeave = () => {
      if (!pauseOnHover) return;
      // Restart scrolling only if content is scrollable
      if (container.scrollHeight > container.clientHeight) {
        scrollingRef.current = true;
        if (!animationFrameIdRef.current) {
          animationFrameIdRef.current = requestAnimationFrame(scroll);
        }
      }
    };

    if (pauseOnHover) {
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Add manual scroll detection
    const handleManualScroll = () => {
      if (!container) return;
      
      const currentScrollTop = container.scrollTop;
      const scrollDiff = Math.abs(currentScrollTop - lastScrollTopRef.current);
      
      // Handle infinite scroll reset for manual scrolling too
      const totalHeight = container.scrollHeight;
      const singleContentHeight = totalHeight / 5;
      
      // If manually scrolled to boundaries, reset position
      if (currentScrollTop >= singleContentHeight * 4 - 50) {
        // Near the end, jump to 2nd set
        container.scrollTop = singleContentHeight;
        lastScrollTopRef.current = singleContentHeight;
        if (process.env.NODE_ENV === 'development') {
          console.log('Manual scroll reset - jumped from near end to 2nd set');
        }
        return;
      } else if (currentScrollTop <= 50) {
        // Near the beginning, jump to 3rd set
        container.scrollTop = singleContentHeight * 2;
        lastScrollTopRef.current = singleContentHeight * 2;
        if (process.env.NODE_ENV === 'development') {
          console.log('Manual scroll reset - jumped from near beginning to 3rd set');
        }
        return;
      }
      
      // If scroll position changed significantly and we didn't cause it, it's manual
      if (scrollDiff > 10 && !isManualScrollingRef.current) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Manual scroll detected, pausing auto-scroll');
        }
        isManualScrollingRef.current = true;
        
        // Clear existing timeout
        if (manualScrollTimeoutRef.current) {
          clearTimeout(manualScrollTimeoutRef.current);
        }
        
        // Resume auto-scroll after user stops scrolling
        manualScrollTimeoutRef.current = setTimeout(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Resuming auto-scroll after manual scroll pause');
          }
          isManualScrollingRef.current = false;
          lastScrollTopRef.current = container.scrollTop;
          if (!animationFrameIdRef.current && scrollingRef.current) {
            animationFrameIdRef.current = requestAnimationFrame(scroll);
          }
        }, 2000); // Resume after 2 seconds of no manual scrolling
      }
      
      // Update last scroll position for manual scroll detection
      if (isManualScrollingRef.current) {
        lastScrollTopRef.current = currentScrollTop;
      }
    };
    
    container.addEventListener('scroll', handleManualScroll, { passive: true });

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
      if (pauseOnHover && container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (container) {
        container.removeEventListener('scroll', handleManualScroll);
      }
    };
  }, [dependencies, isScrollInitialized, scrollSpeed, pauseOnHover, enabled]);

  return scrollContainerRef;
}

export default useAutoScroll;
