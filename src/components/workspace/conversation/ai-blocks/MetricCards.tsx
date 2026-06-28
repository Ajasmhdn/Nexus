import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { MetricItem } from "@/types";

interface MetricCardsProps {
  items: MetricItem[];
}

export default function MetricCards({ items }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-surface border border-border/50 rounded-lg p-4"
        >
          <div className="text-[11px] text-text-muted font-medium uppercase tracking-wide">
            {item.label}
          </div>
          <div className="text-lg font-semibold text-text-primary mt-1">
            {item.value}
          </div>
          {item.trendValue && (
            <div className="flex items-center gap-1 mt-1.5">
              {item.trend === "up" && (
                <TrendingUp className="w-3 h-3 text-error" />
              )}
              {item.trend === "down" && (
                <TrendingDown className="w-3 h-3 text-success" />
              )}
              {item.trend === "neutral" && (
                <Minus className="w-3 h-3 text-text-muted" />
              )}
              <span
                className={`text-xs ${
                  item.trend === "up"
                    ? "text-error"
                    : item.trend === "down"
                    ? "text-success"
                    : "text-text-muted"
                }`}
              >
                {item.trendValue}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
