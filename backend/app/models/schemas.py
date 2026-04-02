from pydantic import BaseModel


class ChunkRequest(BaseModel):
    filename: str
    chunk_size: int = 500
    chunk_overlap: int = 50


class EmbedRequest(BaseModel):
    model: str = "all-MiniLM-L6-v2"
    dimensions: int | None = None


class StoreRequest(BaseModel):
    algorithm: str = "FlatL2"       # FlatL2 | FlatIP | HNSW
    distance_metric: str = "L2"     # L2 | cosine
    ef_construction: int = 200      # HNSW param


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class GenerateRequest(BaseModel):
    query: str
    context_chunks: list[str]
    model: str = "mock"  # "mock" | "gpt-5.4-nano" | "gpt-5.4-mini" | "gpt-5.4"
