"use client";

import { useState } from "react";
import { ChevronRight, Table2 } from "lucide-react";
import { TABLE_METADATA } from "../../../ai/schema/metadata";

export default function SchemaTab() {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["machines"])
  );

  const toggleTable = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const tables = Object.keys(TABLE_METADATA);

  return (
    <div className="py-1">
      {tables.map((tableName) => {
        const table = TABLE_METADATA[tableName];
        const isOpen = expanded.has(tableName);
        return (
          <div key={tableName} className="border-b border-border/40">
            <button
              onClick={() => toggleTable(tableName)}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-surface-alt/50 transition-colors text-left"
            >
              <ChevronRight
                className={`w-3.5 h-3.5 text-text-muted transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
              <Table2 className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">
                {tableName}
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 pl-10 space-y-2">
                <p className="text-xs text-text-muted leading-relaxed italic">
                  {table.description}
                </p>
                <div className="rounded-lg bg-[#1E1E2E] overflow-hidden">
                  <pre className="px-3 py-3 font-mono text-[11px] text-gray-300 leading-relaxed whitespace-pre overflow-auto">
                    <code>{table.ddl}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
