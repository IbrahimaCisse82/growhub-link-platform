import { motion } from "framer-motion";
import { LucideIcon, Inbox } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Reusable empty state with micro-animation + accessible structure.
 */
export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
        className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4"
      >
        <Icon className="w-7 h-7" aria-hidden="true" />
      </motion.div>
      <h3 className="font-heading font-bold text-base md:text-lg text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
