# 🧠 RAG Intelligence API: Retrieval-Augmented Generation System

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## 📖 Overview

The **RAG Intelligence API** is a high-performance web application designed to bridge the gap between static Large Language Models (LLMs) and dynamic, domain-specific knowledge. Built on **Python** and **FastAPI**, this system allows users to upload custom documents, process them into semantic vectors, and query an LLM that grounds its responses strictly in the provided context.

By utilizing a Retrieval-Augmented Generation (RAG) architecture, this application significantly reduces AI hallucinations, ensures traceability of facts, and provides a scalable backend for intelligent document processing and enterprise search solutions.

## ✨ Key Features

*   **⚡ High-Speed API Engine:** Built with FastAPI, ensuring asynchronous request handling, automatic interactive documentation (Swagger UI), and rapid response times.
*   **📚 Dynamic Document Ingestion:** Upload text, PDF, or markdown files. The system automatically parses, cleans, and chunks the data for optimal embedding.
*   **🧩 Intelligent Chunking & Overlap:** Implements sliding-window chunking strategies to preserve context across paragraph boundaries, ensuring the LLM receives cohesive information.
*   **🔍 Semantic Vector Search:** Converts text chunks into high-dimensional embeddings and retrieves the most mathematically relevant context using cosine similarity.
*   **💬 Context-Aware Generation:** Constructs optimized prompts combining the user's query with the retrieved vector context to generate highly accurate, grounded answers.

---

## 🏗️ System Architecture & Data Flow

The application follows a two-phase pipeline: **Ingestion** and **Retrieval/Generation**.

### 1. Ingestion Pipeline (Data Preparation)
1.  **Upload:** User submits a document via the `/api/v1/upload` endpoint.
2.  **Parsing:** Text is extracted and normalized (removing special characters, standardizing formatting).
3.  **Chunking:** Text is split into manageable tokens (e.g., 500-token chunks with a 50-token overlap).
4.  **Embedding:** An embedding model translates chunks into vector representations.
5.  **Storage:** Vectors and their original text metadata are stored in the Vector Database.

### 2. Retrieval Pipeline (Query Execution)
1.  **Query:** User sends a natural language question via the `/api/v1/query` endpoint.
2.  **Query Embedding:** The question is converted into a vector using the *same* embedding model.
3.  **Similarity Search:** The Vector Database returns the top *K* most relevant text chunks.
4.  **Prompt Assembly:** The system merges the context chunks and the user's query into a strict instruction template.
5.  **Generation:** The LLM processes the prompt and returns a synthesized, fact-based answer.

---

## 🛠️ Technology Stack

*   **Core Framework:** Python 3.8+
*   **Web Framework:** FastAPI (with Uvicorn ASGI server)
*   **LLM Integration:**  Llama3 / Gemini
*   **Embedding Model:** HuggingFace MiniLM / OpenAI Ada
*   **Vector Database:** ChromaDB
*   **Document Processing:** LangChain / PyPDF2 / BeautifulSoup

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
*   Python 3.8 or higher
*   `pip` (Python package installer)
*   Git

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/akshan9103/Local-RAG.git](https://github.com/akshan9103/Local-RAG.git)
    cd rag-fastapi-project
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your necessary API keys and database URIs:
    ```env
    # .env file
    LLM_API_KEY=your_api_key_here
    EMBEDDING_API_KEY=your_embedding_key_here
    VECTOR_DB_URL=your_database_url_here
    ```

### Running the Application

Start the FastAPI server using Uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
