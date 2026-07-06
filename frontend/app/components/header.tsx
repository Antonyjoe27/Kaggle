import React from 'react';
import Link from 'next/link';

const Header: React.FC = () => {
    return (
        <header className="bg-gray-800 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">AI Engineering Manager</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li>
                            <Link href="/dashboard">Dashboard</Link>
                        </li>
                        <li>
                            <Link href="/projects">Projects</Link>
                        </li>
                        <li>
                            <Link href="/team-analysis">Team Analysis</Link>
                        </li>
                        <li>
                            <Link href="/learning-paths">Learning Paths</Link>
                        </li>
                        <li>
                            <Link href="/reports">Reports</Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;