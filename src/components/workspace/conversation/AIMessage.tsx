import { Bot } from "lucide-react";
import type { ContentBlock } from "@/types";
import TextBlock from "./ai-blocks/TextBlock";
import InsightBlock from "./ai-blocks/InsightBlock";
import SqlBlock from "./ai-blocks/SqlBlock";
import MetricCards from "./ai-blocks/MetricCards";
import DataTable from "./ai-blocks/DataTable";
import ChartBlock from "./ai-blocks/ChartBlock";

interface AIMessageProps {
  blocks: ContentBlock[];
  timestamp: string;
}

function renderBlock(block: ContentBlock) {
  switch (block.type) {
    case "text":
      return <TextBlock key={block.id} content={block.content} />;
    case "summary":
      return (
        <TextBlock key={block.id} title={block.title} content={block.content} />
      );
    case "insight":
      return (
        <InsightBlock
          key={block.id}
          variant={block.variant}
          content={block.content}
        />
      );
    case "sql":
      return (
        <SqlBlock
          key={block.id}
          query={block.query}
          explanation={block.explanation}
        />
      );
    case "metrics":
      return <MetricCards key={block.id} items={block.items} />;
    case "table":
      return (
        <DataTable
          key={block.id}
          headers={block.headers}
          rows={block.rows}
          caption={block.caption}
        />
      );
    case "chart":
      return (
        <ChartBlock
          key={block.id}
          chartType={block.chartType}
          title={block.title}
          xAxisKey={block.xAxisKey}
          yAxisKey={block.yAxisKey}
          data={block.data}
        />
      );
    default:
      return null;
  }
}

export default function AIMessage({ blocks, timestamp }: AIMessageProps) {
  return (
    <div className="mb-8 px-6 max-w-[720px] mx-auto w-full animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0 mt-0.5">
          <Bot className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          {blocks.map((block) => renderBlock(block))}
          <div className="text-[11px] text-text-muted mt-2">{timestamp}</div>
        </div>
      </div>
    </div>
  );
}
