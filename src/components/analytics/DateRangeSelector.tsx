'use client'

import React, { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'

interface DateRangeSelectorProps {
  dateRange: { start: Date; end: Date }
  onDateRangeChange: (range: { start: Date; end: Date }) => void
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  dateRange,
  onDateRangeChange
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const presetRanges = [
    {
      label: 'Last 7 days',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'Last 30 days',
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'Last 90 days',
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'This year',
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date()
    }
  ]

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  const getCurrentLabel = () => {
    const preset = presetRanges.find(range =>
      Math.abs(range.start.getTime() - dateRange.start.getTime()) < 24 * 60 * 60 * 1000 &&
      Math.abs(range.end.getTime() - dateRange.end.getTime()) < 24 * 60 * 60 * 1000
    )
    return preset ? preset.label : formatDateRange(dateRange.start, dateRange.end)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center gap-2 min-w-[160px]"
      >
        <Calendar className="w-4 h-4" />
        <span className="flex-1 text-left">{getCurrentLabel()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-app-card border border-app-light rounded-xl shadow-xl z-20">
            <div className="p-4">
              <h4 className="text-sm font-semibold text-app-primary mb-3">Quick Select</h4>
              <div className="space-y-1">
                {presetRanges.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onDateRangeChange({ start: preset.start, end: preset.end })
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-app-secondary hover:text-app-primary hover:bg-app-surface rounded-lg transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-app-light mt-4 pt-4">
                <h4 className="text-sm font-semibold text-app-primary mb-3">Custom Range</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-app-muted mb-1">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newStart = new Date(e.target.value)
                        onDateRangeChange({ start: newStart, end: dateRange.end })
                      }}
                      className="input-field w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-app-muted mb-1">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newEnd = new Date(e.target.value)
                        onDateRangeChange({ start: dateRange.start, end: newEnd })
                      }}
                      className="input-field w-full text-sm"
                    />
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="btn-primary w-full text-sm py-2"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}