import { Rows3, Clock, Table2 } from "lucide-react";
import { analysisTableData } from "@/lib/mock-data";
import DataTable from "@/components/workspace/conversation/ai-blocks/DataTable";

export default function ResultsTab() {
  const { metadata } = analysisTableData;

  return (
    <div>
      {/* Metadata Bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Rows3 className="w-3.5 h-3.5" />
          {metadata.rowCount} rows returned
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Clock className="w-3.5 h-3.5" />
          {metadata.executionTime}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Table2 className="w-3.5 h-3.5" />
          {metadata.table}
        </div>
      </div>

      {/* Results Table */}
      <div className="p-3">
        <DataTable
          headers={analysisTableData.headers}
          rows={analysisTableData.rows}
        />
      </div>
    </div>
  );
}
