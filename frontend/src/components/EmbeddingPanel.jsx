import { useState, useEffect } from "react";
import { generateEmbeddings, getEmbeddingStatus, getChunks } from "../api/client";
import LogPanel from "./LogPanel";

const MODELS = ["all-MiniLM-L6-v2", "all-mpnet-base-v2", "paraphrase-MiniLM-L6-v2"];

export default function EmbeddingPanel() {
  const [model, setModel] = useState(MODELS[0]);
  const [dims, setDims] = useState("");
  const [chunks, setChunks] = useState([]);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getChunks().then(({ data }) => setChunks(data.chunks));
    getEmbeddingStatus().then(({ data }) => {
      setLogs(data.log);
      if (data.count > 0) setResult({ count: data.count, dimensions: data.dimensions });
    });
  }, []);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await generateEmbeddings(model, dims ? Number(dims) : null);
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
      <div className="flex gap-3 items-start p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
        <span className="text-lg mt-0.5">🧮</span>
        <div>
          <p className="text-sm text-violet-300 font-medium">What are Embeddings?</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Embeddings convert text into dense numerical vectors that capture semantic meaning.
            Similar text produces similar vectors, enabling semantic search.
          </p>
        </div>
      </div>

      {/* Config card */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Embedding Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all"
            >
              {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Dimensions (optional)</label>
            <input
              value={dims}
              onChange={(e) => setDims(e.target.value)}
              placeholder="Auto-detected"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all"
            />
          </div>
        </div>

        {/* Chunk readiness indicator */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
          chunks.length > 0
            ? "bg-green-500/5 border border-green-500/20 text-green-400"
            : "bg-yellow-500/5 border border-yellow-500/20 text-yellow-400"
        }`}>
          <span>{chunks.length > 0 ? "✓" : "⏳"}</span>
          {chunks.length > 0
            ? `${chunks.length} chunks ready for embedding`
            : "Awaiting chunks — run the Chunking step first"}
        </div>

        <button
          onClick={run}
          disabled={loading || chunks.length === 0}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
        >
          {loading ? "⏳ Generating..." : "⦿ Generate Embeddings"}
        </button>
      </div>

      {/* Embedding preview heatmap */}
      {result && result.preview && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Embedding Matrix ({result.count} × {result.dimensions})
            </h4>
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{backgroundColor:"rgba(99,102,241,0.6)"}} /> Positive</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{backgroundColor:"rgba(239,68,68,0.6)"}} /> Negative</span>
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-800">
            <table className="text-xs font-mono w-full">
              <thead>
                <tr className="text-gray-500 bg-gray-900/50">
                  <th className="pr-3 pl-3 py-2 text-left">#</th>
                  {result.preview[0]?.map((_, i) => (
                    <th key={i} className="px-2 py-2 text-right">d{i}</th>
                  ))}
                  <th className="px-2 py-2 text-gray-700">…</th>
                </tr>
              </thead>
              <tbody>
                {result.preview.slice(0, 15).map((row, i) => (
                  <tr key={i} className="text-gray-300 border-t border-gray-800/50">
                    <td className="pr-3 pl-3 py-1.5 text-gray-600 font-medium">{i}</td>
                    {row.map((v, j) => {
                      const abs = Math.abs(v);
                      const intensity = Math.min(abs * 5, 1);
                      const bg = v >= 0
                        ? `rgba(99, 102, 241, ${intensity})`
                        : `rgba(239, 68, 68, ${intensity})`;
                      return (
                        <td key={j} className="px-2 py-1.5 text-right rounded" style={{ backgroundColor: bg }}>
                          {v.toFixed(4)}
                        </td>
                      );
                    })}
                    <td className="px-2 py-1.5 text-gray-700">…</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-600 mt-1.5">Showing first 5 dimensions of each embedding. Full dimension: {result.dimensions}.</p>
        </div>
      )}

      <LogPanel title="embedding.log" logs={logs} />
    </div>
  );
}
