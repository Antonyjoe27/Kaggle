"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Corrected import path
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Corrected import path
import { Terminal } from 'lucide-react'; // Corrected import path
import { getDashboardStats } from '../lib/api';
import { DashboardStats } from '../lib/types';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            const { data, error } = await getDashboardStats();
            if (error) {
                setError(error);
            } else if (data) {
                setStats(data);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center">Loading dashboard...</div>;
    if (error) return <div className="text-center text-red-500">Error: {error}</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_projects ?? 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Team Members</CardTitle>
                        <Terminal className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_team_members ?? 0}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {stats?.recent_reports?.map((report, index) => (
                            <li key={index} className="flex justify-between">
                                <span>Project {report.project_id}: Readiness Score {report.readiness_score}%</span>
                                <span className="text-sm text-gray-500">{new Date(report.generated_at).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {stats?.risk_alerts && stats.risk_alerts.length > 0 && (
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Risk Alerts</AlertTitle>
                    {stats.risk_alerts.map((alert, index) => <AlertDescription key={index}>{alert}</AlertDescription>)}
                </Alert>
            )}
        </div>
    );
}