import { useState, useEffect } from "react";
import { storeVectors, getStoreStatus } from "../api/client";
import LogPanel from "./LogPanel";

export default function VectorStorePanel() {
  const [algorithm, setAlgorithm] = useState("FlatL2");
  const [metric, setMetric] = useState("L2");
  const [efConstruction, setEfConstruction] = useState(200);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStoreStatus().then(({ data }) => {
      setLogs(data.log);
      if (data.total_vectors > 0) setResult(data);
    });
  }, []);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await storeVectors(algorithm, metric, efConstruction);
      setResult(data);
      setLogs(data.log);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Tutorial tip */}
      <div className="flex gap-3 items-start p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
        <span className="text-lg mt-0.5">📍</span>
        <div>
          <p className="text-sm text-amber-300 font-medium">What is a Vector Store?</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Embeddings are indexed in a vector database (FAISS) for fast similarity search.
            Flat = exact but slower, HNSW = approximate but much faster at scale.
          </p>
        </div>
      </div>

      {/* Config card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Indexing Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all"
            >
              <option value="FlatL2">Flat (Exact Search)</option>
              <option value="HNSW">HNSW (Approximate)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Distance Metric</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all"
            >
              <option value="L2">L2 (Euclidean)</option>
              <option value="cosine">Cosine Similarity</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
              ef_construction: <span className="text-indigo-400 font-bold">{efConstruction}</span>
            </label>
            <input
              type="range" min={50} max={500} step={10}
              value={efConstruction}
              onChange={(e) => setEfConstruction(Number(e.target.value))}
              className="w-full accent-indigo-500"
              disabled={algorithm !== "HNSW"}
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
              <span>50</span><span>500</span>
            </div>
            {algorithm !== "HNSW" && <p className="text-[10px] text-gray-600 mt-1">Select HNSW to enable this param</p>}
          </div>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
        >
          {loading ? "⏳ Indexing..." : "▦ Build Vector Store"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-3">
          {/* Total vectors badge */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/5 border border-green-500/20">
            <span className="text-green-400 text-lg">✓</span>
            <span className="text-sm">
              <span className="text-green-400 font-bold">{result.total_vectors}</span>
              <span className="text-gray-400"> vectors indexed</span>
            </span>
            <span className="ml-auto text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
              {result.algorithm} · {result.distance_metric}
            </span>
          </div>

          {/* Metadata table */}
          <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-gray-800">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 bg-gray-900/50 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-4">vector_id</th>
                  <th className="text-left py-2 px-4">filename</th>
                  <th className="text-left py-2 px-4">chunk_id</th>
                </tr>
              </thead>
              <tbody>
                {result.metadata?.map((m, i) => (
                  <tr key={m.vector_id} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="py-2 px-4 font-mono text-indigo-400 text-xs">{m.vector_id}</td>
                    <td className="py-2 px-4 text-gray-300">{m.filename}</td>
                    <td className="py-2 px-4 text-gray-500 text-xs font-mono">{m.chunk_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LogPanel title="vector_store.log" logs={logs} />
    </div>
  );
}
