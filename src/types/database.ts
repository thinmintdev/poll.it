/**
 * Database-specific types for raw data and events
 */

// Raw database event structures
export interface PageViewEvent {
  id: string;
  poll_id: string;
  visitor_hash: string;
  session_id?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  country_code?: string;
  region?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen_resolution?: string;
  language?: string;
  time_zone?: string;
  time_on_page?: number;
  scroll_depth?: number;
  created_at: string;
}

export interface VoteEvent {
  id: string;
  poll_id: string;
  option_index: number;
  voter_ip: string;
  voter_hash?: string;
  session_id?: string;
  device_type?: string;
  browser?: string;
  country_code?: string;
  region?: string;
  time_to_vote?: number;
  created_at: string;
}

export interface ShareEvent {
  id: string;
  poll_id: string;
  platform: string;
  share_type: 'link' | 'qr' | 'social' | 'embed';
  referrer?: string;
  user_agent?: string;
  country_code?: string;
  created_at: string;
}

export interface ClickEvent {
  id: string;
  poll_id: string;
  element_type: string;
  element_id?: string;
  page_section?: string;
  click_coordinates?: {
    x: number;
    y: number;
  };
  session_id?: string;
  created_at: string;
}

// Raw events collection type
export interface RawEventsData {
  page_views: PageViewEvent[];
  votes: VoteEvent[];
  shares: ShareEvent[];
  clicks: ClickEvent[];
}

// Generic database row type
export interface DatabaseRow {
  [key: string]: string | number | boolean | null | undefined;
}

// Chart.js specific types
export interface ChartContext {
  chart: {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    data: {
      datasets: Array<{
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
      }>;
      labels?: string[];
    };
    chartArea: {
      left: number;
      top: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
    };
  };
  dataIndex: number;
  datasetIndex: number;
  parsed: {
    x: number;
    y: number;
  };
  raw: number;
}

export interface TooltipContext extends ChartContext {
  tooltip: {
    title: string[];
    body: Array<{
      lines: string[];
    }>;
  };
  label: string;
  formattedValue: string;
}

export interface LegendContext {
  chart: ChartContext['chart'];
  datasetIndex: number;
  text: string;
  fillStyle: string;
  strokeStyle: string;
  lineWidth: number;
}

// Generic processing function type
export type DataProcessor<T = DatabaseRow> = (data: T[]) => T[];

// Batch update handler type
export type BatchUpdateHandler<T = unknown> = (batch: T[]) => void;