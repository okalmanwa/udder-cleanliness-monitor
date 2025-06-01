import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';
import { useRef } from 'react';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend, TimeScale, ChartDataLabels);

export type CriticalEvent = {
  date: string; // ISO string
  cow: string;
  position: string;
};

export default function CriticalEventsTimeline({ data }: { data: CriticalEvent[] }) {
  const chartRef = useRef<any>(null);

  const chartData = {
    datasets: [
      {
        label: 'Critical Event',
        data: data.map(d => ({ x: d.date, y: d.cow, position: d.position })),
        backgroundColor: '#ef4444', // red-500
        borderColor: '#b91c1c', // red-700
        pointRadius: 8,
        pointHoverRadius: 10,
        datalabels: {
          display: false,
        },
      },
    ],
  };

  const options = {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: any) => `Date: ${items[0].raw.x}`,
          label: (item: any) => `Cow: ${item.raw.y}, Position: ${item.raw.position}`,
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: { unit: 'day' as const },
        title: { display: true, text: 'Date' },
        grid: { color: '#e5e7eb' },
        ticks: { color: '#222', font: { weight: 'bold' as const } },
      },
      y: {
        type: 'category' as const,
        title: { display: true, text: 'Cow' },
        grid: { color: '#e5e7eb' },
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
      link.download = 'critical-events-timeline.png';
      link.click();
    }
  };

  return (
    <div className="rounded-2xl shadow p-6 flex flex-col items-center bg-transparent">
      <h3 className="text-lg font-bold text-green-900 mb-4">Critical Events Timeline</h3>
      <div className="w-full max-w-3xl h-96">
        <Scatter ref={chartRef} data={chartData} options={options} plugins={[ChartDataLabels]} />
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