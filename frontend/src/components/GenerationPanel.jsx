import { useState } from "react";
import { generateResponse } from "../api/client";
import LogPanel from "./LogPanel";

const LLM_MODELS = ["mock", "gpt-5.4-nano", "gpt-5.4-mini", "gpt-5.4"];

export default function GenerationPanel({ query: initialQuery, retrievedChunks }) {
  const [model, setModel] = useState("mock");
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!retrievedChunks?.length) return;
    setLoading(true);
    try {
      const contexts = retrievedChunks.map((c) => c.text);
      const { data } = await generateResponse(initialQuery || "", contexts, model);
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
      <div className="flex gap-3 items-start p-4 rounded-xl bg-pink-500/5 border border-pink-500/20">
        <span className="text-lg mt-0.5">✨</span>
        <div>
          <p className="text-sm text-pink-300 font-medium">Grounded Generation</p>
          <p className="text-xs text-gray-400 mt-0.5">
            The LLM generates an answer grounded in the retrieved context. This prevents hallucination by constraining
            the model to only use information from your documents.
          </p>
        </div>
      </div>

      {/* Config + action */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">LLM Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 transition-all"
            >
              {LLM_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {model === "mock" && (
              <p className="text-[10px] text-gray-600 mt-1">Mock mode: returns a context summary. Set OPENAI_API_KEY for real LLM.</p>
            )}
          </div>
          <div className="flex items-end">
            <button
              onClick={generate}
              disabled={loading || !retrievedChunks?.length}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
            >
              {loading ? "⏳ Generating..." : "✨ Generate Response"}
            </button>
          </div>
        </div>

        {/* Context readiness */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
          retrievedChunks?.length > 0
            ? "bg-green-500/5 border border-green-500/20 text-green-400"
            : "bg-yellow-500/5 border border-yellow-500/20 text-yellow-400"
        }`}>
          <span>{retrievedChunks?.length > 0 ? "✓" : "⏳"}</span>
          {retrievedChunks?.length > 0
            ? `${retrievedChunks.length} context chunks ready`
            : "Run a query in Step 5 first to get retrieved chunks"}
        </div>
      </div>

      {/* Context preview */}
      {retrievedChunks?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Retrieved Context ({retrievedChunks.length} chunks)
          </h4>
          <div className="bg-gray-800/50 border border-gray-800 rounded-xl p-4 max-h-36 overflow-y-auto space-y-2">
            {retrievedChunks.map((c, i) => (
              <div key={i} className="flex gap-2 pb-2 border-b border-gray-800 last:border-0 last:pb-0">
                <span className="text-indigo-400 text-xs font-mono flex-shrink-0">[{c.chunk_id}]</span>
                <span className="text-xs text-gray-400 leading-relaxed">{c.text.slice(0, 150)}...</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated response */}
      {result && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Generated Response</h4>
            <div className="relative bg-gray-800/50 border border-gray-800 rounded-xl p-5">
              <div className="absolute top-3 right-3 text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                {result.model}
              </div>
              <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-200">{result.response}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-4 bg-gradient-to-br from-green-600/10 to-green-700/5 border border-green-500/20 text-center">
              <div className="text-2xl font-bold text-green-400">{(result.confidence * 100).toFixed(0)}%</div>
              <div className="text-xs text-gray-500 mt-1">Confidence</div>
            </div>
            <div className="rounded-xl p-4 bg-gradient-to-br from-blue-600/10 to-blue-700/5 border border-blue-500/20 text-center">
              <div className="text-2xl font-bold text-blue-400">{result.token_usage?.total_tokens}</div>
              <div className="text-xs text-gray-500 mt-1">Token Usage</div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                {result.token_usage?.prompt_tokens}p + {result.token_usage?.completion_tokens}c
              </div>
            </div>
            <div className="rounded-xl p-4 bg-gradient-to-br from-purple-600/10 to-purple-700/5 border border-purple-500/20 text-center">
              <div className="text-2xl font-bold text-purple-400">{result.iterations}</div>
              <div className="text-xs text-gray-500 mt-1">Iterations</div>
            </div>
          </div>
        </div>
      )}

      <LogPanel title="generation.log" logs={logs} />
    </div>
  );
}
