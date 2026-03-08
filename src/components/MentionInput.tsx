import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface MentionUser {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSubmit?: () => void;
  multiline?: boolean;
}

export default function MentionInput({ value, onChange, placeholder, className, onSubmit, multiline = false }: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  const searchUsers = useCallback(async (query: string) => {
    if (query.length < 1) { setSuggestions([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, display_name, avatar_url")
      .ilike("display_name", `%${query}%`)
      .limit(5);
    setSuggestions((data ?? []) as MentionUser[]);
  }, []);

  const handleChange = (text: string) => {
    onChange(text);
    const pos = inputRef.current?.selectionStart ?? text.length;
    setCursorPos(pos);

    // Check if we're in a mention context
    const textBeforeCursor = text.slice(0, pos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowSuggestions(true);
      setSelectedIdx(0);
      searchUsers(mentionMatch[1]);
    } else {
      setShowSuggestions(false);
    }
  };

  const insertMention = (user: MentionUser) => {
    const textBeforeCursor = value.slice(0, cursorPos);
    const textAfterCursor = value.slice(cursorPos);
    const mentionStart = textBeforeCursor.lastIndexOf("@");
    const newText = textBeforeCursor.slice(0, mentionStart) + `@${user.display_name} ` + textAfterCursor;
    onChange(newText);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insertMention(suggestions[selectedIdx]); }
      else if (e.key === "Escape") { setShowSuggestions(false); }
    } else if (e.key === "Enter" && !e.shiftKey && !multiline && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  const Comp = multiline ? "textarea" : "input";

  return (
    <div className="relative">
      <Comp
        ref={inputRef as any}
        value={value}
        onChange={(e: any) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary/40 transition-colors",
          multiline && "resize-none min-h-[80px]",
          className
        )}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {suggestions.map((u, i) => (
            <button
              key={u.user_id}
              onClick={() => insertMention(u)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs hover:bg-secondary/60 transition-colors",
                i === selectedIdx && "bg-secondary/60"
              )}
            >
              {u.avatar_url ? (
                <img src={u.avatar_url} className="w-6 h-6 rounded-full object-cover" alt="" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                  {u.display_name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-medium">{u.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Utility: render text with @mentions highlighted
export function MentionText({ text, onMentionClick }: { text: string; onMentionClick?: (name: string) => void }) {
  const parts = text.split(/(@\w[\w\s]*?(?=\s@|\s#|$|[.!?,;]))/g);
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <button
            key={i}
            onClick={() => onMentionClick?.(part.slice(1).trim())}
            className="text-primary font-semibold hover:underline"
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
