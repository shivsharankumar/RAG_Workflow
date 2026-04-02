import { useState, useEffect } from "react";
import { listDocuments, chunkDocument, getChunks } from "../api/client";
import LogPanel from "./LogPanel";

export default function ChunkingPanel() {
  const [docs, setDocs] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [chunkSize, setChunkSize] = useState(500);
  const [overlap, setOverlap] = useState(50);
  const [chunks, setChunks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listDocuments().then(({ data }) => {
      setDocs(data.documents);
      if (data.documents.length > 0) setSelectedFile(data.documents[0].filename);
    });
    getChunks().then(({ data }) => {
      setChunks(data.chunks);
      setLogs(data.log);
    });
  }, []);

  const run = async () => {
    if (!selectedFile) return;
    setLoading(true);
    try {
      const { data } = await chunkDocument(selectedFile, chunkSize, overlap);
      setChunks(data.chunks);
      setLogs(data.log);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      {/* Tutorial tip */}
      <div className="flex gap-3 items-start p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
        {/* <span className="text-lg mt-0.5">✂️</span> */}
        <div>
          <p className="text-sm text-cyan-300 font-medium">What is Chunking?</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Large documents are split into smaller overlapping chunks so the retriever can find the most relevant passages.
            Smaller chunks = more precise, larger = more context.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Configuration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Document</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
            >
              {docs.map((d) => (
                <option key={d.filename} value={d.filename}>{d.filename}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
              Chunk Size: <span className="text-indigo-400 font-bold">{chunkSize}</span> chars
            </label>
            <input
              type="range" min={100} max={2000} step={50}
              value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
              <span>100</span><span>2000</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">
              Overlap: <span className="text-indigo-400 font-bold">{overlap}</span> chars
            </label>
            <input
              type="range" min={0} max={500} step={10}
              value={overlap}
              onChange={(e) => setOverlap(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
              <span>0</span><span>500</span>
            </div>
          </div>
        </div>
        <button
          onClick={run}
          disabled={loading || !selectedFile}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-medium disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/10"
        >
          {loading ? "⏳ Chunking..." : "✂️ Run Chunking"}
        </button>
      </div>

      {/* Chunk preview */}
      {chunks.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Generated Chunks ({chunks.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {chunks.map((c, i) => (
              <div key={c.chunk_id} className="bg-gray-800/50 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-xs font-mono text-gray-500">{c.chunk_id}</span>
                  <span className="ml-auto text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{c.filename}</span>
                </div>
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <LogPanel title="chunking.log" logs={logs} />
    </div>
  );
}
