import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const uploadFile = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/ingest", form);
};

export const loadSampleData = () => api.post("/ingest/sample");
export const listDocuments = () => api.get("/ingest/documents");

export const chunkDocument = (filename, chunkSize, chunkOverlap) =>
  api.post("/chunk", { filename, chunk_size: chunkSize, chunk_overlap: chunkOverlap });
export const getChunks = () => api.get("/chunk/chunks");

export const generateEmbeddings = (model, dimensions) =>
  api.post("/embed", { model, dimensions });
export const getEmbeddingStatus = () => api.get("/embed/status");

export const storeVectors = (algorithm, distanceMetric, efConstruction) =>
  api.post("/store", { algorithm, distance_metric: distanceMetric, ef_construction: efConstruction });
export const getStoreStatus = () => api.get("/store/status");

export const querySearch = (query, topK) =>
  api.post("/query", { query, top_k: topK });

export const generateResponse = (query, contextChunks, model) =>
  api.post("/generate", { query, context_chunks: contextChunks, model });

export const getDashboardStatus = () => api.get("/dashboard/status");
export const resetPipeline = () => api.post("/dashboard/reset");
