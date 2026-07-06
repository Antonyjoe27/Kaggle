# Database Setup for AI Assisted Learning Path Allocator

This directory contains the necessary files and documentation for setting up and managing the PostgreSQL database used in the AI Assisted Learning Path Allocator application.

## Directory Structure

- **migrations/**: This folder will contain database migration files that help manage schema changes over time. Migrations are essential for maintaining the integrity of the database as the application evolves.

- **schema.sql**: This file contains the SQL schema for initializing the database. It defines the structure of the database, including tables, columns, and relationships.

## Getting Started

To set up the database for the AI Assisted Learning Path Allocator application, follow these steps:

1. **Install PostgreSQL**: Ensure that PostgreSQL is installed on your machine or server.

2. **Create a Database**: Create a new PostgreSQL database for the application.

3. **Run the Schema**: Execute the `schema.sql` file to initialize the database structure. You can do this using a PostgreSQL client or command line:
   ```bash
   psql -U your_username -d your_database -f schema.sql
   ```

4. **Apply Migrations**: As the application evolves, use the migration files in the `migrations/` directory to apply changes to the database schema.

## Important Notes

- Ensure that the database connection settings in the backend application are correctly configured to connect to this database.

- Regularly back up your database to prevent data loss.

For any issues or questions regarding the database setup, please refer to the main project documentation or contact the development team.