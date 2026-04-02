from fastapi import APIRouter, UploadFile, File, HTTPException
from app.state import pipeline

router = APIRouter()


@router.post("")
async def ingest_file(file: UploadFile = File(...)):
    try:
        content = await file.read()
        filename = file.filename or "unknown"
        pipeline.documents[filename] = content
        pipeline.log("ingestion", f"Uploaded: {filename} ({len(content)} bytes)")
        pipeline.status = "running"
        pipeline.current_stage = "ingestion"
        return {
            "filename": filename,
            "size": len(content),
            "status": "uploaded",
        }
    except Exception as e:
        pipeline.log("ingestion", f"Error uploading {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents")
async def list_documents():
    docs = [
        {"filename": name, "size": len(data)}
        for name, data in pipeline.documents.items()
    ]
    return {"documents": docs, "log": pipeline.ingestion_log}


@router.post("/sample")
async def load_sample_data():
    """Load sample documents for quick demo."""
    samples = {
        "machine_learning.txt": (
            "Machine learning is a subset of artificial intelligence that focuses on "
            "building systems that learn from data. Supervised learning uses labeled "
            "datasets to train algorithms to classify data or predict outcomes. "
            "Unsupervised learning finds hidden patterns in unlabeled data. "
            "Reinforcement learning trains agents to make sequences of decisions by "
            "rewarding desired behaviors. Deep learning uses neural networks with many "
            "layers to model complex patterns. Common applications include image "
            "recognition, natural language processing, recommendation systems, and "
            "autonomous vehicles. Key concepts include overfitting, regularization, "
            "gradient descent, and cross-validation."
        ),
        "python_programming.txt": (
            "Python is a high-level, interpreted programming language known for its "
            "readability and versatility. It supports multiple paradigms including "
            "object-oriented, functional, and procedural programming. Python's standard "
            "library provides modules for file I/O, regular expressions, networking, "
            "and web development. Popular frameworks include Django and Flask for web "
            "development, NumPy and Pandas for data science, and PyTorch and TensorFlow "
            "for machine learning. Python uses dynamic typing and garbage collection. "
            "Virtual environments isolate project dependencies. The Python Package Index "
            "(PyPI) hosts thousands of third-party packages."
        ),
        "cloud_computing.txt": (
            "Cloud computing delivers computing services over the internet, including "
            "servers, storage, databases, networking, and software. The three main "
            "service models are Infrastructure as a Service (IaaS), Platform as a "
            "Service (PaaS), and Software as a Service (SaaS). Major providers include "
            "AWS, Azure, and Google Cloud Platform. Key concepts include scalability, "
            "elasticity, pay-as-you-go pricing, and high availability. Containerization "
            "with Docker and orchestration with Kubernetes have become standard practices. "
            "Serverless computing allows running code without managing servers. Cloud "
            "security involves shared responsibility models and compliance frameworks."
        ),
    }
    for name, text in samples.items():
        pipeline.documents[name] = text.encode("utf-8")
        pipeline.log("ingestion", f"Loaded sample: {name} ({len(text)} bytes)")
    return {"loaded": list(samples.keys()), "count": len(samples)}
