# AI Assisted Learning Path Allocator

An AI-powered SaaS platform that helps HR teams and Engineering Managers analyze projects, evaluate team skills, and automatically allocate personalized learning paths — closing skill gaps before they become project risks.

The platform uses **Gemini 2.5 Flash** to analyze project requirements, assess engineer skill levels from GitHub activity, route freshers vs. experienced engineers into tailored onboarding/growth plans, and generate team readiness reports.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [AI Agents](#ai-agents)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Guide](#setup-guide)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Database Setup](#2-database-setup)
  - [3. Backend Setup](#3-backend-setup)
  - [4. Frontend Setup](#4-frontend-setup)
  - [5. Run with Docker (Alternative)](#5-run-with-docker-alternative)
  - [6. Verify the Installation](#6-verify-the-installation)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Total projects, team members, recent reports, and risk alerts at a glance. |
| **Projects** | Create projects (name, description, deadline, Jira URL) and auto-extract required skills, technologies, and complexity via AI. |
| **Team Analysis** | Add team members with GitHub URLs; AI generates a skill profile from their repositories. |
| **Learning Path Allocation** | Automatically routes each engineer — fresher or experienced — into a tailored learning path based on project skill gaps. |
| **Onboarding (Freshers)** | 30-60-90 day onboarding plans, auto-matched mentors, and beginner-friendly course recommendations. |
| **Growth Tracks (Experienced)** | Seniority assessment, specialization mapping, mentorship capacity, stretch assignments, and promotion-readiness checks. |
| **Reports** | Team readiness scores, missing skills, risk analysis, recommendations, and downloadable PDF reports. |
| **Employee Portal** | A self-service portal for employees to view assigned courses and track progress. |

---

## Architecture

```
┌────────────────┐      ┌──────────────────┐      ┌────────────────────┐
│   Frontend      │ ──▶ │     Backend       │ ──▶ │     Database        │
│  Next.js 15     │      │     FastAPI       │      │  PostgreSQL +       │
│  TypeScript     │ ◀── │   Python 3.11     │ ◀── │  pgvector            │
│  Tailwind/ShadCN│      │                   │      │                     │
└────────────────┘      └────────┬──────────┘      └────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │        AI Agent Layer        │
                    │   (Gemini 2.5 Flash + RAG)   │
                    │ Project · GitHub · Jira ·     │
                    │ Fresher · Experience ·        │
                    │ Learning Path · Readiness      │
                    └───────────────────────────────┘
```

---

## Tech Stack

**Frontend**
- Next.js 15, TypeScript, Tailwind CSS, ShadCN UI

**Backend**
- FastAPI, Python 3.11, SQLAlchemy

**Database**
- PostgreSQL, pgvector (vector storage for RAG)

**AI**
- Google Gemini 2.5 Flash
- LangChain (RAG orchestration)

**Integrations**
- GitHub API, Jira API

---

## AI Agents

All agents live in `ai/agents/` (lightweight, framework-agnostic reference implementations) and are mirrored by production versions in `backend/app/core/ai_agents.py`.

| Agent | File | Purpose |
|---|---|---|
| **Project Analyzer** | `project_analyzer.py` | Extracts required skills, technologies, and complexity from a project description. |
| **GitHub Analyzer** | `github_analyzer.py` | Builds a skill profile from a team member's GitHub repositories (languages, README, dependency files). |
| **Jira Analyzer** | `jira_analyzer.py` | Pulls project status, tasks, and assignments from Jira for health insights. |
| **Learning Path Agent** | `learning_path_agent.py` | Combines Gemini + RAG to generate personalized learning paths. |
| **Readiness Agent** | `readiness_agent.py` | Scores team readiness for a project and flags missing skills/risks. |
| **Fresher Agent** | `fresher_agent.py` | Routes freshers/interns/junior engineers into a 30-60-90 day onboarding plan with an auto-matched mentor. |
| **Experience Agent** | `experience_agent.py` | Assesses mid-level/senior engineers: seniority tier, specialization, mentorship capacity, stretch assignments, and promotion readiness. |

Shared support modules:
- `prompts.py` — centralized Gemini prompt templates
- `tools.py` — `call_gemini` (with deterministic mock fallback), `parse_json_response`, `compute_skill_gap`, `classify_experience_level`, `find_best_mentor`

> All agents fall back to deterministic mock responses when `GOOGLE_API_KEY` isn't set, so the full app runs end-to-end without any API key during local development.

---

## Project Structure

```
AIEnginerringManager/
├── ai/                          # Framework-agnostic AI agent reference implementations
│   ├── agents/
│   │   ├── project_analyzer.py
│   │   ├── github_analyzer.py
│   │   ├── jira_analyzer.py
│   │   ├── learning_path_agent.py
│   │   ├── readiness_agent.py
│   │   ├── fresher_agent.py
│   │   ├── experience_agent.py
│   │   ├── prompts.py
│   │   └── tools.py
│   ├── rag/
│   │   ├── retriever.py
│   │   └── vector_store.py
│   └── README.md
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── api/                 # REST endpoints (projects, team, reports, etc.)
│   │   ├── core/                 # config, db, models, schemas, ai_agents.py
│   │   ├── main.py
│   │   └── deps.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/                    # Next.js application
│   ├── app/                     # Pages: dashboard, projects, team-analysis, learning-paths, reports
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── Dockerfile
├── db/
│   ├── schema.sql
│   ├── migrations/
│   ├── database_setup_guide.md  # Schema additions for Fresher/Experience agents
│   └── README.md
├── employee-portal/              # Self-service employee portal (static HTML/CSS/JS)
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

Make sure you have the following installed:

- **Node.js** ≥ 18.x and **npm**
- **Python** 3.11+
- **PostgreSQL** 14+ with the **pgvector** extension
- **Docker** & **Docker Compose** (optional, for containerized setup)
- A **Google Gemini API key** ([Get one here](https://ai.google.dev/)) — optional; the app runs on mock AI responses without it

---

## Setup Guide

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AIEnginerringManager
```

### 2. Database Setup

1. **Install PostgreSQL** and ensure the `pgvector` extension is available.

2. **Create the database:**
   ```bash
   createdb ai_eng_manager
   ```

3. **Apply the base schema:**
   ```bash
   psql -U <your_username> -d ai_eng_manager -f db/schema.sql
   ```

4. **Apply agent-support migrations** (onboarding plans, experience assessments, mentor assignments — see `db/database_setup_guide.md` for full details):
   ```bash
   psql -U <your_username> -d ai_eng_manager -f db/migrations/0001_agents_tables.sql
   ```

> See `db/README.md` and `db/database_setup_guide.md` for schema details and backfill queries.

### 3. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** — copy `.env` and fill in your values (see [Environment Variables](#environment-variables)):
   ```bash
   cp .env.example .env   # if .env.example exists, otherwise edit .env directly
   ```

5. **Run the FastAPI server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

6. The API will be available at `http://localhost:8000`, with interactive docs at `http://localhost:8000/docs`.

### 4. Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000` in your browser.

### 5. Run with Docker (Alternative)

To spin up the frontend, backend, and database together:

```bash
docker compose up --build
```

This starts:
- `frontend` on `http://localhost:3000`
- `backend` on `http://localhost:8000`
- `db` (PostgreSQL) on `localhost:5432`

> Note: when using Docker Compose, update `backend`'s `DATABASE_URL` env var to match the `db` service credentials defined in `docker-compose.yml`.

### 6. Verify the Installation

1. Visit `http://localhost:3000` — you should see the dashboard.
2. Visit `http://localhost:8000/docs` — you should see the FastAPI Swagger UI.
3. Create a test project from the **Projects** page and confirm the AI Analyzer returns required skills/technologies (mock response is fine without a Gemini key).
4. Add a team member with a GitHub URL and confirm a skill profile is generated.
5. Generate a learning path and confirm freshers/experienced engineers are routed to the correct agent.

---

## Environment Variables

**`backend/.env`**

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/ai_eng_manager` | Yes |
| `SECRET_KEY` | Random secret used for signing/session security | Yes |
| `GOOGLE_API_KEY` | Gemini API key. If unset, agents fall back to mock responses | No |
| `GITHUB_TOKEN` | GitHub personal access token for repo analysis | No |
| `JIRA_BASE_URL` | Your Jira instance base URL | No |
| `JIRA_EMAIL` | Jira account email for API auth | No |
| `JIRA_API_TOKEN` | Jira API token | No |

**`frontend/.env.local`**

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | URL of the backend API | Yes |

---

## API Overview

| Resource | Endpoint prefix | Purpose |
|---|---|---|
| Projects | `/projects` | Create/list/analyze projects |
| Team Members | `/team-members` | Add/list team members, trigger GitHub skill analysis |
| Learning Paths | `/learning-paths` | Generate/assign personalized learning paths |
| Reports | `/reports` | Generate readiness reports, download PDFs |
| Dashboard | `/dashboard` | Aggregate stats for the dashboard |
| Performance | `/performance` | Employee performance evaluation |
| Employee Portal | `/employee-portal` | Endpoints backing the self-service portal |
| Integrations | `/integrations` | GitHub/Jira integration hooks |

Full interactive documentation is available at `/docs` (Swagger) once the backend is running.

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

Please open an issue first for major changes to discuss what you'd like to change.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
