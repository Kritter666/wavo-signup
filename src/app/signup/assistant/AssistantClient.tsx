"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Role = "Artist" | "Producer" | "Manager" | "Label" | "Other";
type ConnectorKey = "instagram" | "spotify" | "youtube" | "tiktok" | "linkedin" | "meta_ads" | "google_ads";

const CONNECTORS: Array<{ key: ConnectorKey; name: string; category: string }> = [
  { key: "instagram", name: "Instagram", category: "Social" },
  { key: "spotify", name: "Spotify", category: "Streaming" },
  { key: "youtube", name: "YouTube", category: "Streaming" },
  { key: "tiktok", name: "TikTok", category: "Social" },
  { key: "linkedin", name: "LinkedIn", category: "Social" },
  { key: "meta_ads", name: "Meta Ads", category: "Ads" },
  { key: "google_ads", name: "Google Ads", category: "Ads" },
];

type QID = "role" | "fullName" | "email" | "connectors" | "review";

type Step = { id: QID; prompt: string; required?: boolean };

type Form = {
  role: Role;
  fullName: string;
  email: string;
  connectors: ConnectorKey[];
  marketingConsent: boolean;
};

const defaultForm: Form = {
  role: "Artist",
  fullName: "",
  email: "",
  connectors: [],
  marketingConsent: true,
};

type CState = "off" | "connecting" | "on";
const defaultConn: Record<ConnectorKey, CState> = {
  instagram: "off",
  spotify: "off",
  youtube: "off",
  tiktok: "off",
  linkedin: "off",
  meta_ads: "off",
  google_ads: "off",
};

function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm transition ${active ? "bg-foreground text-background" : "bg-background hover:bg-muted"}`}
    >
      {children}
    </button>
  );
}

export default function AssistantClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const listRef = useRef<HTMLDivElement>(null);

  const emailFromQuery = sp.get("email") ?? "";
  const STEPS: Step[] = [
    { id: "role", prompt: "What best describes you? (tap an option)" },
    { id: "fullName", prompt: "Great. What’s your full name?", required: true },
    // if email was passed via query, we’ll still show it so they can confirm or edit
    { id: "email", prompt: "What’s your email?", required: true },
    { id: "connectors", prompt: "Optional: connect any sources you use.", required: false },
    { id: "review", prompt: "Review & submit.", required: true },
  ];

  const [form, setForm] = useState<Form>({ ...defaultForm, email: emailFromQuery || "" });
  const [connState, setConnState] = useState<Record<ConnectorKey, CState>>({ ...defaultConn });
  const [qIndex, setQIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Build chat from steps up to current index
  const messages = useMemo(() => {
    const out: Array<{ from: "assistant" | "user"; text: string }> = [];
    for (let i = 0; i <= qIndex; i++) {
      const s = STEPS[i];
      out.push({ from: "assistant", text: s.prompt });
      if (i < qIndex) {
        const ans = summaryFor(s.id);
        if (ans) out.push({ from: "user", text: ans });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [STEPS, qIndex, form, connState]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function summaryFor(id: QID): string | null {
    switch (id) {
      case "role": return form.role || null;
      case "fullName": return form.fullName || null;
      case "email": return form.email || null;
      case "connectors": {
        const on = Object.entries(connState).filter(([, v]) => v === "on").map(([k]) => CONNECTORS.find(c => c.key === k)?.name).filter(Boolean) as string[];
        return on.length ? `Connected: ${on.join(", ")}` : "(skipped)";
      }
      case "review": return null;
    }
  }

  function next() { setQIndex((i) => Math.min(STEPS.length - 1, i + 1)); }

  function goBack() {
    const newIdx = Math.max(0, qIndex - 1);
    clearAfter(newIdx);
    setQIndex(newIdx);
  }

  // Clear answers AFTER idx so Back “erases” later steps
  function clearAfter(idx: number) {
    const after = STEPS.slice(idx + 1).map(s => s.id);
    setForm((f) => {
      const nf = { ...f };
      if (after.includes("review")) { /* nothing specific to keep */ }
      if (after.includes("connectors")) {
        nf.connectors = [];
      }
      if (after.includes("email")) nf.email = "";
      if (after.includes("fullName")) nf.fullName = "";
      if (after.includes("role")) nf.role = "Artist";
      return nf;
    });
    if (after.includes("connectors")) setConnState({ ...defaultConn });
  }

  function pickRole(r: Role) { setForm((f) => ({ ...f, role: r })); }

  function connect(k: ConnectorKey) {
    setConnState((m) => ({ ...m, [k]: "connecting" }));
    setTimeout(() => {
      setConnState((m) => ({ ...m, [k]: "on" }));
      setForm((f) => ({ ...f, connectors: Array.from(new Set([...f.connectors, k])) as ConnectorKey[] }));
    }, 600);
  }
  function disconnect(k: ConnectorKey) {
    setConnState((m) => ({ ...m, [k]: "off" }));
    setForm((f) => ({ ...f, connectors: f.connectors.filter(x => x !== k) as ConnectorKey[] }));
  }

  function canContinue(): boolean {
    const s = STEPS[qIndex];
    if (!s?.required) return !submitting;
    if (s.id === "fullName") return !!form.fullName && !submitting;
    if (s.id === "email") return !!form.email && !submitting;
    if (s.id === "review") return !!form.fullName && !!form.email && !submitting;
    return !submitting;
  }

  async function submit() {
    try {
      setSubmitting(true);
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(`/thanks?email=${encodeURIComponent(form.email)}`);
    } catch (e: any) {
      alert(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-2xl">
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="text-center mb-3">
            <h1 className="text-center font-black tracking-[0.35em] text-xl sm:text-2xl leading-none">WAVO</h1>
            <div className="text-2xl font-semibold mt-2">Let’s get you set up</div>
            <div className="text-sm text-muted-foreground">
              Tap choices or type. Back erases the next answers. I’ll personalize your workspace.
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

            {/* Inline controls for CURRENT step only */}
            <div className="mt-3 space-y-3">
              {STEPS[qIndex]?.id === "role" && (
                <div className="flex flex-wrap gap-2">
                  {(["Artist","Producer","Manager","Label"] as Role[]).map((r) => (
                    <Chip key={r} active={form.role === r} onClick={() => pickRole(r)}>{r}</Chip>
                  ))}
                  <span className="text-xs text-muted-foreground">You can also type a custom role below.</span>
                </div>
              )}

              {STEPS[qIndex]?.id === "connectors" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONNECTORS.map((c) => {
                    const st = connState[c.key];
                    return (
                      <div key={c.key} className="border rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.category}</div>
                        </div>
                        {st === "off" && <Button size="sm" variant="secondary" onClick={() => connect(c.key)}>Connect</Button>}
                        {st === "connecting" && <Badge variant="outline">Connecting…</Badge>}
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
            </div>

            <div className="text-[11px] text-muted-foreground mt-3">Step {qIndex + 1} / {STEPS.length}</div>
          </div>

          {/* Typed inputs for steps that need them */}
          <div className="mt-3 grid gap-2">
            {STEPS[qIndex]?.id === "role" && (
              <Input
                value={form.role === "Other" ? "" : ""}
                onChange={() => {}}
                placeholder='(Optional) type a custom role like "A&R", then press Continue'
              />
            )}
            {STEPS[qIndex]?.id === "fullName" && (
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Type your full name…"
              />
            )}
            {STEPS[qIndex]?.id === "email" && (
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@company.com"
              />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  const s = STEPS[qIndex];
                  if (s.id === "role" && form.role === "Other") {
                    // If they typed nothing, keep Other; else leave as-is
                  }
                  if (s.id === "review") return submit();
                  next();
                }}
                disabled={!canContinue()}
              >
                {STEPS[qIndex]?.id === "review" ? (submitting ? "Submitting…" : "Submit") : "Continue"}
              </Button>

              {qIndex > 0 && (
                <Button type="button" variant="secondary" onClick={goBack}>Back</Button>
              )}
              {qIndex < STEPS.length - 1 && (
                <Button type="button" variant="secondary" onClick={() => next()}>Skip</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
