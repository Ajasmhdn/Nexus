import { parseInlineMarkdown } from "@/lib/sql-highlight";

interface TextBlockProps {
  content: string;
  title?: string;
}

export default function TextBlock({ content, title }: TextBlockProps) {
  return (
    <div>
      {title && (
        <h3 className="font-semibold text-sm text-text-primary mb-2">
          {title}
        </h3>
      )}
      <p className="text-sm text-text-secondary leading-relaxed">
        {parseInlineMarkdown(content)}
      </p>
    </div>
  );
}
