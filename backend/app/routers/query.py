import numpy as np
from fastapi import APIRouter, HTTPException
from app.models.schemas import QueryRequest
from app.state import pipeline

router = APIRouter()


@router.post("")
async def search(req: QueryRequest):
    if pipeline.faiss_index is None:
        raise HTTPException(status_code=400, detail="Vector store not built. Run store step first.")

    pipeline.status = "running"
    pipeline.current_stage = "retrieval"
    pipeline.log("retrieval", f"Query: '{req.query}' (top_k={req.top_k})")

    # Embed the query
    from app.routers.embed import _get_model
    pipeline.log("retrieval", f"Embedding query with model '{pipeline.embedding_model}'")
    model = _get_model(pipeline.embedding_model)
    query_emb = model.encode([req.query], show_progress_bar=False)
    query_vec = np.array(query_emb, dtype="float32")

    # Normalize if cosine
    if pipeline.distance_metric == "cosine":
        norm = np.linalg.norm(query_vec, axis=1, keepdims=True)
        norm[norm == 0] = 1
        query_vec = query_vec / norm

    pipeline.log("retrieval", "Searching FAISS index...")
    top_k = min(req.top_k, pipeline.faiss_index.ntotal)
    distances, indices = pipeline.faiss_index.search(query_vec, top_k)

    results = []
    for rank, (idx, dist) in enumerate(zip(indices[0], distances[0])):
        if idx < 0:
            continue
        chunk = pipeline.chunks[idx]
        results.append({
            "rank": rank + 1,
            "chunk_id": chunk["chunk_id"],
            "filename": chunk["filename"],
            "text": chunk["text"],
            "distance": float(dist),
        })

    pipeline.log("retrieval", f"Retrieved {len(results)} chunks")

    return {
        "query": req.query,
        "results": results,
        "log": pipeline.retrieval_log,
    }
