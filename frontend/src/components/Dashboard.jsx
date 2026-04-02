import { useState, useEffect } from "react";
import { getDashboardStatus, resetPipeline, loadSampleData } from "../api/client";

const STAGES = [
  { id: "ingestion", label: "Ingest", icon: "⬆", color: "from-blue-500 to-blue-600" },
  { id: "chunking", label: "Chunk", icon: "✂", color: "from-cyan-500 to-cyan-600" },
  { id: "embedding", label: "Embed", icon: "⦿", color: "from-violet-500 to-violet-600" },
  { id: "vector_store", label: "Store", icon: "▦", color: "from-amber-500 to-amber-600" },
  { id: "retrieval", label: "Retrieve", icon: "⌕", color: "from-emerald-500 to-emerald-600" },
  { id: "generation", label: "Generate", icon: "✨", color: "from-pink-500 to-pink-600" },
];

const statusConfig = {
  ready: { color: "bg-blue-500", ring: "ring-blue-500/30", text: "Ready" },
  running: { color: "bg-yellow-500", ring: "ring-yellow-500/30", text: "Running", pulse: true },
  completed: { color: "bg-green-500", ring: "ring-green-500/30", text: "Completed" },
};

const STAT_ICONS = ["📄", "🧩", "🧮", "📍"];
const STAT_COLORS = [
  "from-blue-600/20 to-blue-700/10 border-blue-500/20",
  "from-cyan-600/20 to-cyan-700/10 border-cyan-500/20",
  "from-violet-600/20 to-violet-700/10 border-violet-500/20",
  "from-amber-600/20 to-amber-700/10 border-amber-500/20",
];

export default function Dashboard({ onRefresh, onNavigate }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const { data } = await getDashboardStatus();
      setStatus(data);
    } catch { }
  };

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 3000);
    return () => clearInterval(id);
  }, []);

  const handleReset = async () => {
    setLoading(true);
    await resetPipeline();
    await fetchStatus();
    onRefresh?.();
    setLoading(false);
  };

  const handleSample = async () => {
    setLoading(true);
    await loadSampleData();
    await fetchStatus();
    onRefresh?.();
    setLoading(false);
  };

  if (!status) {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <span className="w-4 h-4 border-2 border-gray-600 border-t-indigo-400 rounded-full animate-spin" />
        Loading pipeline status...
      </div>
    );
  }

  const stageIdx = STAGES.findIndex((s) => s.id === status.current_stage);
  const sc = statusConfig[status.status] || statusConfig.ready;

  return (
    <div className="space-y-8">
      {/* Welcome card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950/30 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h3 className="text-lg font-bold mb-1">Welcome to the RAG Pipeline Demo</h3>
          <p className="text-sm text-gray-400 max-w-xl">
            This interactive tool walks you through every stage of a Retrieval-Augmented Generation system.
            Follow the 6 steps in order, or load sample data to get started quickly.
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSample}
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
            >
              {loading ? "Loading..." : "⚡ Load Sample Data"}
            </button>
            <button
              onClick={() => onNavigate?.("ingestion")}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm font-medium border border-gray-700 transition-all"
            >
              Start from Step 1
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-5 py-2.5 bg-gray-800/50 hover:bg-red-900/30 hover:border-red-500/30 rounded-xl text-sm font-medium border border-gray-700/50 text-gray-400 hover:text-red-400 disabled:opacity-50 transition-all"
            >
              Reset Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Status banner */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-800">
        <span className={`w-3 h-3 rounded-full ${sc.color} ring-4 ${sc.ring} ${sc.pulse ? "animate-pulse" : ""}`} />
        <span className="text-sm font-semibold">{sc.text}</span>
        <span className="text-gray-600">|</span>
        <span className="text-xs text-gray-400">
          Current stage: <span className="text-gray-200 font-medium">{status.current_stage}</span>
        </span>
      </div>

      {/* Pipeline flow visualization */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Pipeline Flow</h4>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {STAGES.map((s, i) => {
            const isDone = i < stageIdx;
            const isCurrent = s.id === status.current_stage;
            const isPending = i > stageIdx && stageIdx >= 0;
            return (
              <div key={s.id} className="flex items-center">
                <div className={`relative flex flex-col items-center px-3 py-3 rounded-xl transition-all min-w-[90px] ${isCurrent ? "bg-gray-800 ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-500/10" :
                    isDone ? "bg-gray-800/50" : "bg-gray-900/30"
                  }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-1.5 ${isDone ? `bg-gradient-to-br ${s.color} text-white shadow-md` :
                      isCurrent ? "bg-indigo-500/20 text-indigo-300 ring-2 ring-indigo-500/40 animate-pulse" :
                        "bg-gray-800 text-gray-600"
                    }`}>
                    {isDone ? "✓" : s.icon}
                  </div>
                  <span className={`text-xs font-medium ${isDone ? "text-gray-300" : isCurrent ? "text-indigo-300" : "text-gray-600"
                    }`}>{s.label}</span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`w-6 h-0.5 mx-0.5 rounded-full ${isDone ? "bg-gradient-to-r from-green-500 to-green-600" :
                      isCurrent ? "bg-indigo-500/40" : "bg-gray-800"
                    }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Pipeline Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ["Documents", status.documents_count],
            ["Chunks", status.chunks_count],
            ["Embeddings", status.embeddings_count],
            ["Vectors", status.vectors_count],
          ].map(([label, val], i) => (
            <div key={label} className={`rounded-xl p-4 bg-gradient-to-br ${STAT_COLORS[i]} border transition-all hover:scale-[1.02]`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-lg">{STAT_ICONS[i]}</span>
                <span className="text-2xl font-bold">{val}</span>
              </div>
              <div className="text-xs text-gray-400 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
