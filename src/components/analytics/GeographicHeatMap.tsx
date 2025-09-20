'use client';

import { useEffect, useState, memo, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { getCachedColors } from '@/lib/chart-themes';
import { formatNumber } from '@/lib/analytics-utils';
import { GeographicDataPoint, MapOptions } from '@/types/analytics';
import classNames from 'classnames';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface GeographicHeatMapProps {
  data: GeographicDataPoint[];
  title?: string;
  theme?: 'cotton-candy' | 'dark' | 'light';
  mapStyle?: 'light' | 'dark' | 'satellite';
  showClustering?: boolean;
  height?: number;
  className?: string;
  onError?: (error: Error) => void;
  onLocationClick?: (location: GeographicDataPoint) => void;
}

const GeographicHeatMap = memo<GeographicHeatMapProps>(({
  data,
  title,
  theme = 'cotton-candy',
  mapStyle = 'dark',
  showClustering = true,
  height = 400,
  className = '',
  onError,
  onLocationClick,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<any>(null);

  // Load Leaflet CSS
  useEffect(() => {
    const loadLeafletCSS = () => {
      if (typeof window === 'undefined') return;

      // Check if Leaflet CSS is already loaded
      const existingLink = document.querySelector('link[href*="leaflet.css"]');
      if (existingLink) {
        setLeafletLoaded(true);
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      link.crossOrigin = '';

      link.onload = () => setLeafletLoaded(true);
      link.onerror = () => {
        setMapError('Failed to load map styles');
        onError?.(new Error('Failed to load Leaflet CSS'));
      };

      document.head.appendChild(link);
    };

    loadLeafletCSS();
  }, [onError]);

  // Process data for heat map visualization
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const colors = getCachedColors(5, theme, 'primary');

    return data
      .filter(item => item.latitude && item.longitude)
      .map(item => {
        const normalizedValue = maxValue > minValue
          ? (item.value - minValue) / (maxValue - minValue)
          : 0.5;

        const colorIndex = Math.min(Math.floor(normalizedValue * colors.length), colors.length - 1);
        const radius = Math.max(5, Math.min(50, normalizedValue * 30 + 10));

        return {
          ...item,
          color: colors[colorIndex],
          radius,
          intensity: normalizedValue,
        };
      });
  }, [data, theme]);

  // Map center calculation
  const mapCenter = useMemo((): [number, number] => {
    if (!processedData || processedData.length === 0) {
      return [20, 0]; // Default center
    }

    const avgLat = processedData.reduce((sum, item) => sum + item.latitude!, 0) / processedData.length;
    const avgLng = processedData.reduce((sum, item) => sum + item.longitude!, 0) / processedData.length;

    return [avgLat, avgLng];
  }, [processedData]);

  // Map tile URL based on style
  const getTileUrl = () => {
    switch (mapStyle) {
      case 'light':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'dark':
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      default:
        return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
  };

  useEffect(() => {
    const initMap = async () => {
      if (!leafletLoaded) return;

      try {
        setIsLoading(true);
        setMapError(null);

        // Simulate map loading
        await new Promise(resolve => setTimeout(resolve, 300));

        setIsLoading(false);
      } catch (error) {
        console.error('Map initialization error:', error);
        setMapError('Failed to initialize map');
        onError?.(error as Error);
        setIsLoading(false);
      }
    };

    initMap();
  }, [leafletLoaded, onError]);

  if (!leafletLoaded || isLoading) {
    return (
      <div className={classNames('animate-pulse', className)}>
        <div className="bg-app-surface rounded-lg p-6">
          {title && <div className="h-6 bg-app-surface-light rounded w-1/3 mb-4"></div>}
          <div className="h-64 bg-app-surface-light rounded flex items-center justify-center">
            <div className="text-app-muted">Loading heat map...</div>
          </div>
        </div>
      </div>
    );
  }

  if (mapError) {
    return (
      <div className={classNames('bg-app-surface rounded-lg p-6 text-center', className)}>
        <div className="text-red-400 mb-2">⚠️ {mapError}</div>
        <button
          onClick={() => window.location.reload()}
          className="btn-secondary text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.length === 0 || processedData.length === 0) {
    return (
      <div className={classNames('bg-app-surface rounded-lg p-6 text-center', className)}>
        <div className="text-app-muted">No geographic data with coordinates available</div>
      </div>
    );
  }

  return (
    <div className={classNames('bg-app-surface rounded-lg p-6', className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-app-primary">{title}</h3>
          <p className="text-sm text-app-muted">
            {processedData.length} locations • Interactive heat map
          </p>
        </div>
      )}

      <div
        style={{ height: `${height}px` }}
        className="relative rounded-lg overflow-hidden"
      >
        <MapContainer
          ref={mapRef}
          center={mapCenter}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url={getTileUrl()}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {processedData.map((location, index) => (
            <CircleMarker
              key={`${location.countryCode}-${index}`}
              center={[location.latitude!, location.longitude!]}
              radius={location.radius}
              pathOptions={{
                fillColor: location.color,
                color: '#ffffff',
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6,
              }}
              eventHandlers={{
                click: () => onLocationClick?.(location),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{location.country}</div>
                  {location.region && (
                    <div className="text-gray-600">{location.region}</div>
                  )}
                  {location.city && (
                    <div className="text-gray-600">{location.city}</div>
                  )}
                  <div className="mt-2">
                    <span className="font-medium">Value: </span>
                    {formatNumber(location.value)}
                  </div>
                  {location.percentage && (
                    <div>
                      <span className="font-medium">Percentage: </span>
                      {location.percentage.toFixed(1)}%
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Legend and controls */}
      <div className="mt-4 space-y-4">
        {/* Heat map legend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-app-muted">Low</span>
            <div className="flex space-x-1">
              {getCachedColors(5, theme, 'primary').map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
            <span className="text-xs text-app-muted">High</span>
          </div>

          <div className="text-xs text-app-muted">
            Total: {formatNumber(data.reduce((sum, d) => sum + d.value, 0))}
          </div>
        </div>

        {/* Map controls */}
        <div className="flex flex-wrap gap-2">
          <button
            className="btn-secondary text-xs"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView(mapCenter, 2);
              }
            }}
          >
            Reset View
          </button>
          <button
            className="btn-secondary text-xs"
            onClick={() => {
              // Fit to bounds of all markers
              if (mapRef.current && processedData.length > 0) {
                const bounds = processedData.map(item => [item.latitude!, item.longitude!] as [number, number]);
                mapRef.current.fitBounds(bounds, { padding: [20, 20] });
              }
            }}
          >
            Fit All
          </button>
        </div>

        {/* Top locations */}
        <div>
          <h4 className="text-sm font-medium text-app-secondary mb-2">
            Top Locations
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {processedData
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)
              .map((location, index) => (
                <div
                  key={`${location.countryCode}-${index}`}
                  className="flex items-center justify-between p-2 rounded bg-app-tertiary hover:bg-app-surface-light transition-colors cursor-pointer"
                  onClick={() => {
                    onLocationClick?.(location);
                    // Center map on this location
                    if (mapRef.current) {
                      mapRef.current.setView([location.latitude!, location.longitude!], 6);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: location.color }}
                    ></div>
                    <div className="min-w-0">
                      <div className="text-sm text-app-secondary truncate">
                        {location.city ? `${location.city}, ${location.country}` : location.country}
                      </div>
                      {location.region && (
                        <div className="text-xs text-app-muted">{location.region}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-app-primary">
                    {formatNumber(location.value)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
});

GeographicHeatMap.displayName = 'GeographicHeatMap';

export default GeographicHeatMap;