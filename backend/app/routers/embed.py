from fastapi import APIRouter, HTTPException
from app.models.schemas import EmbedRequest
from app.state import pipeline

router = APIRouter()

_model_cache: dict = {}


def _get_model(model_name: str):
    if model_name not in _model_cache:
        from sentence_transformers import SentenceTransformer
        _model_cache[model_name] = SentenceTransformer(model_name)
    return _model_cache[model_name]


@router.post("")
async def generate_embeddings(req: EmbedRequest):
    if not pipeline.chunks:
        raise HTTPException(status_code=400, detail="No chunks available. Run chunking first.")

    pipeline.status = "running"
    pipeline.current_stage = "embedding"
    pipeline.embedding_model = req.model
    pipeline.log("embedding", f"Generating embeddings with model '{req.model}'")
    pipeline.log("embedding", f"Processing {len(pipeline.chunks)} chunks...")

    try:
        model = _get_model(req.model)
        texts = [c["text"] for c in pipeline.chunks]
        embs = model.encode(texts, show_progress_bar=False)
        pipeline.embeddings = embs.tolist()
        pipeline.embedding_dim = len(pipeline.embeddings[0]) if pipeline.embeddings else 0
        pipeline.log("embedding", f"Generated {len(pipeline.embeddings)} embeddings (dim={pipeline.embedding_dim})")
    except Exception as e:
        pipeline.log("embedding", f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    # Return a preview (first 5 values of each embedding)
    preview = [emb[:5] for emb in pipeline.embeddings]
    return {
        "count": len(pipeline.embeddings),
        "dimensions": pipeline.embedding_dim,
        "model": req.model,
        "preview": preview,
        "log": pipeline.embedding_log,
    }


@router.get("/status")
async def embedding_status():
    return {
        "count": len(pipeline.embeddings),
        "dimensions": pipeline.embedding_dim,
        "model": pipeline.embedding_model,
        "log": pipeline.embedding_log,
    }
