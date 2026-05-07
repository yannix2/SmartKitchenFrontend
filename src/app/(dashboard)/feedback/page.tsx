"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Loader2, Trash2, Save, Plus, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/provider";
import type { SelfFeedback } from "@/types";

function StarPicker({
  value, onChange, size = "lg",
}: {
  value: number;
  onChange: (n: number) => void;
  size?: "sm" | "lg";
}) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  const cls = size === "lg" ? "w-8 h-8" : "w-5 h-5";
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 press-scale"
          aria-label={`${n} stars`}
        >
          <Star
            className={cn(
              cls,
              "transition-colors",
              n <= display ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 hover:text-amber-400/60",
            )}
          />
        </button>
      ))}
      {value > 0 && size === "lg" && <span className="ml-1 text-sm font-bold tabular-nums">{value}/5</span>}
    </div>
  );
}

export default function FeedbackPage() {
  const toast = useToast();
  const t = useT({
    fr: {
      title: "Vos avis",
      subtitle: "Partagez plusieurs expériences au fil du temps — chaque avis est publié séparément.",
      add_new: "Nouvel avis",
      cancel: "Annuler",
      rating_label: "Note",
      rating_required: "Sélectionnez une note avant d'envoyer.",
      comment_label: "Commentaire (optionnel)",
      comment_ph: "Qu'est-ce qui a fonctionné ? Qu'est-ce qui pourrait être amélioré ?",
      char_count: "{n}/1000 caractères",
      save: "Publier l'avis",
      save_edit: "Enregistrer les modifications",
      saving: "Enregistrement…",
      saved: "Avis publié. Merci !",
      updated: "Avis mis à jour.",
      delete: "Supprimer",
      edit: "Modifier",
      delete_confirm: "Supprimer cet avis ?",
      deleted: "Avis supprimé.",
      err_save: "Échec de l'enregistrement",
      err_delete: "Échec de la suppression",
      published: "Publié",
      unpublished: "En attente de modération",
      no_yet: "Vous n'avez encore laissé aucun avis.",
      first_cta: "Laisser votre premier avis",
      count_one: "avis",
      count_many: "avis",
    },
    en: {
      title: "Your reviews",
      subtitle: "Share multiple experiences over time — each review is published separately.",
      add_new: "New review",
      cancel: "Cancel",
      rating_label: "Rating",
      rating_required: "Pick a rating before submitting.",
      comment_label: "Comment (optional)",
      comment_ph: "What worked well? Anything we could improve?",
      char_count: "{n}/1000 characters",
      save: "Publish review",
      save_edit: "Save changes",
      saving: "Saving…",
      saved: "Review published. Thank you!",
      updated: "Review updated.",
      delete: "Delete",
      edit: "Edit",
      delete_confirm: "Delete this review?",
      deleted: "Review deleted.",
      err_save: "Save failed",
      err_delete: "Delete failed",
      published: "Published",
      unpublished: "Pending moderation",
      no_yet: "You haven't left any reviews yet.",
      first_cta: "Leave your first review",
      count_one: "review",
      count_many: "reviews",
    },
  });

  const [list, setList]     = useState<SelfFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null); // null = closed, "" = creating, "<id>" = editing
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving]   = useState(false);

  function refresh() {
    setLoading(true);
    api.get<SelfFeedback[]>("/feedback/me")
      .then((d) => setList(d ?? []))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { refresh(); }, []);

  function openCreate() {
    setEditingId("");
    setRating(0);
    setComment("");
  }
  function openEdit(fb: SelfFeedback) {
    setEditingId(fb.id);
    setRating(fb.rating);
    setComment(fb.comment ?? "");
  }
  function closeForm() {
    setEditingId(null);
    setRating(0);
    setComment("");
  }

  async function save() {
    if (rating < 1) {
      toast.error(t.rating_required);
      return;
    }
    setSaving(true);
    try {
      if (editingId === "" || editingId === null) {
        await api.post<SelfFeedback>("/feedback", { rating, comment: comment.trim() || null });
        toast.success(t.saved);
      } else {
        await api.patch<SelfFeedback>(`/feedback/me/${editingId}`, { rating, comment: comment.trim() || null });
        toast.success(t.updated);
      }
      closeForm();
      refresh();
    } catch (err: unknown) {
      toast.error((err as { detail?: string }).detail ?? t.err_save);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(t.delete_confirm)) return;
    try {
      await api.delete(`/feedback/me/${id}`);
      toast.success(t.deleted);
      refresh();
    } catch (err: unknown) {
      toast.error((err as { detail?: string }).detail ?? t.err_delete);
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="text-primary" style={{ width: "18px", height: "18px" }} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">{t.title}</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {list.length > 0
              ? `${list.length} ${list.length !== 1 ? t.count_many : t.count_one}`
              : t.subtitle}
          </p>
        </div>
        {editingId === null && (
          <Button size="sm" onClick={openCreate} className="gap-1.5 shrink-0">
            <Plus className="w-3.5 h-3.5" />{t.add_new}
          </Button>
        )}
      </div>

      {/* Form (create/edit) */}
      {editingId !== null && (
        <div className="rounded-2xl border border-primary/30 bg-card p-5 space-y-4 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {editingId === "" ? t.add_new : t.edit}
            </p>
            <button
              onClick={closeForm}
              aria-label={t.cancel}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t.rating_label}</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t.comment_label}</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 1000))}
              placeholder={t.comment_ph}
              rows={5}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
            <p className="text-[10px] text-muted-foreground text-right mt-1">
              {t.char_count.replace("{n}", String(comment.length))}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={closeForm} disabled={saving}>{t.cancel}</Button>
            <Button size="sm" onClick={save} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? t.saving : (editingId === "" ? t.save : t.save_edit)}
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : list.length === 0 && editingId === null ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">{t.no_yet}</p>
          <Button size="sm" onClick={openCreate} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />{t.first_cta}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {list.map((fb) => (
            <article
              key={fb.id}
              className={cn(
                "rounded-2xl border bg-card p-5 transition-colors",
                editingId === fb.id ? "border-primary/40 opacity-50" : "border-border hover:border-primary/30",
              )}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <StarPicker value={fb.rating} onChange={() => {}} size="sm" />
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold",
                    fb.is_published
                      ? "bg-emerald-500/15 text-emerald-600"
                      : "bg-amber-500/15 text-amber-600",
                  )}>
                    {fb.is_published ? t.published : t.unpublished}
                  </span>
                </div>
              </div>
              {fb.comment && (
                <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{fb.comment}</p>
              )}
              <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground">
                  {new Date(fb.updated_at).toLocaleDateString("fr-FR")}
                  {fb.updated_at !== fb.created_at && " · ✎"}
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm" variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => openEdit(fb)}
                    disabled={editingId !== null}
                  >
                    <Pencil className="w-3 h-3" />{t.edit}
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => remove(fb.id)}
                    disabled={editingId !== null}
                  >
                    <Trash2 className="w-3 h-3" />{t.delete}
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
