// Analytics and data visualization types

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface TimeSeriesDataPoint {
  date: Date | string;
  value: number;
  label?: string;
}

export interface GeographicDataPoint {
  country: string;
  countryCode: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  value: number;
  percentage?: number;
}

export interface AnalyticsData {
  // Poll metrics
  totalPolls: number;
  totalVotes: number;
  activePolls: number;
  averageVotesPerPoll: number;

  // Time-based data
  pollsOverTime: TimeSeriesDataPoint[];
  votesOverTime: TimeSeriesDataPoint[];

  // Geographic data
  votesByCountry: GeographicDataPoint[];
  votesByRegion: GeographicDataPoint[];

  // Category data
  pollsByCategory: ChartDataPoint[];
  responseDistribution: ChartDataPoint[];

  // Engagement metrics
  averageResponseTime: number;
  peakHours: ChartDataPoint[];
  deviceTypes: ChartDataPoint[];
  browserTypes: ChartDataPoint[];
}

export interface ChartTheme {
  primary: string[];
  secondary: string[];
  background: string;
  text: string;
  grid: string;
  border: string;
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  theme: 'light' | 'dark' | 'cotton-candy';
  animations: boolean;
  legend: {
    display: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
  tooltip: {
    enabled: boolean;
    format: 'percentage' | 'value' | 'both';
  };
}

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'pdf' | 'svg' | 'csv' | 'json';
  filename?: string;
  quality?: number;
  width?: number;
  height?: number;
  includeData?: boolean;
}

// Leaflet map types
export interface MapDataPoint extends GeographicDataPoint {
  id: string;
  popupContent?: string;
  markerType?: 'circle' | 'marker' | 'heatmap';
}

export interface MapOptions {
  center: [number, number];
  zoom: number;
  style: 'light' | 'dark' | 'satellite' | 'terrain';
  clustering: boolean;
  heatmap: boolean;
  bounds?: [[number, number], [number, number]];
}

// Virtualization types for large datasets
export interface VirtualizedListItem {
  id: string;
  height: number;
  data: any;
  index: number;
}

export interface VirtualizationOptions {
  itemSize: number | ((index: number) => number);
  overscanCount: number;
  threshold: number; // When to enable virtualization
}

// Performance monitoring
export interface PerformanceMetrics {
  renderTime: number;
  dataProcessingTime: number;
  chartInitializationTime: number;
  totalMemoryUsage: number;
  frameRate: number;
}

// Real-time data update types
export interface RealtimeUpdate {
  type: 'add' | 'update' | 'remove';
  data: ChartDataPoint | TimeSeriesDataPoint | GeographicDataPoint;
  timestamp: Date;
  chartId: string;
}

export interface RealtimeSubscription {
  chartId: string;
  updateInterval: number;
  enabled: boolean;
  onUpdate: (update: RealtimeUpdate) => void;
  onError: (error: Error) => void;
}