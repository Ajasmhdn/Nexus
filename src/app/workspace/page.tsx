import HistorySidebar from "@/components/workspace/sidebar/HistorySidebar";
import ConversationArea from "@/components/workspace/conversation/ConversationArea";
import AnalysisPanel from "@/components/workspace/analysis/AnalysisPanel";

export default function WorkspacePage() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <HistorySidebar />
      <ConversationArea />
      <AnalysisPanel />
    </div>
  );
}
