from app.core.config import settings
from langchain_openai import OpenAIEmbeddings
from langchain_ollama import OllamaEmbeddings
from langchain_community.embeddings import DashScopeEmbeddings
# Add these for the free options:
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import GoogleGenerativeAIEmbeddings


class EmbeddingsFactory:
    @staticmethod
    def create():
        embeddings_provider = settings.EMBEDDINGS_PROVIDER.lower()

        # --- PAID / SEMI-PAID PROVIDERS ---
        if embeddings_provider == "openai":
            print("Using OpenAI Embeddings")
            return OpenAIEmbeddings(
                api_key=settings.OPENAI_API_KEY,
                model=settings.OPENAI_EMBEDDINGS_MODEL
            )
        
        # --- 100% LOCAL & FREE (Uses your CPU/GPU) ---
        elif embeddings_provider == "huggingface":
            print("Using HuggingFace Embeddings (Local)")
            # Downloads the model to your machine. 
            # Model name example: "BAAI/bge-m3" or "sentence-transformers/all-MiniLM-L6-v2"
            return HuggingFaceEmbeddings(
                model_name=settings.HF_EMBEDDINGS_MODEL,
                model_kwargs={'device': 'cpu'} # Change to 'cuda' if you have a GPU
            )

        elif embeddings_provider == "ollama":
            print("Using Ollama Embeddings (Local)")
            return OllamaEmbeddings(
                model=settings.OLLAMA_EMBEDDINGS_MODEL,
                base_url=settings.OLLAMA_API_BASE
            )

        # --- CLOUD FREE TIER (Requires API Key, but has free limit) ---
        elif embeddings_provider == "google":
            # Model: "models/text-embedding-004"
            print("Using Google Generative AI Embeddings")
            return GoogleGenerativeAIEmbeddings(
                model=settings.GOOGLE_EMBEDDINGS_MODEL,
                google_api_key=settings.GOOGLE_API_KEY
            )

        else:
            raise ValueError(f"Unsupported embeddings provider: {embeddings_provider}")