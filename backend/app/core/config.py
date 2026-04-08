import os
from typing import List, Optional
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "LocalRaG."  # Project name
    VERSION: str = "0.1.0"  # Project version
    API_V1_STR: str = "/api"  # API version string

    # MySQL settings
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "ragwebui")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "ragwebui")
    POSTGRES_DATABASE: str = os.getenv("POSTGRES_DATABASE", "ragwebui")
    SQLALCHEMY_DATABASE_URI: Optional[str] = None

    @property
    def database_url(self) -> str:
        if self.SQLALCHEMY_DATABASE_URI:
            return self.SQLALCHEMY_DATABASE_URI
        password = quote_plus(self.POSTGRES_PASSWORD)
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{password}"
            f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DATABASE}"
        )


    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

    # Chat Provider settings
    CHAT_PROVIDER: str = os.getenv("CHAT_PROVIDER", "ollama")

    # Embeddings settings
    EMBEDDINGS_PROVIDER: str = os.getenv("EMBEDDINGS_PROVIDER", "ollama")
    CHAT_TITLE_PROVIDER: str = os.getenv("CHAT_TITLE_PROVIDER", "ollama")

    # MinIO settings
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "documents")

  
    # Vector Store settings
    VECTOR_STORE_TYPE: str = os.getenv("VECTOR_STORE_TYPE", "chroma")

    # Chroma DB settings
    CHROMA_DB_HOST: str = os.getenv("CHROMA_DB_HOST", "localhost")
    CHROMA_DB_PORT: int = int(os.getenv("CHROMA_DB_PORT", "8000"))

    # Qdrant DB settings
    QDRANT_URL: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    QDRANT_PREFER_GRPC: bool = os.getenv("QDRANT_PREFER_GRPC", "true").lower() == "true"

    # Ollama settings
    OLLAMA_API_BASE: str = "http://localhost:11434"
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "gemma3:4b")
    OLLAMA_CHAT_TITLE_MODEL: str = os.getenv("OLLAMA_CHAT_TITLE_MODEL", "llama3.2:1b")
    OLLAMA_EMBEDDINGS_MODEL: str = os.getenv(
        "OLLAMA_EMBEDDINGS_MODEL", "nomic-embed-text"
    )
    
    HF_EMBEDDINGS_MODEL: str = os.getenv("HF_EMBEDDINGS_MODEL", "BAAI/bge-m3")
    HF_DEVICE: str = os.getenv("HF_DEVICE", "cpu")  # Change to "cuda" in .env if you have an NVIDIA GPU

    # --- Google Gemini (API Free Tier) ---
    GOOGLE_API_KEY: Optional[str] = os.getenv("GOOGLE_API_KEY", None)  # Optional, but required if using Google embeddings
    GOOGLE_EMBEDDINGS_MODEL: str = os.getenv("GOOGLE_EMBEDDINGS_MODEL", "models/text-embedding-004")
    GOOGLE_CHAT_MODEL: str = os.getenv("GOOGLE_CHAT_MODEL", "models/gemini-1.5-flash:001")
    GOOGLE_TITLE_MODEL: str = os.getenv("GOOGLE_TITLE_MODEL", "models/gemini-1.5-flash:001")
      # Added this line

    class Config:
        env_file = ".env"


settings = Settings()
