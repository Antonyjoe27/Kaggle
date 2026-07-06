-- Enable pgvector extension for vector storage
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for Projects
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    deadline DATE,
    jira_url VARCHAR(255),
    required_skills TEXT[], -- Array of strings
    technologies TEXT[],    -- Array of strings
    complexity VARCHAR(50), -- e.g., 'Low', 'Medium', 'High'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Team Members
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    github_url VARCHAR(255),
    skill_profile JSONB, -- Store skill profile as JSON (e.g., {"Python": 5, "Docker": 3})
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Reports
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    readiness_score REAL,
    missing_skills TEXT[],
    risks TEXT[],
    recommendations TEXT[],
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for RAG documents (example for pgvector)
CREATE TABLE rag_documents (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    embedding VECTOR(1536) -- Assuming Gemini 2.5 Flash embedding size, adjust if needed
);