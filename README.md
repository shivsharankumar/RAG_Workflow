# RAG Pipeline — Interactive UI

A full-stack Retrieval-Augmented Generation pipeline with step-by-step visualization.

## Stack

- **Backend**: FastAPI + FAISS + sentence-transformers
- **Frontend**: React + Vite + Tailwind CSS

## Quick Start

### 1. Install dependencies

```bash
# Backend
pip install -r backend/requirements.txt

# Frontend
npm install --prefix frontend
```

### 2. Start the backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

### 3. Start the frontend

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies API calls to the backend.

## Pipeline Stages

1. **Ingestion** — Upload files or load sample data
2. **Chunking** — Split documents with configurable chunk size/overlap
3. **Embedding** — Generate embeddings using sentence-transformers
4. **Vector Store** — Index in FAISS (Flat or HNSW, L2 or cosine)
5. **Query & Retrieval** — Semantic search with top-k retrieval
6. **Grounded Generation** — LLM response with confidence and token metrics

## LLM Generation

By default, generation uses a **mock mode** that summarizes retrieved context. To use OpenAI:

```bash
export OPENAI_API_KEY=your-key-here
```

Then select `gpt-3.5-turbo` or `gpt-4` in the Generation panel.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/ingest` | POST | Upload a document |
| `/ingest/documents` | GET | List uploaded documents |
| `/ingest/sample` | POST | Load sample data |
| `/chunk` | POST | Chunk a document |
| `/embed` | POST | Generate embeddings |
| `/store` | POST | Build FAISS index |
| `/query` | POST | Semantic search |
| `/generate` | POST | LLM generation |
| `/dashboard/status` | GET | Pipeline status |
| `/dashboard/reset` | POST | Reset pipeline |
# RAG_Workflow
