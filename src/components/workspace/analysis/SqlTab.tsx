"use client";

import { useState } from "react";
import { Copy, Check, Database } from "lucide-react";

interface SqlTabProps {
  sql?: string;
}

export default function SqlTab({ sql }: SqlTabProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!sql) return;
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!sql) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-text-muted text-sm space-y-2 p-4">
        <Database className="w-8 h-8 opacity-40" />
        <p className="font-medium">No SQL generated</p>
        <p className="text-xs text-center">Generated SQL queries will appear here once you query the database.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-medium text-text-primary">
          Generated MySQL Query
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
        </div>
      </div>

      {/* Code — dark panel for readability */}
      <div className="mx-3 mt-3 rounded-lg bg-[#1E1E2E] overflow-hidden">
        <pre className="px-4 py-4 font-mono text-[13px] text-gray-300 leading-relaxed whitespace-pre-wrap overflow-auto">
          <code>{sql}</code>
        </pre>
      </div>

      {/* Query Explanation */}
      <div className="border-t border-border px-4 py-3 mt-3">
        <h4 className="text-xs font-medium text-text-muted mb-2">
          Read-Only Security Gate
        </h4>
        <p className="text-xs text-text-secondary leading-relaxed">
          This query has been validated by a multi-layer TypeScript validator and is executing securely against the read-only operational database.
        </p>
      </div>
    </div>
  );
}
