-- Analytics Schema for Poll.it
-- This schema provides comprehensive analytics tracking for polls
-- while maintaining privacy compliance and performance optimization

-- Create analytics tables for comprehensive tracking

-- Poll Analytics Table - tracks poll-level metrics
CREATE TABLE IF NOT EXISTS poll_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,

  -- View tracking
  total_views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,

  -- Engagement metrics
  total_votes INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,4) DEFAULT 0.0000, -- Percentage as decimal (0.0000-1.0000)
  interaction_rate DECIMAL(5,4) DEFAULT 0.0000,

  -- Time tracking
  avg_time_to_vote INTEGER DEFAULT 0, -- Average time in seconds
  avg_time_on_page INTEGER DEFAULT 0, -- Average time spent viewing

  -- Social metrics
  total_shares INTEGER DEFAULT 0,
  share_to_vote_ratio DECIMAL(5,4) DEFAULT 0.0000,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Page View Events - tracks individual page views with privacy-conscious data
CREATE TABLE IF NOT EXISTS page_view_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,

  -- Anonymized visitor tracking (hashed IP + user agent for uniqueness)
  visitor_hash TEXT NOT NULL, -- SHA-256 hash of IP + User Agent + Date for daily uniqueness

  -- Device/platform information (anonymized)
  device_type TEXT, -- mobile, tablet, desktop
  browser_family TEXT, -- chrome, firefox, safari, etc
  os_family TEXT, -- windows, macos, ios, android, linux

  -- Geographic data (country/region level only for privacy)
  country_code CHAR(2), -- ISO 3166-1 alpha-2 country code
  region_code VARCHAR(10), -- State/province code

  -- Session tracking
  session_id UUID NOT NULL, -- Frontend-generated session identifier

  -- Referral tracking
  referrer_domain TEXT, -- Domain of referring site (no full URLs for privacy)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Engagement data
  time_on_page INTEGER, -- Time spent on page in seconds
  scroll_depth INTEGER DEFAULT 0, -- Max scroll percentage (0-100)

  -- Timestamps
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vote Events - tracks voting behavior and patterns
CREATE TABLE IF NOT EXISTS vote_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  vote_id UUID NOT NULL REFERENCES votes(id) ON DELETE CASCADE,

  -- Voting behavior
  option_index INTEGER NOT NULL,
  time_to_vote INTEGER, -- Time from page load to vote in seconds

  -- User context (anonymized)
  visitor_hash TEXT NOT NULL, -- Same as page_view_events for correlation
  session_id UUID NOT NULL,

  -- Device context
  device_type TEXT,
  browser_family TEXT,

  -- Geographic context
  country_code CHAR(2),
  region_code VARCHAR(10),

  -- Voting patterns
  is_first_vote_in_session BOOLEAN DEFAULT TRUE,
  previous_option_viewed INTEGER[], -- Array of options user hovered/viewed before voting

  -- Timestamps
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Share Events - tracks social sharing and viral metrics
CREATE TABLE IF NOT EXISTS share_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,

  -- Sharing details
  platform TEXT NOT NULL, -- twitter, facebook, linkedin, copy_link, etc
  share_method TEXT NOT NULL, -- button_click, url_copy, native_share

  -- User context
  visitor_hash TEXT NOT NULL,
  session_id UUID NOT NULL,

  -- Device context
  device_type TEXT,
  browser_family TEXT,

  -- Geographic context
  country_code CHAR(2),
  region_code VARCHAR(10),

  -- Viral tracking
  shared_url TEXT, -- The actual URL shared (for tracking parameters)

  -- Timestamps
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Click Events - tracks clicks from shared links for viral analysis
CREATE TABLE IF NOT EXISTS click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,

  -- Click source tracking
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- User context
  visitor_hash TEXT NOT NULL,
  session_id UUID NOT NULL,

  -- Device context
  device_type TEXT,
  browser_family TEXT,

  -- Geographic context
  country_code CHAR(2),
  region_code VARCHAR(10),

  -- Conversion tracking
  converted_to_vote BOOLEAN DEFAULT FALSE,
  time_to_conversion INTEGER, -- Time from click to vote in seconds

  -- Timestamps
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance monitoring for analytics optimization
CREATE TABLE IF NOT EXISTS analytics_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Performance metrics
  operation_type TEXT NOT NULL, -- 'aggregate', 'insert', 'query'
  table_name TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  row_count INTEGER DEFAULT 0,

  -- Error tracking
  error_occurred BOOLEAN DEFAULT FALSE,
  error_message TEXT,

  -- Context
  user_agent TEXT,
  ip_hash TEXT, -- Hashed IP for debugging without storing actual IPs

  -- Timestamps
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_poll_analytics_poll_id ON poll_analytics(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_analytics_updated_at ON poll_analytics(updated_at);

CREATE INDEX IF NOT EXISTS idx_page_view_events_poll_id ON page_view_events(poll_id);
CREATE INDEX IF NOT EXISTS idx_page_view_events_visitor_hash ON page_view_events(visitor_hash);
CREATE INDEX IF NOT EXISTS idx_page_view_events_session_id ON page_view_events(session_id);
CREATE INDEX IF NOT EXISTS idx_page_view_events_viewed_at ON page_view_events(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_view_events_country ON page_view_events(country_code);

CREATE INDEX IF NOT EXISTS idx_vote_events_poll_id ON vote_events(poll_id);
CREATE INDEX IF NOT EXISTS idx_vote_events_vote_id ON vote_events(vote_id);
CREATE INDEX IF NOT EXISTS idx_vote_events_visitor_hash ON vote_events(visitor_hash);
CREATE INDEX IF NOT EXISTS idx_vote_events_session_id ON vote_events(session_id);
CREATE INDEX IF NOT EXISTS idx_vote_events_voted_at ON vote_events(voted_at);
CREATE INDEX IF NOT EXISTS idx_vote_events_country ON vote_events(country_code);

CREATE INDEX IF NOT EXISTS idx_share_events_poll_id ON share_events(poll_id);
CREATE INDEX IF NOT EXISTS idx_share_events_platform ON share_events(platform);
CREATE INDEX IF NOT EXISTS idx_share_events_visitor_hash ON share_events(visitor_hash);
CREATE INDEX IF NOT EXISTS idx_share_events_shared_at ON share_events(shared_at);

CREATE INDEX IF NOT EXISTS idx_click_events_poll_id ON click_events(poll_id);
CREATE INDEX IF NOT EXISTS idx_click_events_referrer ON click_events(referrer_domain);
CREATE INDEX IF NOT EXISTS idx_click_events_utm_source ON click_events(utm_source);
CREATE INDEX IF NOT EXISTS idx_click_events_clicked_at ON click_events(clicked_at);
CREATE INDEX IF NOT EXISTS idx_click_events_conversion ON click_events(converted_to_vote);

CREATE INDEX IF NOT EXISTS idx_analytics_performance_table ON analytics_performance(table_name);
CREATE INDEX IF NOT EXISTS idx_analytics_performance_recorded_at ON analytics_performance(recorded_at);

-- Create composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_page_views_poll_date ON page_view_events(poll_id, viewed_at);
CREATE INDEX IF NOT EXISTS idx_votes_poll_date ON vote_events(poll_id, voted_at);
CREATE INDEX IF NOT EXISTS idx_shares_poll_platform_date ON share_events(poll_id, platform, shared_at);

-- Create function to update poll analytics in real-time
CREATE OR REPLACE FUNCTION update_poll_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle different trigger scenarios
  IF TG_TABLE_NAME = 'votes' AND TG_OP = 'INSERT' THEN
    -- Update analytics when new vote is cast
    INSERT INTO poll_analytics (poll_id, total_votes)
    VALUES (NEW.poll_id, 1)
    ON CONFLICT (poll_id) DO UPDATE SET
      total_votes = poll_analytics.total_votes + 1,
      updated_at = CURRENT_TIMESTAMP;

  ELSIF TG_TABLE_NAME = 'page_view_events' AND TG_OP = 'INSERT' THEN
    -- Update analytics when page is viewed
    INSERT INTO poll_analytics (poll_id, total_views)
    VALUES (NEW.poll_id, 1)
    ON CONFLICT (poll_id) DO UPDATE SET
      total_views = poll_analytics.total_views + 1,
      updated_at = CURRENT_TIMESTAMP;

  ELSIF TG_TABLE_NAME = 'share_events' AND TG_OP = 'INSERT' THEN
    -- Update analytics when content is shared
    INSERT INTO poll_analytics (poll_id, total_shares)
    VALUES (NEW.poll_id, 1)
    ON CONFLICT (poll_id) DO UPDATE SET
      total_shares = poll_analytics.total_shares + 1,
      updated_at = CURRENT_TIMESTAMP;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for real-time analytics updates
DROP TRIGGER IF EXISTS update_poll_analytics_on_vote ON votes;
CREATE TRIGGER update_poll_analytics_on_vote
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_analytics();

DROP TRIGGER IF EXISTS update_poll_analytics_on_view ON page_view_events;
CREATE TRIGGER update_poll_analytics_on_view
  AFTER INSERT ON page_view_events
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_analytics();

DROP TRIGGER IF EXISTS update_poll_analytics_on_share ON share_events;
CREATE TRIGGER update_poll_analytics_on_share
  AFTER INSERT ON share_events
  FOR EACH ROW
  EXECUTE FUNCTION update_poll_analytics();

-- Create function to calculate unique viewers using visitor_hash
CREATE OR REPLACE FUNCTION calculate_unique_viewers(poll_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT visitor_hash)
    FROM page_view_events
    WHERE poll_id = poll_uuid
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate completion rate
CREATE OR REPLACE FUNCTION calculate_completion_rate(poll_uuid UUID)
RETURNS DECIMAL(5,4) AS $$
DECLARE
  total_views INTEGER;
  total_votes INTEGER;
BEGIN
  SELECT total_views, total_votes
  INTO total_views, total_votes
  FROM poll_analytics
  WHERE poll_id = poll_uuid;

  IF total_views IS NULL OR total_views = 0 THEN
    RETURN 0.0000;
  END IF;

  RETURN LEAST(1.0000, CAST(total_votes AS DECIMAL) / CAST(total_views AS DECIMAL));
END;
$$ LANGUAGE plpgsql;

-- Create comprehensive analytics view for reporting
CREATE OR REPLACE VIEW poll_analytics_summary AS
SELECT
  p.id as poll_id,
  p.question,
  p.created_at as poll_created_at,
  pa.total_views,
  pa.unique_viewers,
  pa.total_votes,
  pa.completion_rate,
  pa.total_shares,
  pa.share_to_vote_ratio,
  pa.avg_time_to_vote,
  pa.avg_time_on_page,
  -- Geographic distribution (top 5 countries)
  (
    SELECT ARRAY_AGG(country_code ORDER BY view_count DESC)
    FROM (
      SELECT country_code, COUNT(*) as view_count
      FROM page_view_events
      WHERE poll_id = p.id AND country_code IS NOT NULL
      GROUP BY country_code
      ORDER BY view_count DESC
      LIMIT 5
    ) top_countries
  ) as top_countries,
  -- Device breakdown
  (
    SELECT JSON_OBJECT_AGG(device_type, device_count)
    FROM (
      SELECT device_type, COUNT(*) as device_count
      FROM page_view_events
      WHERE poll_id = p.id AND device_type IS NOT NULL
      GROUP BY device_type
    ) device_stats
  ) as device_breakdown,
  -- Platform breakdown for shares
  (
    SELECT JSON_OBJECT_AGG(platform, share_count)
    FROM (
      SELECT platform, COUNT(*) as share_count
      FROM share_events
      WHERE poll_id = p.id
      GROUP BY platform
    ) share_stats
  ) as share_breakdown,
  -- Viral coefficient (clicks from shares / total shares)
  CASE
    WHEN pa.total_shares > 0 THEN
      (
        SELECT CAST(COUNT(*) AS DECIMAL) / CAST(pa.total_shares AS DECIMAL)
        FROM click_events
        WHERE poll_id = p.id
      )
    ELSE 0.0000
  END as viral_coefficient,
  pa.updated_at as analytics_updated_at
FROM polls p
LEFT JOIN poll_analytics pa ON p.id = pa.poll_id;

-- Create function for daily analytics aggregation (for reporting dashboards)
CREATE OR REPLACE FUNCTION aggregate_daily_analytics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  poll_id UUID,
  analytics_date DATE,
  daily_views INTEGER,
  daily_unique_viewers INTEGER,
  daily_votes INTEGER,
  daily_shares INTEGER,
  daily_conversion_rate DECIMAL(5,4),
  top_referrer TEXT,
  top_country CHAR(2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pve.poll_id,
    target_date as analytics_date,
    COUNT(*)::INTEGER as daily_views,
    COUNT(DISTINCT pve.visitor_hash)::INTEGER as daily_unique_viewers,
    COALESCE(vote_counts.daily_votes, 0)::INTEGER as daily_votes,
    COALESCE(share_counts.daily_shares, 0)::INTEGER as daily_shares,
    CASE
      WHEN COUNT(*) > 0 THEN
        LEAST(1.0000, CAST(COALESCE(vote_counts.daily_votes, 0) AS DECIMAL) / CAST(COUNT(*) AS DECIMAL))
      ELSE 0.0000
    END as daily_conversion_rate,
    MODE() WITHIN GROUP (ORDER BY pve.referrer_domain) as top_referrer,
    MODE() WITHIN GROUP (ORDER BY pve.country_code) as top_country
  FROM page_view_events pve
  LEFT JOIN (
    SELECT
      ve.poll_id,
      COUNT(*)::INTEGER as daily_votes
    FROM vote_events ve
    WHERE DATE(ve.voted_at) = target_date
    GROUP BY ve.poll_id
  ) vote_counts ON vote_counts.poll_id = pve.poll_id
  LEFT JOIN (
    SELECT
      se.poll_id,
      COUNT(*)::INTEGER as daily_shares
    FROM share_events se
    WHERE DATE(se.shared_at) = target_date
    GROUP BY se.poll_id
  ) share_counts ON share_counts.poll_id = pve.poll_id
  WHERE DATE(pve.viewed_at) = target_date
  GROUP BY pve.poll_id;
END;
$$ LANGUAGE plpgsql;

-- Insert analytics records for existing polls (backfill)
INSERT INTO poll_analytics (poll_id, total_votes)
SELECT
  p.id,
  COALESCE(vote_counts.vote_count, 0)
FROM polls p
LEFT JOIN (
  SELECT poll_id, COUNT(*) as vote_count
  FROM votes
  GROUP BY poll_id
) vote_counts ON vote_counts.poll_id = p.id
ON CONFLICT (poll_id) DO NOTHING;