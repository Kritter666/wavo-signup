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

type ConnectorKey =
  | "instagram"
  | "spotify"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "meta_ads"
  | "google_ads";

const CONNECTORS: Array<{ key: ConnectorKey; name: string; category: string }> = [
  { key: "instagram", name: "Instagram", category: "Social" },
  { key: "spotify", name: "Spotify", category: "Streaming" },
  { key: "youtube", name: "YouTube", category: "Streaming" },
  { key: "tiktok", name: "TikTok", category: "Social" },
  { key: "linkedin", name: "LinkedIn", category: "Social" },
  { key: "meta_ads", name: "Meta Ads", category: "Ads" },
  { key: "google_ads", name: "Google Ads", category: "Ads" },
];

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
  connectors?: ConnectorKey[]; // NEW
};

type QID =
  | "role" | "fullName" | "org" | "primaryArtist" | "location"
  | "connectors" // NEW step
  | "website" | "instagram" | "spotify" | "soundcloud"
  | "useCases" | "notes" | "consent" | "review";

type Message = { from: "assistant" | "user"; text: string };

const FLOW: { id: QID; prompt: string }[] = [
  { id: "role",          prompt: "What best describes you? (tap an option)" },
  { id: "fullName",      prompt: "Great. What’s your name?" },
  { id: "org",           prompt: "Which org or team are you with? (optional)" },
  { id: "primaryArtist", prompt: "Who’s the primary artist/subject? (optional)" },
  { id: "location",      prompt: "Where are you based? (City, Country)" },
  { id: "connectors",    prompt: "Optional connections — tap Connect to enable any sources you use." },
  { id: "website",       prompt: "Website URL? (optional)" },
  { id: "instagram",     prompt: "Instagram handle or link? (optional)" },
  { id: "spotify",       prompt: "Spotify artist/team link? (optional)" },
  { id: "soundcloud",    prompt: "SoundCloud link? (optional)" },
  { id: "useCases",      prompt: "Focus areas (tap to select — multiple ok)" },
  { id: "notes",         prompt: "Anything else we should know? (optional)" },
  { id: "consent",       prompt: "Can we contact you about Wavo products and research?" },
  { id: "review",        prompt: "Review looks good. Ready to submit?" },
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
  return v
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .map((s) => map.get(s))
    .filter(Boolean) as UseCase[];
}

/** Small helper chips **/
function Chip({
  children, active, onClick,
}: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm transition
        ${active ? "bg-foreground text-background" : "bg-background hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

export default function AssistantClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    { from: "assistant", text: "Welcome! I’ll set you up. Answer with taps or by typing." },
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
    connectors: [],
  });

  // Connectors state (fake OAuth-style)
  type CState = "off" | "connecting" | "on";
  const [connState, setConnState] = useState<Record<ConnectorKey, CState>>({
    instagram: "off",
    spotify: "off",
    youtube: "off",
    tiktok: "off",
    linkedin: "off",
    meta_ads: "off",
    google_ads: "off",
  });

  // UI helpers
  const roleOptions: Role[] = ["Artist", "Producer", "Manager", "Label", "Other"];
  const useCaseOptions: UseCase[] = [
    "Campaigns",
    "A&R Discovery",
    "Release Planning",
    "Creator Marketing",
    "Reporting/Analytics",
    "Rights/IP",
    "Other",
  ];

  // "Other" input toggles
  const [roleOtherOpen, setRoleOtherOpen] = useState(false);
  const [roleOtherVal, setRoleOtherVal] = useState("");
  const [useCaseOtherOpen, setUseCaseOtherOpen] = useState(false);
  const [useCaseOtherVal, setUseCaseOtherVal] = useState("");

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const q = FLOW[qIndex];
    if (!q) return;
    setMessages((prev) =>
      prev[prev.length - 1]?.text === q.prompt && prev[prev.length - 1]?.from === "assistant"
        ? prev
        : [...prev, { from: "assistant", text: q.prompt }]
    );
  }, [qIndex]);

  function next() { setQIndex((i) => Math.min(FLOW.length - 1, i + 1)); }
  function back() { setQIndex((i) => Math.max(0, i - 1)); }

  function pickRole(value: Role | "Other") {
    if (value === "Other") {
      setRoleOtherOpen(true);
      return;
    }
    setRoleOtherOpen(false);
    setForm((f) => ({ ...f, role: value as Role }));
    setMessages((prev) => [...prev, { from: "user", text: value }]);
    next();
  }
  function submitRoleOther() {
    const v = roleOtherVal.trim();
    if (!v) return;
    const norm = normalizeRole(v);
    setForm((f) => ({ ...f, role: norm }));
    setMessages((prev) => [...prev, { from: "user", text: v }]);
    setRoleOtherOpen(false);
    setRoleOtherVal("");
    next();
  }

  function toggleUseCase(uc: UseCase | "Other") {
    if (uc === "Other") { setUseCaseOtherOpen(true); return; }
    setForm((f) => {
      const has = f.useCases.includes(uc as UseCase);
      return { ...f, useCases: has ? f.useCases.filter((x) => x !== uc) : [...f.useCases, uc as UseCase] };
    });
  }
  function addUseCaseOther() {
    const raw = useCaseOtherVal.trim();
    if (!raw) return;
    const label = raw.slice(0, 40);
    setForm((f) => ({ ...f, useCases: Array.from(new Set([...f.useCases, "Other"])) }));
    setMessages((prev) => [...prev, { from: "user", text: `Other: ${label}` }]);
    setUseCaseOtherOpen(false);
    setUseCaseOtherVal("");
  }

  function connect(k: ConnectorKey) {
    setConnState((m) => ({ ...m, [k]: "connecting" }));
    setTimeout(() => {
      setConnState((m) => ({ ...m, [k]: "on" }));
      setForm((f) => {
        const list = new Set(f.connectors);
        list.add(k);
        return { ...f, connectors: Array.from(list) as ConnectorKey[] };
      });
      setMessages((prev) => [...prev, { from: "assistant", text: `Connected ${CONNECTORS.find(c => c.key === k)?.name}.` }]);
    }, 850);
  }
  function disconnect(k: ConnectorKey) {
    setConnState((m) => ({ ...m, [k]: "off" }));
    setForm((f) => ({ ...f, connectors: (f.connectors || []).filter((x) => x !== k) as ConnectorKey[] }));
    setMessages((prev) => [...prev, { from: "assistant", text: `Disconnected ${CONNECTORS.find(c => c.key === k)?.name}.` }]);
  }

  // Text-submit handler (fallback / for text questions)
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = input.trim();
    const q = FLOW[qIndex];
    if (!q) return;

    // allow typing on any step as fallback
    setMessages((prev) => [...prev, { from: "user", text: value || "(skipped)" }]);

    if (q.id === "fullName" && value) setForm((f) => ({ ...f, fullName: value }));
    if (q.id === "org") setForm((f) => ({ ...f, org: value }));
    if (q.id === "primaryArtist") setForm((f) => ({ ...f, primaryArtist: value }));
    if (q.id === "location") setForm((f) => ({ ...f, location: value }));
    if (q.id === "website") setForm((f) => ({ ...f, website: value }));
    if (q.id === "instagram") setForm((f) => ({ ...f, instagram: value }));
    if (q.id === "spotify") setForm((f) => ({ ...f, spotify: value }));
    if (q.id === "soundcloud") setForm((f) => ({ ...f, soundcloud: value }));
    if (q.id === "useCases") setForm((f) => ({ ...f, useCases: Array.from(new Set([...(f.useCases || []), ...parseUseCases(value)])) }));
    if (q.id === "consent") {
      const yes = /^y(es)?/i.test(value);
      setForm((f) => ({ ...f, marketingConsent: yes }));
    }

    setInput("");

    if (q.id !== "review") { next(); return; }

    // Submit to API
    try {
      setSubmitting(true);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessages((prev) => [...prev, { from: "assistant", text: "All set — thanks! Redirecting…" }]);
      router.push(`/thanks?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setMessages((prev) => [...prev, { from: "assistant", text: `Submit failed: ${err?.message || "Unknown error"}` }]);
    } finally {
      setSubmitting(false);
    }
  }

  const canContinue = useMemo(() => {
    const id = FLOW[qIndex]?.id;
    if (id === "review") return !!form.fullName && !!form.email && form.marketingConsent && !submitting;
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
              Tap choices or type. Skip optional questions. We’ll personalize your workspace.
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

            {/* Inline controls for current question */}
            <div className="mt-3 space-y-3">
              {FLOW[qIndex]?.id === "role" && (
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((r) =>
                    r === "Other" ? (
                      <Chip key={r} onClick={() => pickRole("Other")}>Other…</Chip>
                    ) : (
                      <Chip key={r} onClick={() => pickRole(r)}>{r}</Chip>
                    )
                  )}
                  {roleOtherOpen && (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type your role"
                        value={roleOtherVal}
                        onChange={(e) => setRoleOtherVal(e.target.value)}
                        className="h-9 w-48"
                      />
                      <Button size="sm" onClick={submitRoleOther}>OK</Button>
                    </div>
                  )}
                </div>
              )}

              {FLOW[qIndex]?.id === "connectors" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONNECTORS.map((c) => {
                    const st = connState[c.key];
                    return (
                      <div key={c.key} className="border rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.category}</div>
                        </div>
                        {st === "off" && (
                          <Button size="sm" variant="secondary" onClick={() => connect(c.key)}>Connect</Button>
                        )}
                        {st === "connecting" && (
                          <Badge variant="outline">Connecting…</Badge>
                        )}
                        {st === "on" && (
                          <div className="flex items-center gap-2">
                            <Badge>Connected</Badge>
                            <Button size="sm" variant="ghost" onClick={() => disconnect(c.key)}>Disconnect</Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {FLOW[qIndex]?.id === "useCases" && (
                <div className="flex flex-wrap gap-2">
                  {useCaseOptions.map((uc) =>
                    uc === "Other" ? (
                      <Chip key={uc} onClick={() => setUseCaseOtherOpen(true)}>Other…</Chip>
                    ) : (
                      <Chip
                        key={uc}
                        active={form.useCases.includes(uc)}
                        onClick={() => toggleUseCase(uc)}
                      >
                        {uc}
                      </Chip>
                    )
                  )}
                  {useCaseOtherOpen && (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Add another focus area"
                        value={useCaseOtherVal}
                        onChange={(e) => setUseCaseOtherVal(e.target.value)}
                        className="h-9 w-64"
                      />
                      <Button size="sm" onClick={addUseCaseOther}>Add</Button>
                    </div>
                  )}
                </div>
              )}

              {FLOW[qIndex]?.id === "consent" && (
                <div className="flex items-center gap-3">
                  <Chip active={form.marketingConsent} onClick={() => setForm((f) => ({ ...f, marketingConsent: true }))}>Yes</Chip>
                  <Chip active={!form.marketingConsent} onClick={() => setForm((f) => ({ ...f, marketingConsent: false }))}>No</Chip>
                </div>
              )}
            </div>

            <div className="text-[11px] text-muted-foreground mt-3">Step {qIndex + 1} / {FLOW.length}</div>
          </div>

          <form onSubmit={onSubmit} className="mt-3 grid gap-2">
            {/* Text input fallback when there are no chips showing */}
            {![ "role","connectors","useCases","consent" ].includes(FLOW[qIndex]?.id || "") && (
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) e.currentTarget.form?.requestSubmit();
                }}
              />
            )}
            {FLOW[qIndex]?.id === "notes" && (
              <Textarea rows={3} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your answer…" />
            )}

            <div className="flex items-center gap-2">
              {/* Primary continues flow OR submits on final step */}
              <Button
                type={["role","connectors","useCases","consent"].includes(FLOW[qIndex]?.id || "") ? "button" : "submit"}
                onClick={() => {
                  const id = FLOW[qIndex]?.id;
                  if (id === "role" || id === "connectors" || id === "useCases" || id === "consent") {
                    // For chip-based steps, Continue just advances
                    next();
                  }
                }}
                disabled={!canContinue}
              >
                {FLOW[qIndex]?.id === "review" ? (submitting ? "Submitting…" : "Submit") : "Continue"}
              </Button>
              {qIndex > 0 && <Button type="button" variant="secondary" onClick={back}>Back</Button>}
              {qIndex < FLOW.length - 1 && <Button type="button" variant="secondary" onClick={next}>Skip</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
