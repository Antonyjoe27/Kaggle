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
// ── Course Types ──────────────────────────────────────────────────────────────
export interface CourseCreate {
    id: string;
    title: string;
    category?: string;
    difficulty?: string;
    duration_hours?: number;
    description?: string;
    provider?: string;
    platform_url?: string;
    points?: number;
    course_type?: string;
    syllabus?: Record<string, any>;
    banner_gradient?: string;
}

export interface CourseResponse extends CourseCreate {}

export interface CourseAssignmentResponse {
    id: number;
    employee_id: number;
    course_id: string;
    assigned_at: string;
    deadline?: string;
    progress: number;
    status: string;
    completed_lessons?: string[];
}

// ── Performance Types ─────────────────────────────────────────────────────────
export interface LearningData {
    courses_completed: number;
    total_courses_assigned: number;
    average_quiz_score: number;
    learning_hours: number;
    current_streak_days: number;
    early_completions: number;
}

export interface ValidationData {
    tasks_passed: number;
    tasks_failed: number;
}

export interface ProjectActivityData {
    tickets_completed: number;
    tickets_assigned: number;
}

export interface EvaluateEmployeeRequest {
    learning_data: LearningData;
    validation_data: ValidationData;
    project_data: ProjectActivityData;
    skill_gaps?: string[];
}

export interface CourseRecommendation {
    course_id: string;
    title: string;
    skill_category: string;
    priority: string;
    reason: string;
    estimated_hours: number;
    points_value: number;
}

export interface PerformanceEvaluationResponse {
    employee_id: number;
    readiness_score: number;
    competency_level: string;
    points_earned: number;
    strengths: string[];
    weaknesses: string[];
    summary: string;
    recommendations: CourseRecommendation[];
    points_breakdown: Record<string, number>;
    metrics: Record<string, number>;
}

export interface AutoAssignResponse {
    employee_id: number;
    employee_name: string;
    experience_level: string;
    requires_hr_approval: boolean;
    assigned_courses: { course_id: string; title: string; difficulty: string; reason: string }[];
    message: string;
}
