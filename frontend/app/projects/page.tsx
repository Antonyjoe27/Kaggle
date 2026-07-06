"use client";

import { useState, useEffect } from 'react';
import ProjectForm from './components/project-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectResponse } from '../lib/types';
import { getProject } from '../lib/api';

export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectResponse[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null);

    // In a real app, you'd fetch all projects here
    useEffect(() => {
        // Mock fetching projects for now
        const fetchMockProjects = async () => {
            // Example: fetch a project after it's created/analyzed
            // For now, we'll just update the list when a new project is added/analyzed
        };
        fetchMockProjects();
    }, []);

    const handleProjectCreated = (newProject: ProjectResponse) => {
        setProjects((prev) => [...prev, newProject]);
        setSelectedProjectId(newProject.id);
        setSelectedProject(newProject);
    };

    const handleProjectAnalyzed = (updatedProject: ProjectResponse) => {
        setProjects((prev) => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
        setSelectedProject(updatedProject);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Projects Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Project</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProjectForm onProjectCreated={handleProjectCreated} onProjectAnalyzed={handleProjectAnalyzed} />
                    </CardContent>
                </Card>

                {selectedProject && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Analysis Results for {selectedProject.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Required Skills:</strong> {selectedProject.required_skills?.join(', ') || 'N/A'}</p>
                            <p><strong>Technologies:</strong> {selectedProject.technologies?.join(', ') || 'N/A'}</p>
                            <p><strong>Complexity:</strong> {selectedProject.complexity || 'N/A'}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Display a list of all projects here in a real application */}
            <Card>
                <CardHeader>
                    <CardTitle>All Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    {projects.length === 0 ? (
                        <p>No projects created yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {projects.map((project) => (
                                <li key={project.id} className="flex justify-between items-center p-2 border rounded">
                                    <span>{project.name} - {project.complexity || 'Not Analyzed'}</span>
                                    {/* Add a button to view/re-analyze project if needed */}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}