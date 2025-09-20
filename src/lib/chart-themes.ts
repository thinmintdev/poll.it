// Chart theme configuration for cotton-candy design system
import type { ChartTheme, ChartOptions } from '@/types/analytics';

// Cotton candy color palette for charts
export const COTTON_CANDY_COLORS = {
  primary: [
    '#ff6b9d', // Cotton candy pink
    '#4facfe', // Cotton candy blue
    '#9f7aea', // Cotton candy purple
    '#00f5a0', // Cotton candy mint
    '#ffa726', // Cotton candy peach
    '#e879f9', // Cotton candy lavender
    '#36d1dc', // Cyan
    '#fd79a8', // Rose
    '#fdcb6e', // Yellow
    '#6c5ce7', // Purple
  ],
  secondary: [
    '#ff85b3', // Lighter pink
    '#6bb6ff', // Lighter blue
    '#b39dea', // Lighter purple
    '#33f5a0', // Lighter mint
    '#ffb74d', // Lighter peach
    '#ea96f9', // Lighter lavender
    '#54d3dc', // Lighter cyan
    '#fd8fb0', // Lighter rose
    '#fdd085', // Lighter yellow
    '#7d6ce7', // Lighter purple
  ],
  gradients: [
    'linear-gradient(135deg, #ff6b9d 0%, #4facfe 100%)',
    'linear-gradient(135deg, #9f7aea 0%, #e879f9 100%)',
    'linear-gradient(135deg, #00f5a0 0%, #4facfe 100%)',
    'linear-gradient(135deg, #ffa726 0%, #ff6b9d 100%)',
    'linear-gradient(135deg, #36d1dc 0%, #6c5ce7 100%)',
  ],
};

// Chart themes
export const CHART_THEMES: Record<string, ChartTheme> = {
  'cotton-candy': {
    primary: COTTON_CANDY_COLORS.primary,
    secondary: COTTON_CANDY_COLORS.secondary,
    background: '#0a0a0f',
    text: '#ffffff',
    grid: '#2d2d44',
    border: '#3a3a52',
  },
  dark: {
    primary: ['#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'],
    secondary: ['#4b5563', '#7c8594', '#a1a8b3', '#d6dae0', '#eaeef2'],
    background: '#111827',
    text: '#f9fafb',
    grid: '#374151',
    border: '#4b5563',
  },
  light: {
    primary: ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b'],
    secondary: ['#60a5fa', '#a78bfa', '#f87171', '#34d399', '#fbbf24'],
    background: '#ffffff',
    text: '#111827',
    grid: '#e5e7eb',
    border: '#d1d5db',
  },
};

// Default chart options with cotton-candy theme
export const DEFAULT_CHART_OPTIONS: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  theme: 'cotton-candy',
  animations: true,
  legend: {
    display: true,
    position: 'bottom',
  },
  tooltip: {
    enabled: true,
    format: 'both',
  },
};

// Chart.js configuration generators
export const createChartConfig = (
  type: 'doughnut' | 'line' | 'bar' | 'pie',
  theme: string = 'cotton-candy',
  options: Partial<ChartOptions> = {}
) => {
  const selectedTheme = CHART_THEMES[theme] || CHART_THEMES['cotton-candy'];
  const mergedOptions = { ...DEFAULT_CHART_OPTIONS, ...options };

  const baseConfig = {
    responsive: mergedOptions.responsive,
    maintainAspectRatio: mergedOptions.maintainAspectRatio,
    plugins: {
      legend: {
        display: mergedOptions.legend.display,
        position: mergedOptions.legend.position,
        labels: {
          color: selectedTheme.text,
          font: {
            family: 'Poppins, system-ui, sans-serif',
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        enabled: mergedOptions.tooltip.enabled,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: selectedTheme.text,
        bodyColor: selectedTheme.text,
        borderColor: selectedTheme.border,
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || context.raw;
            const dataset = context.dataset;

            if (mergedOptions.tooltip.format === 'percentage') {
              const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${percentage}%`;
            } else if (mergedOptions.tooltip.format === 'value') {
              return `${label}: ${value.toLocaleString()}`;
            } else {
              const total = dataset.data.reduce((sum: number, val: number) => sum + val, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          },
        },
      },
    },
    animation: mergedOptions.animations ? {
      duration: 800,
      easing: 'easeInOutCubic',
    } : false,
  };

  // Type-specific configurations
  if (type === 'line') {
    return {
      ...baseConfig,
      scales: {
        x: {
          grid: {
            color: selectedTheme.grid,
            lineWidth: 1,
          },
          ticks: {
            color: selectedTheme.text,
            font: {
              family: 'Poppins, system-ui, sans-serif',
            },
          },
        },
        y: {
          grid: {
            color: selectedTheme.grid,
            lineWidth: 1,
          },
          ticks: {
            color: selectedTheme.text,
            font: {
              family: 'Poppins, system-ui, sans-serif',
            },
          },
        },
      },
      elements: {
        line: {
          tension: 0.4,
          borderWidth: 3,
        },
        point: {
          radius: 4,
          hoverRadius: 6,
          borderWidth: 2,
        },
      },
    };
  }

  if (type === 'bar') {
    return {
      ...baseConfig,
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: selectedTheme.text,
            font: {
              family: 'Poppins, system-ui, sans-serif',
            },
          },
        },
        y: {
          grid: {
            color: selectedTheme.grid,
            lineWidth: 1,
          },
          ticks: {
            color: selectedTheme.text,
            font: {
              family: 'Poppins, system-ui, sans-serif',
            },
          },
        },
      },
      elements: {
        bar: {
          borderRadius: 4,
          borderSkipped: false,
        },
      },
    };
  }

  // Doughnut and pie charts
  return {
    ...baseConfig,
    cutout: type === 'doughnut' ? '60%' : '0%',
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: selectedTheme.background,
        hoverBorderWidth: 3,
      },
    },
  };
};

// Utility function to get colors for a dataset
export const getChartColors = (
  count: number,
  theme: string = 'cotton-candy',
  type: 'primary' | 'secondary' = 'primary'
): string[] => {
  const selectedTheme = CHART_THEMES[theme] || CHART_THEMES['cotton-candy'];
  const colors = selectedTheme[type];

  // If we need more colors than available, repeat the palette
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }

  return result;
};

// Generate gradient colors for enhanced visuals
export const getGradientColors = (
  ctx: CanvasRenderingContext2D,
  chartArea: any,
  colorStops: string[]
) => {
  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );

  colorStops.forEach((color, index) => {
    gradient.addColorStop(index / (colorStops.length - 1), color);
  });

  return gradient;
};

// Performance optimization: memoized color generation
const colorCache = new Map<string, string[]>();

export const getCachedColors = (
  count: number,
  theme: string = 'cotton-candy',
  type: 'primary' | 'secondary' = 'primary'
): string[] => {
  const cacheKey = `${count}-${theme}-${type}`;

  if (colorCache.has(cacheKey)) {
    return colorCache.get(cacheKey)!;
  }

  const colors = getChartColors(count, theme, type);
  colorCache.set(cacheKey, colors);

  return colors;
};