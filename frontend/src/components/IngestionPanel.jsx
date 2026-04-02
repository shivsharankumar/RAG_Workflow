import { useState, useEffect, useCallback } from "react";
import { uploadFile, listDocuments } from "../api/client";
import LogPanel from "./LogPanel";

export default function IngestionPanel() {
  const [docs, setDocs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    try {
      const { data } = await listDocuments();
      setDocs(data.documents);
      setLogs(data.log);
    } catch { }
  };

  useEffect(() => { refresh(); }, []);

  const handleUpload = async (files) => {
    setUploading(true);
    for (const file of files) {
      try {
        await uploadFile(file);
      } catch (e) {
        console.error(e);
      }
    }
    await refresh();
    setUploading(false);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleUpload(Array.from(e.dataTransfer.files));
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  return (
    <div className="space-y-5">
      {/* Tutorial tip */}
      <div className="flex gap-3 items-start p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
        {/* <span className="text-lg mt-0.5">💡</span> */}
        <div>
          <p className="text-sm text-blue-300 font-medium">Getting Started</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Upload .txt, .md, or .pdf files containing the knowledge you want to query.
            Or use the Dashboard to load sample data for a quick demo.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 group ${dragging
            ? "border-indigo-400 bg-indigo-500/10 scale-[1.01]"
            : "border-gray-700 hover:border-indigo-500/50 hover:bg-gray-900/50"
          }`}
        onClick={() => document.getElementById("file-input").click()}
      >
        <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 transition-all ${dragging
            ? "bg-indigo-500/20 scale-110"
            : "bg-gray-800 group-hover:bg-indigo-500/10"
          }`}>
          {uploading ? "⏳" : "⬆️"}
        </div>
        <p className={`text-sm font-medium ${dragging ? "text-indigo-300" : "text-gray-300"
          }`}>
          {uploading ? "Uploading..." : "Drop files here or click to upload"}
        </p>
        <p className="text-xs text-gray-600 mt-1">Supports .txt, .md, .pdf</p>
        <input
          id="file-input"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleUpload(Array.from(e.target.files))}
        />
      </div>

      {/* Document list */}
      {docs.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Uploaded Documents ({docs.length})
          </h4>
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.filename} className="flex items-center gap-3 bg-gray-800/50 border border-gray-800 rounded-xl px-4 py-3 transition-all hover:border-gray-700">
                <span className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm flex-shrink-0">📄</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{d.filename}</p>
                  <p className="text-xs text-gray-500">{(d.size / 1024).toFixed(1)} KB</p>
                </div>
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">✓ Uploaded</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <LogPanel title="ingestion.log" logs={logs} />
    </div>
  );
}
