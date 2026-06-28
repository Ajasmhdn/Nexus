import { Clock, Rows3, Table2 } from "lucide-react";
import { queryHistory } from "@/lib/mock-data";
import { formatTime } from "@/lib/format";

const statusStyles: Record<string, string> = {
  success: "bg-success-muted text-success",
  error: "bg-error-muted text-error",
  running: "bg-accent-muted text-accent",
};

export default function HistoryTab() {
  return (
    <div>
      {queryHistory.map((qe) => (
        <div
          key={qe.id}
          className="px-4 py-3 border-b border-border/50 hover:bg-surface-alt/30 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <code className="text-[13px] font-mono text-text-secondary truncate max-w-[280px]">
              {qe.query}
            </code>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                statusStyles[qe.status]
              }`}
            >
              {qe.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Clock className="w-3 h-3" />
              {formatTime(qe.timestamp)}
            </span>
            <span className="text-[11px] text-text-muted">
              {qe.executionTime}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Rows3 className="w-3 h-3" />
              {qe.rowCount} rows
            </span>
            {qe.table && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <Table2 className="w-3 h-3" />
                {qe.table}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
