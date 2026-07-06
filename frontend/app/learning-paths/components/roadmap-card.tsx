import React from 'react';

interface RoadmapCardProps {
  week: number;
  topic: string;
}

const RoadmapCard: React.FC<RoadmapCardProps> = ({ week, topic }) => {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Week {week}</h3>
      <p className="mt-2">{topic}</p>
    </div>
  );
};

export default RoadmapCard;