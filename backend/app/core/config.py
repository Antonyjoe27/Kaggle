from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    AI_MODEL: str = "Gemini 2.5 Flash"
    GITHUB_API_URL: str = "https://api.github.com"
    JIRA_API_URL: str = "https://your-jira-instance.atlassian.net/rest/api/3"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()