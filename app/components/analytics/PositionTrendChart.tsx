import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

type PositionTrendData = {
  date: string
  position: string
  score: number
}

type PositionTrendChartProps = {
  data: PositionTrendData[]
}

export default function PositionTrendChart({ data }: PositionTrendChartProps) {
  // Group data by position
  const positions = ['LF', 'RF', 'LR', 'RR']
  const datasets = positions.map((position, index) => {
    const positionData = data.filter(d => d.position === position)
    return {
      label: position,
      data: positionData.map(d => d.score),
      borderColor: `hsl(${index * 90}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 90}, 70%, 50%, 0.1)`,
      tension: 0.4
    }
  })

  const chartData = {
    labels: Array.from(new Set(data.map(d => d.date))),
    datasets
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Score Trends by Position'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Line data={chartData} options={options} />
    </div>
  )
} 