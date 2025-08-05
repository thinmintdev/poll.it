'use client'

import { useRef } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

interface PollChartProps {
  results: {
    option: string
    votes: number
    percentage: number
  }[]
  type?: 'doughnut' | 'bar'
}

export default function PollChart({ results, type = 'doughnut' }: PollChartProps) {
  const chartRef = useRef<ChartJS<'doughnut'> | null>(null)

  const data = {
    labels: results.map(result => result.option),
    datasets: [
      {
        data: results.map(result => result.votes),
        backgroundColor: [
          '#525CEB', // accent
          '#BFCFE7', // highlight
          '#FFBCBC', // highlight-alt
          '#6366F1', // indigo-500
          '#8B5CF6', // purple-500
          '#EC4899', // pink-500
          '#F59E0B', // amber-500
          '#10B981', // emerald-500
          '#06B6D4', // cyan-500
          '#84CC16', // lime-500
        ],
        borderColor: [
          '#4338CA', // accent darker
          '#93C5FD', // highlight darker
          '#FCA5A5', // highlight-alt darker
          '#4F46E5', // indigo-600
          '#7C3AED', // purple-600
          '#DB2777', // pink-600
          '#D97706', // amber-600
          '#059669', // emerald-600
          '#0891B2', // cyan-600
          '#65A30D', // lime-600
        ],
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 30,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          font: {
            size: 12,
          },
          color: '#EDF2F6', // text-primary
        },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            const label = context.label || ''
            const value = type === 'bar' ? context.parsed.y : context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0
            return `${label}: ${value} votes (${percentage}%)`
          }
        }
      }
    },
    ...(type === 'bar' && {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#EDF2F6',
            stepSize: 1,
          },
          grid: {
            color: '#494953',
          },
        },
        x: {
          ticks: {
            color: '#EDF2F6',
          },
          grid: {
            color: '#494953',
          },
        },
      },
    }),
  }

  return (
    <div className="h-64 w-full">
      {type === 'doughnut' ? (
        <Doughnut ref={chartRef} data={data} options={options} />
      ) : (
        <Bar data={data} options={options} />
      )}
    </div>
  )
}
