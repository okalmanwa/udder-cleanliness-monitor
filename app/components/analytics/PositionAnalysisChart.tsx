import { Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
)

type PositionAnalysisChartProps = {
  data: {
    position: string
    averageScore: number
  }[]
}

export default function PositionAnalysisChart({ data }: PositionAnalysisChartProps) {
  const chartData = {
    labels: data.map(d => d.position),
    datasets: [
      {
        label: 'Average Score by Position',
        data: data.map(d => d.averageScore),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(75, 192, 192)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(75, 192, 192)',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Score Analysis by Position',
      },
    },
    scales: {
      r: {
        min: 0,
        max: 4,
        ticks: {
          stepSize: 1,
        },
      },
    },
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Radar data={chartData} options={options} />
    </div>
  )
} 