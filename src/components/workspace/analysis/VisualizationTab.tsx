"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, AlertCircle, Info, PieChart, LineChart, Database } from "lucide-react";

interface VisualizationTabProps {
  chart?: any; // ChartBlock
}

export default function VisualizationTab({ chart }: VisualizationTabProps) {
  const [chartTypeOverride, setChartTypeOverride] = useState<string | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!chart || !chart.data || chart.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[300px] text-text-muted text-sm space-y-2 p-4">
        <Database className="w-8 h-8 opacity-40" />
        <p className="font-medium">No visualization active</p>
        <p className="text-xs text-center">Chart data is automatically generated when query results contain 2 to 20 rows.</p>
      </div>
    );
  }

  const chartType = chartTypeOverride || chart.chartType || "bar";
  const { data, xAxisKey, yAxisKey, title } = chart;

  // Extract values
  const maxVal = Math.max(...data.map((d: any) => Number(d[yAxisKey]) || 0), 1);
  const totalSum = data.reduce((sum: number, d: any) => sum + (Number(d[yAxisKey]) || 0), 0);
  let cumulativeAngle = 0;

  const chartTypes = [
    { id: "bar", label: "Bar Chart", icon: BarChart3 },
    { id: "line", label: "Line Chart", icon: LineChart },
    { id: "pie", label: "Donut Chart", icon: PieChart },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Controls Card */}
      <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
            Active Dataset
          </label>
          <div className="text-sm font-medium text-text-primary">
            {title || "Dynamic Visualization"}
          </div>
        </div>

        {/* Chart Types Selector */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
            Visualization Type
          </label>
          <div className="flex bg-white rounded-lg p-1 border border-border gap-1">
            {chartTypes.map((type) => {
              const Icon = type.icon;
              const isActive = chartType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => setChartTypeOverride(type.id)}
                  className={`flex-1 py-1.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? "bg-accent-light text-accent border border-accent/15"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-border rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider block">Y-Axis Metric</span>
          <span className="text-sm font-semibold text-text-primary mt-1 block truncate">
            {yAxisKey}
          </span>
        </div>
        <div className="bg-white border border-border rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider block">Total Sum</span>
          <span className="text-sm font-semibold text-text-primary mt-1 block truncate">
            {totalSum.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-center min-h-[300px]">
        {chartType === "bar" && (
          <div className="space-y-4 w-full">
            {data.map((item: any, idx: number) => {
              const val = Number(item[yAxisKey]) || 0;
              const label = String(item[xAxisKey] || "");
              const pct = (val / maxVal) * 100;
              const isHovered = hoveredIndex === idx;
              return (
                <div
                  key={idx}
                  className="space-y-1.5"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-primary">{label}</span>
                    <span className="text-text-secondary font-mono">
                      {val.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-6 w-full bg-surface rounded-md overflow-hidden border border-border/50 relative flex items-center">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full bg-accent transition-all duration-300 ${
                        isHovered ? "brightness-110" : ""
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {chartType === "line" && (
          <div className="w-full h-56 flex flex-col justify-between">
            <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
              {/* Grid Lines */}
              <line x1="30" y1="20" x2="390" y2="20" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="30" y1="75" x2="390" y2="75" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="30" y1="130" x2="390" y2="130" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="30" y1="170" x2="390" y2="170" stroke="#e5e7eb" strokeWidth="1.5" />

              {/* Draw Line & Points */}
              {(() => {
                const stepX = data.length > 1 ? 360 / (data.length - 1) : 360;
                const points = data.map((item: any, idx: number) => {
                  const val = Number(item[yAxisKey]) || 0;
                  const label = String(item[xAxisKey] || "");
                  const x = 30 + idx * stepX;
                  const y = 170 - (val / maxVal) * 140;
                  return { x, y, val, label };
                });

                const pathString = points
                  .map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                  .join(" ");

                const areaString = points.length > 0
                  ? `${pathString} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`
                  : "";

                return (
                  <>
                    {/* Fill Area */}
                    {areaString && <path d={areaString} fill="url(#purple-gradient-tab)" opacity="0.15" />}
                    {/* Line */}
                    <path
                      d={pathString}
                      fill="none"
                      stroke="#9603ff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Data Points */}
                    {points.map((p: any, i: number) => {
                      const isHovered = hoveredIndex === i;
                      return (
                        <g key={i} className="cursor-pointer">
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={isHovered ? 6 : 4}
                            fill="#9603ff"
                            stroke="white"
                            strokeWidth="1.5"
                            className="transition-all"
                            onMouseEnter={() => setHoveredIndex(i)}
                            onMouseLeave={() => setHoveredIndex(null)}
                          />
                          {isHovered && (
                            <g>
                              <rect
                                x={p.x - 40}
                                y={p.y - 32}
                                width="80"
                                height="22"
                                rx="4"
                                fill="#1f2937"
                              />
                              <text
                                x={p.x}
                                y={p.y - 17}
                                textAnchor="middle"
                                fill="white"
                                fontSize="10"
                                fontFamily="monospace"
                              >
                                {p.val}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </>
                );
              })()}

              <defs>
                <linearGradient id="purple-gradient-tab" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9603ff" />
                  <stop offset="100%" stopColor="#9603ff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between px-6 text-[10px] text-text-muted mt-2">
              {data.map((d: any, idx: number) => (
                <span key={idx} className="truncate max-w-[60px] text-center block">
                  {String(d[xAxisKey] || "").split(" (")[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {chartType === "pie" && (
          <div className="flex items-center justify-center gap-6">
            <svg width="180" height="180" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="3" />
              {data.map((item: any, idx: number) => {
                const val = Number(item[yAxisKey]) || 0;
                const percent = totalSum > 0 ? (val / totalSum) * 100 : 0;
                const strokeDasharray = `${percent} ${100 - percent}`;
                const strokeDashoffset = 100 - cumulativeAngle;
                cumulativeAngle += percent;

                const colors = ["#9603ff", "#b14dff", "#cc88ff", "#e5c2ff", "#cbd5e1", "#94a3b8"];
                const color = colors[idx % colors.length];

                return (
                  <circle
                    key={idx}
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke={color}
                    strokeWidth="3.2"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 hover:stroke-[3.8] cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Legend */}
            <div className="space-y-1.5 flex-1 max-w-[200px]">
              {data.map((item: any, idx: number) => {
                const val = Number(item[yAxisKey]) || 0;
                const label = String(item[xAxisKey] || "");
                const colors = ["#9603ff", "#b14dff", "#cc88ff", "#e5c2ff", "#cbd5e1", "#94a3b8"];
                const color = colors[idx % colors.length];
                const pct = totalSum > 0 ? ((val / totalSum) * 100).toFixed(1) : "0";
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between text-xs transition-opacity ${
                      hoveredIndex !== null && hoveredIndex !== idx ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-text-primary truncate max-w-[100px]">{label}</span>
                    </div>
                    <span className="font-mono text-text-muted">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Summary */}
      <div className="bg-accent-light/40 border border-accent/15 rounded-xl p-5 flex gap-3">
        <Info className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">AI Visualization Summary</h4>
          <p className="text-sm text-text-secondary leading-relaxed">
            Data rendering is updated dynamically from operational records.
          </p>
        </div>
      </div>
    </div>
  );
}
