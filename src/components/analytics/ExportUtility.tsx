'use client';

import { useState, memo, useCallback } from 'react';
import { prepareDataForExport } from '@/lib/analytics-utils';
import { ExportOptions, ChartDataPoint, TimeSeriesDataPoint, GeographicDataPoint } from '@/types/analytics';
import classNames from 'classnames';

interface ExportUtilityProps {
  data: ChartDataPoint[] | TimeSeriesDataPoint[] | GeographicDataPoint[];
  filename?: string;
  title?: string;
  className?: string;
}

const ExportUtility = memo<ExportUtilityProps>(({
  data,
  filename = 'analytics-data',
  title = 'Export Data',
  className = '',
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);

      const exportData = prepareDataForExport(data, format);
      const timestamp = new Date().toISOString().split('T')[0];
      const exportFilename = `${filename}_${timestamp}.${format}`;

      // Create blob and download
      const blob = new Blob([exportData], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message (could be enhanced with a toast system)
      console.log(`Data exported as ${exportFilename}`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [data, filename]);

  const handleChartExport = useCallback(async (chartRef: React.RefObject<any>, format: 'png' | 'jpeg') => {
    if (!chartRef.current) return;

    try {
      setIsExporting(true);

      const canvas = chartRef.current.canvas || chartRef.current.chartInstance?.canvas;
      if (!canvas) {
        throw new Error('Chart canvas not found');
      }

      const url = canvas.toDataURL(`image/${format}`, 0.9);
      const timestamp = new Date().toISOString().split('T')[0];
      const exportFilename = `${filename}_chart_${timestamp}.${format}`;

      const link = document.createElement('a');
      link.href = url;
      link.download = exportFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Chart exported as ${exportFilename}`);
    } catch (error) {
      console.error('Chart export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [filename]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div className={classNames('bg-app-surface rounded-lg p-4', className)}>
      <h4 className="text-sm font-medium text-app-secondary mb-3">{title}</h4>

      <div className="space-y-3">
        {/* Data export options */}
        <div>
          <div className="text-xs text-app-muted mb-2">Export Data</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="btn-secondary text-xs flex items-center space-x-1"
            >
              <span>📊</span>
              <span>{isExporting ? 'Exporting...' : 'CSV'}</span>
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className="btn-secondary text-xs flex items-center space-x-1"
            >
              <span>📄</span>
              <span>{isExporting ? 'Exporting...' : 'JSON'}</span>
            </button>
          </div>
        </div>

        {/* Data summary */}
        <div className="text-xs text-app-muted">
          {data.length} data points • {Math.round(JSON.stringify(data).length / 1024)}KB
        </div>
      </div>
    </div>
  );
});

ExportUtility.displayName = 'ExportUtility';

export default ExportUtility;