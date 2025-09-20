'use client';

import { useEffect, useState, memo, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { getCachedColors } from '@/lib/chart-themes';
import { formatNumber } from '@/lib/analytics-utils';
import { GeographicDataPoint } from '@/types/analytics';
import classNames from 'classnames';

// World map topology URL (using a smaller file for performance)
const WORLD_MAP_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface SimpleMapProps {
  data: GeographicDataPoint[];
  title?: string;
  theme?: 'cotton-candy' | 'dark' | 'light';
  showMarkers?: boolean;
  showLabels?: boolean;
  height?: number;
  className?: string;
  onError?: (error: Error) => void;
  onCountryClick?: (country: GeographicDataPoint) => void;
}

const SimpleMap = memo<SimpleMapProps>(({
  data,
  title,
  theme = 'cotton-candy',
  showMarkers = true,
  showLabels = false,
  height = 400,
  className = '',
  onError,
  onCountryClick,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Color scale for countries based on data values
  const colorScale = useMemo(() => {
    if (!data || data.length === 0) return [];

    const values = data.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const colors = getCachedColors(5, theme, 'primary');

    return data.map(item => {
      const normalizedValue = maxValue > minValue
        ? (item.value - minValue) / (maxValue - minValue)
        : 0.5;

      const colorIndex = Math.min(Math.floor(normalizedValue * colors.length), colors.length - 1);
      return {
        ...item,
        color: colors[colorIndex],
        intensity: normalizedValue,
      };
    });
  }, [data, theme]);

  // Get country color by country code
  const getCountryColor = (countryCode: string) => {
    const country = colorScale.find(d =>
      d.countryCode.toLowerCase() === countryCode.toLowerCase()
    );

    if (country) {
      return country.color;
    }

    // Default color for countries without data
    return theme === 'cotton-candy' ? '#2d2d44' : '#e5e7eb';
  };

  // Get country data by country code
  const getCountryData = (countryCode: string) => {
    return data.find(d =>
      d.countryCode.toLowerCase() === countryCode.toLowerCase()
    );
  };

  useEffect(() => {
    const loadMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);

        // Simulate map loading
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsLoading(false);
      } catch (error) {
        console.error('Map loading error:', error);
        setMapError('Failed to load map');
        onError?.(error as Error);
        setIsLoading(false);
      }
    };

    loadMap();
  }, [onError]);

  if (isLoading) {
    return (
      <div className={classNames('animate-pulse', className)}>
        <div className="bg-app-surface rounded-lg p-6">
          {title && <div className="h-6 bg-app-surface-light rounded w-1/3 mb-4"></div>}
          <div className="h-64 bg-app-surface-light rounded flex items-center justify-center">
            <div className="text-app-muted">Loading map...</div>
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

  if (!data || data.length === 0) {
    return (
      <div className={classNames('bg-app-surface rounded-lg p-6 text-center', className)}>
        <div className="text-app-muted">No geographic data available</div>
      </div>
    );
  }

  return (
    <div className={classNames('bg-app-surface rounded-lg p-6', className)}>
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-app-primary">{title}</h3>
          <p className="text-sm text-app-muted">
            {data.length} countries • Click to view details
          </p>
        </div>
      )}

      <div style={{ height: `${height}px` }} className="relative">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 100,
            center: [0, 20],
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <ZoomableGroup>
            <Geographies geography={WORLD_MAP_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryCode = geo.properties.ISO_A2;
                  const countryData = getCountryData(countryCode);
                  const fillColor = getCountryColor(countryCode);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke={theme === 'cotton-candy' ? '#3a3a52' : '#d1d5db'}
                      strokeWidth={0.5}
                      style={{
                        default: {
                          outline: 'none',
                        },
                        hover: {
                          fill: countryData ? fillColor.replace(')', ', 0.8)').replace('rgb', 'rgba') : fillColor,
                          outline: 'none',
                          cursor: countryData ? 'pointer' : 'default',
                        },
                        pressed: {
                          outline: 'none',
                        },
                      }}
                      onClick={() => {
                        if (countryData && onCountryClick) {
                          onCountryClick(countryData);
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Markers for countries with data */}
            {showMarkers && colorScale.map((country) => {
              if (!country.latitude || !country.longitude) return null;

              return (
                <Marker
                  key={country.countryCode}
                  coordinates={[country.longitude, country.latitude]}
                >
                  <circle
                    r={Math.max(3, Math.min(15, country.intensity * 10))}
                    fill={country.color}
                    stroke="#ffffff"
                    strokeWidth={1}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onCountryClick?.(country)}
                  />
                  {showLabels && (
                    <text
                      textAnchor="middle"
                      y={-20}
                      style={{
                        fontFamily: 'Poppins, system-ui, sans-serif',
                        fontSize: '10px',
                        fill: theme === 'cotton-candy' ? '#ffffff' : '#111827',
                      }}
                    >
                      {country.country}
                    </text>
                  )}
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-app-muted">Low</span>
          <div className="flex space-x-1">
            {getCachedColors(5, theme, 'primary').map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded"
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

      {/* Top countries */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-app-secondary mb-2">
          Top Countries
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
            .map((country) => {
              const colorData = colorScale.find(c => c.countryCode === country.countryCode);
              return (
                <div
                  key={country.countryCode}
                  className="flex items-center justify-between p-2 rounded bg-app-tertiary hover:bg-app-surface-light transition-colors cursor-pointer"
                  onClick={() => onCountryClick?.(country)}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: colorData?.color }}
                    ></div>
                    <span className="text-sm text-app-secondary">{country.country}</span>
                  </div>
                  <div className="text-sm font-medium text-app-primary">
                    {formatNumber(country.value)}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
});

SimpleMap.displayName = 'SimpleMap';

export default SimpleMap;