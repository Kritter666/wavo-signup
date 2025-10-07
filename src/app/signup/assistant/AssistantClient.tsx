"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Role = "Artist" | "Producer" | "Manager" | "Label" | "Other";
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

type Payload = {
  role: Role;
  email: string;
  fullName: string;
  org?: string;
  primaryArtist?: string;
  marketingConsent: boolean;
  connectors: ConnectorKey[];
};

type QID = "role" | "email" | "fullName" | "connectors" | "consent" | "review";

type Step = { id: QID; prompt: string; required?: boolean };

function normalizeRole(v: string): Role {
  const t = v.trim().toLowerCase();
  if (t.startsWith("art")) return "Artist";
  if (t.startsWith("prod")) return "Producer";
  if (t.startsWith("man")) return "Manager";
  if (t.startsWith("lab")) return "Label";
  return "Other";
}

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
  const listRef = useRef<HTMLDivElement>(null);

  // Build a SHORT FLOW; insert "email" if not provided via query
  const emailFromQuery = sp.get("email") ?? "";
  const FLOW: Step[] = [
    { id: "role", prompt: "What best describes you? (tap an option)", required: false },
    ...(emailFromQuery ? [] : [{ id: "email", prompt: "What’s your email?" as const, required: true }]),
    { id: "fullName", prompt: "Great. What’s your full name?", required: true },
    { id: "connectors", prompt: "Optional connections — tap Connect to enable any you use.", required: false },
    { id: "consent", prompt: "Can we contact you about Wavo products and research?", required: true },
    { id: "review", prompt: "Review looks good. Ready to submit?", required: true },
  ];

  // Form state
  const [form, setForm] = useState<Payload>({
    role: "Artist",
    email: emailFromQuery,
    fullName: "",
    org: "",
    primaryArtist: "",
    marketingConsent: true,
    connectors: [],
  });

  // Connectors state
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

  // Step navigation (derived chat makes Back “erase” naturally)
  const [qIndex, setQIndex] = useState(0);
  const step = FLOW[qIndex];

  // Text input buffer for typed answers on current step
  const [input, setInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Derive chat messages from steps + answers up to current step (no stale bubbles)
  const messages = useMemo(() => {
    const arr: Array<{ from: "assistant" | "user"; text: string }> = [];
    for (let i = 0; i <= qIndex; i++) {
      const s = FLOW[i];
      if (!s) break;
      arr.push({ from: "assistant", text: s.prompt });

      // For past steps (< current), render the user's answer summary if available
      if (i < qIndex) {
        const summary = summarizeAnswer(s.id);
        if (summary) arr.push({ from: "user", text: summary });
      }
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [FLOW, qIndex, form, connState]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function summarizeAnswer(id: QID): string | null {
    switch (id) {
      case "role":
        return form.role || null;
      case "email":
        return form.email || null;
      case "fullName":
        return form.fullName || null;
      case "connectors": {
        const on = Object.entries(connState)
          .filter(([, v]) => v === "on")
          .map(([k]) => CONNECTORS.find(c => c.key === k as ConnectorKey)?.name)
          .filter(Boolean) as string[];
        return on.length ? `Connected: ${on.join(", ")}` : "(skipped)";
      }
      case "consent":
        return form.marketingConsent ? "Yes" : "No";
      case "review":
        // No bubble for review
        return null;
    }
  }

  // Step handlers
  function pickRole(v: Role | "Other") {
    if (v === "Other") return; // handled by typed input
    setForm((f) => ({ ...f, role: v as Role }));
  }

  function connect(k: ConnectorKey) {
    setConnState((m) => ({ ...m, [k]: "connecting" }));
    setTimeout(() => {
      setConnState((m) => ({ ...m, [k]: "on" }));
      setForm((f) => {
        const set = new Set(f.connectors);
        set.add(k);
        return { ...f, connectors: Array.from(set) as ConnectorKey[] };
      });
    }, 700);
  }
  function disconnect(k: ConnectorKey) {
    setConnState((m) => ({ ...m, [k]: "off" }));
    setForm((f) => ({ ...f, connectors: f.connectors.filter(x => x !== k) as ConnectorKey[] }));
  }

  function canContinue(): boolean {
    if (!step) return false;
    if (!step.required) return !submitting;
    if (step.id === "email") return !!form.email && !submitting;
    if (step.id === "fullName") return !!form.fullName && !submitting;
    if (step.id === "consent") return (form.marketingConsent === true || form.marketingConsent === false) && !submitting;
    if (step.id === "review") return !!form.fullName && (!!form.email) && form.marketingConsent && !submitting;
    return !submitting;
  }

  async function onSubmitTyped(e: React.FormEvent) {
    e.preventDefault();
    if (!step) return;
    const v = input.trim();

    if (step.id === "role" && v) setForm((f) => ({ ...f, role: normalizeRole(v) }));
    if (step.id === "email" && v) setForm((f) => ({ ...f, email: v }));
    if (step.id === "fullName" && v) setForm((f) => ({ ...f, fullName: v }));
    if (step.id === "consent" && v) {
      const yes = /^y(es)?/i.test(v);
      setForm((f) => ({ ...f, marketingConsent: yes }));
    }

    setInput("");
    // Advance after typed entry
    if (step.id !== "review") {
      setQIndex((i) => Math.min(FLOW.length - 1, i + 1));
    } else {
      submitFinal();
    }
  }

  async function submitFinal() {
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
              Tap choices or type. Skip optional steps. I’ll personalize your workspace.
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

            {/* Inline controls for the CURRENT step only */}
            <div className="mt-3 space-y-3">
              {step?.id === "role" && (
                <div className="flex flex-wrap gap-2">
                  {(["Artist","Producer","Manager","Label"] as Role[]).map((r) => (
                    <Chip key={r} active={form.role === r} onClick={() => pickRole(r)}>{r}</Chip>
                  ))}
                  {/* 'Other' lets them type below */}
                  <Chip onClick={() => setInput("Other")}>Other… (type below)</Chip>
                </div>
              )}

              {step?.id === "connectors" && (
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

              {step?.id === "consent" && (
                <div className="flex items-center gap-3">
                  <Chip active={form.marketingConsent} onClick={() => setForm((f) => ({ ...f, marketingConsent: true }))}>Yes</Chip>
                  <Chip active={!form.marketingConsent} onClick={() => setForm((f) => ({ ...f, marketingConsent: false }))}>No</Chip>
                </div>
              )}
            </div>

            <div className="text-[11px] text-muted-foreground mt-3">Step {qIndex + 1} / {FLOW.length}</div>
          </div>

          <form onSubmit={onSubmitTyped} className="mt-3 grid gap-2">
            {/* Text input for steps that are typed */}
            {["role","connectors","consent","review"].includes(step?.id || "") ? null : (
              <>
                {step?.id === "fullName" && (
                  <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your full name…" />
                )}
                {step?.id === "email" && (
                  <Input type="email" value={input} onChange={(e) => setInput(e.target.value)} placeholder="you@company.com" />
                )}
              </>
            )}

            <div className="flex items-center gap-2">
              <Button
                type={step?.id === "review" ? "button" : ["role","connectors","consent"].includes(step?.id || "") ? "button" : "submit"}
                onClick={() => {
                  if (!step) return;
                  if (step.id === "review") return submitFinal();
                  if (["role","connectors","consent"].includes(step.id)) {
                    // Continue without typing
                    setQIndex((i) => Math.min(FLOW.length - 1, i + 1));
                  }
                }}
                disabled={!canContinue()}
              >
                {step?.id === "review" ? (submitting ? "Submitting…" : "Submit") : "Continue"}
              </Button>

              {qIndex > 0 && (
                <Button type="button" variant="secondary" onClick={() => setQIndex((i) => Math.max(0, i - 1))}>
                  Back
                </Button>
              )}
              {qIndex < FLOW.length - 1 && (
                <Button type="button" variant="secondary" onClick={() => setQIndex((i) => Math.min(FLOW.length - 1, i + 1))}>
                  Skip
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
