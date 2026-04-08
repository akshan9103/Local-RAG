import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.api import api_router
from app.api.openapi.api import router as openapi_router
from app.core.config import settings
from app.core.minio import init_minio
from app.core.exceptions import InvalidCredentialsException, invalid_credentials_exception_handler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_exception_handler(InvalidCredentialsException, invalid_credentials_exception_handler)
# CORS Middleware
origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(openapi_router, prefix="/openapi")


@app.on_event("startup")
async def startup_event():
    init_minio()


@app.get("/")
def root():
    return {"message": "Welcome to RAG Web UI API"}


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.VERSION,
    }