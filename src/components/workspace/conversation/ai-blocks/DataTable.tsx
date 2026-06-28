interface DataTableProps {
  headers: string[];
  rows: string[][];
  caption?: string;
}

function isNumericCell(value: string): boolean {
  return /(\d+\.?\d*\s*(hrs|min|%|s|ms))|^\d+\.?\d*%?$/.test(value);
}

export default function DataTable({ headers, rows, caption }: DataTableProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {caption && (
        <div className="text-xs text-text-muted px-4 py-2 bg-surface-alt/30 border-b border-border">
          {caption}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-alt">
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-2.5 text-left text-[11px] font-medium text-text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-t border-border/50 ${
                  rowIndex % 2 === 1 ? "bg-surface-alt/20" : ""
                }`}
              >
                {row.map((cell, cellIndex) => {
                  const numeric = isNumericCell(cell);
                  return (
                    <td
                      key={cellIndex}
                      className={`px-4 py-2.5 whitespace-nowrap ${
                        numeric
                          ? "text-right font-mono text-[13px] tabular-nums text-text-secondary"
                          : "text-sm text-text-secondary"
                      }`}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
