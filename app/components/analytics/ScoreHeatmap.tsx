import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';
import { MatrixController, MatrixElement } from 'chartjs-chart-matrix';
import { Chart } from 'react-chartjs-2';
import { useRef } from 'react';

ChartJS.register(MatrixController, MatrixElement, Tooltip, Legend, CategoryScale, LinearScale);

export type HeatmapDatum = {
  position: string;
  month: string;
  average: number;
};

function getColor(value: number) {
  // Blue (good) to Red (bad)
  if (value === 0) return '#e5e7eb'; // gray-200 for no data
  if (value < 2) return '#10b981'; // emerald-500
  if (value < 3) return '#f59e42'; // amber-500
  return '#ef4444'; // red-500
}

export default function ScoreHeatmap({ data }: { data: HeatmapDatum[] }) {
  const chartRef = useRef<any>(null);
  const positions = Array.from(new Set(data.map(d => d.position)));
  const months = Array.from(new Set(data.map(d => d.month)));

  const matrixData = data.map(d => ({
    x: d.month,
    y: d.position,
    v: d.average,
  }));

  const chartData = {
    datasets: [
      {
        label: 'Average Score',
        data: matrixData,
        backgroundColor: (ctx: any) => getColor(ctx.raw.v),
        borderWidth: 1,
        width: ({ chart }: any) => (chart.chartArea || {}).width / months.length - 2,
        height: ({ chart }: any) => (chart.chartArea || {}).height / positions.length - 2,
        datalabels: {
          display: (ctx: any) => ctx.raw && ctx.raw.v > 0,
          color: '#fff',
          font: { weight: 'bold' as const, size: 14 },
          formatter: (value: any, ctx: any) => (ctx.raw && ctx.raw.v > 0 ? ctx.raw.v.toFixed(2) : ''),
        },
      },
    ],
    labels: months,
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any) => `Month: ${items[0].raw.x}`,
          label: (item: any) => `Position: ${item.raw.y}, Avg: ${item.raw.v.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        labels: months,
        title: { display: true, text: 'Month' },
        grid: { display: false },
        ticks: { color: '#222', font: { weight: 'bold' as const } },
      },
      y: {
        type: 'category' as const,
        labels: positions,
        title: { display: true, text: 'Position' },
        grid: { display: false },
        ticks: { color: '#222', font: { weight: 'bold' as const } },
      },
    },
    backgroundColor: 'transparent',
    maintainAspectRatio: false,
    aspectRatio: 2,
  };

  const handleDownload = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = 'score-heatmap.png';
      link.click();
    }
  };

  return (
    <div className="rounded-2xl shadow p-6 flex flex-col items-center bg-transparent">
      <h3 className="text-lg font-bold text-green-900 mb-4">Score Heatmap (Month x Position)</h3>
      <div className="w-full max-w-3xl h-96">
        <Chart ref={chartRef} type='matrix' data={chartData} options={options} />
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