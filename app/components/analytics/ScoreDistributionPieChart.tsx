import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useRef } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export type ScoreDistribution = {
  score: number;
  count: number;
};

export default function ScoreDistributionPieChart({ data }: { data: ScoreDistribution[] }) {
  const chartRef = useRef<any>(null);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  const chartData = {
    labels: data.map(d => `Score ${d.score}`),
    datasets: [
      {
        label: 'Examinations',
        data: data.map(d => d.count),
        backgroundColor: [
          '#3b82f6', // blue-500
          '#10b981', // emerald-500
          '#f59e42', // amber-500
          '#ef4444', // red-500
        ],
        borderColor: [
          '#1d4ed8', // blue-700
          '#047857', // emerald-700
          '#b45309', // amber-700
          '#b91c1c', // red-700
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    plugins: {
      legend: { position: 'bottom' as const },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' as const, size: 16 },
        formatter: (value: number) => {
          if (!total) return '0%';
          const percent = (value / total) * 100;
          return percent < 3 ? '' : percent.toFixed(0) + '%';
        },
      },
    },
    backgroundColor: 'transparent',
  };

  const handleDownload = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = 'score-distribution.png';
      link.click();
    }
  };

  return (
    <div className="rounded-2xl shadow p-6 flex flex-col items-center bg-transparent">
      <h3 className="text-lg font-bold text-green-900 mb-4">Score Distribution</h3>
      <div className="w-64 h-64">
        <Pie ref={chartRef} data={chartData} options={options} plugins={[ChartDataLabels]} />
      </div>
      <button
        onClick={handleDownload}
        className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold shadow hover:from-green-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        Download Chart
      </button>
    </div>
  );
} 