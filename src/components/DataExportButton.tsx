import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download } from "lucide-react";

function convertToCSV(data: Record<string, any>[], filename: string) {
  if (!data || data.length === 0) {
    toast.error("Aucune donnée à exporter");
    return;
  }
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`${filename}.csv exporté !`);
}

interface ExportButtonProps {
  table: string;
  label: string;
  filename: string;
  columns?: string;
  filterByUser?: boolean;
}

export default function DataExportButton({ table, label, filename, columns = "*", filterByUser = true }: ExportButtonProps) {
  const { user } = useAuth();

  const handleExport = async () => {
    if (!user) return;
    let query = (supabase as any).from(table).select(columns);
    if (filterByUser) {
      query = query.eq("user_id", user.id);
    }
    const { data, error } = await query.limit(1000);
    if (error) {
      toast.error("Erreur lors de l'export");
      return;
    }
    convertToCSV(data, filename);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5 text-[11px] font-bold text-foreground/70 hover:text-primary hover:border-primary/30 transition-colors"
    >
      <Download className="w-3 h-3" />
      {label}
    </button>
  );
}

export { convertToCSV };
