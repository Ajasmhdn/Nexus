interface UserMessageProps {
  content: string;
  timestamp: string;
}

export default function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <div className="flex justify-end mb-6 px-6 max-w-[720px] mx-auto w-full">
      <div className="max-w-[85%]">
        <div className="bg-accent text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed">
          {content}
        </div>
        <div className="text-[11px] text-text-muted mt-1.5 text-right">
          {timestamp}
        </div>
      </div>
    </div>
  );
}
