# AI Assisted Learning Path Allocator - AI Components Documentation

This directory contains the AI agents and RAG (Retrieval-Augmented Generation) components used in the "AI Assisted Learning Path Allocator" application. The AI agents are responsible for analyzing projects, team skills, generating learning paths, and evaluating project readiness.

## AI Agents

1. **Project Analyzer Agent** (`project_analyzer.py`):
   - Utilizes the Gemini AI model to analyze project requirements.
   - Extracts necessary skills, technologies, and complexity levels from project descriptions.

2. **GitHub Analyzer Agent** (`github_analyzer.py`):
   - Interacts with the GitHub API to analyze team members' repositories.
   - Evaluates programming languages, README files, and dependency files (e.g., `requirements.txt`, `package.json`, `Dockerfile`) to generate skill profiles.

3. **Jira Analyzer Agent** (`jira_analyzer.py`):
   - Integrates with the Jira API to gather project management data.
   - Assesses project statuses, tasks, and team assignments to provide insights into project health.

4. **Learning Path Agent** (`learning_path_agent.py`):
   - Combines Gemini and RAG to generate personalized learning paths for team members based on project requirements and existing skills.
   - Tailors learning experiences to enhance team capabilities.

5. **Readiness Agent** (`readiness_agent.py`):
   - Uses Gemini and stored project/team data to evaluate team readiness for upcoming projects.
   - Generates readiness scores, identifies missing skills, and provides recommendations for training.

6. **Fresher Agent** (`fresher_agent.py`):
   - Handles freshers, interns, and junior engineers (routed via `tools.classify_experience_level`).
   - Builds a 30-60-90 day onboarding plan tailored to the new hire's current skills and project requirements.
   - Recommends a mentor from available senior/mid-level engineers and suggests beginner-friendly courses.
   - Reviews onboarding progress and flags when a plan needs adjusting.

7. **Experience Agent** (`experience_agent.py`):
   - Handles mid-level and senior engineers.
   - Assesses seniority tier, specialization areas, and remaining skill gaps against project requirements.
   - Estimates mentorship capacity and suggests which junior team members they should mentor.
   - Suggests stretch assignments and assesses promotion readiness.

Both agents share two support modules:
- **`prompts.py`** — centralized Gemini prompt templates for onboarding, check-ins, seniority assessment, and promotion readiness.
- **`tools.py`** — shared helpers: `call_gemini` (with mock fallback), `parse_json_response`, `compute_skill_gap`, `classify_experience_level`, and `find_best_mentor`.

See `db/database_setup_guide.md` for the schema additions (`onboarding_plans`, `experience_assessments`, `mentor_assignments`, `promotion_assessments`) needed to persist these agents' output.

## RAG Components

1. **Retriever** (`retriever.py`):
   - Implements logic to retrieve relevant documents and data for the RAG process.
   - Ensures that the Learning Path Agent has access to the necessary information for generating learning paths.

2. **Vector Store** (`vector_store.py`):
   - Utilizes pgvector for storing and retrieving vector embeddings.
   - Supports efficient querying of relevant documents based on team skills and project requirements.

## Usage

To utilize the AI agents and RAG components, ensure that the backend is properly configured and that the necessary API integrations (GitHub and Jira) are set up. The agents can be invoked through the respective API endpoints defined in the backend application.

For further details on implementation and usage, refer to the individual agent files and the backend API documentation.