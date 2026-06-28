import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

interface InsightBlockProps {
  variant: "warning" | "success" | "info" | "error";
  content: string;
}

const variantStyles = {
  warning: {
    container: "bg-warning-muted border-warning",
    text: "text-warning",
    Icon: AlertTriangle,
  },
  success: {
    container: "bg-success-muted border-success",
    text: "text-success",
    Icon: CheckCircle,
  },
  info: {
    container: "bg-info-muted border-info",
    text: "text-info",
    Icon: Info,
  },
  error: {
    container: "bg-error-muted border-error",
    text: "text-error",
    Icon: XCircle,
  },
};

export default function InsightBlock({ variant, content }: InsightBlockProps) {
  const style = variantStyles[variant];
  const Icon = style.Icon;

  return (
    <div
      className={`rounded-md px-4 py-3 border-l-2 text-sm leading-relaxed flex items-start gap-2.5 ${style.container}`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.text}`} />
      <span className={style.text}>{content}</span>
    </div>
  );
}
