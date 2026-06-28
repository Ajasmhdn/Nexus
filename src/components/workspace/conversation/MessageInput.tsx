"use client";

import { useState, useRef, useEffect } from "react";
import { Paperclip, Database, ArrowUp, X, CheckCircle2, Shield, Network, HardDrive, RefreshCw } from "lucide-react";
import { suggestedPrompts } from "@/lib/mock-data";

export default function MessageInput() {
  const [value, setValue] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showDbPopover, setShowDbPopover] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dbButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Click outside database popover handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        dbButtonRef.current &&
        !dbButtonRef.current.contains(event.target as Node)
      ) {
        setShowDbPopover(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const removeAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDbClick = () => {
    setShowDbPopover((prev) => !prev);
  };

  return (
    <div className="px-6 pb-6 pt-3 bg-gradient-to-t from-white via-white/95 to-transparent relative">
      <div className="max-w-[720px] mx-auto w-full relative">
        {/* Database Connection Info Popover */}
        {showDbPopover && (
          <div
            ref={popoverRef}
            className="absolute bottom-20 left-12 z-50 w-72 bg-white rounded-xl border border-border shadow-xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-border">
              <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-accent" />
                Active Database Connection
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] text-success font-medium">Connected</span>
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  Type
                </span>
                <span className="font-mono text-text-primary">PostgreSQL (v16.2)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted flex items-center gap-1">
                  <Network className="w-3 h-3" />
                  Host
                </span>
                <span className="font-mono text-text-primary text-right truncate max-w-[150px]">
                  pg-cluster-prod.internal
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Port</span>
                <span className="font-mono text-text-primary">5432</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Database</span>
                <span className="font-mono text-text-primary">ops_intelligence_db</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  User
                </span>
                <span className="font-mono text-text-primary">read_only_analyst</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">SSL Mode</span>
                <span className="font-mono text-text-primary">Require</span>
              </div>
            </div>

            <div className="mt-3.5 pt-3.5 border-t border-border flex items-center justify-between text-[10px] text-text-muted">
              <span>Latency: 0.24ms</span>
              <button className="flex items-center gap-1 text-accent hover:text-accent-hover font-medium cursor-pointer transition-colors">
                <RefreshCw className="w-2.5 h-2.5" />
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Suggested Prompts */}
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => setValue(prompt)}
              className="px-3 py-1.5 bg-surface border border-border rounded-full text-xs text-text-secondary hover:text-accent hover:border-accent/30 cursor-pointer transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Container */}
        <div className="bg-white border border-border rounded-xl focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/10 transition-all shadow-lg shadow-black/5 overflow-hidden">
          {/* Attached File Preview Bar */}
          {attachedFile && (
            <div className="px-4 py-2 bg-surface-alt/40 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-accent-light flex items-center justify-center text-accent text-xs font-semibold">
                  {attachedFile.name.split(".").pop()?.toUpperCase() || "FILE"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate max-w-[280px]">
                    {attachedFile.name}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {(attachedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={removeAttachedFile}
                className="w-5 h-5 rounded-full hover:bg-surface flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask about your operational data..."
            rows={1}
            className="w-full bg-transparent px-4 pt-3 pb-2 text-sm text-text-primary placeholder:text-text-muted resize-none outline-none min-h-[44px] max-h-[200px]"
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-1">
              {/* Media Button */}
              <button
                type="button"
                onClick={handleAttachmentClick}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  attachedFile
                    ? "bg-accent-light text-accent"
                    : "text-text-muted hover:bg-surface hover:text-text-secondary"
                }`}
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Database Connection Button */}
              <button
                type="button"
                ref={dbButtonRef}
                onClick={handleDbClick}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  showDbPopover
                    ? "bg-accent-light text-accent"
                    : "text-text-muted hover:bg-surface hover:text-text-secondary"
                }`}
                title="Database connection info"
              >
                <Database className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-text-muted hidden sm:inline">
                ⌘ Enter
              </span>
              <button
                disabled={!value.trim() && !attachedFile}
                className="w-8 h-8 rounded-lg bg-accent hover:bg-accent-hover flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
