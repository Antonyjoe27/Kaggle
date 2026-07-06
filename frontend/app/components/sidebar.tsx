import React from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
    return (
        <div className="bg-gray-800 text-white w-64 h-full p-5">
            <h2 className="text-lg font-bold mb-4">AI Engineering Manager</h2>
            <ul className="space-y-2">
                <li>
                    <Link href="/dashboard" className="hover:text-gray-400">Dashboard</Link>
                </li>
                <li>
                    <Link href="/projects" className="hover:text-gray-400">Projects</Link>
                </li>
                <li>
                    <Link href="/team-analysis" className="hover:text-gray-400">Team Analysis</Link>
                </li>
                <li>
                    <Link href="/learning-paths" className="hover:text-gray-400">Learning Paths</Link>
                </li>
                <li>
                    <Link href="/reports" className="hover:text-gray-400">Reports</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;