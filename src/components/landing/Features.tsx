import { features } from "@/lib/mock-data";
import {
  MessageSquareText,
  Code,
  BarChart3,
  Database,
  History,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "message-square-text": MessageSquareText,
  code: Code,
  "bar-chart-3": BarChart3,
  database: Database,
  history: History,
  users: Users,
};

export default function Features() {
  return (
    <section id="features" className="py-24 border-t border-border/50">
      <h2 className="text-3xl font-bold text-center text-text-primary">
        Everything you need to analyze operational data
      </h2>
      <p className="text-text-secondary text-center mt-4 text-base">
        From natural language queries to actionable insights
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
        {features.map((feature) => {
          const Icon = iconMap[feature.icon] || Database;
          return (
            <div
              key={feature.title}
              className="p-6 bg-surface border border-border/50 rounded-lg hover:border-border transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-muted flex items-center justify-center">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-base font-semibold mt-4 text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
