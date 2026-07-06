"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportResponse, ProjectResponse } from '../lib/types';
import { generateReport, getRecentReports, getProject, downloadPdfReport } from '../lib/api'; // Corrected import
import { useToast } from '@/components/ui/use-toast';

export default function ReportsPage() {
    const [projects, setProjects] = useState<ProjectResponse[]>([]); // In a real app, fetch all projects
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [currentReport, setCurrentReport] = useState<ReportResponse | null>(null);
    const [recentReports, setRecentReports] = useState<Array<{ project_id: number; readiness_score: number; generated_at: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchInitialData = async () => {
            // Mock fetching projects. In a real app, you'd fetch all projects from your backend.
            const { data: projectData, error: projectError } = await getProject(1); // Assuming project ID 1 exists
            if (projectError) {
                console.error("Failed to fetch mock project:", projectError);
                setProjects([{ id: 1, name: "Dummy Project X", description: "A test project", required_skills: ["Python", "Docker", "AWS Fundamentals", "CI/CD"], technologies: ["FastAPI", "PostgreSQL"], complexity: "Medium", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
            } else if (projectData) {
                setProjects([projectData]);
            }

            const { data: recentData, error: recentError } = await getRecentReports();
            if (recentError) {
                console.error("Failed to fetch recent reports:", recentError);
            } else if (recentData) {
                setRecentReports(recentData);
            }
        };
        fetchInitialData();
    }, []);

    const handleGenerateReport = async () => {
        if (!selectedProjectId) {
            toast({
                title: "No project selected",
                description: "Please select a project to generate a report.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        const { data, error } = await generateReport(parseInt(selectedProjectId));
        if (error) {
            setError(error);
            toast({
                title: "Error generating report",
                description: error,
                variant: "destructive",
            });
        } else if (data) {
            setCurrentReport(data);
            setRecentReports((prev) => [{ project_id: parseInt(selectedProjectId), readiness_score: data.readiness_score, generated_at: data.generated_at }, ...prev].slice(0, 5)); // Keep top 5
            toast({
                title: "Report generated!",
                description: "Team readiness report is ready.",
            });
        }
        setLoading(false);
    };

    const handleDownloadPdf = () => {
        if (currentReport && selectedProjectId) {
            const projectName = projects.find(p => p.id === parseInt(selectedProjectId))?.name || `Project ${selectedProjectId}`;
            downloadPdfReport(currentReport, projectName);
        } else {
            toast({ title: "No report to download", description: "Please generate a report first.", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Reports</h1>

            <Card>
                <CardHeader><CardTitle>Generate Readiness Report</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Select onValueChange={setSelectedProjectId} value={selectedProjectId || ''}>
                        <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select a project" /></SelectTrigger>
                        <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={handleGenerateReport} disabled={loading || !selectedProjectId}>Generate Report</Button>
                    <Button onClick={handleDownloadPdf} disabled={!currentReport} className="ml-2">Download PDF Report</Button>
                    {error && <p className="text-red-500">{error}</p>}
                </CardContent>
            </Card>

            {currentReport && (
                <Card>
                    <CardHeader><CardTitle>Latest Report for Project {selectedProjectId}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p><strong>Readiness Score:</strong> {currentReport.readiness_score}%</p>
                        <p><strong>Missing Skills:</strong> {currentReport.missing_skills.join(', ') || 'None'}</p>
                        <p><strong>Risks:</strong> {currentReport.risks.join(', ') || 'None'}</p>
                        <p><strong>Recommendations:</strong> {currentReport.recommendations.join(', ') || 'None'}</p>
                        <p className="text-sm text-gray-500">Generated: {new Date(currentReport.generated_at).toLocaleString()}</p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader><CardTitle>Recent Reports</CardTitle></CardHeader>
                <CardContent>
                    {recentReports.length === 0 ? (
                        <p>No recent reports.</p>
                    ) : (
                        <ul className="space-y-2">
                            {recentReports.map((report, index) => (
                                <li key={index} className="flex justify-between items-center p-2 border rounded">
                                    <span>Project {report.project_id}: Readiness Score {report.readiness_score}%</span>
                                    <span className="text-sm text-gray-500">{new Date(report.generated_at).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}