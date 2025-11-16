from functools import lru_cache
from typing import Optional

from pydantic import BaseSettings, Field


class Settings(BaseSettings):
    """Configuration for the AI expiry estimator service."""

    grok_api_url: Optional[str] = Field(
        None,
        description="Endpoint for Grok chat completions. When omitted, the service falls back to heuristic estimates only.",
    )
    grok_api_key: Optional[str] = Field(None, description="Bearer token for talking to Grok or a compatible LLM endpoint.")
    grok_model: str = Field(
        "grok-1",
        description="Model identifier sent to the Grok API. Update to match the deployed model name your endpoint expects.",
    )
    default_shelf_life_days: int = Field(
        3, description="Baseline shelf-life guess (in days) used when Grok is unavailable or declines to answer."
    )
    max_shelf_life_days: int = Field(
        30,
        description="Upper bound for any heuristic estimate. Grok responses are also clamped to this value for sanity.",
    )
    download_timeout: float = Field(10.0, description="Timeout (in seconds) for fetching product images.")
    inference_timeout: float = Field(18.0, description="Timeout (in seconds) for Grok completion calls.")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


def get_settings() -> Settings:
    @lru_cache()
    def _get_settings() -> Settings:
        return Settings()

    return _get_settings()
