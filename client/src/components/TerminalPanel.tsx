import React, { useEffect, useRef } from "react";
import { X, Terminal, ChevronDown, ChevronUp } from "lucide-react";
import { RunnerStatus } from "../hooks/useWebContainerRunner";

interface TerminalPanelProps {
  logs: string[];
  status: RunnerStatus;
  isOpen: boolean;
  onToggle: () => void;
}

const statusColor: Record<RunnerStatus, string> = {
  idle: "text-gray-400",
  installing: "text-yellow-400",
  starting: "text-blue-400",
  ready: "text-green-400",
  error: "text-red-400",
};

const statusLabel: Record<RunnerStatus, string> = {
  idle: "Idle",
  installing: "Installing dependencies…",
  starting: "Starting dev server…",
  ready: "Server ready",
  error: "Error",
};

export function TerminalPanel({
  logs,
  status,
  isOpen,
  onToggle,
}: TerminalPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest log line
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  return (
    <div
      className={`flex flex-col border-t border-gray-700 bg-gray-950 transition-all duration-300 ease-in-out ${
        isOpen ? "h-44" : "h-9"
      }`}
      style={{ flexShrink: 0 }}
    >
      {/* ── Header bar ──────────────────────────────────────────────── */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 h-9 w-full text-left hover:bg-gray-900 transition-colors select-none flex-shrink-0"
        aria-label={isOpen ? "Collapse terminal" : "Expand terminal"}
      >
        <Terminal className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-xs font-medium text-gray-300 flex-1">
          Terminal
        </span>

        {/* Status badge */}
        <span className={`text-xs ${statusColor[status]} flex items-center gap-1`}>
          {(status === "installing" || status === "starting") && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          )}
          {statusLabel[status]}
        </span>

        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-2" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-gray-400 ml-2" />
        )}
      </button>

      {/* ── Log output ──────────────────────────────────────────────── */}
      {isOpen && (
        <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-xs leading-relaxed text-gray-300 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700">
          {logs.length === 0 ? (
            <span className="text-gray-600">Waiting for output…</span>
          ) : (
            logs.map((line, i) => (
              <pre
                key={i}
                className="whitespace-pre-wrap break-words"
                style={{ margin: 0 }}
              >
                {line}
              </pre>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
