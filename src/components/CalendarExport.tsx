import { Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end?: Date;
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function generateICS(events: CalendarEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GrowHubLink//Events//FR",
    "CALSCALE:GREGORIAN",
  ];

  events.forEach((event) => {
    const end = event.end ?? new Date(event.start.getTime() + 60 * 60 * 1000);
    lines.push(
      "BEGIN:VEVENT",
      `DTSTART:${formatICSDate(event.start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, "\\n")}` : "",
      event.location ? `LOCATION:${event.location}` : "",
      `UID:${crypto.randomUUID()}@growhublink.com`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}

function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const start = formatICSDate(event.start);
  const end = formatICSDate(event.end ?? new Date(event.start.getTime() + 60 * 60 * 1000));
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
    details: event.description ?? "",
    location: event.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Export single event
export function ExportEventButton({ event }: { event: CalendarEvent }) {
  const { t } = useTranslation();
  const handleICS = () => {
    const ics = generateICS([event]);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, "_")}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("c1.calendarExport.eventExported"));
  };

  const handleGoogle = () => {
    window.open(generateGoogleCalendarUrl(event), "_blank");
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleICS}
        className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg border border-border hover:border-primary/30"
        title={t("c1.calendarExport.downloadIcs")}
      >
        <Download className="w-3 h-3" />
        {t("c1.calendarExport.ical")}
      </button>
      <button
        onClick={handleGoogle}
        className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg border border-border hover:border-primary/30"
        title={t("c1.calendarExport.googleCalendar")}
      >
        <Calendar className="w-3 h-3" />
        {t("c1.calendarExport.google")}
      </button>
    </div>
  );
}

// Export all events
export function ExportAllEventsButton({ events }: { events: CalendarEvent[] }) {
  const { t } = useTranslation();
  const handleExport = () => {
    if (events.length === 0) { toast.error(t("c1.calendarExport.noEventsToExport")); return; }
    const ics = generateICS(events);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "growhublink-events.ics";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("c1.calendarExport.eventsExported", { count: events.length }));
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 hover:bg-primary/20 transition-colors"
    >
      <Calendar className="w-3.5 h-3.5" />
      {t("c1.calendarExport.exportCalendar", { count: events.length })}
    </button>
  );
}
