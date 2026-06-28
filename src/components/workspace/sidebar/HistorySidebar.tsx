"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Settings, LogOut, MessageSquare } from "lucide-react";
import { conversationGroups } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/format";

export default function HistorySidebar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<{ userId: string; email: string; role: string; fullName: string; jobTitle: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Session fetch failed");
        }
        return res.json();
      })
      .then((data) => {
        if (data.user) {
          setUserProfile(data.user);
        }
      })
      .catch((err) => console.error("Error loading user profile:", err));
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

  const filteredGroups = conversationGroups
    .map((group) => {
      const filteredConversations = group.conversations.filter(
        (conv) =>
          conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return {
        ...group,
        conversations: filteredConversations,
      };
    })
    .filter((group) => group.conversations.length > 0);

  return (
    <aside className="w-[280px] min-w-[280px] bg-surface border-r border-border flex flex-col h-screen">
      {/* New Conversation */}
      <div className="p-4">
        <button className="w-full bg-accent hover:bg-accent-hover text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-accent/20">
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
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, gi) => (
            <div key={group.label}>
              <div
                className={`text-[11px] font-medium text-text-muted uppercase tracking-wider px-2 py-2 ${
                  gi > 0 ? "mt-4" : ""
                }`}
              >
                {group.label}
              </div>
              {group.conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5 ${
                    conv.isActive
                      ? "bg-accent-light text-accent border border-accent/15"
                      : "hover:bg-white text-text-secondary"
                  }`}
                >
                  <div className={`text-sm font-medium truncate ${conv.isActive ? "text-accent" : ""}`}>
                    {conv.title}
                  </div>
                  <div className="text-xs text-text-muted truncate mt-0.5">
                    {conv.preview}
                  </div>
                  <div className="text-[11px] text-text-muted mt-1">
                    {formatRelativeTime(conv.timestamp)}
                  </div>
                </div>
              ))}
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
