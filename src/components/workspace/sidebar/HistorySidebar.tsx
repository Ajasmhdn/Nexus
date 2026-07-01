"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Settings, LogOut, MessageSquare, Trash2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/format";

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string | Date;
}

interface HistorySidebarProps {
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
}

export default function HistorySidebar({
  activeSessionId,
  onSelectSession,
  onCreateSession
}: HistorySidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<Conversation[]>([]);
  const [userProfile, setUserProfile] = useState<{ userId: string; email: string; role: string; fullName: string; jobTitle: string | null } | null>(null);

  // Load profile and sessions
  const loadSessions = () => {
    fetch("/api/chat/sessions")
      .then((res) => {
        if (!res.ok) throw new Error("Sessions fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.sessions) {
          setSessions(data.sessions);
        }
      })
      .catch((err) => console.error("Error loading sessions:", err));
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Session fetch failed");
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUserProfile(data.user);
        }
      })
      .catch((err) => console.error("Error loading user profile:", err));

    loadSessions();

    // Listen to changes from outside to trigger reload if message updates
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/auth");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const res = await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
          onSelectSession("");
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const groupConversations = (conversations: Conversation[]) => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const last7Days: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
    const startOf7DaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const conv of conversations) {
      const date = new Date(conv.timestamp);
      if (date >= startOfToday) {
        today.push(conv);
      } else if (date >= startOfYesterday) {
        yesterday.push(conv);
      } else if (date >= startOf7DaysAgo) {
        last7Days.push(conv);
      } else {
        older.push(conv);
      }
    }

    const groups = [];
    if (today.length > 0) groups.push({ label: "Today", conversations: today });
    if (yesterday.length > 0) groups.push({ label: "Yesterday", conversations: yesterday });
    if (last7Days.length > 0) groups.push({ label: "Previous 7 Days", conversations: last7Days });
    if (older.length > 0) groups.push({ label: "Older Conversations", conversations: older });

    return groups;
  };

  const filteredConversations = sessions.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const conversationGroups = groupConversations(filteredConversations);

  return (
    <aside className="w-[280px] min-w-[280px] bg-surface border-r border-border flex flex-col h-screen">
      {/* New Conversation */}
      <div className="p-4">
        <button
          onClick={onCreateSession}
          className="w-full bg-accent hover:bg-accent-hover text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-accent/20"
        >
          <Plus className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full bg-white border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversationGroups.length > 0 ? (
          conversationGroups.map((group, gi) => (
            <div key={group.label}>
              <div
                className={`text-[11px] font-medium text-text-muted uppercase tracking-wider px-2 py-2 ${
                  gi > 0 ? "mt-4" : ""
                }`}
              >
                {group.label}
              </div>
              {group.conversations.map((conv) => {
                const isActive = conv.id === activeSessionId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectSession(conv.id)}
                    className={`group/item px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5 relative ${
                      isActive
                        ? "bg-accent-light text-accent border border-accent/15"
                        : "hover:bg-white text-text-secondary"
                    }`}
                  >
                    <div className="pr-6">
                      <div className={`text-sm font-medium truncate ${isActive ? "text-accent" : ""}`}>
                        {conv.title}
                      </div>
                      <div className="text-xs text-text-muted truncate mt-0.5">
                        {conv.preview}
                      </div>
                      <div className="text-[11px] text-text-muted mt-1">
                        {formatRelativeTime(new Date(conv.timestamp).toISOString())}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(e, conv.id)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 hover:text-danger text-text-muted transition-opacity p-1 rounded hover:bg-surface cursor-pointer"
                      title="Delete conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4 space-y-2">
            <MessageSquare className="w-8 h-8 text-text-muted/60 mx-auto" />
            <p className="text-sm font-medium text-text-secondary">No results found</p>
            <p className="text-xs text-text-muted">No conversations match &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent text-xs font-semibold flex-shrink-0 uppercase">
            {(userProfile?.fullName || userProfile?.userId || "US").substring(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-text-primary truncate">
              {userProfile?.fullName || "Loading..."}
            </p>
            <p className="text-xs text-text-muted truncate">
              {userProfile?.jobTitle || ""}
            </p>
            <p className="text-[11px] text-text-muted truncate">
              {userProfile?.email || ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors cursor-pointer">
              <Settings className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
