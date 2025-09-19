'use client'

import { useRef, useEffect, useMemo } from 'react';
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
import type { TooltipItem } from 'chart.js';
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
  /** Array of poll results with options, votes, and percentages, or null when results are hidden */
  results: {
    option: string;
    votes: number;
    percentage: number;
  }[] | null;
  /** Chart type - either doughnut (default) or bar chart */
  type?: 'doughnut' | 'bar';
}

/**
 * Chart.js type definitions for better TypeScript support
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartRef = any;

/**
 * Cotton candy color palette matching the progress bars
 */
const getCottonColors = () => {
  const colors = [
    {
      background: '#ff6b9d',
      border: '#e85a8a',
      name: 'cotton-pink'
    },
    {
      background: '#4facfe',
      border: '#3b8dd4',
      name: 'cotton-blue'
    },
    {
      background: '#9f7aea',
      border: '#8a67d1',
      name: 'cotton-purple'
    },
    {
      background: '#00f5a0',
      border: '#00d689',
      name: 'cotton-mint'
    },
    {
      background: '#ffa726',
      border: '#e6941f',
      name: 'cotton-peach'
    },
    {
      background: '#e879f9',
      border: '#d65fe6',
      name: 'cotton-lavender'
    },
    // Extended colors for polls with more than 6 options
    {
      background: '#ff6b6b',
      border: '#e85a5a',
      name: 'cotton-coral'
    },
    {
      background: '#4ecdc4',
      border: '#3bb4ab',
      name: 'cotton-teal'
    },
    {
      background: '#45b7d1',
      border: '#3ba2bd',
      name: 'cotton-sky'
    },
    {
      background: '#96ceb4',
      border: '#7fb89d',
      name: 'cotton-sage'
    },
  ]
  return colors
}

/**
 * PollChart Component
 *
 * Renders interactive charts for poll results using Chart.js.
 * Supports both doughnut and bar chart visualizations with
 * cotton candy theming matching the progress bars.
 *
 * Features:
 * - Responsive design that adapts to container size
 * - Cotton candy color scheme matching progress bars
 * - Interactive tooltips with vote counts and percentages
 * - Optimized re-rendering using React refs
 * - Support for up to 10 poll options with distinct colors
 * - Graceful handling of hidden results with appropriate messaging
 *
 * @param results - Array of poll results to visualize, or null when results are hidden
 * @param type - Chart type ('doughnut' or 'bar')
 * @returns JSX element containing the chart
 */
export default function PollChart({ results, type = 'doughnut' }: PollChartProps) {
  // Use ref to prevent unnecessary re-renders and maintain chart state
  const chartRef = useRef<ChartRef>(null);

  // Get cotton candy colors
  const cottonColors = getCottonColors();
  const backgroundColors = cottonColors.map(color => color.background);
  const borderColors = cottonColors.map(color => color.border);

  // Filter out any invalid results and ensure we have valid data
  const validResults = useMemo(() => {
    return results ? results.filter(result =>
      result &&
      typeof result.option === 'string' &&
      result.option.trim() !== '' &&
      typeof result.votes === 'number' &&
      !isNaN(result.votes)
    ) : [];
  }, [results]);

  // Force chart update when data changes for live updates
  useEffect(() => {
    if (chartRef.current && validResults.length > 0) {
      const chart = chartRef.current;
      if (chart.data) {
        chart.data.labels = validResults.map(result => result.option);
        chart.data.datasets[0].data = validResults.map(result => result.votes);
        chart.update('none'); // Update without animation for faster live updates
      }
    }
  }, [validResults]);

  // Handle null results when poll results are hidden
  if (results === null) {
    return (
      <div className={`${CHART_CONFIG.HEIGHT} w-full flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          <div className="mb-3">
            <svg
              className="w-12 h-12 mx-auto opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L18 2.5m-8.122 7.378a3 3 0 104.243 4.243M9.878 9.878L2.5 18"
              />
            </svg>
          </div>
          <p className="text-sm font-medium mb-1">Results Hidden</p>
          <p className="text-xs opacity-75">Poll results are currently not visible</p>
        </div>
      </div>
    );
  }

  // If no valid results, show empty state
  if (validResults.length === 0) {
    return (
      <div className={`${CHART_CONFIG.HEIGHT} w-full flex items-center justify-center`}>
        <div className="text-center text-app-muted">
          <p>No poll data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data with cotton candy theming
  const data = {
    labels: validResults.map(result => result.option),
    datasets: [
      {
        data: validResults.map(result => result.votes),
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: CHART_CONFIG.STYLING.borderWidth,
        // Additional styling for better visual appeal with cotton candy colors
        hoverBackgroundColor: backgroundColors.map(color => `${color}CC`), // Add 80% opacity
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
          label: function(context: TooltipItem<'doughnut'> | TooltipItem<'bar'>) {
            const label = context.label || '';
            const parsed = context.parsed as unknown;
            let value = 0;
            if (typeof parsed === 'number') {
              value = parsed;
            } else if (parsed && typeof parsed === 'object' && 'y' in parsed) {
              const yVal = (parsed as { y?: unknown }).y;
              if (typeof yVal === 'number') value = yVal;
            }
            // Safely coerce dataset values to numbers for summation
            const dataValues = (context.dataset.data as unknown[]).map(v => {
              if (typeof v === 'number') return v;
              if (Array.isArray(v) && typeof v[0] === 'number') return v[0];
              return 0;
            });
            const total = dataValues.reduce((acc: number, n: number) => acc + n, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} votes (${percentage}%)`;
          },
          // Add total votes in footer
          footer: function(tooltipItems: Array<TooltipItem<'doughnut'> | TooltipItem<'bar'>>) {
            if (!tooltipItems.length) return '';
            const raw = tooltipItems[0].dataset.data as unknown[];
            const total = raw.reduce((acc: number, v: unknown) => {
              if (typeof v === 'number') return acc + v;
              if (Array.isArray(v) && typeof v[0] === 'number') return acc + v[0];
              return acc;
            }, 0);
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
          aria-label={`Poll results doughnut chart showing ${validResults.length} options`}
          role="img"
        />
      ) : (
        <Bar 
          data={data} 
          options={options}
          // Accessibility attributes
          aria-label={`Poll results bar chart showing ${validResults.length} options`}
          role="img"
        />
      )}
    </div>
  );
}
