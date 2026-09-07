from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "CancerCare360 AI Service"
    DEBUG: bool = False
    API_KEY: str = "default_internal_api_key_for_testing"
    MODEL_PROVIDER: str = "rule-heuristic-engine"
    LLM_API_KEY: str | None = None
    CONFIDENCE_THRESHOLD: float = 0.75
    ENABLED_CAPABILITIES: List[str] = ["extract", "summarize", "explain", "draft"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
