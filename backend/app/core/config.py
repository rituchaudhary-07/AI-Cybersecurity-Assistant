import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Cybersecurity Assistant"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretjwtkey_change_in_production_environment_12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "cybersecurity_assistant_db"
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
