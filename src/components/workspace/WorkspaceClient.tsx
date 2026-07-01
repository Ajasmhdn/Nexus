"use client";

import { useState, useEffect } from "react";
import HistorySidebar from "./sidebar/HistorySidebar";
import ConversationArea from "./conversation/ConversationArea";
import AnalysisPanel from "./analysis/AnalysisPanel";

interface Message {
  messageId?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string | Date;
  blocks?: any[];
  sqlExecuted?: string;
  generatedSql?: string;
}

interface Session {
  id: string;
  title: string;
  preview: string;
  timestamp: string | Date;
}

interface WorkspaceClientProps {
  initialSessionId: string | null;
}

export default function WorkspaceClient({ initialSessionId }: WorkspaceClientProps) {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSendingQuery, setIsSendingQuery] = useState(false);

  // Load user sessions list
  const loadSessionsList = async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
    }
  };

  // Load message history for a target session
  const loadSessionMessages = async (sessionId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Error loading session messages:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadSessionsList();
    if (activeSessionId) {
      loadSessionMessages(activeSessionId);
    }
  }, [activeSessionId]);

  // Handle New Conversation action
  const handleCreateSession = async () => {
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        const newSessionId = data.sessionId;
        setMessages([]);
        setActiveSessionId(newSessionId);
        await loadSessionsList();
      }
    } catch (err) {
      console.error("Error creating session:", err);
    }
  };

  // Handle selecting a conversation
  const handleSelectSession = (sessionId: string) => {
    if (!sessionId) {
      setActiveSessionId(null);
      setMessages([]);
      return;
    }
    setActiveSessionId(sessionId);
  };

  // Handle sending query to the AI pipeline
  const handleSendQuery = async (content: string) => {
    let currentSessionId = activeSessionId;

    // A. If no active session, create one first on demand
    if (!currentSessionId) {
      try {
        const res = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        if (!res.ok) throw new Error("Automatic session creation failed.");
        const data = await res.json();
        currentSessionId = data.sessionId;
        setActiveSessionId(currentSessionId);
      } catch (err) {
        console.error("Error during auto-session creation:", err);
        return;
      }
    }

    // B. Append User message locally
    const userMsg: Message = {
      role: "user",
      content,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsSendingQuery(true);

    try {
      // C. POST to live pipeline endpoint
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          content
        })
      });

      if (!res.ok) {
        throw new Error("Pipeline returned an execution error.");
      }

      const data = await res.json();

      // D. Append Assistant response blocks
      const assistantMsg: Message = {
        role: "assistant",
        content: data.text,
        createdAt: new Date(),
        // Format chartConfig and tableData directly back into ContentBlocks if returned
        blocks: data.blocks || [
          {
            id: "summary-fallback",
            type: "summary",
            title: "Analysis Results",
            content: data.text
          },
          ...(data.sql ? [{
            id: "sql-fallback",
            type: "sql",
            query: data.sql,
            explanation: `Executed in ${data.executionTimeMs || 0}ms.`
          }] : []),
          ...(data.tableData ? [data.tableData] : []),
          ...(data.chartConfig ? [{
            id: "chart-fallback",
            type: "chart",
            chartType: data.chartConfig.chartType,
            title: data.chartConfig.title || "Visual Output",
            xAxisKey: data.chartConfig.xAxisKey,
            yAxisKey: data.chartConfig.yAxisKey,
            data: data.chartConfig.data
          }] : [])
        ],
        sqlExecuted: data.sql
      };

      setMessages(prev => [...prev, assistantMsg]);
      await loadSessionsList(); // Update sidebar previews and titles
    } catch (err: any) {
      console.error("Failed to run pipeline query:", err);
      const errorMsg: Message = {
        role: "assistant",
        content: `Error: ${err.message || "Query execution failed."}`,
        createdAt: new Date(),
        blocks: [
          {
            id: "err-block",
            type: "summary",
            title: "Execution Error",
            content: "The analytics engine failed to process the request."
          },
          {
            id: "err-insight",
            type: "insight",
            variant: "error",
            content: err.message || "Please ensure your database connection is active."
          }
        ]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSendingQuery(false);
    }
  };

  // E. Extract analysis contexts from messages
  const lastAssistantMessage = messages
    .slice()
    .reverse()
    .find(m => m.role === "assistant" && m.blocks);

  const activeSql = lastAssistantMessage?.sqlExecuted || "";
  const activeTable = lastAssistantMessage?.blocks?.find(b => b.type === "table") || null;
  const activeChart = lastAssistantMessage?.blocks?.find(b => b.type === "chart") || null;

  const queryHistory = messages
    .filter(m => m.role === "assistant" && m.sqlExecuted)
    .map(m => ({
      query: m.content.slice(0, 80),
      sql: m.sqlExecuted,
      timestamp: m.createdAt || new Date()
    }));

  const activeSessionTitle = sessions.find(s => s.id === activeSessionId)?.title || "New Conversation";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <HistorySidebar
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
      />
      <ConversationArea
        messages={messages}
        title={activeSessionTitle}
        loading={isSendingQuery}
        onSend={handleSendQuery}
      />
      <AnalysisPanel
        activeSql={activeSql}
        activeTable={activeTable}
        activeChart={activeChart}
        queryHistory={queryHistory}
      />
    </div>
  );
}
