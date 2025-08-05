import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";
import './InfiniteScroll.css';

gsap.registerPlugin(Observer);

interface InfiniteScrollProps {
  width?: string;
  maxHeight?: string;
  negativeMargin?: string;
  items: Array<{ content: React.ReactNode; id?: string }>;
  itemMinHeight?: number;
  isTilted?: boolean;
  tiltDirection?: 'left' | 'right';
  autoplay?: boolean;
  autoplaySpeed?: number;
  autoplayDirection?: 'up' | 'down';
  pauseOnHover?: boolean;
}

export default function InfiniteScroll({
  width = "100%",
  maxHeight = "90%",
  negativeMargin = "0.5rem",
  items,
  itemMinHeight = 150,
  isTilted = false,
  tiltDirection = "left",
  autoplay = false,
  autoplaySpeed = 0.5,
  autoplayDirection = "down",
  pauseOnHover = false,
}: InfiniteScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create duplicated items for infinite scroll effect
  const duplicatedItems = items.length > 0 ? [...items, ...items, ...items] : [];

  const getTiltTransform = () => {
    if (!isTilted) return "none";
    return tiltDirection === "left"
      ? "rotateX(20deg) rotateZ(-20deg) skewX(20deg)"
      : "rotateX(20deg) rotateZ(20deg) skewX(-20deg)";
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (duplicatedItems.length === 0) return;

    const divItems = gsap.utils.toArray(container.children);
    if (!divItems.length) return;

    const firstItem = divItems[0] as HTMLElement;
    const itemStyle = getComputedStyle(firstItem);
    const itemHeight = firstItem.offsetHeight;
    const itemMarginTop = parseFloat(itemStyle.marginTop) || 0;
    const totalItemHeight = itemHeight + itemMarginTop;
    const totalHeight = (itemHeight * duplicatedItems.length) + (itemMarginTop * (duplicatedItems.length - 1));

    const wrapFn = gsap.utils.wrap(-totalHeight, totalHeight);

    divItems.forEach((child, i) => {
      const y = i * totalItemHeight;
      gsap.set(child as gsap.TweenTarget, { y });
    });

    const observer = Observer.create({
      target: container,
      type: "wheel,touch,pointer",
      preventDefault: true,
      onPress: (self: { target: Element }) => {
        (self.target as HTMLElement).style.cursor = "grabbing";
      },
      onRelease: (self: { target: Element }) => {
        (self.target as HTMLElement).style.cursor = "grab";
      },
      onChange: ({ deltaY, isDragging, event }: { deltaY: number, isDragging: boolean, event: Event }) => {
        const d = event.type === "wheel" ? -deltaY : deltaY;
        const distance = isDragging ? d * 5 : d * 10;
        divItems.forEach((child) => {
          gsap.to(child as gsap.TweenTarget, {
            duration: 0.5,
            ease: "expo.out",
            y: `+=${distance}`,
            modifiers: {
              y: gsap.utils.unitize(wrapFn)
            }
          });
        });
      }
    });

    let rafId: number;
    if (autoplay) {
      const directionFactor = autoplayDirection === "down" ? 1 : -1;
      const speedPerFrame = autoplaySpeed * directionFactor;

      const tick = () => {
        divItems.forEach((child) => {
          gsap.set(child as gsap.TweenTarget, {
            y: `+=${speedPerFrame}`,
            modifiers: {
              y: gsap.utils.unitize(wrapFn)
            }
          });
        });
        rafId = requestAnimationFrame(tick);
      };

      rafId = requestAnimationFrame(tick);

      if (pauseOnHover) {
        const stopTicker = () => {
          if (rafId) cancelAnimationFrame(rafId);
        };
        const startTicker = () => (rafId = requestAnimationFrame(tick));

        container.addEventListener("mouseenter", stopTicker);
        container.addEventListener("mouseleave", startTicker);

        return () => {
          observer.kill();
          stopTicker();
          container.removeEventListener("mouseenter", stopTicker);
          container.removeEventListener("mouseleave", startTicker);
        };
      } else {
        return () => {
          observer.kill();
          if (rafId) cancelAnimationFrame(rafId);
        };
      }
    }

    return () => {
      observer.kill();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    duplicatedItems.length,
    autoplay,
    autoplaySpeed,
    autoplayDirection,
    pauseOnHover,
    isTilted,
    tiltDirection,
    negativeMargin
  ]);

  return (
    <div className="relative infinite-scroll-wrapper" ref={wrapperRef} style={{ maxHeight }}>
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-app-card to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-app-card to-transparent z-10 pointer-events-none" />
      <style>
        {`
        .infinite-scroll-container {
          width: ${width};
          padding: 6rem 0;
        }

        .infinite-scroll-item {
          min-height: ${itemMinHeight}px;
          margin-bottom: -18.8rem;
        }
        `}
      </style>

      <div
        className="infinite-scroll-container"
        ref={containerRef}
        style={{
          transform: getTiltTransform(),
        }}
      >
        {duplicatedItems.map((item, index) => (
          <div 
            key={item.id ? `${item.id}-${index}` : index} 
            className="infinite-scroll-item"
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
