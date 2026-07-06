import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  description: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col justify-between">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

export default StatsCard;