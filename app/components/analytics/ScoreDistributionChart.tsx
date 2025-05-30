import { Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

type ScoreDistributionChartProps = {
  data: {
    score: number
    count: number
  }[]
}

export default function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  // Ensure we have all scores from 1 to 4, even if count is 0
  const completeData = Array.from({ length: 4 }, (_, i) => {
    const score = i + 1
    const existingData = data.find(d => d.score === score)
    return {
      score,
      count: existingData?.count || 0
    }
  })

  const totalExaminations = completeData.reduce((sum, item) => sum + item.count, 0)

  if (totalExaminations === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-green-700 text-lg font-semibold">
        No examination data available for this period.
      </div>
    )
  }

  const chartData = {
    labels: completeData.map(d => `Score ${d.score}`),
    datasets: [
      {
        label: 'Proportion of Examinations',
        data: completeData.map(d => d.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.5)',  // Score 1 - Green
          'rgba(255, 206, 86, 0.5)',  // Score 2 - Yellow
          'rgba(255, 159, 64, 0.5)',  // Score 3 - Orange
          'rgba(255, 99, 132, 0.5)',  // Score 4 - Red
        ],
        borderColor: [
          'rgb(75, 192, 192)',
          'rgb(255, 206, 86)',
          'rgb(255, 159, 64)',
          'rgb(255, 99, 132)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          generateLabels: (chart: any) => {
            const data = chart.data.datasets[0].data as number[];
            return (chart.data.labels as string[]).map((label: string, i: number) => {
              const value = data[i];
              const percent = totalExaminations ? ((value / totalExaminations) * 100).toFixed(1) : '0.0';
              return {
                text: `${label} (${value} - ${percent}%)`,
                fillStyle: (chart.data.datasets[0].backgroundColor as string[])[i],
                strokeStyle: (chart.data.datasets[0].borderColor as string[])[i],
                lineWidth: 1,
                hidden: value === 0,
                index: i
              };
            });
          }
        }
      },
      title: {
        display: true,
        text: 'Score Distribution',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percent = totalExaminations ? ((value / totalExaminations) * 100).toFixed(1) : '0.0';
            return `${label}: ${value} examinations (${percent}%)`;
          }
        }
      }
    },
  }

  return (
    <div className="bg-white/40 backdrop-blur-sm p-4 rounded-3xl shadow-lg">
      <Pie data={chartData} options={options} />
    </div>
  )
} 