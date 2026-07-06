import React from 'react';

interface ReportSummaryProps {
  readinessScore: number;
  risks: string[];
  recommendations: string[];
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ readinessScore, risks, recommendations }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-white">Readiness Report Summary</h2>
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-300">Readiness Score: {readinessScore}%</h3>
        <h4 className="mt-2 text-md font-medium text-gray-400">Risks:</h4>
        <ul className="list-disc list-inside text-gray-300">
          {risks.map((risk, index) => (
            <li key={index}>{risk}</li>
          ))}
        </ul>
        <h4 className="mt-2 text-md font-medium text-gray-400">Recommendations:</h4>
        <ul className="list-disc list-inside text-gray-300">
          {recommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportSummary;