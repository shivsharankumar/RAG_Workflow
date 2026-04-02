import { useState, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import IngestionPanel from "./components/IngestionPanel";
import ChunkingPanel from "./components/ChunkingPanel";
import EmbeddingPanel from "./components/EmbeddingPanel";
import VectorStorePanel from "./components/VectorStorePanel";
import QueryPanel from "./components/QueryPanel";
import GenerationPanel from "./components/GenerationPanel";

const STEPS = [
  { id: "ingestion",    icon: "⬆", label: "Ingest",        color: "blue" },
  { id: "chunking",     icon: "✂", label: "Chunk",         color: "cyan" },
  { id: "embedding",    icon: "⦿", label: "Embed",         color: "violet" },
  { id: "vector_store", icon: "▦", label: "Store",         color: "amber" },
  { id: "query",        icon: "⌕", label: "Retrieve",      color: "emerald" },
  { id: "generation",   icon: "✨", label: "Generate",      color: "pink" },
];

const COLOR_MAP = {
  blue:    { active: "from-blue-500 to-blue-600",    ring: "ring-blue-500/40",    bg: "bg-blue-500/10",   text: "text-blue-400",    line: "bg-blue-500" },
  cyan:    { active: "from-cyan-500 to-cyan-600",    ring: "ring-cyan-500/40",    bg: "bg-cyan-500/10",   text: "text-cyan-400",    line: "bg-cyan-500" },
  violet:  { active: "from-violet-500 to-violet-600",ring: "ring-violet-500/40",  bg: "bg-violet-500/10", text: "text-violet-400",  line: "bg-violet-500" },
  amber:   { active: "from-amber-500 to-amber-600",  ring: "ring-amber-500/40",   bg: "bg-amber-500/10",  text: "text-amber-400",   line: "bg-amber-500" },
  emerald: { active: "from-emerald-500 to-emerald-600",ring:"ring-emerald-500/40", bg: "bg-emerald-500/10",text: "text-emerald-400", line: "bg-emerald-500" },
  pink:    { active: "from-pink-500 to-pink-600",    ring: "ring-pink-500/40",    bg: "bg-pink-500/10",   text: "text-pink-400",    line: "bg-pink-500" },
};

const DESCRIPTIONS = {
  dashboard:    "Overview of your pipeline status and quick controls.",
  ingestion:    "Upload your documents into the pipeline for processing.",
  chunking:     "Split documents into smaller text chunks for retrieval.",
  embedding:    "Convert text chunks into numerical vector representations.",
  vector_store: "Index embeddings in a vector database for fast search.",
  query:        "Search for relevant chunks using semantic similarity.",
  generation:   "Generate a grounded answer using retrieved context + LLM.",
};

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastQuery, setLastQuery] = useState("");
  const [retrievedChunks, setRetrievedChunks] = useState([]);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleQueryResults = useCallback((query, results) => {
    setLastQuery(query);
    setRetrievedChunks(results);
  }, []);

  const renderPanel = () => {
    switch (tab) {
      case "dashboard":
        return <Dashboard key={refreshKey} onRefresh={handleRefresh} onNavigate={setTab} />;
      case "ingestion":
        return <IngestionPanel key={refreshKey} />;
      case "chunking":
        return <ChunkingPanel key={refreshKey} />;
      case "embedding":
        return <EmbeddingPanel key={refreshKey} />;
      case "vector_store":
        return <VectorStorePanel key={refreshKey} />;
      case "query":
        return <QueryPanel key={refreshKey} onResults={handleQueryResults} />;
      case "generation":
        return (
          <GenerationPanel
            key={refreshKey}
            query={lastQuery}
            retrievedChunks={retrievedChunks}
          />
        );
      default:
        return null;
    }
  };

  const activeStepIdx = STEPS.findIndex((s) => s.id === tab);
  const currentStep = STEPS[activeStepIdx];
  const isDashboard = tab === "dashboard";

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-transparent" />
        <div className="relative px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTab("dashboard")}
              className={`text-2xl font-bold tracking-tight transition-opacity hover:opacity-80 ${
                isDashboard ? "" : "cursor-pointer"
              }`}
            >
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">RAG</span>
              <span className="text-gray-100 ml-1">Pipeline</span>
            </button>
            <span className="text-[10px] font-medium bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">INTERACTIVE DEMO</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Backend connected
          </div>
        </div>
      </header>

      {/* Pipeline flow stepper */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const isActive = step.id === tab;
              const isPast = activeStepIdx > i;
              const c = COLOR_MAP[step.color];
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                  <button
                    onClick={() => setTab(step.id)}
                    className={`relative flex flex-col items-center group transition-all duration-200 ${
                      isActive ? "scale-105" : "hover:scale-105"
                    }`}
                  >
                    {/* Circle */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br ${c.active} text-white shadow-lg shadow-${step.color}-500/20 ring-2 ${c.ring}`
                        : isPast
                          ? `${c.bg} ${c.text}`
                          : "bg-gray-800/80 text-gray-600 group-hover:bg-gray-800 group-hover:text-gray-400"
                    }`}>
                      {isPast ? "✓" : step.icon}
                    </div>
                    {/* Label */}
                    <span className={`mt-1.5 text-[11px] font-medium transition-colors ${
                      isActive ? c.text : isPast ? "text-gray-400" : "text-gray-600 group-hover:text-gray-400"
                    }`}>
                      {step.label}
                    </span>
                    {/* Step number */}
                    <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                      isActive
                        ? "bg-white text-gray-900"
                        : isPast
                          ? `${c.bg} ${c.text}`
                          : "bg-gray-800 text-gray-600"
                    }`}>
                      {i + 1}
                    </span>
                  </button>
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-2 rounded-full relative overflow-hidden bg-gray-800">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                          isPast ? `${c.line} w-full` : isActive ? `${c.line} w-1/2 opacity-50` : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main content — full width, no sidebar */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Page title + description (for pipeline steps) */}
        {!isDashboard && currentStep && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${COLOR_MAP[currentStep.color].active} text-white text-sm font-bold flex items-center justify-center`}>
                {activeStepIdx + 1}
              </span>
              <h2 className="text-xl font-bold tracking-tight">{currentStep.label}</h2>
            </div>
            <p className="text-sm text-gray-500 ml-11">{DESCRIPTIONS[tab]}</p>
          </div>
        )}

        {renderPanel()}

        {/* Prev / Next navigation */}
        {!isDashboard && (
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-800">
            <button
              onClick={() => setTab(activeStepIdx > 0 ? STEPS[activeStepIdx - 1].id : "dashboard")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800/60 transition-all"
            >
              <span>←</span>
              {activeStepIdx > 0 ? STEPS[activeStepIdx - 1].label : "Dashboard"}
            </button>
            {activeStepIdx < STEPS.length - 1 && (
              <button
                onClick={() => setTab(STEPS[activeStepIdx + 1].id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all bg-gradient-to-r ${COLOR_MAP[STEPS[activeStepIdx + 1].color].active} text-white hover:opacity-90 shadow-lg shadow-${STEPS[activeStepIdx + 1].color}-500/10`}
              >
                {STEPS[activeStepIdx + 1].label}
                <span>→</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
