"use client";

import { useState } from "react";
import { Copy, Play, Check } from "lucide-react";
import { currentSql } from "@/lib/mock-data";
import { highlightSQL } from "@/lib/sql-highlight";

export default function SqlTab() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-text-primary">
          Generated Query
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-text-muted hover:text-text-primary transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3 h-3 text-success" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer">
            <Play className="w-3 h-3" />
            Run
          </button>
        </div>
      </div>

      {/* Code — dark panel for readability */}
      <div className="mx-3 mt-3 rounded-lg bg-[#1E1E2E] overflow-hidden">
        <pre className="px-4 py-4 font-mono text-[13px] text-gray-300 leading-relaxed whitespace-pre overflow-auto">
          <code>{highlightSQL(currentSql)}</code>
        </pre>
      </div>

      {/* Query Explanation */}
      <div className="border-t border-border px-4 py-3 mt-3">
        <h4 className="text-xs font-medium text-text-muted mb-2">
          Query Explanation
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          Joins the equipment downtime events with equipment metadata and
          technician assignments, filtering for Plant A within the last 30 days.
          Results are ordered by longest duration first to surface the most
          impactful downtime events.
        </p>
      </div>
    </div>
  );
}
