"use client";

import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/provider";

const SUPPORT_EMAIL = "support@smartkitchen.com";

export default function ContactPage() {
  const t = useT({
    fr: {
      eyebrow: "Contact",
      title: "Une question ? Parlons-en.",
      lead: "Notre équipe répond dans la journée — du lundi au vendredi.",
      direct_email: "Email direct",
      direct_email_desc: "Pour toute question, technique ou commerciale.",
      form_title: "Ou envoyez-nous un message",
      f_name: "Votre nom",
      f_email: "Votre email",
      f_subject: "Sujet",
      f_message: "Message",
      f_send: "Envoyer",
      success_title: "Message prêt à être envoyé",
      success_body: "Votre client email s'est ouvert. Validez l'envoi pour finaliser.",
      hours_title: "Horaires support",
      hours_body: "Lundi — Vendredi · 9h — 18h (CET). Réponse moyenne en 4h.",
    },
    en: {
      eyebrow: "Contact",
      title: "Got a question? Let's talk.",
      lead: "Our team replies within a business day — Monday to Friday.",
      direct_email: "Direct email",
      direct_email_desc: "For any technical or commercial question.",
      form_title: "Or send us a message",
      f_name: "Your name",
      f_email: "Your email",
      f_subject: "Subject",
      f_message: "Message",
      f_send: "Send",
      success_title: "Message ready to send",
      success_body: "Your email client just opened — confirm the send to deliver it.",
      hours_title: "Support hours",
      hours_body: "Monday — Friday · 9am — 6pm (CET). Average response in 4h.",
    },
  });

  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const body = `${message}\n\n---\nFrom: ${name} <${email}>`;
    const url  = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    setTimeout(() => { setSending(false); setSent(true); }, 600);
  }

  return (
    <div className="animate-fade-in-up px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest">
            <MessageSquare className="w-3.5 h-3.5" /> {t.eyebrow}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight">{t.title}</h1>
          <p className="text-lg text-muted-foreground">{t.lead}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column: direct contact */}
          <div className="space-y-4">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all row-hover-lift"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t.direct_email}</p>
                  <p className="font-semibold text-sm mt-0.5">{SUPPORT_EMAIL}</p>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{t.direct_email_desc}</p>
                </div>
              </div>
            </a>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t.hours_title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.hours_body}</p>
            </div>
          </div>

          {/* Right column: form */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
              <h2 className="text-xl font-black tracking-tight">{t.form_title}</h2>

              {sent ? (
                <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-primary">{t.success_title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.success_body}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cn" className="text-xs">{t.f_name} *</Label>
                      <Input id="cn" required value={name} onChange={(e) => setName(e.target.value)} className="h-10 mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="ce" className="text-xs">{t.f_email} *</Label>
                      <Input id="ce" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cs" className="text-xs">{t.f_subject} *</Label>
                    <Input id="cs" required value={subject} onChange={(e) => setSubject(e.target.value)} className="h-10 mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="cm" className="text-xs">{t.f_message} *</Label>
                    <textarea
                      id="cm" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
                      className="w-full mt-1.5 rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={sending} className="w-full gap-2 font-bold press-scale shadow-md shadow-primary/20">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {t.f_send}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
