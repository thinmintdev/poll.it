// Type declarations for react-simple-maps
declare module 'react-simple-maps' {
  import { ComponentType, ReactNode } from 'react';

  export interface Geography {
    type: 'Feature';
    geometry: {
      type: 'Polygon' | 'MultiPolygon';
      coordinates: number[][][] | number[][][][];
    };
    properties: {
      [key: string]: string | number | boolean | null;
    };
    rsmKey?: string;
  }

  export interface MarkerData {
    coordinates: [number, number];
    [key: string]: unknown;
  }

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      rotation?: [number, number, number];
      center?: [number, number];
    };
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (args: { geographies: Geography[] }) => ReactNode;
  }

  export interface GeographyProps {
    geography: Geography;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onClick?: (geography: Geography) => void;
    onMouseEnter?: (geography: Geography) => void;
    onMouseLeave?: (geography: Geography) => void;
  }

  export interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
    style?: React.CSSProperties;
    onClick?: (marker: MarkerData) => void;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    minZoom?: number;
    maxZoom?: number;
    onMoveStart?: (position: { coordinates: [number, number]; zoom: number }) => void;
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    onMove?: (position: { coordinates: [number, number]; zoom: number }) => void;
    children?: ReactNode;
  }

  export const ComposableMap: ComponentType<ComposableMapProps>;
  export const Geographies: ComponentType<GeographiesProps>;
  export const Geography: ComponentType<GeographyProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const ZoomableGroup: ComponentType<ZoomableGroupProps>;
}