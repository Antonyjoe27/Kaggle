export interface ProjectBase {
    name: string;
    description?: string;
    deadline?: string; // ISO date string
    jira_url?: string; // URL string
}

export interface ProjectCreate extends ProjectBase {}

export interface ProjectResponse extends ProjectBase {
    id: number;
    required_skills?: string[];
    technologies?: string[];
    complexity?: string;
    created_at: string;
    updated_at: string;
}

export interface TeamMemberBase {
    name: string;
    designation?: string;
    github_url?: string; // URL string
}

export interface TeamMemberCreate extends TeamMemberBase {}

export interface TeamMemberResponse extends TeamMemberBase {
    id: number;
    skill_profile?: Record<string, number>; // e.g., {"Python": 5, "Docker": 3}
    created_at: string;
    updated_at: string;
}

export interface ReportResponse {
    readiness_score: number;
    missing_skills: string[];
    risks: string[];
    recommendations: string[];
    generated_at: string;
}

export interface DashboardStats {
    total_projects: number;
    total_team_members: number;
    recent_reports: Array<{ project_id: number; readiness_score: number; generated_at: string }>;
    risk_alerts: string[];
}