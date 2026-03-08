import { useState, useMemo } from "react";
import { Hash, X, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Predefined popular tags by category
const tagSuggestions: Record<string, string[]> = {
  secteur: ["SaaS", "FinTech", "HealthTech", "EdTech", "CleanTech", "FoodTech", "DeepTech", "AI/ML", "Blockchain", "IoT", "Cybersecurity", "MarketPlace"],
  compétence: ["Growth", "Fundraising", "Product", "Sales", "Marketing", "Dev", "Design", "DataScience", "Legal", "Finance", "Operations", "HR"],
  besoin: ["Co-fondateur", "Investisseur", "Mentor", "Dev", "Designer", "Commercial", "Partenariat", "Beta-testeurs", "Conseil", "Networking"],
  stade: ["Idéation", "MVP", "Seed", "Série A", "Série B", "Scale-up", "Profitable", "Bootstrap"],
};

interface SmartTagsProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  placeholder?: string;
  context?: "post" | "profile" | "event";
}

export default function SmartTags({ selectedTags, onChange, maxTags = 5, placeholder, context = "post" }: SmartTagsProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue && !showSuggestions) return {};
    const query = inputValue.toLowerCase();
    const result: Record<string, string[]> = {};
    Object.entries(tagSuggestions).forEach(([category, tags]) => {
      const filtered = tags.filter(
        tag => tag.toLowerCase().includes(query) && !selectedTags.includes(tag)
      );
      if (filtered.length > 0) result[category] = filtered.slice(0, 4);
    });
    return result;
  }, [inputValue, selectedTags, showSuggestions]);

  const addTag = (tag: string) => {
    if (selectedTags.length >= maxTags) return;
    if (!selectedTags.includes(tag)) {
      onChange([...selectedTags, tag]);
    }
    setInputValue("");
    setShowSuggestions(false);
  };

  const removeTag = (tag: string) => {
    onChange(selectedTags.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1]);
    }
  };

  const hasSuggestions = Object.keys(filteredSuggestions).length > 0;

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 items-center bg-secondary/50 border border-border rounded-xl px-3 py-2 min-h-[40px] focus-within:border-primary/40 transition-colors">
        {selectedTags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 rounded-lg px-2 py-0.5 text-[11px] font-semibold">
            <Hash className="w-2.5 h-2.5" />
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {selectedTags.length < maxTags && (
          <input
            value={inputValue}
            onChange={e => { setInputValue(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? (placeholder ?? "Ajouter des tags...") : ""}
            className="flex-1 min-w-[100px] bg-transparent outline-none text-xs"
          />
        )}
      </div>

      {/* Tag suggestions dropdown */}
      {showSuggestions && hasSuggestions && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-64 overflow-y-auto">
          {Object.entries(filteredSuggestions).map(([category, tags]) => (
            <div key={category}>
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/30">
                {category}
              </div>
              <div className="flex flex-wrap gap-1 p-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    <Hash className="w-2.5 h-2.5 text-primary" /> {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTags.length > 0 && (
        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          {selectedTags.length}/{maxTags} tags
        </div>
      )}
    </div>
  );
}

// Display-only component for tags
export function TagDisplay({ tags, size = "sm" }: { tags: string[]; size?: "sm" | "xs" }) {
  if (!tags?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map(tag => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-0.5 bg-primary/10 text-primary border border-primary/20 rounded-lg font-semibold",
            size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-1.5 py-0.5 text-[10px]"
          )}
        >
          <Hash className="w-2.5 h-2.5" />{tag}
        </span>
      ))}
    </div>
  );
}

// Trending tags component
export function TrendingTags({ onTagClick }: { onTagClick?: (tag: string) => void }) {
  // Static trending for now - could be computed from DB
  const trending = ["SaaS", "AI/ML", "Fundraising", "Growth", "HealthTech", "Seed"];
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
        <TrendingUp className="w-3 h-3" /> Tendances
      </div>
      {trending.map(tag => (
        <button
          key={tag}
          onClick={() => onTagClick?.(tag)}
          className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-border hover:border-primary/30 hover:text-primary transition-colors"
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}
