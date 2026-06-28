"use client";

import { useState } from "react";
import { Code, Copy, Play, Check } from "lucide-react";
import { highlightSQL } from "@/lib/sql-highlight";

interface SqlBlockProps {
  query: string;
  explanation?: string;
}

export default function SqlBlock({ query, explanation }: SqlBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1E1E2E] rounded-lg border border-[#2D2D3D] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252535] border-b border-[#2D2D3D]">
        <div className="flex items-center gap-2">
          <Code className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-400">SQL</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-purple-400 hover:text-purple-300 transition-colors cursor-pointer">
            <Play className="w-3 h-3" />
            Run
          </button>
        </div>
      </div>

      {/* Code */}
      <pre className="px-4 py-3 font-mono text-[13px] leading-relaxed overflow-x-auto whitespace-pre">
        <code>{highlightSQL(query)}</code>
      </pre>

      {/* Explanation */}
      {explanation && (
        <div className="px-4 py-2.5 border-t border-[#2D2D3D]">
          <p className="text-xs text-gray-400 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
