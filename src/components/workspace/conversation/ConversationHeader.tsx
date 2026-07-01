import { ChevronDown, Settings } from "lucide-react";

interface ConversationHeaderProps {
  title?: string;
}

export default function ConversationHeader({ title = "New Conversation" }: ConversationHeaderProps) {
  return (
    <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-white flex-shrink-0">
      <h1 className="text-sm font-medium text-text-primary">
        {title}
      </h1>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface border border-border rounded-lg px-3 py-1.5 cursor-pointer hover:border-text-muted transition-colors">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          Gemini 2.5 Flash
          <ChevronDown className="w-3 h-3 text-text-muted" />
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-surface flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
