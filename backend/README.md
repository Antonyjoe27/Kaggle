# AI Assisted Learning Path Allocator Backend

This is the backend for the AI Assisted Learning Path Allocator application, designed to assist HR and Team Leads in analyzing projects, team skills, generating learning paths, and evaluating project readiness.

## Technology Stack

- **Backend Framework**: FastAPI
- **Programming Language**: Python 3.11
- **Database**: PostgreSQL with pgvector for vector storage
- **AI Integration**: Gemini 2.5 Flash for AI agents
- **Integrations**: GitHub API, Jira API

## Directory Structure

- **app/**: Contains the main application code.
  - **api/**: API endpoints for managing projects, team members, learning paths, and reports.
  - **core/**: Core functionalities including configuration, database models, schemas, services, and AI agents.
  - **main.py**: Entry point for the FastAPI application.
  - **deps.py**: Dependency injection functions.

- **requirements.txt**: Lists the required Python packages for the backend.

- **pyproject.toml**: Project metadata and dependencies.

## API Endpoints

- **Projects**: Manage projects, including creation and analysis.
- **Team**: Manage team members and their skill analysis.
- **Learning Paths**: Generate personalized learning paths based on project requirements and team skills.
- **Reports**: Generate readiness reports for the team.

## Database

The backend uses PostgreSQL for data storage, with a schema defined in `db/schema.sql`. Migrations are managed in the `db/migrations` directory.

## AI Agents

The backend integrates with various AI agents to perform analyses:
- **Project Analyzer Agent**: Analyzes project requirements and extracts necessary skills and technologies.
- **GitHub Analyzer Agent**: Analyzes team members' GitHub profiles to generate skill profiles.
- **Jira Analyzer Agent**: Integrates with Jira to analyze project management data.
- **Learning Path Agent**: Generates learning paths based on project requirements and team skills.
- **Readiness Agent**: Evaluates team readiness and provides recommendations.

## Getting Started

1. Clone the repository.
2. Install the required dependencies using `pip install -r requirements.txt`.
3. Set up the PostgreSQL database and run migrations.
4. Start the FastAPI application using `uvicorn app.main:app --reload`.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.