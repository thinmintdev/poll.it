'use client'

import React from 'react'
import { AnalyticsDashboard } from '@/components/analytics'

export default function AnalyticsDemoPage() {
  // Demo poll ID - in a real app this would come from URL params or props
  const demoPollId = 'demo-poll-123'

  return (
    <div className="min-h-screen bg-app-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gradient-primary mb-4">
            Analytics Dashboard Demo
          </h1>
          <p className="text-app-secondary max-w-2xl mx-auto">
            Experience the comprehensive analytics dashboard for poll creators.
            This demo showcases all the features including engagement metrics,
            geographic insights, device breakdowns, and sharing analytics.
          </p>
        </div>

        <AnalyticsDashboard pollId={demoPollId} />
      </div>
    </div>
  )
}