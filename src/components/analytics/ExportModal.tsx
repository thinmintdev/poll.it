'use client'

import React, { useState } from 'react'
import { Download, X, FileText, Database, Table, Calendar, Check } from 'lucide-react'
import { ExportData } from '@/types/poll'

interface ExportModalProps {
  onExport: (data: ExportData) => void
  onClose: () => void
  dateRange: { start: Date; end: Date }
}

export const ExportModal: React.FC<ExportModalProps> = ({
  onExport,
  onClose,
  dateRange
}) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'xlsx'>('csv')
  const [includeDetails, setIncludeDetails] = useState(true)
  const [customDateRange, setCustomDateRange] = useState(dateRange)
  const [isExporting, setIsExporting] = useState(false)

  const formatOptions = [
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Comma-separated values for Excel and spreadsheet apps',
      icon: Table,
      recommended: true
    },
    {
      value: 'json' as const,
      label: 'JSON',
      description: 'JavaScript Object Notation for developers and APIs',
      icon: Database,
      recommended: false
    },
    {
      value: 'xlsx' as const,
      label: 'Excel',
      description: 'Native Excel format with multiple sheets',
      icon: FileText,
      recommended: false
    }
  ]

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await onExport({
        format,
        dateRange: {
          start: customDateRange.start.toISOString(),
          end: customDateRange.end.toISOString()
        },
        includeDetails
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatFileSize = (format: string) => {
    switch (format) {
      case 'csv': return '~50KB'
      case 'json': return '~120KB'
      case 'xlsx': return '~80KB'
      default: return 'Unknown'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-app-light">
          <div>
            <h2 className="text-xl font-semibold text-app-primary">Export Analytics Data</h2>
            <p className="text-app-muted text-sm mt-1">
              Download your poll analytics in your preferred format
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-app-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-app-muted" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-medium text-app-primary mb-4">Export Format</h3>
            <div className="grid grid-cols-1 gap-3">
              {formatOptions.map((option) => (
                <div
                  key={option.value}
                  className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    format === option.value
                      ? 'border-cotton-blue bg-cotton-blue bg-opacity-10'
                      : 'border-app-light hover:border-app-surface bg-app-surface hover:bg-app-surface-light'
                  }`}
                  onClick={() => setFormat(option.value)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      format === option.value
                        ? 'bg-cotton-blue text-white'
                        : 'bg-app-tertiary text-app-muted'
                    }`}>
                      <option.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-app-primary">{option.label}</span>
                        {option.recommended && (
                          <span className="text-xs bg-cotton-mint bg-opacity-20 text-cotton-mint px-2 py-1 rounded-full">
                            Recommended
                          </span>
                        )}
                        <span className="text-xs text-app-muted">{formatFileSize(option.value)}</span>
                      </div>
                      <p className="text-sm text-app-muted">{option.description}</p>
                    </div>
                    {format === option.value && (
                      <div className="w-6 h-6 bg-cotton-blue rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div>
            <h3 className="text-lg font-medium text-app-primary mb-4">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-app-muted mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={customDateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => {
                    setCustomDateRange({
                      ...customDateRange,
                      start: new Date(e.target.value)
                    })
                  }}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-app-muted mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={customDateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => {
                    setCustomDateRange({
                      ...customDateRange,
                      end: new Date(e.target.value)
                    })
                  }}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div>
            <h3 className="text-lg font-medium text-app-primary mb-4">Export Options</h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDetails}
                  onChange={(e) => setIncludeDetails(e.target.checked)}
                  className="mt-1 w-4 h-4 text-cotton-blue bg-app-surface border-app-light rounded focus:ring-cotton-blue focus:ring-2"
                />
                <div>
                  <div className="font-medium text-app-primary">Include Detailed Data</div>
                  <div className="text-sm text-app-muted">
                    Export granular analytics including hourly breakdowns, device details, and geographic data.
                    This will increase file size but provide more comprehensive insights.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Preview Information */}
          <div className="bg-app-surface rounded-xl p-4">
            <h4 className="font-medium text-app-primary mb-3">Export Preview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-app-muted">Format</div>
                <div className="font-medium text-app-primary">{format.toUpperCase()}</div>
              </div>
              <div>
                <div className="text-app-muted">Date Range</div>
                <div className="font-medium text-app-primary">
                  {Math.ceil((customDateRange.end.getTime() - customDateRange.start.getTime()) / (1000 * 60 * 60 * 24))} days
                </div>
              </div>
              <div>
                <div className="text-app-muted">Detail Level</div>
                <div className="font-medium text-app-primary">
                  {includeDetails ? 'Full' : 'Summary'}
                </div>
              </div>
              <div>
                <div className="text-app-muted">Est. Size</div>
                <div className="font-medium text-app-primary">
                  {formatFileSize(format)}
                </div>
              </div>
            </div>
          </div>

          {/* Data Included */}
          <div>
            <h4 className="font-medium text-app-primary mb-3">Data Included</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                'Poll performance metrics',
                'View and vote statistics',
                'Geographic distribution',
                'Device and browser breakdown',
                'Sharing platform analytics',
                'Time-based engagement data',
                ...(includeDetails ? [
                  'Hourly activity patterns',
                  'Detailed device information',
                  'Complete sharing chain data',
                  'Visitor journey mapping'
                ] : [])
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-cotton-mint" />
                  <span className="text-app-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-app-light">
          <div className="text-sm text-app-muted">
            Export will include data from {customDateRange.start.toLocaleDateString()} to {customDateRange.end.toLocaleDateString()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn-secondary"
              disabled={isExporting}
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="btn-primary flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}