from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = (
        "mssql+pyodbc:///?odbc_connect="
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=es-haint135\\SQLEXPRESS;"
        "DATABASE=TestFlow;"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )
    backend_cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    auto_start_frontend: bool = True
    auto_open_browser: bool = True
    frontend_url: str = "http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
