import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useRef, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

export type CowScore = {
  cow: string;
  avgScore: number;
};

function getBarColor(score: number) {
  if (score <= 1.5) return '#22c55e'; // Excellent - green
  if (score <= 2.5) return '#eab308'; // Good - yellow
  if (score <= 3.5) return '#f97316'; // Attention - orange
  return '#ef4444'; // Critical - red
}

export default function AverageScorePerCow({ data }: { data: CowScore[] }) {
  const chartRef = useRef<any>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortedData = [...data].sort((a, b) => {
    return sortOrder === 'asc' ? a.avgScore - b.avgScore : b.avgScore - a.avgScore;
  });

  const chartData = {
    labels: sortedData.map(d => d.cow),
    datasets: [
      {
        label: 'Average Score',
        data: sortedData.map(d => d.avgScore),
        backgroundColor: sortedData.map(d => getBarColor(d.avgScore)),
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Average Score per Cow' },
      datalabels: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Cow: ${ctx.label}, Avg Score: ${ctx.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { beginAtZero: true, max: 4.0, ticks: { stepSize: 0.5 }, title: { display: true, text: 'Average Score' } },
      y: { title: { display: true, text: 'Cow' } },
    },
    maintainAspectRatio: false,
    height: 400,
  };

  const handleDownload = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = 'average-score-per-cow.png';
      link.click();
    }
  };

  return (
    <div className="rounded-2xl shadow-lg p-6 flex flex-col items-center bg-transparent">
      <h3 className="text-xl font-bold text-green-900 mb-4">Average Score per Cow</h3>
      <div className="flex justify-end w-full mb-4">
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold shadow hover:from-green-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          Sort {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
        </button>
      </div>
      <div className="w-full max-w-3xl h-96 overflow-y-auto">
        <Bar ref={chartRef} data={chartData} options={options} plugins={[ChartDataLabels]} />
      </div>
      <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-green-500 inline-block"></span>Excellent (≤1.5)</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-400 inline-block"></span>Good (1.5–2.5)</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-orange-400 inline-block"></span>Attention (2.5–3.5)</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500 inline-block"></span>Critical ({'>'}3.5)</div>
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