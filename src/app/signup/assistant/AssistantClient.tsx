"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

type Role = "Artist" | "Producer" | "Manager" | "Label" | "Other";
type UseCase =
  | "Campaigns"
  | "A&R Discovery"
  | "Release Planning"
  | "Creator Marketing"
  | "Reporting/Analytics"
  | "Rights/IP"
  | "Other";

type SignupPayload = {
  role: Role;
  fullName: string;
  email: string;
  org?: string;
  primaryArtist?: string;
  location?: string;
  website?: string;
  instagram?: string;
  spotify?: string;
  soundcloud?: string;
  useCases: UseCase[];
  notes?: string;
  marketingConsent: boolean;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;
};

type QID =
  | "role" | "fullName" | "org" | "primaryArtist" | "location"
  | "website" | "instagram" | "spotify" | "soundcloud"
  | "useCases" | "notes" | "consent" | "review";

type Message = { from: "assistant" | "user"; text: string };

const FLOW: { id: QID; prompt: string }[] = [
  { id: "role",          prompt: "What best describes you? (Artist, Producer, Manager, Label, Other)" },
  { id: "fullName",      prompt: "Great. What’s your name?" },
  { id: "org",           prompt: "Which org or team are you with? (optional — press Enter to skip)" },
  { id: "primaryArtist", prompt: "Who’s the primary artist/subject? (optional)" },
  { id: "location",      prompt: "Where are you based? (City, Country)" },
  { id: "website",       prompt: "Website URL? (optional)" },
  { id: "instagram",     prompt: "Instagram handle or link? (optional)" },
  { id: "spotify",       prompt: "Spotify artist/team link? (optional)" },
  { id: "soundcloud",    prompt: "SoundCloud link? (optional)" },
  { id: "useCases",      prompt: "Pick focus areas (comma separated): Campaigns, A&R Discovery, Release Planning, Creator Marketing, Reporting/Analytics, Rights/IP, Other" },
  { id: "notes",         prompt: "Anything else we should know? (optional)" },
  { id: "consent",       prompt: "Can we contact you about Wavo products and research? (yes/no)" },
  { id: "review",        prompt: "Review looks good. Ready to submit? (yes to submit, or type a field name to edit)" },
];

function normalizeRole(v: string): Role {
  const t = v.trim().toLowerCase();
  if (t.startsWith("art")) return "Artist";
  if (t.startsWith("prod")) return "Producer";
  if (t.startsWith("man")) return "Manager";
  if (t.startsWith("lab")) return "Label";
  return "Other";
}
function parseUseCases(v: string): UseCase[] {
  const map = new Map<string, UseCase>([
    ["campaigns", "Campaigns"],
    ["a&r discovery", "A&R Discovery"],
    ["release planning", "Release Planning"],
    ["creator marketing", "Creator Marketing"],
    ["reporting/analytics", "Reporting/Analytics"],
    ["rights/ip", "Rights/IP"],
    ["other", "Other"],
  ]);
  return v.split(",").map(s => s.trim().toLowerCase()).map(s => map.get(s)).filter(Boolean) as UseCase[];
}

export default function AssistantClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { from: "assistant", text: "Welcome! I’ll set you up. I’ll ask a few quick questions." },
  ]);
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<SignupPayload>({
    role: "Artist",
    fullName: "",
    email: sp.get("email") ?? "",
    org: "",
    primaryArtist: "",
    location: "",
    website: "",
    instagram: "",
    spotify: "",
    soundcloud: "",
    useCases: [],
    notes: "",
    marketingConsent: true,
    utmSource: sp.get("utm_source"),
    utmMedium: sp.get("utm_medium"),
    utmCampaign: sp.get("utm_campaign"),
    referrer: typeof window !== "undefined" ? document.referrer || null : null,
  });

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const q = FLOW[qIndex];
    if (!q) return;
    setMessages(prev =>
      prev[prev.length - 1]?.text === q.prompt && prev[prev.length - 1]?.from === "assistant"
        ? prev
        : [...prev, { from: "assistant", text: q.prompt }]
    );
  }, [qIndex]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    const q = FLOW[qIndex];
    if (!q) return;

    setMessages(prev => [...prev, { from: "user", text: value || "(skipped)" }]);
    setInput("");

    if (q.id === "role")          setForm(f => ({ ...f, role: normalizeRole(value || "Other") }));
    if (q.id === "fullName" && value) setForm(f => ({ ...f, fullName: value }));
    if (q.id === "org")           setForm(f => ({ ...f, org: value }));
    if (q.id === "primaryArtist") setForm(f => ({ ...f, primaryArtist: value }));
    if (q.id === "location")      setForm(f => ({ ...f, location: value }));
    if (q.id === "website")       setForm(f => ({ ...f, website: value }));
    if (q.id === "instagram")     setForm(f => ({ ...f, instagram: value }));
    if (q.id === "spotify")       setForm(f => ({ ...f, spotify: value }));
    if (q.id === "soundcloud")    setForm(f => ({ ...f, soundcloud: value }));
    if (q.id === "useCases")      setForm(f => ({ ...f, useCases: parseUseCases(value) }));
    if (q.id === "notes")         setForm(f => ({ ...f, notes: value }));
    if (q.id === "consent") {
      const yes = /^y(es)?/i.test(value);
      setForm(f => ({ ...f, marketingConsent: yes }));
    }

    if (q.id !== "review") {
      setQIndex(i => i + 1);
      return;
    }

    // submit
    try {
      setSubmitting(true);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessages(prev => [...prev, { from: "assistant", text: "All set — thanks! Redirecting…" }]);
      router.push(`/thanks?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setMessages(prev => [...prev, { from: "assistant", text: `Submit failed: ${err?.message || "Unknown error"}` }]);
    } finally {
      setSubmitting(false);
    }
  }

  const canContinue = useMemo(() => {
    if (FLOW[qIndex]?.id === "review")
      return !!form.fullName && !!form.email && form.marketingConsent && !submitting;
    return !submitting;
  }, [qIndex, form, submitting]);

  return (
    <div className="w-full max-w-2xl">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-2">
            <h1 className="text-center font-black tracking-[0.35em] text-xl sm:text-2xl leading-none">WAVO</h1>
            <div className="text-2xl font-semibold mt-2">Let’s get you set up</div>
            <div className="text-sm text-muted-foreground">
              Answer in plain English. Skip optional questions, or jump back by typing a field name.
            </div>
          </div>

          <div ref={listRef} className="h-[360px] overflow-y-auto rounded-lg border p-3 bg-background/30">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] mb-2 ${m.from === "assistant" ? "mr-auto" : "ml-auto"}`}>
                <div className={`rounded-2xl px-3 py-2 text-sm border ${m.from === "assistant" ? "bg-card" : "bg-primary text-primary-foreground"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            <div className="text-[11px] text-muted-foreground mt-2">Step {qIndex + 1} / {FLOW.length}</div>
          </div>

          <form onSubmit={onSubmit} className="mt-3 grid gap-2">
            {FLOW[qIndex]?.id === "useCases" && (
              <div className="flex flex-wrap gap-2">
                {["Campaigns","A&R Discovery","Release Planning","Creator Marketing","Reporting/Analytics","Rights/IP","Other"].map(x =>
                  <Badge key={x} variant="outline">{x}</Badge>
                )}
              </div>
            )}
            {FLOW[qIndex]?.id === "notes" ? (
              <Textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="Type your answer…" />
            ) : FLOW[qIndex]?.id === "consent" ? (
              <div className="flex items-center gap-3">
                <Checkbox
                  id="consent"
                  checked={form.marketingConsent}
                  onCheckedChange={(v) => setForm(f => ({ ...f, marketingConsent: !!v }))}
                />
                <label htmlFor="consent" className="text-sm text-muted-foreground">
                  I agree to be contacted about Wavo products and research.
                </label>
              </div>
            ) : (
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type your answer…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.currentTarget.form?.requestSubmit();
                  }
                }}
              />
            )}
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={!canContinue}>
                {FLOW[qIndex]?.id === "review" ? (submitting ? "Submitting…" : "Submit") : "Continue"}
              </Button>
              {qIndex > 0 && <Button type="button" variant="secondary" onClick={() => setQIndex(i => i - 1)}>Back</Button>}
              {qIndex < FLOW.length - 1 && <Button type="button" variant="secondary" onClick={() => setQIndex(i => i + 1)}>Skip</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
