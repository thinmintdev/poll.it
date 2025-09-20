# Analytics Dashboard

A comprehensive, visually engaging analytics dashboard for poll creators that matches the cotton-candy color scheme and provides actionable insights.

## Features

### 🎨 Visual Design
- **Cotton-candy color scheme** integration
- **Responsive design** for mobile and desktop
- **Glass morphism effects** with hover animations
- **Skeleton loading states** for smooth UX
- **Interactive tooltips** with detailed information

### 📊 Dashboard Sections

#### 1. Overview/Summary
- Key performance indicators
- Engagement funnel visualization
- Time-based trends analysis
- Quick statistics cards

#### 2. Engagement Analytics
- Real-time engagement metrics
- Time-to-vote analysis
- Session duration tracking
- Click-through rates
- Hourly activity patterns

#### 3. Geographic Insights
- Country-wise performance breakdown
- Geographic heat map visualization
- Regional engagement comparison
- Growth opportunity identification

#### 4. Device & Platform Analytics
- Device type breakdown (mobile, desktop, tablet)
- Browser family analysis
- Operating system distribution
- Cross-platform performance metrics

#### 5. Sharing & Viral Metrics
- Social media platform breakdown
- Viral coefficient tracking
- Share-to-vote ratios
- Platform-specific performance

### 📈 Visualization Types
- **Doughnut charts** for option votes and breakdowns
- **Line graphs** for time-based metrics and trends
- **Bar charts** for comparative data
- **Progress bars** for completion rates
- **Geographic tables** with flag indicators
- **Interactive time range selectors**

### 🔧 Interactive Features
- **Date range selector** with presets and custom ranges
- **Tab navigation** between different analytics sections
- **Chart type switching** (line vs bar charts)
- **Hover tooltips** with detailed information
- **Export functionality** (CSV, JSON, Excel)
- **Responsive mobile layout** with touch-friendly interactions

### ⚡ Performance Considerations
- **Lazy loading** of heavy visualizations
- **Efficient data fetching** with caching
- **Skeleton loading states** during data retrieval
- **Error handling** for failed API calls
- **Optimized re-rendering** with React.memo and useCallback

## Usage

### Basic Implementation

```tsx
import { AnalyticsDashboard } from '@/components/analytics'

function PollAnalyticsPage({ pollId }: { pollId: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <AnalyticsDashboard pollId={pollId} />
    </div>
  )
}
```

### Individual Components

```tsx
import {
  AnalyticsOverview,
  EngagementChart,
  GeographicMap,
  DeviceBreakdown,
  ShareAnalytics
} from '@/components/analytics'

// Use individual components for custom layouts
function CustomAnalyticsPage({ analytics }: { analytics: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <AnalyticsOverview analytics={analytics} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EngagementChart analytics={analytics} />
        <DeviceBreakdown analytics={analytics} />
      </div>
    </div>
  )
}
```

### Data Export

```tsx
import { ExportModal } from '@/components/analytics'

function ExportButton({ pollId }: { pollId: string }) {
  const [showExport, setShowExport] = useState(false)

  const handleExport = async (exportData: ExportData) => {
    const response = await fetch(`/api/analytics/${pollId}/export?${new URLSearchParams({
      format: exportData.format,
      start: exportData.dateRange.start,
      end: exportData.dateRange.end,
      includeDetails: exportData.includeDetails.toString()
    })}`)

    const blob = await response.blob()
    // Handle file download
  }

  return (
    <>
      <button onClick={() => setShowExport(true)}>
        Export Analytics
      </button>
      {showExport && (
        <ExportModal
          onExport={handleExport}
          onClose={() => setShowExport(false)}
          dateRange={{ start: new Date(), end: new Date() }}
        />
      )}
    </>
  )
}
```

## API Integration

### Required API Endpoints

The dashboard expects these API endpoints to be available:

#### Get Analytics Data
```
GET /api/analytics/[pollId]?daily=true&start=2024-01-01&end=2024-12-31
```

Response format:
```typescript
{
  success: boolean
  data: AnalyticsData
}
```

#### Export Analytics
```
GET /api/analytics/[pollId]/export?format=csv&start=2024-01-01&end=2024-12-31&includeDetails=true
```

### Data Structure

```typescript
interface AnalyticsData {
  poll_id: string
  question: string
  poll_created_at: string
  total_views: number
  unique_viewers: number
  total_votes: number
  completion_rate: number
  total_shares: number
  share_to_vote_ratio: number
  avg_time_to_vote: number
  avg_time_on_page: number
  top_countries: string[]
  device_breakdown: Record<string, number>
  browser_breakdown: Record<string, number>
  os_breakdown: Record<string, number>
  share_breakdown: Record<string, number>
  viral_coefficient: number
  bounce_rate: number
  return_visitor_rate: number
  peak_hour: number
  analytics_updated_at: string
  daily_analytics?: DailyAnalytics[]
  geographic_data?: GeographicData[]
  time_series_data?: TimeSeriesData[]
}
```

## Styling

The dashboard uses the cotton-candy color scheme defined in `globals.css`:

### Key CSS Variables
- `--cotton-candy-pink`: #ff6b9d
- `--cotton-candy-blue`: #4facfe
- `--cotton-candy-purple`: #9f7aea
- `--cotton-candy-mint`: #00f5a0
- `--cotton-candy-peach`: #ffa726
- `--cotton-candy-lavender`: #e879f9

### Utility Classes
- `glass-card`: Glass morphism effect
- `hover-glow`: Hover animation with glow
- `text-gradient-primary`: Cotton-candy gradient text
- `bg-gradient-primary`: Cotton-candy gradient background

## Accessibility

The dashboard is built with accessibility in mind:

- **Keyboard navigation** support
- **Screen reader** compatibility
- **WCAG 2.1 AA** compliance
- **High contrast** color combinations
- **Focus indicators** for interactive elements
- **Semantic HTML** structure
- **ARIA labels** for complex visualizations

## Performance Optimization

### Loading States
- Skeleton screens during data fetching
- Progressive loading of chart components
- Lazy loading of heavy visualizations

### Data Handling
- Efficient data transformation
- Memoized calculations
- Optimized re-rendering

### Bundle Optimization
- Tree-shaking compatible exports
- Minimal external dependencies
- Optimized Chart.js configuration

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

### Required
- React 18+
- Chart.js 4+
- react-chartjs-2
- lucide-react
- TypeScript

### Optional
- Tailwind CSS (for styling)
- Next.js (for SSR support)

## Demo

Visit `/analytics/demo` to see the dashboard in action with sample data.

## Troubleshooting

### Common Issues

1. **Charts not rendering**
   - Ensure Chart.js is properly registered
   - Check that data format matches expected structure

2. **Loading state stuck**
   - Verify API endpoints are responding
   - Check network connectivity
   - Validate poll ID exists

3. **Export not working**
   - Ensure export API endpoint is implemented
   - Check browser download permissions
   - Verify date range is valid

4. **Responsive layout issues**
   - Ensure container has proper CSS classes
   - Check viewport meta tag
   - Verify Tailwind CSS is loaded

### Performance Issues

1. **Slow chart rendering**
   - Reduce data point density
   - Enable chart animations sparingly
   - Use Chart.js performance optimizations

2. **Memory leaks**
   - Properly cleanup chart instances
   - Use useCallback for event handlers
   - Implement proper component unmounting

## Contributing

When contributing to the analytics dashboard:

1. Follow the cotton-candy design system
2. Ensure accessibility standards
3. Add proper TypeScript types
4. Include loading states
5. Test on mobile devices
6. Validate performance impact