"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays, ChevronLeft, ChevronRight, RefreshCcw,
  Loader2, Phone, CheckCircle2, XCircle, Clock, Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { CalendarEvent, OnboardingStatus } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getWeekDays(anchor: Date): Date[] {
  const day = anchor.getDay(); // 0=Sun
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_NAMES_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_NAMES_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

const STATUS_DOT: Record<OnboardingStatus, string> = {
  not_started:      "bg-muted-foreground/40",
  pending_call:     "bg-sky-500",
  pending_approval: "bg-amber-500",
  approved:         "bg-emerald-500",
  rejected:         "bg-destructive",
};

const STATUS_CARD: Record<OnboardingStatus, string> = {
  not_started:      "border-border bg-card",
  pending_call:     "border-sky-500/25 bg-sky-500/5",
  pending_approval: "border-amber-500/25 bg-amber-500/5",
  approved:         "border-emerald-500/25 bg-emerald-500/5",
  rejected:         "border-destructive/25 bg-destructive/5",
};

// ── Event card ─────────────────────────────────────────────────────────────────

function EventCard({ ev, onClick, storeWord }: { ev: CalendarEvent; onClick: () => void; storeWord: string }) {
  const statusIcon: Record<OnboardingStatus, React.ElementType> = {
    not_started: Clock, pending_call: Phone,
    pending_approval: Clock, approved: CheckCircle2, rejected: XCircle,
  };
  const Icon = statusIcon[ev.onboarding_status] ?? Clock;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border p-3 space-y-1.5 hover:shadow-sm transition-all duration-150",
        STATUS_CARD[ev.onboarding_status],
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[ev.onboarding_status])} />
        <p className="text-xs font-semibold truncate flex-1">{ev.name || ev.email}</p>
        <Icon className="w-3 h-3 text-muted-foreground shrink-0" />
      </div>
      <p className="text-[10px] text-muted-foreground">
        {new Date(ev.preferred_call_time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
      </p>
      {ev.store_count && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <Store className="w-3 h-3" /> {ev.store_count} {storeWord}
        </p>
      )}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CrmCalendarPage() {
  const router = useRouter();
  const t = useT({
    fr: {
      title: "Calendrier d'appels", today: "Aujourd'hui",
      total_one: "appel programmé au total", total_many: "appels programmés au total",
      upcoming: "Prochains appels", no_upcoming: "Aucun appel programmé",
      store_one: "restaurant", store_many: "restaurants", lang: "fr",
    },
    en: {
      title: "Call Calendar", today: "Today",
      total_one: "call scheduled total", total_many: "calls scheduled total",
      upcoming: "Upcoming calls", no_upcoming: "No upcoming calls scheduled",
      store_one: "store", store_many: "stores", lang: "en",
    },
  });
  const DAY_NAMES = t.lang === "fr" ? DAY_NAMES_FR : DAY_NAMES_EN;
  const MONTH_NAMES = t.lang === "fr" ? MONTH_NAMES_FR : MONTH_NAMES_EN;
  const [events, setEvents]   = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchor, setAnchor]   = useState(new Date());

  const weekDays = getWeekDays(anchor);
  const monthLabel = `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}`;

  async function fetchEvents() {
    setLoading(true);
    try {
      const d = await api.get<{ events: CalendarEvent[] }>("/crm/calendar");
      setEvents(d.events ?? []);
    } catch { setEvents([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchEvents(); }, []);

  function prevWeek() {
    const d = new Date(anchor);
    d.setDate(d.getDate() - 7);
    setAnchor(d);
  }
  function nextWeek() {
    const d = new Date(anchor);
    d.setDate(d.getDate() + 7);
    setAnchor(d);
  }
  function goToday() { setAnchor(new Date()); }

  // Events for each day
  function eventsForDay(day: Date): CalendarEvent[] {
    return events.filter((ev) => {
      try {
        const d = new Date(ev.preferred_call_time);
        return d.getFullYear() === day.getFullYear()
          && d.getMonth() === day.getMonth()
          && d.getDate() === day.getDate();
      } catch { return false; }
    }).sort((a, b) => new Date(a.preferred_call_time).getTime() - new Date(b.preferred_call_time).getTime());
  }

  const today = new Date();

  // Upcoming events (next 7 days)
  const upcoming = events
    .filter((ev) => {
      try { return new Date(ev.preferred_call_time) >= today; }
      catch { return false; }
    })
    .sort((a, b) => new Date(a.preferred_call_time).getTime() - new Date(b.preferred_call_time).getTime())
    .slice(0, 5);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-400 mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="text-primary" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {events.length} {events.length !== 1 ? t.total_many : t.total_one}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={goToday}>{t.today}</Button>
          <Button size="sm" variant="outline" onClick={fetchEvents} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* Week view */}
        <div className="xl:col-span-3 space-y-4">
          {/* Week navigation */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <button onClick={prevWeek} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextWeek} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Week grid */}
          <div className="rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-7 divide-x divide-border border-b border-border bg-muted/40">
              {weekDays.map((day, i) => {
                const isToday = day.toDateString() === today.toDateString();
                return (
                  <div key={i} className="px-2 py-3 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{DAY_NAMES[i]}</p>
                    <p className={cn(
                      "text-sm font-black mt-0.5 w-7 h-7 flex items-center justify-center mx-auto rounded-full",
                      isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                    )}>
                      {day.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7 divide-x divide-border min-h-[320px]">
              {weekDays.map((day, i) => {
                const dayEvents = eventsForDay(day);
                const isToday  = day.toDateString() === today.toDateString();
                return (
                  <div key={i} className={cn("p-2 space-y-1.5 min-h-[120px]", isToday && "bg-primary/3")}>
                    {loading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/40" />
                      </div>
                    ) : dayEvents.length === 0 ? (
                      <div className="h-full" />
                    ) : dayEvents.map((ev) => (
                      <EventCard
                        key={ev.user_id}
                        ev={ev}
                        storeWord={(ev.store_count ?? 0) > 1 ? t.store_many : t.store_one}
                        onClick={() => router.push(`/crm/${ev.user_id}`)}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div className="xl:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold">{t.upcoming}</h3>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
              {t.no_upcoming}
            </div>
          ) : upcoming.map((ev) => (
            <div
              key={ev.user_id}
              className={cn(
                "rounded-2xl border p-4 cursor-pointer hover:shadow-sm transition-all",
                STATUS_CARD[ev.onboarding_status],
              )}
              onClick={() => router.push(`/crm/${ev.user_id}`)}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[ev.onboarding_status])} />
                <p className="text-xs font-semibold truncate">{ev.name || ev.email}</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                {new Date(ev.preferred_call_time).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                {" · "}
                {new Date(ev.preferred_call_time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </p>
              {ev.phone_number && (
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />{ev.phone_code} {ev.phone_number}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
