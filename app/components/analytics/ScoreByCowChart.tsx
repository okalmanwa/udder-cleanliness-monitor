import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { FaStar, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa'
import { GiCow } from 'react-icons/gi'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

type ScoreByCowChartProps = {
  data: { cow_number: number; average: number }[]
}

const getScoreColor = (score: number) => {
  if (score <= 1.5) return { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-700', icon: FaStar }
  if (score <= 2.5) return { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-700', icon: FaExclamationTriangle }
  if (score <= 3.5) return { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-700', icon: FaExclamationTriangle }
  return { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-700', icon: FaTimesCircle }
}

const getScoreChartColor = (score: number) => {
  if (score <= 1.5) return { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgb(34, 197, 94)' }
  if (score <= 2.5) return { bg: 'rgba(234, 179, 8, 0.7)', border: 'rgb(234, 179, 8)' }
  if (score <= 3.5) return { bg: 'rgba(249, 115, 22, 0.7)', border: 'rgb(249, 115, 22)' }
  return { bg: 'rgba(239, 68, 68, 0.7)', border: 'rgb(239, 68, 68)' }
}

const getScoreStatus = (score: number) => {
  if (score <= 1.5) return 'Excellent'
  if (score <= 2.5) return 'Good'
  if (score <= 3.5) return 'Needs Attention'
  return 'Critical'
}

export default function ScoreByCowChart({ data }: ScoreByCowChartProps) {
  // If no data, show empty state
  if (!data || data.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6 min-h-[200px]">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <GiCow className="text-green-600 text-xl" />
            <h3 className="text-lg font-bold text-green-900">
              Cow Performance Analysis
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            No performance data available
          </div>
        </div>
        <div className="flex items-center justify-center flex-1 min-h-[120px]">
          <div className="text-center text-gray-500">
            <GiCow className="mx-auto text-4xl mb-2 opacity-50" />
            <p className="text-lg font-medium">No cow data available</p>
            <p className="text-sm">Complete some examinations to see cow performance</p>
          </div>
        </div>
      </div>
    )
  }

  // If only one cow, show a summary card instead of a chart
  if (data.length === 1) {
    const cow = data[0]
    const { bg, border, text, icon: Icon } = getScoreColor(cow.average)
    const status = getScoreStatus(cow.average)
    
    return (
      <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <GiCow className="text-green-600 text-xl" />
            <h3 className="text-lg font-bold text-green-900">
              Cow Performance Summary
            </h3>
          </div>
          <div className="text-sm text-gray-600">
            Individual performance analysis
          </div>
        </div>
        <div className={`${bg} ${border} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-md`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${bg.replace('100', '200')} ${border}`}>
                <Icon className={`text-xl ${text}`} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">Cow {cow.cow_number}</h4>
                <p className={`text-sm font-medium ${text}`}>{status}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-800">{cow.average.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${border.replace('border-', 'bg-').replace('400', '500')}`}
              style={{ width: `${(cow.average / 4) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Excellent (1)</span>
            <span>Critical (4)</span>
          </div>
        </div>
      </div>
    )
  }

  // For multiple cows, show horizontal bar chart sorted by score
  const sortedData = [...data].sort((a, b) => a.average - b.average)

  const chartData = {
    labels: sortedData.map(d => `Cow ${d.cow_number}`),
    datasets: [
      {
        label: 'Average Score',
        data: sortedData.map(d => d.average),
        backgroundColor: sortedData.map(d => getScoreChartColor(d.average).bg),
        borderColor: sortedData.map(d => getScoreChartColor(d.average).border),
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }

  const options = {
    indexAxis: 'y' as const, // Horizontal bars
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false // Remove legend for cleaner look
      },
      title: { 
        display: false // Remove title, it's in the parent component
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Average Score: ${context.parsed.x.toFixed(2)}`
          }
        }
      }
    },
    scales: {
      x: {
        min: 1,
        max: 4,
        ticks: { 
          stepSize: 0.5,
          callback: function(value: any) {
            return value.toFixed(1)
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    }
  }

  return (
    <div className="bg-white/60 backdrop-blur rounded-2xl shadow-lg p-4">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <GiCow className="text-green-600 text-xl" />
          <h3 className="text-lg font-bold text-green-900">
            Cow Performance Analysis
          </h3>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-green-700">{data.length}</span> cows • Ranked by average score
          </div>
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Best → Worst
          </div>
        </div>
      </div>
      
      {/* Add scrollable container with max height */}
      <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-green-200 scrollbar-track-gray-100">
        <div style={{ height: Math.max(200, data.length * 40 + 60) }}>
          <Bar data={chartData} options={options} />
        </div>
      </div>
      
      <div className="mt-3 flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Excellent (1.0-1.5)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span>Good (1.5-2.5)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span>Attention (2.5-3.5)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Critical (3.5-4.0)</span>
        </div>
      </div>
    </div>
  )
} 