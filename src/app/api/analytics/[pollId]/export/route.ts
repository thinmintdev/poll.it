import { NextRequest, NextResponse } from 'next/server'
import { getPollAnalytics, getDailyAnalytics } from '@/lib/analytics'

export async function GET(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    const { pollId } = params
    const { searchParams } = new URL(request.url)

    const format = searchParams.get('format') || 'csv'
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const includeDetails = searchParams.get('includeDetails') === 'true'

    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      )
    }

    // Get analytics data
    const analytics = await getPollAnalytics(pollId)
    if (!analytics) {
      return NextResponse.json(
        { error: 'Poll not found or no analytics data available' },
        { status: 404 }
      )
    }

    // Get daily analytics if date range is specified
    let dailyData = []
    if (start && end) {
      const startDate = new Date(start)
      const endDate = new Date(end)
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
        const dayAnalytics = await getDailyAnalytics(pollId, date)
        if (dayAnalytics) {
          dailyData.push(dayAnalytics)
        }
      }
    }

    // Prepare export data
    const exportData = {
      poll_info: {
        id: analytics.poll_id,
        question: analytics.question,
        created_at: analytics.poll_created_at,
        export_date: new Date().toISOString()
      },
      summary: {
        total_views: analytics.total_views,
        unique_viewers: analytics.unique_viewers,
        total_votes: analytics.total_votes,
        completion_rate: analytics.completion_rate,
        total_shares: analytics.total_shares,
        share_to_vote_ratio: analytics.share_to_vote_ratio,
        viral_coefficient: analytics.viral_coefficient,
        avg_time_on_page: analytics.avg_time_on_page,
        avg_time_to_vote: analytics.avg_time_to_vote,
        bounce_rate: analytics.bounce_rate,
        return_visitor_rate: analytics.return_visitor_rate
      },
      geographic: {
        top_countries: analytics.top_countries,
        ...(includeDetails && analytics.geographic_data && {
          detailed_geographic: analytics.geographic_data
        })
      },
      devices: {
        device_breakdown: analytics.device_breakdown,
        browser_breakdown: analytics.browser_breakdown,
        os_breakdown: analytics.os_breakdown
      },
      sharing: {
        share_breakdown: analytics.share_breakdown,
        viral_metrics: {
          reach_multiplier: analytics.viral_coefficient,
          social_amplification: analytics.total_shares / (analytics.total_votes || 1),
          engagement_virality: analytics.total_shares / (analytics.total_views || 1)
        }
      },
      ...(includeDetails && dailyData.length > 0 && {
        daily_analytics: dailyData
      })
    }

    // Generate appropriate response based on format
    switch (format) {
      case 'json':
        return NextResponse.json(exportData, {
          headers: {
            'Content-Disposition': `attachment; filename="poll-analytics-${pollId}.json"`,
            'Content-Type': 'application/json'
          }
        })

      case 'csv':
        const csvData = generateCSV(exportData, includeDetails)
        return new NextResponse(csvData, {
          headers: {
            'Content-Disposition': `attachment; filename="poll-analytics-${pollId}.csv"`,
            'Content-Type': 'text/csv'
          }
        })

      case 'xlsx':
        // For now, return CSV with Excel-compatible format
        // In a real implementation, you'd use a library like 'xlsx' to generate actual Excel files
        const excelCSV = generateCSV(exportData, includeDetails)
        return new NextResponse(excelCSV, {
          headers: {
            'Content-Disposition': `attachment; filename="poll-analytics-${pollId}.xlsx"`,
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }
        })

      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error exporting analytics:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    )
  }
}

function generateCSV(data: any, includeDetails: boolean): string {
  const rows: string[] = []

  // Header
  rows.push('Poll Analytics Export')
  rows.push(`Generated: ${new Date().toISOString()}`)
  rows.push(`Poll ID: ${data.poll_info.id}`)
  rows.push(`Question: "${data.poll_info.question}"`)
  rows.push('')

  // Summary metrics
  rows.push('SUMMARY METRICS')
  rows.push('Metric,Value')
  Object.entries(data.summary).forEach(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    rows.push(`${label},${value}`)
  })
  rows.push('')

  // Device breakdown
  if (data.devices.device_breakdown) {
    rows.push('DEVICE BREAKDOWN')
    rows.push('Device Type,Count,Percentage')
    const total = Object.values(data.devices.device_breakdown).reduce((a: number, b: number) => a + b, 0)
    Object.entries(data.devices.device_breakdown).forEach(([device, count]) => {
      const percentage = total > 0 ? ((count as number / total) * 100).toFixed(1) : '0'
      rows.push(`${device},${count},${percentage}%`)
    })
    rows.push('')
  }

  // Browser breakdown
  if (data.devices.browser_breakdown) {
    rows.push('BROWSER BREAKDOWN')
    rows.push('Browser,Count,Percentage')
    const total = Object.values(data.devices.browser_breakdown).reduce((a: number, b: number) => a + b, 0)
    Object.entries(data.devices.browser_breakdown).forEach(([browser, count]) => {
      const percentage = total > 0 ? ((count as number / total) * 100).toFixed(1) : '0'
      rows.push(`${browser},${count},${percentage}%`)
    })
    rows.push('')
  }

  // Geographic data
  if (data.geographic.top_countries?.length > 0) {
    rows.push('TOP COUNTRIES')
    rows.push('Country Code,Views')
    data.geographic.top_countries.forEach((country: string) => {
      rows.push(`${country},`)
    })
    rows.push('')
  }

  // Sharing breakdown
  if (data.sharing.share_breakdown) {
    rows.push('SHARING PLATFORMS')
    rows.push('Platform,Shares,Percentage')
    const total = Object.values(data.sharing.share_breakdown).reduce((a: number, b: number) => a + b, 0)
    Object.entries(data.sharing.share_breakdown).forEach(([platform, shares]) => {
      const percentage = total > 0 ? ((shares as number / total) * 100).toFixed(1) : '0'
      rows.push(`${platform},${shares},${percentage}%`)
    })
    rows.push('')
  }

  // Daily analytics if included
  if (includeDetails && data.daily_analytics?.length > 0) {
    rows.push('DAILY ANALYTICS')
    rows.push('Date,Views,Votes,Shares,Completion Rate')
    data.daily_analytics.forEach((day: any) => {
      rows.push(`${day.date},${day.views || 0},${day.votes || 0},${day.shares || 0},${day.completion_rate || 0}`)
    })
    rows.push('')
  }

  // Viral metrics
  rows.push('VIRAL METRICS')
  rows.push('Metric,Value')
  Object.entries(data.sharing.viral_metrics).forEach(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    rows.push(`${label},${value}`)
  })

  return rows.join('\n')
}