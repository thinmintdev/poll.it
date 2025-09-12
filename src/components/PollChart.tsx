'use client'

import { useRef } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { CHART_CONFIG } from '@/constants/config';

// Register Chart.js components globally to avoid re-registration
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
);

/**
 * Props interface for the PollChart component
 */
interface PollChartProps {
  /** Array of poll results with options, votes, and percentages */
  results: {
    option: string;
    votes: number;
    percentage: number;
  }[];
  /** Chart type - either doughnut (default) or bar chart */
  type?: 'doughnut' | 'bar';
}

/**
 * Chart.js type definitions for better TypeScript support
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartRef = any;

/**
 * PollChart Component
 * 
 * Renders interactive charts for poll results using Chart.js.
 * Supports both doughnut and bar chart visualizations with
 * consistent theming and responsive design.
 * 
 * Features:
 * - Responsive design that adapts to container size
 * - Accessible color scheme with high contrast
 * - Interactive tooltips with vote counts and percentages
 * - Optimized re-rendering using React refs
 * - Support for up to 10 poll options with distinct colors
 * 
 * @param results - Array of poll results to visualize
 * @param type - Chart type ('doughnut' or 'bar')
 * @returns JSX element containing the chart
 */
export default function PollChart({ results, type = 'doughnut' }: PollChartProps) {
  // Use ref to prevent unnecessary re-renders and maintain chart state
  const chartRef = useRef<ChartRef>(null);

  // Prepare chart data with consistent theming
  const data = {
    labels: results.map(result => result.option),
    datasets: [
      {
        data: results.map(result => result.votes),
        backgroundColor: CHART_CONFIG.BACKGROUND_COLORS,
        borderColor: CHART_CONFIG.BORDER_COLORS,
        borderWidth: CHART_CONFIG.STYLING.borderWidth,
        // Additional styling for better visual appeal
        hoverBackgroundColor: CHART_CONFIG.BACKGROUND_COLORS.map(color => `${color}CC`), // Add 80% opacity
        hoverBorderWidth: CHART_CONFIG.STYLING.borderWidth + 1,
      },
    ],
  };

  // Chart configuration with accessibility and theming
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Accessibility improvements
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: CHART_CONFIG.STYLING.legendPadding,
          boxWidth: CHART_CONFIG.STYLING.legendBoxSize,
          boxHeight: CHART_CONFIG.STYLING.legendBoxSize,
          usePointStyle: true, // Use circles instead of squares for better aesthetics
          font: {
            size: CHART_CONFIG.STYLING.fontSize,
          },
          color: CHART_CONFIG.STYLING.textColor,
        },
      },
      tooltip: {
        // Enhanced tooltip with better formatting
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: CHART_CONFIG.STYLING.textColor,
        bodyColor: CHART_CONFIG.STYLING.textColor,
        borderColor: CHART_CONFIG.STYLING.textColor,
        borderWidth: 1,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            const label = context.label || '';
            const value = type === 'bar' ? (context.parsed?.y || context.parsed) : context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} votes (${percentage}%)`;
          },
          // Add total votes in footer
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          footer: function(tooltipItems: any[]) {
            const total = tooltipItems[0]?.dataset.data.reduce((a: number, b: number) => a + b, 0) || 0;
            return `Total votes: ${total}`;
          },
        },
      },
    },
    // Bar chart specific configuration
    ...(type === 'bar' && {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: CHART_CONFIG.STYLING.textColor,
            stepSize: 1, // Ensure integer steps for vote counts
            callback: function(value: string | number) {
              // Format large numbers with commas
              return new Intl.NumberFormat().format(Number(value));
            },
          },
          grid: {
            color: CHART_CONFIG.STYLING.gridColor,
          },
          title: {
            display: true,
            text: 'Number of Votes',
            color: CHART_CONFIG.STYLING.textColor,
          },
        },
        x: {
          ticks: {
            color: CHART_CONFIG.STYLING.textColor,
            maxRotation: 45, // Rotate labels if they're too long
          },
          grid: {
            color: CHART_CONFIG.STYLING.gridColor,
          },
        },
      },
    }),
    // Performance optimizations
    animation: {
      duration: 1000, // Smooth animation for better UX
    },
    interaction: {
      intersect: false, // Highlight nearest point
      mode: 'index' as const,
    },
  };

  return (
    <div className={`${CHART_CONFIG.HEIGHT} w-full`}>
      {type === 'doughnut' ? (
        <Doughnut 
          ref={chartRef} 
          data={data} 
          options={options}
          // Accessibility attributes
          aria-label={`Poll results doughnut chart showing ${results.length} options`}
          role="img"
        />
      ) : (
        <Bar 
          data={data} 
          options={options}
          // Accessibility attributes
          aria-label={`Poll results bar chart showing ${results.length} options`}
          role="img"
        />
      )}
    </div>
  );
}
