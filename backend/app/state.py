"""Shared in-memory pipeline state for all stages."""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any
import time


def _ts() -> str:
    return time.strftime("%Y-%m-%d %H:%M:%S")


@dataclass
class PipelineState:
    # Pipeline status: "ready" | "running" | "completed"
    status: str = "ready"
    current_stage: str = "idle"

    # --- Ingestion ---
    documents: dict[str, bytes] = field(default_factory=dict)  # filename -> content
    ingestion_log: list[str] = field(default_factory=list)

    # --- Chunking ---
    chunks: list[dict[str, Any]] = field(default_factory=list)
    # Each chunk: {"chunk_id": str, "filename": str, "text": str}
    chunking_log: list[str] = field(default_factory=list)

    # --- Embedding ---
    embeddings: list[list[float]] = field(default_factory=list)
    embedding_dim: int = 0
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_log: list[str] = field(default_factory=list)

    # --- Vector Store ---
    faiss_index: Any = None
    index_algorithm: str = "FlatL2"
    distance_metric: str = "L2"
    vector_metadata: list[dict[str, str]] = field(default_factory=list)
    # Each: {"vector_id": str, "filename": str, "chunk_id": str}
    vector_store_log: list[str] = field(default_factory=list)

    # --- Retrieval ---
    retrieval_log: list[str] = field(default_factory=list)

    # --- Generation ---
    generation_log: list[str] = field(default_factory=list)

    def log(self, stage: str, message: str) -> None:
        entry = f"[{_ts()}] {message}"
        log_map = {
            "ingestion": self.ingestion_log,
            "chunking": self.chunking_log,
            "embedding": self.embedding_log,
            "vector_store": self.vector_store_log,
            "retrieval": self.retrieval_log,
            "generation": self.generation_log,
        }
        if stage in log_map:
            log_map[stage].append(entry)

    def reset(self) -> None:
        self.status = "ready"
        self.current_stage = "idle"
        self.documents.clear()
        self.ingestion_log.clear()
        self.chunks.clear()
        self.chunking_log.clear()
        self.embeddings.clear()
        self.embedding_dim = 0
        self.embedding_log.clear()
        self.faiss_index = None
        self.vector_metadata.clear()
        self.vector_store_log.clear()
        self.retrieval_log.clear()
        self.generation_log.clear()


pipeline = PipelineState()
