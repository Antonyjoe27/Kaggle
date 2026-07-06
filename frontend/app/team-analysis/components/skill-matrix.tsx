import React from 'react';

interface SkillMatrixProps {
  skills: { name: string; level: string }[];
}

const SkillMatrix: React.FC<SkillMatrixProps> = ({ skills }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="w-full bg-gray-200 dark:bg-gray-700">
            <th className="py-2 px-4 border-b">Employee Name</th>
            <th className="py-2 px-4 border-b">Skill</th>
            <th className="py-2 px-4 border-b">Proficiency Level</th>
          </tr>
        </thead>
        <tbody>
          {skills.map((skill, index) => (
            <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-600">
              <td className="py-2 px-4 border-b">{skill.name}</td>
              <td className="py-2 px-4 border-b">{skill.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillMatrix;