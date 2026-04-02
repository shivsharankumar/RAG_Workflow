from fastapi import APIRouter, HTTPException
from app.models.schemas import ChunkRequest
from app.state import pipeline

router = APIRouter()


@router.post("")
async def chunk_document(req: ChunkRequest):
    if req.filename not in pipeline.documents:
        raise HTTPException(status_code=404, detail=f"Document '{req.filename}' not found")

    pipeline.status = "running"
    pipeline.current_stage = "chunking"
    pipeline.log("chunking", f"Chunking '{req.filename}' (size={req.chunk_size}, overlap={req.chunk_overlap})")

    text = pipeline.documents[req.filename].decode("utf-8", errors="replace")
    chunks = []
    start = 0
    idx = 0
    while start < len(text):
        end = start + req.chunk_size
        chunk_text = text[start:end]
        chunk = {
            "chunk_id": f"{req.filename}_chunk_{idx}",
            "filename": req.filename,
            "text": chunk_text,
        }
        chunks.append(chunk)
        start += req.chunk_size - req.chunk_overlap
        idx += 1

    # Replace existing chunks for this file, keep others
    pipeline.chunks = [c for c in pipeline.chunks if c["filename"] != req.filename] + chunks
    pipeline.log("chunking", f"Generated {len(chunks)} chunks from '{req.filename}'")

    return {
        "filename": req.filename,
        "chunk_count": len(chunks),
        "chunks": chunks,
        "log": pipeline.chunking_log,
    }


@router.get("/chunks")
async def get_chunks():
    return {"chunks": pipeline.chunks, "log": pipeline.chunking_log}
