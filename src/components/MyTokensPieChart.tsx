import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Token {
  name: string;
  symbol: string;
  totalValue: number;
}

interface MyTokensPieChartProps {
  tokens: Token[];
}

const MyTokensPieChart: React.FC<MyTokensPieChartProps> = ({ tokens }) => {
  if (!tokens || tokens.length === 0) return null;

  const data = {
    labels: tokens.map((token) => `${token.name} (${token.symbol})`),
    datasets: [
      {
        label: 'Valor Total (CHZ)',
        data: tokens.map((token) => token.totalValue),
        backgroundColor: [
          '#6366F1', // Indigo
          '#22C55E', // Green
          '#F59E42', // Orange
          '#F43F5E', // Pink
          '#3B82F6', // Blue
          '#A855F7', // Purple
          '#FACC15', // Yellow
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#374151', // Tailwind gray-700
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${value} CHZ`;
          },
        },
      },
    },
  };

  return (
    <div className="flex justify-center items-center mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center" style={{ width: 370 }}>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
          Distribución de Valor de Tokens
        </h3>
        <div style={{ width: 320, height: 320 }}>
          <Pie data={data} options={options} width={320} height={320} />
        </div>
      </div>
    </div>
  );
};

export default MyTokensPieChart;
