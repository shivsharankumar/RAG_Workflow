from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ingest, chunk, embed, store, query, generate, dashboard

app = FastAPI(title="RAG Pipeline API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest.router, prefix="/ingest", tags=["Ingestion"])
app.include_router(chunk.router, prefix="/chunk", tags=["Chunking"])
app.include_router(embed.router, prefix="/embed", tags=["Embedding"])
app.include_router(store.router, prefix="/store", tags=["Vector Store"])
app.include_router(query.router, prefix="/query", tags=["Query"])
app.include_router(generate.router, prefix="/generate", tags=["Generation"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])


@app.get("/health")
async def health():
    return {"status": "ok"}
