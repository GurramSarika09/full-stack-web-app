from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str = "postgresql+psycopg://postgres:Akshay%402006@localhost:5432/expenses_db"
    cors_origins: list[str] = ["http://localhost:4200"]


settings = Settings()
