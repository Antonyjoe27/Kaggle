# AI Assisted Learning Path Allocator Frontend

This is the frontend application for the "AI Assisted Learning Path Allocator", a modern SaaS-style web application designed to assist HR and Team Leads in analyzing projects, team skills, generating learning paths, and evaluating project readiness.

## Technology Stack

- **Frontend Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS, ShadCN UI

## Project Structure

The frontend application is organized into the following directories:

- **app**: Contains the main application components and pages.
  - **dashboard**: Dashboard page displaying project and team statistics.
  - **projects**: Page for managing projects.
  - **team-analysis**: Page for analyzing team members and their skills.
  - **learning-paths**: Page for generating personalized learning paths.
  - **reports**: Page for generating readiness reports.
  - **components**: Reusable components used across different pages.
  - **lib**: Contains utility functions, API calls, and TypeScript types.
  
- **public**: Contains static assets such as images and icons.

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd AIEngineeringManager/frontend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the development server**:
   ```
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000` to view the application.

## Features

- **Dashboard**: View total projects, team members, recent reports, and risk alerts.
- **Projects Page**: Create and analyze projects with required skills and complexity levels.
- **Team Analysis Page**: Add team members and analyze their skills based on GitHub profiles.
- **Learning Paths Page**: Generate personalized learning paths for team members based on project requirements and skills.
- **Reports Page**: Generate and download readiness reports with scores, risks, and recommendations.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.