import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useRef } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, ChartDataLabels);

export type ExaminationsByFarm = {
  farmName: string;
  count: number;
};

export default function ExaminationsByFarmBarChart({ data }: { data: ExaminationsByFarm[] }) {
  const chartRef = useRef<any>(null);

  const chartData = {
    labels: data.map(d => d.farmName),
    datasets: [
      {
        label: 'Examinations',
        data: data.map(d => d.count),
        backgroundColor: '#3b82f6', // blue-500
        borderColor: '#1d4ed8', // blue-700
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const options = {
    indexAxis: 'x' as const,
    plugins: {
      legend: { display: false },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold' as const, size: 16 },
        anchor: 'end' as const,
        align: 'start' as const,
        formatter: (value: number) => value === 0 ? '' : value,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#222',
          font: { weight: 'bold' as const },
        },
        grid: { color: '#e5e7eb' },
      },
      x: {
        ticks: {
          color: '#222',
          font: { weight: 'bold' as const },
        },
        grid: { display: false },
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
      link.download = 'examinations-by-farm.png';
      link.click();
    }
  };

  return (
    <div className="rounded-2xl shadow p-6 flex flex-col items-center bg-transparent">
      <h3 className="text-lg font-bold text-green-900 mb-4">Examinations by Farm</h3>
      <div className="w-full max-w-md h-72">
        <Bar ref={chartRef} data={chartData} options={options} plugins={[ChartDataLabels]} />
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