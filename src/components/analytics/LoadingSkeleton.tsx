'use client'

import React from 'react'

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="h-8 bg-app-surface rounded-lg w-80 mb-3"></div>
            <div className="h-4 bg-app-surface rounded w-96 mb-2"></div>
            <div className="flex gap-4">
              <div className="h-3 bg-app-surface rounded w-32"></div>
              <div className="h-3 bg-app-surface rounded w-32"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-app-surface rounded-lg w-32"></div>
            <div className="h-10 bg-app-surface rounded-lg w-32"></div>
          </div>
        </div>

        {/* Key Metrics Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-app-tertiary rounded-xl p-4 border border-app-light">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-app-surface rounded w-20 mb-2"></div>
                  <div className="h-6 bg-app-surface rounded w-16"></div>
                </div>
                <div className="w-8 h-8 bg-app-surface rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs Skeleton */}
      <div className="bg-app-tertiary rounded-2xl p-2">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-10 bg-app-surface rounded-xl w-24 animate-pulse"></div>
          ))}
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className="space-y-6 animate-pulse">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-app-tertiary rounded-xl p-6 border border-app-light">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-app-surface rounded"></div>
                    <div className="h-3 bg-app-surface rounded w-20"></div>
                  </div>
                  <div className="h-8 bg-app-surface rounded w-16 mb-2"></div>
                  <div className="h-3 bg-app-surface rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart Area */}
        <div className="bg-app-tertiary rounded-xl p-6 border border-app-light">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-app-surface rounded w-48"></div>
            <div className="flex gap-3">
              <div className="h-8 bg-app-surface rounded w-24"></div>
              <div className="h-8 bg-app-surface rounded w-20"></div>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 bg-app-surface rounded-full"></div>
                <div className="h-3 bg-app-surface rounded w-16"></div>
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="h-96 bg-app-surface rounded-lg"></div>
        </div>

        {/* Secondary Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-app-tertiary rounded-xl p-6 border border-app-light">
              <div className="h-5 bg-app-surface rounded w-32 mb-4"></div>
              <div className="h-64 bg-app-surface rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Data Table Skeleton */}
        <div className="bg-app-tertiary rounded-xl p-6 border border-app-light">
          <div className="h-5 bg-app-surface rounded w-40 mb-6"></div>
          <div className="space-y-3">
            {/* Table Header */}
            <div className="flex justify-between py-3 border-b border-app-surface">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-3 bg-app-surface rounded w-16"></div>
              ))}
            </div>
            {/* Table Rows */}
            {[1, 2, 3, 4, 5].map(row => (
              <div key={row} className="flex justify-between items-center py-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-app-surface rounded"></div>
                  <div>
                    <div className="h-4 bg-app-surface rounded w-24 mb-1"></div>
                    <div className="h-3 bg-app-surface rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-app-surface rounded w-12"></div>
                <div className="h-4 bg-app-surface rounded w-12"></div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-app-surface rounded-full"></div>
                  <div className="h-3 bg-app-surface rounded w-8"></div>
                </div>
                <div className="h-3 bg-app-surface rounded w-8"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Skeleton */}
      <div className="fixed bottom-6 right-6">
        <div className="w-14 h-14 bg-app-surface rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}