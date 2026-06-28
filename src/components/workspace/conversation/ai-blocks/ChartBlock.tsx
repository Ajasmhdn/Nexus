"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface ChartBlockProps {
  chartType: "bar" | "line" | "pie";
  title: string;
  xAxisKey: string;
  yAxisKey: string;
  data: Record<string, unknown>[];
}

const COLORS = [
  "#9603ff",
  "#b14dff",
  "#cc88ff",
  "#7c3aed",
  "#6d28d9",
  "#a78bfa",
  "#8b5cf6",
  "#c084fc",
];

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1f2937",
    border: "none",
    borderRadius: "8px",
    color: "#f9fafb",
    fontSize: "12px",
    padding: "8px 12px",
  },
  itemStyle: { color: "#e5e7eb" },
  labelStyle: { color: "#9ca3af", fontWeight: 600, marginBottom: "4px" },
};

export default function ChartBlock({
  chartType,
  title,
  xAxisKey,
  yAxisKey,
  data,
}: ChartBlockProps) {
  return (
    <div className="bg-surface border border-border/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-text-muted" />
        <h4 className="text-sm font-medium text-text-primary">{title}</h4>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={260}>
          {chartType === "bar" ? (
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <Tooltip {...tooltipStyle} />
              <Bar
                dataKey={yAxisKey}
                fill="#9603ff"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          ) : chartType === "line" ? (
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6b7280" }}
                axisLine={{ stroke: "#e5e7eb" }}
                tickLine={false}
              />
              <Tooltip {...tooltipStyle} />
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke="#9603ff"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#9603ff", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6, fill: "#9603ff", stroke: "#fff", strokeWidth: 2 }}
              />
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip {...tooltipStyle} />
              <Legend
                formatter={(value: string) => (
                  <span style={{ color: "#374151", fontSize: "12px" }}>
                    {value}
                  </span>
                )}
              />
              <Pie
                data={data}
                dataKey={yAxisKey}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
