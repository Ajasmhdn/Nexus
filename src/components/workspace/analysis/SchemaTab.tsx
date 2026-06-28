"use client";

import { useState } from "react";
import { ChevronRight, Table2 } from "lucide-react";
import { databaseSchema } from "@/lib/mock-data";

export default function SchemaTab() {
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set([databaseSchema.tables[0].name])
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

  return (
    <div className="py-1">
      {databaseSchema.tables.map((table) => {
        const isOpen = expanded.has(table.name);
        return (
          <div key={table.name}>
            <button
              onClick={() => toggleTable(table.name)}
              className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-surface-alt/50 transition-colors text-left"
            >
              <ChevronRight
                className={`w-3.5 h-3.5 text-text-muted transition-transform ${
                  isOpen ? "rotate-90" : ""
                }`}
              />
              <Table2 className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-sm font-medium text-text-primary">
                {table.name}
              </span>
              <span className="text-[11px] text-text-muted bg-surface-alt px-2 py-0.5 rounded ml-auto">
                {table.rowCount.toLocaleString()} rows
              </span>
            </button>
            {isOpen && (
              <div className="pl-10 pb-2">
                {table.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center gap-2 px-4 py-1.5"
                  >
                    <span className="text-[13px] font-mono text-text-secondary">
                      {col.name}
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {col.type}
                    </span>
                    {col.isPrimaryKey && (
                      <span className="text-[10px] bg-accent-muted text-accent px-1.5 py-0.5 rounded font-medium">
                        PK
                      </span>
                    )}
                    {col.isForeignKey && (
                      <span className="text-[10px] bg-warning-muted text-warning px-1.5 py-0.5 rounded font-medium">
                        FK
                      </span>
                    )}
                    {col.references && (
                      <span className="text-[11px] text-text-muted italic">
                        → {col.references}
                      </span>
                    )}
                    {col.nullable && (
                      <span className="text-[10px] text-text-muted">
                        nullable
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
