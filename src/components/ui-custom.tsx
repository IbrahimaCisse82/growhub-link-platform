import { cn } from "@/lib/utils";
import { ReactNode } from "react";

// Metric Card
export function MetricCard({ icon, value, label, badge, badgeType = "up" }: {
  icon: string;
  value: string;
  label: string;
  badge: string;
  badgeType?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-card border border-border rounded-[14px] p-[18px] transition-all relative overflow-hidden hover:border-primary/15 group">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className={cn(
        "w-[38px] h-[38px] rounded-[9px] flex items-center justify-center mb-3.5 text-base",
        "bg-primary/10"
      )}>
        {icon}
      </div>
      <div className="font-heading text-[26px] font-extrabold leading-none mb-[3px]">{value}</div>
      <div className="text-[11px] text-muted-foreground font-medium mb-2.5">{label}</div>
      <span className={cn(
        "inline-flex items-center gap-[3px] text-[11px] font-bold px-[7px] py-[3px] rounded-full",
        badgeType === "up" && "bg-primary/10 text-primary",
        badgeType === "down" && "bg-ghred/10 text-ghred",
        badgeType === "neutral" && "bg-secondary text-foreground/70"
      )}>
        {badge}
      </span>
    </div>
  );
}

// Progress Bar
export function ProgressBar({ label, value, percentage, color }: {
  label: string;
  value: string;
  percentage: number;
  color?: string;
}) {
  return (
    <div className="mb-3.5">
      <div className="flex justify-between text-xs mb-[5px]">
        <span className="text-foreground/70 font-medium">{label}</span>
        <span className="text-primary font-bold font-heading">{value}</span>
      </div>
      <div className="h-[5px] bg-secondary rounded-[3px] overflow-hidden">
        <div
          className="h-full rounded-[3px] bg-gradient-to-r from-ghgreen-dark to-primary transition-all duration-1000"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  );
}

// Card wrapper
export function GHCard({ children, className, title, headerRight, onClick }: {
  children: ReactNode;
  className?: string;
  title?: string;
  headerRight?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-[22px] transition-all relative overflow-hidden hover:border-primary/15 hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {title && (
        <div className="flex items-center justify-between mb-[18px]">
          <div className="font-heading text-[13px] font-bold text-foreground/70 uppercase tracking-wider">{title}</div>
          {headerRight}
        </div>
      )}
      {children}
    </div>
  );
}

// Tag
export function Tag({ children, variant = "default" }: {
  children: ReactNode;
  variant?: "default" | "green" | "blue" | "orange" | "red" | "purple" | "teal";
}) {
  return (
    <span className={cn(
      "inline-flex items-center text-[10px] font-semibold px-2 py-[3px] rounded-full border whitespace-nowrap",
      variant === "default" && "bg-secondary text-foreground/70 border-border",
      variant === "green" && "bg-primary/10 text-primary border-primary/35",
      variant === "blue" && "bg-ghblue/12 text-ghblue border-ghblue/20",
      variant === "orange" && "bg-ghorange/12 text-ghorange border-ghorange/20",
      variant === "red" && "bg-ghred/12 text-ghred border-ghred/20",
      variant === "purple" && "bg-ghpurple/12 text-ghpurple border-ghpurple/20",
      variant === "teal" && "bg-ghteal/12 text-ghteal border-ghteal/20",
    )}>
      {children}
    </span>
  );
}

// Section Header
export function SectionHeader({ title, linkText, onLink }: {
  title: string;
  linkText?: string;
  onLink?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3.5">
      <h3 className="font-heading text-base font-extrabold">{title}</h3>
      {linkText && (
        <button onClick={onLink} className="text-xs text-primary cursor-pointer font-semibold hover:opacity-70 transition-opacity">
          {linkText}
        </button>
      )}
    </div>
  );
}

// Stat Row
export function StatRow({ label, value, valueColor }: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-b-0">
      <span className="text-xs text-foreground/70">{label}</span>
      <span className={cn("font-heading text-sm font-bold", valueColor || "text-primary")}>{value}</span>
    </div>
  );
}

// Activity Item
export function ActivityItem({ icon, iconBg, children, time, action }: {
  icon: string;
  iconBg: string;
  children: ReactNode;
  time: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex gap-2.5 items-start py-3 border-b border-border/40 last:border-b-0">
      <div className={cn("w-[34px] h-[34px] rounded-[9px] flex items-center justify-center flex-shrink-0 text-sm", iconBg)}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-xs text-foreground/70 leading-relaxed">{children}</div>
        <div className="text-[10px] text-muted-foreground/60 mt-0.5">{time}</div>
      </div>
      {action}
    </div>
  );
}
