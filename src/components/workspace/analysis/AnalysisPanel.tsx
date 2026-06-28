"use client";

import { useState } from "react";
import ResultsTab from "./ResultsTab";
import VisualizationTab from "./VisualizationTab";
import SqlTab from "./SqlTab";
import SchemaTab from "./SchemaTab";
import HistoryTab from "./HistoryTab";

const tabs = ["Results", "Visualization", "SQL", "Schema", "History"] as const;
type Tab = (typeof tabs)[number];

export default function AnalysisPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("Results");

  return (
    <aside className="w-[580px] min-w-[580px] border-l border-border bg-surface h-screen flex flex-col">
      {/* Tab Bar */}
      <div className="flex border-b border-border flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm transition-colors relative cursor-pointer ${
              activeTab === tab
                ? "text-text-primary font-medium"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Results" && <ResultsTab />}
        {activeTab === "Visualization" && <VisualizationTab />}
        {activeTab === "SQL" && <SqlTab />}
        {activeTab === "Schema" && <SchemaTab />}
        {activeTab === "History" && <HistoryTab />}
      </div>
    </aside>
  );
}
