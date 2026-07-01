import { Clock, Database } from "lucide-react";
import { formatTime } from "@/lib/format";

interface QueryHistoryItem {
  query: string;
  sql?: string;
  timestamp: string | Date;
}

interface HistoryTabProps {
  history?: QueryHistoryItem[];
}

export default function HistoryTab({ history = [] }: HistoryTabProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-text-muted text-sm space-y-2 p-4">
        <Database className="w-8 h-8 opacity-40" />
        <p className="font-medium">No query history yet</p>
        <p className="text-xs text-center">Past queries run in this session will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      {history.map((qe, index) => (
        <div
          key={index}
          className="px-4 py-3 border-b border-border/50 hover:bg-surface-alt/30 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between gap-2">
            <code className="text-[13px] font-mono text-text-secondary truncate max-w-[400px]">
              {qe.query}
            </code>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-success-muted text-success">
              success
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Clock className="w-3 h-3" />
              {formatTime(new Date(qe.timestamp).toISOString())}
            </span>
            {qe.sql && (
              <span className="text-[10px] font-mono text-text-muted max-w-[200px] truncate">
                {qe.sql.slice(0, 50)}...
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
