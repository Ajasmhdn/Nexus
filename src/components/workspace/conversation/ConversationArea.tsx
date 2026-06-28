import ConversationHeader from "./ConversationHeader";
import UserMessage from "./UserMessage";
import AIMessage from "./AIMessage";
import MessageInput from "./MessageInput";
import { activeMessages } from "@/lib/mock-data";
import { formatTime } from "@/lib/format";

export default function ConversationArea() {
  return (
    <div className="flex flex-col h-screen flex-1 min-w-0 bg-white">
      <ConversationHeader />

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto py-6">
        {activeMessages.map((msg) =>
          msg.role === "user" ? (
            <UserMessage
              key={msg.id}
              content={msg.content}
              timestamp={formatTime(msg.timestamp)}
            />
          ) : (
            <AIMessage
              key={msg.id}
              blocks={msg.blocks || []}
              timestamp={formatTime(msg.timestamp)}
            />
          )
        )}
      </div>

      {/* Input */}
      <MessageInput />
    </div>
  );
}
