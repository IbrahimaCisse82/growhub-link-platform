import { Bell, BellOff } from "lucide-react";
import { useEventReminders } from "@/hooks/useEventReminders";

interface Props {
  eventId: string;
  startsAt: string;
  title: string;
}

export default function ReminderButton({ eventId, startsAt, title }: Props) {
  const { hasReminder, createReminder, removeReminder } = useEventReminders();
  const active = hasReminder(eventId);

  const handleClick = () => {
    if (active) removeReminder.mutate(eventId);
    else createReminder.mutate({ eventId, startsAt, title });
  };

  return (
    <button
      onClick={handleClick}
      disabled={createReminder.isPending || removeReminder.isPending}
      title={active ? "Annuler le rappel" : "Programmer un rappel 30 min avant"}
      className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary"
      }`}
    >
      {active ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
      {active ? "Rappel actif" : "Me rappeler"}
    </button>
  );
}
