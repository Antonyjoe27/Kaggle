import React from 'react';

interface ChartCardProps {
  title: string;
  data: number[];
  labels: string[];
}

const ChartCard: React.FC<ChartCardProps> = ({ title, data, labels }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-2">
        {/* Placeholder for chart rendering logic */}
        <canvas id={`chart-${title}`} />
      </div>
    </div>
  );
};

export default ChartCard;