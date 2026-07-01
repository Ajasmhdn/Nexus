import { Rows3, Clock, Database } from "lucide-react";
import DataTable from "@/components/workspace/conversation/ai-blocks/DataTable";

interface ResultsTabProps {
  table?: any; // TableBlock
}

export default function ResultsTab({ table }: ResultsTabProps) {
  if (!table) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-text-muted text-sm space-y-2 p-4">
        <Database className="w-8 h-8 opacity-40" />
        <p className="font-medium">No results loaded</p>
        <p className="text-xs text-center">Ask a query in the chat to see query analysis here.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Metadata Bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
          <Rows3 className="w-3.5 h-3.5" />
          {table.rows?.length || 0} rows returned
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium">
          <Clock className="w-3.5 h-3.5" />
          Processed
        </div>
      </div>

      {/* Results Table */}
      <div className="p-3">
        <DataTable
          headers={table.headers || []}
          rows={table.rows || []}
          caption={table.caption}
        />
      </div>
    </div>
  );
}
