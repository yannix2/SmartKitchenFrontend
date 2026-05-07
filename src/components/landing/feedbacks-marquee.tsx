"use client";

import { useEffect, useState } from "react";
import { Star, Quote, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { PublicFeedback, PublicFeedbackResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-3.5 h-3.5",
            i < Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function FeedbackCard({ fb }: { fb: PublicFeedback }) {
  const initials = `${fb.user.name?.[0] ?? ""}${fb.user.family_name?.[0] ?? ""}`.toUpperCase();
  return (
    <article className="shrink-0 w-[320px] sm:w-[380px] rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {fb.user.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={fb.user.avatar_url}
              alt={fb.user.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary ring-2 ring-primary/20 shrink-0">
              {initials || "?"}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{fb.user.name} {fb.user.family_name}</p>
            {fb.user.city && (
              <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                <MapPin className="w-3 h-3" />{fb.user.city}
              </p>
            )}
          </div>
        </div>
        <Quote className="w-5 h-5 text-primary/30 shrink-0" />
      </div>
      <Stars value={fb.rating} />
      {fb.comment && (
        <p className="mt-3 text-sm text-foreground/85 leading-relaxed line-clamp-5">
          {fb.comment}
        </p>
      )}
    </article>
  );
}

export function FeedbacksMarquee() {
  const t = useT({
    fr: {
      eyebrow: "Témoignages",
      title: "Ce que disent nos restaurateurs",
      subtitle_one: "avis · note moyenne",
      subtitle_many: "avis · note moyenne",
      empty: "Soyez le premier à laisser un avis depuis votre tableau de bord.",
    },
    en: {
      eyebrow: "Testimonials",
      title: "What our restaurants say",
      subtitle_one: "review · average rating",
      subtitle_many: "reviews · average rating",
      empty: "Be the first to leave a review from your dashboard.",
    },
  });

  const [data, setData] = useState<PublicFeedbackResponse | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch(`${BASE_URL}/feedback/public?limit=20`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: PublicFeedbackResponse | null) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-48 rounded-3xl skeleton" />
        </div>
      </section>
    );
  }

  const feedbacks = data?.feedbacks ?? [];

  if (feedbacks.length === 0) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{t.eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{t.title}</h2>
          <p className="text-sm text-muted-foreground">{t.empty}</p>
        </div>
      </section>
    );
  }

  // Duplicate the list so the marquee loops seamlessly
  const looped = [...feedbacks, ...feedbacks];

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-primary/5 via-transparent to-primary/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">{t.eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{t.title}</h2>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Stars value={data?.average ?? 0} />
            <span className="font-semibold text-foreground">{(data?.average ?? 0).toFixed(1)}</span>
            <span>·</span>
            <span>
              {(data?.total ?? 0)} {data && data.total !== 1 ? t.subtitle_many : t.subtitle_one}
            </span>
          </div>
        </div>
      </div>

      <div className="group relative">
        {/* Edge fades */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-linear-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-linear-to-l from-background to-transparent" />

        <div className="flex gap-4 animate-marquee group-hover:[animation-play-state:paused]">
          {looped.map((fb, i) => (
            <FeedbackCard key={`${fb.id}-${i}`} fb={fb} />
          ))}
        </div>
      </div>
    </section>
  );
}
