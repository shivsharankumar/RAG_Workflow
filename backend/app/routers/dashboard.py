from fastapi import APIRouter
from app.state import pipeline

router = APIRouter()


@router.get("/status")
async def get_status():
    return {
        "status": pipeline.status,
        "current_stage": pipeline.current_stage,
        "documents_count": len(pipeline.documents),
        "chunks_count": len(pipeline.chunks),
        "embeddings_count": len(pipeline.embeddings),
        "vectors_count": pipeline.faiss_index.ntotal if pipeline.faiss_index else 0,
    }


@router.post("/reset")
async def reset_pipeline():
    pipeline.reset()
    return {"status": "reset", "message": "Pipeline reset successfully"}
