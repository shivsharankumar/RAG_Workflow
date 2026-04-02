import { useState } from "react";
import { querySearch } from "../api/client";
import LogPanel from "./LogPanel";

export default function QueryPanel({ onResults }) {
  const [query, setQuery] = useState("");
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await querySearch(query, topK);
      setResults(data.results);
      setLogs(data.log);
      onResults?.(query, data.results);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Tutorial tip */}
      <div className="flex gap-3 items-start p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
        <span className="text-lg mt-0.5">🔍</span>
        <div>
          <p className="text-sm text-emerald-300 font-medium">Semantic Search</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Your query is embedded into the same vector space as the chunks, then the closest matches are retrieved.
            Try asking a natural language question about the uploaded content.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-5 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">⌕</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Enter your query..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-3">
            <label className="text-xs text-gray-500">Top-K</label>
            <input
              type="number" min={1} max={20} value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="w-12 bg-transparent text-sm text-center py-2 focus:outline-none"
            />
          </div>
          <button
            onClick={search}
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
          >
            {loading ? "⏳ Searching..." : "🔍 Search"}
          </button>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Retrieved Chunks ({results.length})
          </h4>
          <div className="space-y-2">
            {results.map((r) => {
              const maxDist = Math.max(...results.map((x) => x.distance), 0.01);
              const relevance = Math.max(0, Math.round((1 - r.distance / maxDist) * 100));
              return (
                <div key={r.chunk_id} className="bg-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                      {r.rank}
                    </span>
                    <span className="text-xs font-mono text-gray-500">{r.chunk_id}</span>
                    <span className="ml-auto flex items-center gap-2">
                      <span className="text-[10px] text-gray-500">distance: {r.distance.toFixed(4)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        relevance > 70 ? "bg-green-500/10 text-green-400" :
                        relevance > 40 ? "bg-yellow-500/10 text-yellow-400" :
                        "bg-red-500/10 text-red-400"
                      }`}>
                        {relevance}% match
                      </span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{r.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <LogPanel title="retrieval.log" logs={logs} />
    </div>
  );
}
