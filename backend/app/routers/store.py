import numpy as np
import faiss
from fastapi import APIRouter, HTTPException
from app.models.schemas import StoreRequest
from app.state import pipeline

router = APIRouter()


@router.post("")
async def store_vectors(req: StoreRequest):
    if not pipeline.embeddings:
        raise HTTPException(status_code=400, detail="No embeddings available. Run embedding first.")

    pipeline.status = "running"
    pipeline.current_stage = "vector_store"
    pipeline.index_algorithm = req.algorithm
    pipeline.distance_metric = req.distance_metric

    dim = pipeline.embedding_dim
    vectors = np.array(pipeline.embeddings, dtype="float32")

    # Normalize for cosine similarity
    if req.distance_metric == "cosine":
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1
        vectors = vectors / norms

    pipeline.log("vector_store", f"Building index: algorithm={req.algorithm}, metric={req.distance_metric}, dim={dim}")

    try:
        if req.algorithm == "HNSW":
            index = faiss.IndexHNSWFlat(dim, 32)
            index.hnsw.efConstruction = req.ef_construction
        elif req.distance_metric == "cosine":
            index = faiss.IndexFlatIP(dim)
        else:
            index = faiss.IndexFlatL2(dim)

        index.add(vectors)
        pipeline.faiss_index = index
    except Exception as e:
        pipeline.log("vector_store", f"Error building index: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    pipeline.vector_metadata = []
    for i, chunk in enumerate(pipeline.chunks):
        pipeline.vector_metadata.append({
            "vector_id": f"vec_{i}",
            "filename": chunk["filename"],
            "chunk_id": chunk["chunk_id"],
        })

    pipeline.log("vector_store", f"Indexed {index.ntotal} vectors")

    return {
        "total_vectors": index.ntotal,
        "algorithm": req.algorithm,
        "distance_metric": req.distance_metric,
        "metadata": pipeline.vector_metadata,
        "log": pipeline.vector_store_log,
    }


@router.get("/status")
async def store_status():
    total = pipeline.faiss_index.ntotal if pipeline.faiss_index else 0
    return {
        "total_vectors": total,
        "algorithm": pipeline.index_algorithm,
        "distance_metric": pipeline.distance_metric,
        "metadata": pipeline.vector_metadata,
        "log": pipeline.vector_store_log,
    }
