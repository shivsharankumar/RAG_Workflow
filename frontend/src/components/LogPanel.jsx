import { useEffect, useRef } from "react";

export default function LogPanel({ title, logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="mt-5">
      <div className="rounded-xl overflow-hidden border border-gray-800 shadow-lg shadow-black/20">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 border-b border-gray-700/50">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-[11px] font-mono text-gray-500">{title}</span>
        </div>
        {/* Terminal body */}
        <div className="bg-gray-950 text-green-400 font-mono text-xs p-4 h-40 overflow-y-auto">
          {logs.length === 0 && (
            <div className="flex items-center gap-1 text-gray-600">
              <span>$</span>
              <span className="text-gray-500">awaiting output...</span>
              <span className="w-1.5 h-3.5 bg-gray-600 animate-pulse ml-0.5" />
            </div>
          )}
          {logs.map((line, i) => (
            <div key={i} className="leading-5 hover:bg-gray-900/50 px-1 -mx-1 rounded">
              <span className="text-gray-600 mr-2 select-none">$</span>
              {line}
            </div>
          ))}
          {logs.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-gray-600">$</span>
              <span className="w-1.5 h-3.5 bg-green-500/60 animate-pulse" />
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>
    </div>
  );
}
