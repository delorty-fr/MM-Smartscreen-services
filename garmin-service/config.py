"""Configuration management for Garmin Service."""

from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration settings for the Garmin Service."""

    # Server settings
    host: str = Field(default="127.0.0.1", alias="GARMIN_API_HOST")
    port: int = Field(default=8000, alias="GARMIN_API_PORT")

    # Garmin credentials (for automatic re-login if tokens expire after restart)
    email: str = Field(default="", alias="GARMIN_EMAIL")
    password: str = Field(default="", alias="GARMIN_PASSWORD")

    # Token storage settings
    token_storage_path: Path = Field(default=Path("~/.garminconnect").expanduser(), alias="GARMIN_TOKEN_PATH")

    # Token refresh settings (seconds before expiry to refresh)
    token_refresh_threshold: int = Field(default=300, alias="GARMIN_TOKEN_REFRESH_THRESHOLD")

    # Stub mode settings (returns fixed data without calling Garmin API)
    stub_mode: bool = Field(default=False, alias="GARMIN_STUB_MODE")

    class Config:
        """Pydantic settings config."""

        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        populate_by_name = True


# Global settings instance
settings = Settings()
