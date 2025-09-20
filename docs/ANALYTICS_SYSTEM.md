# Poll.it Analytics System

A comprehensive, privacy-conscious analytics tracking system for polls that provides detailed insights while maintaining user privacy and GDPR compliance.

## Overview

The analytics system tracks poll-level metrics, voting behavior, sharing patterns, and user engagement to provide actionable insights for poll creators. All data collection is anonymized and privacy-compliant.

## Key Features

### 1. Poll-level Analytics
- **Total Views**: Complete page view tracking
- **Unique Viewers**: Daily-unique visitor identification using anonymized hashes
- **Time Metrics**: Average time spent on poll pages and time to vote
- **Completion Rate**: Percentage of viewers who vote
- **Interaction Rate**: Overall engagement metrics

### 2. Vote-specific Metrics
- **Vote Distribution**: Count and percentage for each option
- **Voting Behavior**: Time to vote, option hover tracking
- **Geographic Distribution**: Country/region level data (privacy-safe)
- **Device Analytics**: Device type, browser, and OS breakdown
- **Voting Patterns**: Sequential behavior analysis

### 3. Sharing & Social Metrics
- **Share Tracking**: Platform-specific sharing counts (Twitter, Facebook, LinkedIn)
- **Click-through Analysis**: Traffic from shared links
- **Viral Coefficient**: Clicks from shares / total shares ratio
- **Referral Sources**: Traffic source identification

### 4. Real-time & Aggregated Analytics
- **Live Updates**: Real-time metric updates using database triggers
- **Daily Aggregation**: Summarized daily statistics
- **Performance Monitoring**: System performance tracking

## Privacy & Compliance

### Data Anonymization
- **IP Hashing**: IP addresses are hashed with daily salt for uniqueness without storage
- **No Personal Data**: No personal information stored beyond OAuth basics
- **Geographic Anonymization**: Only country/region level data collected
- **Session-based Tracking**: Temporary session IDs for behavior correlation

### GDPR Compliance
- **Minimal Data Collection**: Only necessary data for analytics insights
- **No Cross-site Tracking**: Self-contained analytics system
- **User Control**: Analytics can be disabled or data deleted
- **Transparent Processing**: Clear data usage documentation

## Database Schema

### Core Tables

#### `poll_analytics`
Primary analytics aggregation table with real-time updates:
```sql
- poll_id: Poll reference
- total_views: Total page views
- unique_viewers: Daily unique visitors
- total_votes: Vote count
- completion_rate: Views to votes ratio
- total_shares: Social sharing count
- avg_time_to_vote: Average decision time
- avg_time_on_page: Average engagement time
```

#### `page_view_events`
Individual page view tracking:
```sql
- poll_id: Poll reference
- visitor_hash: Anonymized daily-unique identifier
- session_id: Frontend-generated session ID
- device_type, browser_family, os_family: Technical context
- country_code, region_code: Geographic context (anonymized)
- referrer_domain: Traffic source (domain only)
- time_on_page: Engagement duration
- scroll_depth: Page interaction depth
```

#### `vote_events`
Detailed voting behavior:
```sql
- poll_id, vote_id: References
- option_index: Selected option
- visitor_hash, session_id: User context
- time_to_vote: Decision time
- previous_option_viewed: Options considered
- device and geographic context
```

#### `share_events`
Social sharing tracking:
```sql
- poll_id: Poll reference
- platform: Sharing platform (twitter, facebook, etc.)
- share_method: How shared (button, copy, native)
- visitor_hash, session_id: User context
- shared_url: URL with tracking parameters
```

#### `click_events`
Viral traffic analysis:
```sql
- poll_id: Poll reference
- referrer_domain: Traffic source
- utm_source, utm_medium, utm_campaign: Campaign tracking
- converted_to_vote: Whether click led to vote
- time_to_conversion: Click to vote duration
```

### Indexes & Performance
- Optimized indexes for common query patterns
- Composite indexes for time-based analysis
- Performance monitoring for query optimization

## API Endpoints

### Analytics Tracking
- `POST /api/analytics/page-view` - Track page views
- `POST /api/analytics/vote` - Track voting events
- `POST /api/analytics/share` - Track sharing events
- `POST /api/analytics/session-end` - Track session completion

### Analytics Retrieval
- `GET /api/analytics/[pollId]` - Get comprehensive poll analytics
- `GET /api/analytics/[pollId]?daily=true&date=YYYY-MM-DD` - Daily analytics

## Frontend Integration

### Analytics Hooks

#### `useAdvancedAnalytics`
Comprehensive client-side tracking:
```typescript
const analytics = useAdvancedAnalytics({
  pollId: string,
  trackScrollDepth: boolean,
  trackTimeOnPage: boolean,
  trackHover: boolean,
  trackClicks: boolean
});

// Usage
analytics.trackVote(optionIndex, voteId, isFirstVote);
analytics.trackShare(platform, method, url);
analytics.trackOptionHover(optionIndex, isHovering);
```

#### Features
- **Session Management**: Automatic session tracking and lifecycle
- **Scroll Depth**: Progressive scroll milestone tracking
- **Time Tracking**: Active time vs. total time differentiation
- **Hover Analytics**: Option consideration behavior
- **Page Unload**: Reliable data transmission using sendBeacon

### Analytics Dashboard

#### `PollAnalyticsDashboard`
Comprehensive visualization component:
- **Key Metrics Cards**: Views, votes, completion rate, viral coefficient
- **Interactive Charts**: Device breakdown, sharing platforms
- **Geographic Distribution**: Country-level analytics
- **Time-based Filtering**: Today, week, month, all-time views
- **Real-time Updates**: Live data refresh

#### Chart Types
- **Doughnut Charts**: Device and platform breakdowns
- **Performance Metrics**: Time-based analytics
- **Geographic Tags**: Top countries display

## Setup & Installation

### 1. Database Setup
```bash
# Initialize analytics schema
npm run db:analytics

# Or full setup (includes basic polls + auth + analytics)
npm run db:setup-full
```

### 2. Environment Variables
No additional environment variables required - uses existing database connection.

### 3. Integration Steps

#### Enable Analytics in Components
```typescript
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import PollAnalyticsDashboard from '@/components/PollAnalyticsDashboard';

// In poll component
const analytics = useAdvancedAnalytics({ pollId });

// Add dashboard
<PollAnalyticsDashboard pollId={pollId} />
```

#### Track Events
```typescript
// Vote tracking (automatically integrated)
await analytics.trackVote(optionIndex, voteId, isFirstVote);

// Share tracking
await analytics.trackShare('twitter', 'button_click', shareUrl);

// Hover tracking
analytics.trackOptionHover(optionIndex, true/false);
```

## Performance Optimization

### Real-time Updates
- Database triggers for immediate metric updates
- Efficient aggregation functions
- Minimal performance overhead (<10ms per event)

### Data Retention
- Page views: 90 days
- Vote events: Permanent (anonymized)
- Share events: 90 days
- Performance logs: 30 days

### Query Optimization
- Composite indexes for time-range queries
- Materialized views for complex aggregations
- Connection pooling for database efficiency

## Analytics Insights

### Key Metrics Interpretation

#### Completion Rate
- **High (>70%)**: Engaging poll, clear options
- **Medium (30-70%)**: Standard engagement
- **Low (<30%)**: May need poll optimization

#### Time to Vote
- **Quick (<30s)**: Simple decision, clear preferences
- **Medium (30s-2m)**: Thoughtful consideration
- **Long (>2m)**: Complex poll or indecision

#### Viral Coefficient
- **>1.0**: Content is viral (each share generates >1 click)
- **0.5-1.0**: Good sharing performance
- **<0.5**: Limited viral reach

#### Device Breakdown
- Insight into audience platform preferences
- Mobile-first vs. desktop usage patterns
- Cross-platform consistency analysis

### Geographic Insights
- Audience distribution analysis
- Regional engagement patterns
- Time zone optimization opportunities

## Troubleshooting

### Common Issues

#### Analytics Not Tracking
1. Check database connection
2. Verify analytics tables exist: `npm run db:analytics`
3. Check browser console for JavaScript errors
4. Verify API endpoints are accessible

#### Performance Issues
1. Check database indexes
2. Monitor `analytics_performance` table
3. Optimize query patterns
4. Consider data archiving

#### Data Discrepancies
1. Verify time zones in analysis
2. Check for bot traffic filtering
3. Validate unique visitor logic
4. Review session timeout settings

### Debug Mode
```typescript
// Enable development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Analytics event:', eventData);
}
```

### Performance Monitoring
The system automatically tracks its own performance in the `analytics_performance` table:
- Query execution times
- Error rates
- Resource usage patterns

## Security Considerations

### Data Protection
- No personal identifiers stored
- IP addresses immediately hashed
- Session IDs are temporary and rotated
- Geographic data limited to country/region

### Access Control
- Analytics API requires valid poll access
- No cross-poll data exposure
- Rate limiting on analytics endpoints

### Audit Trail
- All analytics operations logged
- Performance metrics tracked
- Error handling with context preservation

## Future Enhancements

### Planned Features
- **A/B Testing**: Poll variation analytics
- **Cohort Analysis**: User behavior over time
- **Funnel Analysis**: Multi-step conversion tracking
- **Custom Events**: Flexible event tracking system
- **Data Export**: CSV/JSON analytics export
- **Alert System**: Threshold-based notifications

### Integration Opportunities
- **Google Analytics**: Enhanced event tracking
- **Social Media APIs**: Deeper sharing insights
- **Email Analytics**: Campaign performance tracking
- **SEO Analytics**: Search traffic optimization

## Best Practices

### Implementation
1. **Progressive Enhancement**: Analytics should never break core functionality
2. **Performance First**: <100ms overhead for all tracking
3. **Privacy by Design**: Minimal data collection with maximum insight
4. **Error Resilience**: Graceful degradation when analytics fails

### Data Analysis
1. **Context Matters**: Always consider poll type and audience
2. **Trend Analysis**: Focus on patterns over absolute numbers
3. **Segmentation**: Analyze by device, geography, and time
4. **Action-Oriented**: Use insights to improve poll design

### Maintenance
1. **Regular Monitoring**: Check performance metrics weekly
2. **Data Cleanup**: Archive old data according to retention policy
3. **Index Optimization**: Monitor and optimize query performance
4. **Privacy Compliance**: Regular privacy impact assessments

## Support & Resources

### Documentation
- API documentation in `/docs/API.md`
- Database schema in `/analytics-schema.sql`
- Component documentation in source files

### Monitoring
- Performance dashboards in admin interface
- Error tracking in application logs
- Database performance in monitoring tools

### Contact
For technical support or questions about the analytics system, refer to the main project documentation or create an issue in the project repository.