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
      if (!scrollingRef.current || !container) return;

      container.scrollTop += scrollSpeed;

      // Check if scrolled to the bottom and loop
      if (Math.ceil(container.scrollTop + container.clientHeight) >= container.scrollHeight) {
        // If the content is shorter than the container, don't try to loop.
        if (container.scrollHeight > container.clientHeight) {
            const overshoot = (container.scrollTop + container.clientHeight) - container.scrollHeight;
            container.scrollTop = Math.max(0, overshoot); // Ensure scrollTop is not negative
        } else {
            // Content is not scrollable, stop animation
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
                animationFrameIdRef.current = null;
            }
            return;
        }
      }
      animationFrameIdRef.current = requestAnimationFrame(scroll);
    };

    // Start scrolling only if content is taller than container
    if (container.scrollHeight > container.clientHeight) {
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

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      if (pauseOnHover && container) {
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [dependencies, isScrollInitialized, scrollSpeed, pauseOnHover, enabled]);

  return scrollContainerRef;
}

export default useAutoScroll;
