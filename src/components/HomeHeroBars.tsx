'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BarData {
  id: number;
  height: number;
  color: string;
  animationDelay: number;
  targetHeight: number;
  glowIntensity: number;
}

const cottonCandyColors = [
  '#ff6b9d', '#4facfe', '#9f7aea', '#00f5a0', '#ffa726', '#e879f9',
  '#ff8a95', '#6bb6ff', '#b794f6', '#4ecdc4', '#ffb74d', '#f093fb'
];

const HomeHeroBars: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const [bars, setBars] = useState<BarData[]>([]);

  useEffect(() => {
    const numBars = 15; // Fewer bars to make them wider
    const initialBars: BarData[] = Array.from({ length: numBars }, (_, i) => ({
      id: i,
      height: Math.random() * 90 + 10, // More random height range
      color: cottonCandyColors[i % cottonCandyColors.length],
      animationDelay: i * 30,
      targetHeight: Math.random() * 90 + 10, // More random height range
      glowIntensity: Math.random() * 0.8 + 0.2
    }));
    setBars(initialBars);
  }, []);

  const drawBars = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const barWidth = width / bars.length * 1.5; // Wider bars (was 0.8)
    const maxBarHeight = height * 0.85;
    
    bars.forEach((bar, index) => {
      // Slower, more varied movement with different frequencies for each bar
      const personalFreq = 0.5 + (index % 7) * 0.1; // Personal frequency for each bar
      const eqMovement = Math.sin(time * 1.5 * personalFreq + index * 0.8) * 12; // Slower and more varied
      const bassMovement = Math.sin(time * 0.2 * personalFreq + index * 0.3) * 20; // Much slower bass
      const trebleMovement = Math.sin(time * 3 * personalFreq + index * 1.2) * 6; // Slower treble
      const pulseEffect = Math.sin(time * 1.2 * personalFreq + bar.glowIntensity * 10) * 8; // Slower pulse
      const randomVariation = Math.sin(time * 0.8 * personalFreq + index * 2.1) * 15; // Additional random variation
      
      const animatedHeight = (bar.targetHeight + eqMovement + bassMovement + trebleMovement + pulseEffect + randomVariation) * (maxBarHeight / 100);
      
      const x = (index * (width / bars.length)) + (width / bars.length * 0.05); // Less spacing for wider bars
      const y = height - animatedHeight;
      
      // Create multiple gradients for depth
      const mainGradient = ctx.createLinearGradient(x, y, x, height);
      mainGradient.addColorStop(0, bar.color);
      mainGradient.addColorStop(0.6, `${bar.color}88`);
      mainGradient.addColorStop(1, 'rgba(10, 10, 15, 0)');
      
      // Draw main bar
      ctx.fillStyle = mainGradient;
      ctx.fillRect(x, y, barWidth, animatedHeight);
      
      // Add glow effect
      const glowHeight = animatedHeight * (0.3 + bar.glowIntensity * 0.4);
      const glowGradient = ctx.createLinearGradient(x, y, x, y + glowHeight);
      glowGradient.addColorStop(0, `${bar.color}AA`);
      glowGradient.addColorStop(1, `${bar.color}00`);
      
      ctx.fillStyle = glowGradient;
      ctx.fillRect(x - 1, y, barWidth + 2, glowHeight);
    });
  }, [bars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
        const container = canvas.parentElement;
        if (container) {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;

    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBars(ctx, canvas.width, canvas.height, time);
      time += 0.015; // Much slower animation (was 0.03)
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    const interval = setInterval(() => {
      setBars(prevBars => 
        prevBars.map(bar => ({
          ...bar,
          targetHeight: Math.random() * 90 + 10, // More random height range
          glowIntensity: Math.random() * 0.8 + 0.2
        }))
      );
    }, 6000); // Even slower transitions (was 4000)

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(interval);
    };
  }, [drawBars]);

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-2xl border border-app/20 glass-card">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cotton-pink/5 via-transparent to-cotton-blue/5"></div>
      
      {/* Animated background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/6 w-3 h-3 bg-cotton-pink/40 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-cotton-blue/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-1/3 left-3/4 w-1.5 h-1.5 bg-cotton-purple/40 rounded-full animate-pulse"></div>
      </div>
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-40"
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
        <motion.h1 
          className="text-6xl md:text-7xl font-bold mb-8 leading-tight text-app-primary"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          Pulse of
          <br />
          <motion.span 
            className="text-gradient-primary inline-block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          >
            Opinion
          </motion.span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-app-secondary mb-12 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Capture what matters most with <span className="text-cotton-mint font-semibold">real-time polling</span> that&apos;s as beautiful as it is powerful.
          <br />Ask, engage, decide — <span className="text-cotton-peach font-semibold">instantly</span>.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/create" className="btn-primary group relative overflow-hidden inline-flex">
              <div className="absolute inset-0 bg-gradient-to-r from-cotton-pink/20 via-cotton-purple/20 to-cotton-blue/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create a Poll
            </Link>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link href="/#feed" className="btn-secondary group inline-flex">
              <svg className="w-5 h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3" />
              </svg>
              View Live Feed
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomeHeroBars;
