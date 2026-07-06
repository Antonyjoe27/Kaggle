import { ProjectCreate, ProjectResponse, TeamMemberCreate, TeamMemberResponse, ReportResponse, DashboardStats } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { error: errorData.detail || response.statusText };
        }

        const data = await response.json();
        return { data };
    } catch (error: any) {
        console.error(`API call to ${endpoint} failed:`, error);
        return { error: error.message || 'An unknown error occurred' };
    }
}

// Projects API
export const createProject = (project: ProjectCreate) =>
    fetchApi<ProjectResponse>('/projects/', { method: 'POST', body: JSON.stringify(project) });

export const getProject = (projectId: number) =>
    fetchApi<ProjectResponse>(`/projects/${projectId}`);

export const analyzeProject = (projectId: number) =>
    fetchApi<ProjectResponse>(`/projects/${projectId}/analyze`, { method: 'POST' });

// Team Members API
export const addTeamMember = (member: TeamMemberCreate) =>
    fetchApi<TeamMemberResponse>('/team-members/', { method: 'POST', body: JSON.stringify(member) });

export const getAllTeamMembers = () =>
    fetchApi<TeamMemberResponse[]>('/team-members/');

export const analyzeTeamMemberSkills = (memberId: number) =>
    fetchApi<TeamMemberResponse>(`/team-members/${memberId}/analyze-skills`, { method: 'POST' });

// Learning Paths API
export const generateLearningPaths = (projectId: number) =>
    fetchApi<Record<string, string[]>>('/learning-paths/', {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId }),
    });

// Reports API
export const generateReport = (projectId: number) =>
    fetchApi<ReportResponse>('/reports/generate', {
        method: 'POST',
        body: JSON.stringify({ project_id: projectId }),
    });

export const getRecentReports = () =>
    fetchApi<Array<{ project_id: number; readiness_score: number; generated_at: string }>>('/reports/recent');

// Dashboard API
export const getDashboardStats = () =>
    fetchApi<DashboardStats>('/dashboard/stats');

// Utility for PDF download (client-side)
export const downloadPdfReport = (reportData: ReportResponse, projectName: string) => {
    // This would typically involve a backend endpoint that generates a PDF
    // For a client-side mock, you might use a library like jsPDF or just open a new window with formatted text.
    alert(`Simulating PDF download for ${projectName} report.`);
    console.log("Report Data for PDF:", reportData);
};