"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, AlertCircle, Info, ChevronDown, Check, PieChart, LineChart } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

const charts = [
  {
    id: "downtime",
    title: "Machine Downtime Distribution (Hours)",
    description: "Tracks total cumulative downtime hours across main machines.",
    metrics: { peak: "CNC Mill #3 (127.5 hrs)", total: "374.2 hrs", change: "+12.3% vs last month" },
    insight: "CNC Mill #3 bearing failure represents 34% of overall downtime. Scheduling preventive bearing inspection every 100 operating hours is highly recommended.",
    data: [
      { label: "CNC Mill #3", value: 127.5 },
      { label: "Hydraulic Press #1", value: 52.3 },
      { label: "Conveyor Belt #7", value: 44.8 },
      { label: "Welding Robot #2", value: 38.6 },
      { label: "Lathe #5", value: 31.2 },
      { label: "Packaging Line #3", value: 28.4 },
    ] as DataPoint[],
  },
  {
    id: "technicians",
    title: "Technician Resolution & Response (Minutes)",
    description: "Average response and resolution times by technicians.",
    metrics: { peak: "Rodriguez (12m response)", total: "6 active techs", change: "-4% response latency" },
    insight: "Rodriguez maintains the lowest response latency (12 mins) across 14 jobs. Thompson has the lowest resolution time but slightly higher initial response times.",
    data: [
      { label: "Rodriguez", value: 12, secondaryValue: 372 },
      { label: "Nakamura", value: 15, secondaryValue: 486 },
      { label: "Thompson", value: 18, secondaryValue: 348 },
      { label: "Kim", value: 22, secondaryValue: 564 },
      { label: "Patel", value: 28, secondaryValue: 438 },
      { label: "Garcia", value: 38, secondaryValue: 672 },
    ] as DataPoint[],
  },
  {
    id: "production",
    title: "Production Line Efficiency (% of Target)",
    description: "Actual vs target throughput metrics by production line.",
    metrics: { peak: "Line 2 (104.2%)", total: "94.6% Avg", change: "+1.8% efficiency gain" },
    insight: "Line 2 exceeded target production by 4.2% due to optimization of shift change handovers. Line 4 remains at 82.1% efficiency due to conveyor speed restrictions.",
    data: [
      { label: "Line 1 (Assembly)", value: 92.5 },
      { label: "Line 2 (Packaging)", value: 104.2 },
      { label: "Line 3 (Fabrication)", value: 97.8 },
      { label: "Line 4 (Machining)", value: 82.1 },
      { label: "Line 5 (Finishing)", value: 96.4 },
    ] as DataPoint[],
  },
];

const chartTypes = [
  { id: "bar", label: "Bar Chart", icon: BarChart3 },
  { id: "line", label: "Line Chart", icon: LineChart },
  { id: "donut", label: "Donut Chart", icon: PieChart },
];

export default function VisualizationTab() {
  const [selectedChartId, setSelectedChartId] = useState("downtime");
  const [chartType, setChartType] = useState<"bar" | "line" | "donut">("bar");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeChart = charts.find((c) => c.id === selectedChartId) || charts[0];
  const maxVal = Math.max(...activeChart.data.map((d) => d.value));

  // Donut chart calculations
  const totalSum = activeChart.data.reduce((sum, d) => sum + d.value, 0);
  let cumulativeAngle = 0;

  return (
    <div className="p-6 space-y-6">
      {/* Controls Card */}
      <div className="bg-surface rounded-xl border border-border p-4 space-y-4">
        {/* Selector */}
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
            Select Analytic Dataset
          </label>
          <div className="relative">
            <select
              value={selectedChartId}
              onChange={(e) => setSelectedChartId(e.target.value)}
              className="w-full bg-white border border-border rounded-lg pl-3 pr-10 py-2.5 text-sm text-text-primary appearance-none focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none cursor-pointer font-medium"
            >
              {charts.map((chart) => (
                <option key={chart.id} value={chart.id}>
                  {chart.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Chart Types */}
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
                  onClick={() => setChartType(type.id as any)}
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
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-border rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider block">Peak Metric</span>
          <span className="text-sm font-semibold text-text-primary mt-1 block truncate">
            {activeChart.metrics.peak}
          </span>
        </div>
        <div className="bg-white border border-border rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider block">Cumulative</span>
          <span className="text-sm font-semibold text-text-primary mt-1 block truncate">
            {activeChart.metrics.total}
          </span>
        </div>
        <div className="bg-white border border-border rounded-xl p-3.5 shadow-sm">
          <span className="text-[10px] text-text-muted font-medium uppercase tracking-wider block">Trend</span>
          <span className="text-xs font-semibold text-success mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {activeChart.metrics.change}
          </span>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="bg-white border border-border rounded-xl p-6 shadow-sm flex flex-col justify-center min-h-[300px]">
        {chartType === "bar" && (
          <div className="space-y-4 w-full">
            {activeChart.data.map((item, idx) => {
              const pct = (item.value / maxVal) * 100;
              const isHovered = hoveredIndex === idx;
              return (
                <div
                  key={item.label}
                  className="space-y-1.5"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-text-primary">{item.label}</span>
                    <span className="text-text-secondary font-mono">
                      {item.value} {selectedChartId === "downtime" ? "hrs" : selectedChartId === "production" ? "%" : "m"}
                    </span>
                  </div>
                  <div className="h-6 w-full bg-surface rounded-md overflow-hidden border border-border/50 relative flex items-center">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full bg-accent transition-all duration-300 ${
                        isHovered ? "brightness-110" : ""
                      }`}
                    />
                    {item.secondaryValue && (
                      <div
                        style={{ width: `${(item.secondaryValue / 700) * 100}%` }}
                        className="h-1 bg-amber-400 absolute bottom-0 left-0 transition-all duration-300"
                        title={`Resolution Time: ${item.secondaryValue} mins`}
                      />
                    )}
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
                const stepX = 360 / (activeChart.data.length - 1);
                const points = activeChart.data.map((item, idx) => {
                  const x = 30 + idx * stepX;
                  const y = 170 - (item.value / maxVal) * 140;
                  return { x, y, val: item.value, label: item.label };
                });

                const pathString = points
                  .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                  .join(" ");

                const areaString = `${pathString} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

                return (
                  <>
                    {/* Fill Area */}
                    <path d={areaString} fill="url(#purple-gradient)" opacity="0.15" />
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
                    {points.map((p, i) => {
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
                                className="shadow-lg"
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

              {/* Define Gradients */}
              <defs>
                <linearGradient id="purple-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9603ff" />
                  <stop offset="100%" stopColor="#9603ff" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-between px-6 text-[10px] text-text-muted mt-2">
              {activeChart.data.map((d) => (
                <span key={d.label} className="truncate max-w-[60px] text-center block">
                  {d.label.split(" (")[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {chartType === "donut" && (
          <div className="flex items-center justify-center gap-6">
            <svg width="180" height="180" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="3" />
              {activeChart.data.map((item, idx) => {
                const percent = (item.value / totalSum) * 100;
                const strokeDasharray = `${percent} ${100 - percent}`;
                const strokeDashoffset = 100 - cumulativeAngle;
                cumulativeAngle += percent;

                // Color palette (purples and grays)
                const colors = [
                  "#9603ff", // Primary purple
                  "#b14dff",
                  "#cc88ff",
                  "#e5c2ff",
                  "#cbd5e1",
                  "#94a3b8",
                ];
                const color = colors[idx % colors.length];

                return (
                  <circle
                    key={item.label}
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
              {activeChart.data.map((item, idx) => {
                const colors = [
                  "#9603ff",
                  "#b14dff",
                  "#cc88ff",
                  "#e5c2ff",
                  "#cbd5e1",
                  "#94a3b8",
                ];
                const color = colors[idx % colors.length];
                const pct = ((item.value / totalSum) * 100).toFixed(1);
                return (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between text-xs transition-opacity ${
                      hoveredIndex !== null && hoveredIndex !== idx ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-text-primary truncate max-w-[100px]">{item.label}</span>
                    </div>
                    <span className="font-mono text-text-muted">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Analytics Insight Card */}
      <div className="bg-accent-light/40 border border-accent/15 rounded-xl p-5 flex gap-3">
        <Info className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-accent uppercase tracking-wider">AI Analytical Summary</h4>
          <p className="text-sm text-text-secondary leading-relaxed">{activeChart.insight}</p>
        </div>
      </div>
    </div>
  );
}
