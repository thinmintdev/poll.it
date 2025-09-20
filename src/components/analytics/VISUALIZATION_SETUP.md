# Data Visualization Setup Guide

This document provides a comprehensive guide for the data visualization libraries and components set up for the poll.it analytics dashboard.

## 📚 Installed Libraries

### Core Visualization Libraries
- **Chart.js v4.5.0** - Powerful charting library with canvas rendering
- **react-chartjs-2 v5.3.0** - React wrapper for Chart.js with optimized performance
- **react-leaflet v5.0.0** - Interactive maps with Leaflet integration
- **react-simple-maps v3.0.0** - Simple and lightweight world map visualizations

### Supporting Libraries
- **date-fns v4.1.0** - Modern date utility library for date manipulation
- **numbro v2.5.0** - Number formatting with internationalization support
- **classnames v2.5.1** - Conditional CSS class utility
- **react-download-link v2.3.0** - File download functionality
- **react-window v2.1.1** - Efficient rendering of large lists
- **react-virtualized-auto-sizer v1.0.26** - Auto-sizing for virtualized components
- **lodash.debounce v4.0.8** - Function debouncing for performance
- **lodash.throttle v4.1.1** - Function throttling for performance

### Type Definitions
- **@types/leaflet v1.9.20** - TypeScript definitions for Leaflet
- **@types/lodash v4.17.20** - TypeScript definitions for Lodash utilities

## 🎨 Cotton Candy Theme Integration

The visualization system seamlessly integrates with the existing cotton-candy color scheme:

### Color Palette
```css
--cotton-candy-pink: #ff6b9d    /* Primary accent */
--cotton-candy-blue: #4facfe    /* Secondary accent */
--cotton-candy-purple: #9f7aea  /* Tertiary accent */
--cotton-candy-mint: #00f5a0    /* Success states */
--cotton-candy-peach: #ffa726   /* Warning states */
--cotton-candy-lavender: #e879f9 /* Special highlights */
```

### Chart Themes
- **cotton-candy** (default) - Matches the application's dark theme
- **dark** - Alternative dark theme
- **light** - Light theme for accessibility

## 🏗️ Architecture Overview

### Component Structure
```
src/components/analytics/
├── types/
│   └── analytics.ts          # TypeScript definitions
├── lib/
│   ├── chart-themes.ts       # Theme configuration
│   └── analytics-utils.ts    # Utility functions
├── components/
│   ├── LazyChart.tsx         # Lazy loading wrapper
│   ├── AdvancedDoughnutChart.tsx
│   ├── TimeSeriesChart.tsx
│   ├── BarChart.tsx
│   ├── GeographicHeatMap.tsx
│   ├── SimpleMap.tsx
│   ├── ExportUtility.tsx
│   └── AnalyticsDashboard.tsx
└── index.ts                  # Optimized exports
```

### Performance Optimizations

#### 1. Bundle Splitting
```typescript
// Webpack optimization in next.config.ts
splitChunks: {
  cacheGroups: {
    chartjs: { /* Chart.js bundle */ },
    maps: { /* Geographic libraries */ },
    utils: { /* Utility libraries */ }
  }
}
```

#### 2. Lazy Loading
```typescript
// Components are lazy-loaded for better performance
export const LazyChart = lazy(() => import('./LazyChart'));
export const GeographicHeatMap = lazy(() => import('./GeographicHeatMap'));
```

#### 3. Code Splitting
- Chart components load only when needed
- Geographic libraries load separately from charts
- Utility functions are cached and memoized

#### 4. Tree Shaking
- Optimized imports to include only used Chart.js components
- Individual utility function imports
- CSS optimization for unused styles

## 📊 Available Chart Types

### 1. Advanced Doughnut Chart
```typescript
<AdvancedDoughnutChart
  data={chartData}
  title="Poll Results"
  theme="cotton-candy"
  showPercentages={true}
  showValues={true}
  height={400}
  onDataClick={(dataPoint, index) => console.log(dataPoint)}
/>
```

**Features:**
- Interactive legend with toggle functionality
- Center text display with totals
- Hover animations and effects
- Data summary cards
- Performance monitoring

### 2. Time Series Chart
```typescript
<TimeSeriesChart
  data={timeSeriesData}
  title="Votes Over Time"
  theme="cotton-candy"
  showArea={true}
  showPoints={true}
  dateFormat="MMM dd"
  height={400}
/>
```

**Features:**
- Gradient area fills
- Interactive tooltips
- Date formatting options
- Statistical summaries
- Responsive design

### 3. Bar Chart
```typescript
<BarChart
  data={barData}
  title="Category Breakdown"
  theme="cotton-candy"
  orientation="vertical"
  showValues={true}
  height={400}
/>
```

**Features:**
- Horizontal/vertical orientation
- Top performers list
- Interactive data points
- Statistical information
- Responsive layout

### 4. Geographic Heat Map
```typescript
<GeographicHeatMap
  data={geoData}
  title="Global Distribution"
  theme="cotton-candy"
  mapStyle="dark"
  height={500}
/>
```

**Features:**
- Interactive Leaflet maps
- Heat map visualization
- Marker clustering
- Popup information
- Map controls (zoom, reset, fit bounds)

### 5. Simple World Map
```typescript
<SimpleMap
  data={countryData}
  title="Country Distribution"
  theme="cotton-candy"
  showMarkers={true}
  height={400}
/>
```

**Features:**
- SVG-based world map
- Country-level data visualization
- Interactive click events
- Legend and statistics
- Responsive design

## 🚀 Performance Features

### 1. Virtualization
For large datasets (>100 items), components automatically enable virtualization:
```typescript
// Automatic virtualization for large datasets
if (data.length > 100) {
  return <VirtualizedChart data={data} />;
}
```

### 2. Memoization
All chart configurations and data processing are memoized:
```typescript
const chartData = useMemo(() => processChartData(rawData), [rawData]);
const chartOptions = useMemo(() => createChartConfig(type, theme), [type, theme]);
```

### 3. Performance Monitoring
Built-in performance monitoring tracks:
- Render time
- Data processing time
- Chart initialization time
- Memory usage

### 4. Efficient Updates
- Debounced resize handlers
- Throttled scroll events
- Intelligent re-rendering
- Memory cleanup on unmount

## 📱 Responsive Design

### Breakpoints
```css
/* Mobile-first responsive design */
.chart-container {
  /* Base: Mobile (320px+) */
  height: 300px;
}

@media (min-width: 640px) {
  /* Small tablets */
  .chart-container { height: 350px; }
}

@media (min-width: 768px) {
  /* Tablets */
  .chart-container { height: 400px; }
}

@media (min-width: 1024px) {
  /* Desktop */
  .chart-container { height: 450px; }
}
```

### Touch Support
- Touch-friendly interactions
- Swipe gestures for maps
- Optimized touch targets
- Mobile-specific optimizations

## 🔧 Configuration

### Environment Variables
```env
# Optional: Map styling
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
```

### Chart Configuration
```typescript
// Default chart options
export const DEFAULT_CHART_OPTIONS: ChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  theme: 'cotton-candy',
  animations: true,
  legend: { display: true, position: 'bottom' },
  tooltip: { enabled: true, format: 'both' }
};
```

### Performance Settings
```typescript
// Performance thresholds
const PERFORMANCE_CONFIG = {
  virtualizationThreshold: 100,     // Items before virtualization
  debounceDelay: 300,               // Debounce delay (ms)
  throttleLimit: 100,               // Throttle limit (ms)
  maxCacheSize: 50,                 // Color cache size
  animationDuration: 800            // Animation duration (ms)
};
```

## 📊 Data Export

### Supported Formats
- **CSV** - Spreadsheet compatible
- **JSON** - Structured data format
- **PNG** - Chart images
- **JPEG** - Compressed chart images

### Export Usage
```typescript
<ExportUtility
  data={chartData}
  filename="poll-analytics"
  title="Export Options"
/>
```

## 🧪 Testing

### Performance Testing
```bash
# Run performance benchmarks
npm run test:performance

# Lighthouse CI for Core Web Vitals
npm run test:lighthouse
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run analyze

# Check for unused dependencies
npm run deps:unused
```

## 🎯 Accessibility

### WCAG Compliance
- **Color Contrast**: Minimum 4.5:1 ratio
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and descriptions
- **Focus Management**: Visible focus indicators

### Features
- High contrast mode support
- Reduced motion preferences
- Screen reader announcements
- Keyboard-only navigation

## 🚀 Getting Started

### Basic Usage
```typescript
import { LazyChart, ChartSkeleton } from '@/components/analytics';

function MyDashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <LazyChart
        type="doughnut"
        data={myData}
        options={{ theme: 'cotton-candy' }}
      />
    </Suspense>
  );
}
```

### Advanced Usage
```typescript
import {
  AdvancedDoughnutChart,
  TimeSeriesChart,
  GeographicHeatMap,
  formatNumber,
  processChartData
} from '@/components/analytics';

function AdvancedDashboard({ rawData }) {
  const processedData = processChartData(rawData, 'label', 'value', 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <AdvancedDoughnutChart
        data={processedData}
        title="Distribution"
        theme="cotton-candy"
        onDataClick={(point) => console.log(point)}
      />
      <GeographicHeatMap
        data={geoData}
        title="Geographic Data"
        height={400}
      />
    </div>
  );
}
```

## 🔄 Migration Guide

### From Existing Charts
If you have existing Chart.js implementations:

1. **Import the new components:**
   ```typescript
   import { AdvancedDoughnutChart } from '@/components/analytics';
   ```

2. **Update data format:**
   ```typescript
   // Old format
   const oldData = { labels: [...], datasets: [...] };

   // New format
   const newData = [
     { label: 'Item 1', value: 100 },
     { label: 'Item 2', value: 200 }
   ];
   ```

3. **Apply cotton-candy theme:**
   ```typescript
   <AdvancedDoughnutChart
     data={newData}
     theme="cotton-candy"  // New theme system
   />
   ```

## 📈 Performance Metrics

### Bundle Size Impact
- **Chart.js bundle**: ~45KB (gzipped)
- **React-Chartjs-2**: ~8KB (gzipped)
- **Leaflet + React-Leaflet**: ~38KB (gzipped)
- **Total additional**: ~91KB (gzipped)

### Performance Targets
- **Initial Load**: <200ms for first chart
- **Interaction**: <16ms for smooth 60fps
- **Memory**: <50MB additional usage
- **Bundle**: <500KB total visualization bundle

## 🛠️ Troubleshooting

### Common Issues

#### Chart not rendering
```typescript
// Ensure Chart.js components are registered
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);
```

#### SSR issues with maps
```typescript
// Use dynamic imports for map components
const GeographicHeatMap = dynamic(
  () => import('@/components/analytics/GeographicHeatMap'),
  { ssr: false }
);
```

#### Performance issues
```typescript
// Enable virtualization for large datasets
const shouldVirtualize = data.length > 100;
```

#### Theme not applying
```typescript
// Ensure CSS variables are loaded
import '@/app/globals.css';
```

This comprehensive setup provides a robust, performant, and accessible data visualization system that integrates seamlessly with your existing poll.it application architecture and cotton-candy design system.