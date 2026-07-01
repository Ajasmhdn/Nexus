import { Loader2 } from "lucide-react";
import ConversationHeader from "./ConversationHeader";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";
import MessageInput from "./MessageInput";
import { formatTime } from "@/lib/format";

interface Message {
  messageId?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string | Date;
  blocks?: any[];
}

interface ConversationAreaProps {
  messages: Message[];
  title?: string;
  loading: boolean;
  onSend: (content: string) => void;
}

export default function ConversationArea({
  messages = [],
  title,
  loading,
  onSend
}: ConversationAreaProps) {
  return (
    <div className="flex flex-col h-screen flex-1 min-w-0 bg-white">
      <ConversationHeader title={title} />

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        {(messages || []).map((msg, index) =>
          msg.role === "user" ? (
            <UserMessage
              key={msg.messageId || index}
              content={msg.content}
              timestamp={formatTime(new Date(msg.createdAt || new Date()).toISOString())}
            />
          ) : (
            <AIMessage
              key={msg.messageId || index}
              blocks={msg.blocks || []}
              timestamp={formatTime(new Date(msg.createdAt || new Date()).toISOString())}
            />
          )
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-3 px-6 py-4 bg-surface max-w-[85%] rounded-r-xl rounded-tl-xl border border-border animate-pulse ml-6">
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
            <span className="text-sm font-medium text-text-secondary">Analyzing database...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput onSend={onSend} loading={loading} />
    </div>
  );
}
