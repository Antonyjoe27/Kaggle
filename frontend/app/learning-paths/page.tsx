"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectResponse } from '../lib/types';
import { getProject, generateLearningPaths } from '../lib/api'; // Corrected import
import { useToast } from '@/components/ui/use-toast';

export default function LearningPathsPage() {
    const [projects, setProjects] = useState<ProjectResponse[]>([]); // In a real app, fetch all projects
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [learningPaths, setLearningPaths] = useState<Record<string, string[]> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        // Mock fetching projects. In a real app, you'd fetch all projects from your backend.
        const fetchMockProjects = async () => {
            // For demonstration, let's assume a project with ID 1 exists and is analyzed.
            const { data, error } = await getProject(1); // Assuming project ID 1 exists
            if (error) {
                console.error("Failed to fetch mock project:", error);
                // Fallback to a dummy project if API fails or project doesn't exist
                setProjects([{ id: 1, name: "Dummy Project X", description: "A test project", required_skills: ["Python", "Docker", "AWS Fundamentals", "CI/CD"], technologies: ["FastAPI", "PostgreSQL"], complexity: "Medium", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
            } else if (data) {
                setProjects([data]);
            }
        };
        fetchMockProjects();
    }, []);

    const handleGenerateLearningPaths = async () => {
        if (!selectedProjectId) {
            toast({
                title: "No project selected",
                description: "Please select a project to generate learning paths.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        const { data, error } = await generateLearningPaths(parseInt(selectedProjectId));
        if (error) {
            setError(error);
            toast({
                title: "Error generating learning paths",
                description: error,
                variant: "destructive",
            });
        } else if (data) {
            setLearningPaths(data);
            toast({
                title: "Learning paths generated!",
                description: "Personalized learning roadmaps are ready.",
            });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Learning Paths</h1>

            <Card>
                <CardHeader><CardTitle>Generate Personalized Learning Paths</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Select onValueChange={setSelectedProjectId} value={selectedProjectId || ''}>
                        <SelectTrigger className="w-[280px]"><SelectValue placeholder="Select a project" /></SelectTrigger>
                        <SelectContent>{projects.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={handleGenerateLearningPaths} disabled={loading || !selectedProjectId}>Generate Learning Paths</Button>
                    {error && <p className="text-red-500">{error}</p>}
                </CardContent>
            </Card>

            {learningPaths && Object.keys(learningPaths).length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(learningPaths).map(([memberName, path], index) => (
                        <Card key={index}>
                            <CardHeader><CardTitle>{memberName}'s Learning Roadmap</CardTitle></CardHeader>
                            <CardContent>
                                <ul className="list-disc pl-5 space-y-1">
                                    {path.map((step, i) => <li key={i}>Week {i + 1}: {step}</li>)}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}