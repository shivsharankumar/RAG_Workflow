import os
import time
from fastapi import APIRouter, HTTPException
from app.models.schemas import GenerateRequest
from app.state import pipeline

router = APIRouter()


def _mock_generate(query: str, context: list[str]) -> dict:
    """Simple mock generation that summarizes context."""
    combined = " ".join(context)
    words = combined.split()
    # Create a mock response based on context
    if len(words) > 50:
        summary = " ".join(words[:50]) + "..."
    else:
        summary = combined

    return {
        "response": (
            f"Based on the provided context, here is a synthesized answer to your query "
            f"'{query}':\n\n{summary}\n\n"
            f"[This is a mock response. Set OPENAI_API_KEY environment variable and "
            f"select a GPT model for real LLM generation.]"
        ),
        "model": "mock",
        "token_usage": {"prompt_tokens": len(combined.split()), "completion_tokens": len(summary.split()), "total_tokens": len(combined.split()) + len(summary.split())},
        "confidence": 0.75,
        "iterations": 1,
    }


async def _openai_generate(query: str, context: list[str], model: str) -> dict:
    """Generate using OpenAI API."""
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    context_text = "\n\n---\n\n".join(context)
    messages = [
        {"role": "system", "content": "You are a helpful assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain enough information, say so."},
        {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {query}"},
    ]

    response = await client.chat.completions.create(model=model, messages=messages, temperature=0.3, max_tokens=1000)

    choice = response.choices[0]
    usage = response.usage

    return {
        "response": choice.message.content,
        "model": model,
        "token_usage": {
            "prompt_tokens": usage.prompt_tokens,
            "completion_tokens": usage.completion_tokens,
            "total_tokens": usage.total_tokens,
        },
        "confidence": 0.85 if choice.finish_reason == "stop" else 0.6,
        "iterations": 1,
    }


@router.post("")
async def generate(req: GenerateRequest):
    if not req.context_chunks:
        raise HTTPException(status_code=400, detail="No context chunks provided.")

    pipeline.status = "running"
    pipeline.current_stage = "generation"
    pipeline.log("generation", f"Generating response with model '{req.model}'")
    pipeline.log("generation", f"Context: {len(req.context_chunks)} chunks")

    start_time = time.time()

    try:
        if req.model == "mock" or not os.environ.get("OPENAI_API_KEY"):
            result = _mock_generate(req.query, req.context_chunks)
            if req.model != "mock" and not os.environ.get("OPENAI_API_KEY"):
                pipeline.log("generation", "Warning: OPENAI_API_KEY not set, falling back to mock generation")
        else:
            result = await _openai_generate(req.query, req.context_chunks, req.model)
    except Exception as e:
        pipeline.log("generation", f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    elapsed = time.time() - start_time
    pipeline.log("generation", f"Generated response in {elapsed:.2f}s ({result['token_usage']['total_tokens']} tokens)")
    pipeline.status = "completed"
    pipeline.current_stage = "generation"

    return {
        "query": req.query,
        "response": result["response"],
        "model": result["model"],
        "token_usage": result["token_usage"],
        "confidence": result["confidence"],
        "iterations": result["iterations"],
        "log": pipeline.generation_log,
    }
