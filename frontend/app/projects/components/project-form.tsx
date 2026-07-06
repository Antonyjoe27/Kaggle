"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ProjectCreate, ProjectResponse } from '../../lib/types';
import { createProject, analyzeProject } from '../../lib/api';
import { useToast } from '@/components/ui/use-toast';

interface ProjectFormProps {
    onProjectCreated: (project: ProjectResponse) => void;
    onProjectAnalyzed: (project: ProjectResponse) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onProjectCreated, onProjectAnalyzed }) => {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [jiraUrl, setJiraUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
    const { toast } = useToast();

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const projectData: ProjectCreate = {
            name: projectName,
            description,
            deadline: deadline || undefined,
            jira_url: jiraUrl || undefined,
        };

        const { data, error } = await createProject(projectData);
        if (error) {
            toast({
                title: "Error creating project",
                description: error,
                variant: "destructive",
            });
        } else if (data) {
            toast({
                title: "Project created successfully!",
                description: `Project "${data.name}" has been added.`,
            });
            onProjectCreated(data);
            setCurrentProjectId(data.id);
            // Clear form after creation
            setProjectName('');
            setDescription('');
            setDeadline('');
            setJiraUrl('');
        }
        setLoading(false);
    };

    const handleAnalyzeProject = async () => {
        if (currentProjectId === null) {
            toast({
                title: "No project selected",
                description: "Please create a project first before analyzing.",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        const { data, error } = await analyzeProject(currentProjectId);
        if (error) {
            toast({
                title: "Error analyzing project",
                description: error,
                variant: "destructive",
            });
        } else if (data) {
            toast({
                title: "Project analyzed!",
                description: `Analysis for "${data.name}" complete.`,
            });
            onProjectAnalyzed(data);
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleCreateProject} className="space-y-4">
            <div><Label htmlFor="projectName">Project Name</Label><Input id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} required /></div>
            <div><Label htmlFor="description">Description</Label><Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div><Label htmlFor="deadline">Deadline</Label><Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
            <div><Label htmlFor="jiraUrl">Jira Project URL</Label><Input id="jiraUrl" type="url" value={jiraUrl} onChange={(e) => setJiraUrl(e.target.value)} /></div>
            <Button type="submit" disabled={loading}>
                {loading && currentProjectId === null ? 'Creating...' : 'Create Project'}
            </Button>
            {currentProjectId && (
                <Button onClick={handleAnalyzeProject} disabled={loading} className="ml-2">
                    {loading && currentProjectId !== null ? 'Analyzing...' : 'Analyze Project'}
                </Button>
            )}
        </form>
    );
};

export default ProjectForm;