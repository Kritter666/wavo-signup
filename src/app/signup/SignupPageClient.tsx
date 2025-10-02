// src/app/signup/SignupPageClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

  // auto-captured
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  referrer?: string | null;

  // assistant enrichment (MVP dummy)
  enriched?: {
    typeGuess?: string;
    managerGuess?: string;
    notableWorks?: string[];
    confidence?: number; // 0..1
    provenance?: string[];
  };
};

const USE_CASES: UseCase[] = [
  "Campaigns",
  "A&R Discovery",
  "Release Planning",
  "Creator Marketing",
  "Reporting/Analytics",
  "Rights/IP",
  "Other",
];

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function SignupPageClient() {
  const sp = useSearchParams();
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<SignupPayload>({
    role: "Artist",
    fullName: "",
    email: "",
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
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    referrer: typeof window !== "undefined" ? document.referrer || null : null,
  });

  // Capture UTM params automatically
  useEffect(() => {
    setForm((f) => ({
      ...f,
      utmSource: sp.get("utm_source"),
      utmMedium: sp.get("utm_medium"),
      utmCampaign: sp.get("utm_campaign"),
      // if ?email= is present, prefill email
      email: sp.get("email") ?? f.email,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const canSubmit = useMemo(() => {
    return !!form.fullName && !!form.email && form.marketingConsent && !submitting;
  }, [form, submitting]);

  function toggleUseCase(uc: UseCase) {
    setForm((f) => {
      const has = f.useCases.includes(uc);
      return { ...f, useCases: has ? f.useCases.filter((x) => x !== uc) : [...f.useCases, uc] };
    });
  }

  // ===== Dummy enrichment (no network) =====
  function aiAssist() {
    const subject = (form.primaryArtist || form.fullName || "").trim();
    if (!subject) return;

    let typeGuess: Role = "Artist";
    if (/manager|mgmt/i.test(subject)) typeGuess = "Manager";
    if (/records|label|entertainment|music group/i.test(form.org || "")) typeGuess = "Label";
    if (/producer|beat|mix|master/i.test(subject)) typeGuess = "Producer";

    // toy enrichment based on name seeds
    const seeds: Record<string, { manager: string; works: string[] }> = {
      "dua lipa": { manager: "Wasserman (approx)", works: ["Levitating", "Houdini"] },
      "ed sheeran": { manager: "Stuart Camp (approx)", works: ["Shape of You", "Bad Habits"] },
      "metro boomin": { manager: "Range Media (approx)", works: ["Creepin’", "Trance"] },
    };
    const key = subject.toLowerCase();
    const hit = seeds[key];

    const enriched = {
      typeGuess,
      managerGuess: hit?.manager || (typeGuess === "Producer" ? "TBD (producer mgmt?)" : "TBD"),
      notableWorks: hit?.works || (typeGuess === "Producer" ? ["Recent placements?"] : ["Top tracks?"]),
      confidence: hit ? 0.8 : 0.45,
      provenance: [
        "heuristic:name+org",
        hit ? `seed:${key}` : "seed:none",
        "future:web+internal graph",
      ],
    };

    setForm((f) => ({
      ...f,
      role: enriched.typeGuess as Role,
      notes:
        (f.notes ? f.notes + "\n" : "") +
        `Enriched: manager≈${enriched.managerGuess}; works≈${enriched.notableWorks?.join(", ")}`,
      enriched,
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          derived: {
            subjectSlug: slug(form.primaryArtist || form.fullName),
            domain: form.email.split("@")[1]?.toLowerCase() || "",
          },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      // redirect to thank-you (keeps page logic simple and SSR-safe)
      router.push(`/thanks?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <div className="text-2xl font-semibold">Join Wavo — early access</div>
        <div className="text-sm text-muted-foreground">
          Tell us who you are. We’ll personalize your workspace and keep you posted.
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <Card>
          <CardContent className="p-4 grid gap-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Role</div>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v as Role }))}
                >
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  {/* >>> change: force solid popover background */}
                  <SelectContent className="bg-white dark:bg-neutral-900 border border-border shadow-lg">
                    {(["Artist", "Producer", "Manager", "Label", "Other"] as Role[]).map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Full name</div>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g., Alex Chen" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Email</div>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Organization (optional)</div>
                <Input value={form.org} onChange={(e) => setForm({ ...form, org: e.target.value })} placeholder="e.g., Atlantic Records" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">Primary artist / subject</div>
                  <Badge variant="secondary">Boosts AI assist</Badge>
                </div>
                <Input value={form.primaryArtist} onChange={(e) => setForm({ ...form, primaryArtist: e.target.value })} placeholder="e.g., Metro Boomin" />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Location</div>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="grid gap-2">
                <div className="text-sm font-medium">Website</div>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://…" />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Instagram</div>
                <Input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} placeholder="@handle or link" />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">Spotify</div>
                <Input value={form.spotify} onChange={(e) => setForm({ ...form, spotify: e.target.value })} placeholder="Artist/Team profile link" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <div className="text-sm font-medium">SoundCloud (optional)</div>
                <Input value={form.soundcloud} onChange={(e) => setForm({ ...form, soundcloud: e.target.value })} placeholder="https://soundcloud.com/…" />
              </div>
              <div className="grid gap-2">
                <div className="text-sm font-medium">How can we help?</div>
                <div className="flex flex-wrap gap-2">
                  {USE_CASES.map((uc) => (
                    <label key={uc} className={`flex items-center gap-2 rounded-xl border px-3 py-2 cursor-pointer ${form.useCases.includes(uc) ? "bg-muted" : ""}`}>
                      <Checkbox checked={form.useCases.includes(uc)} onCheckedChange={() => toggleUseCase(uc)} />
                      <span className="text-sm">{uc}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm font-medium">Notes (optional)</div>
              <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Tell us more about your current workflow or goals" />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox id="consent" checked={form.marketingConsent} onCheckedChange={(v) => setForm({ ...form, marketingConsent: !!v })} />
              <label htmlFor="consent" className="text-sm text-muted-foreground">
                I agree to be contacted about Wavo products, features, and research. You can opt out anytime.
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={aiAssist} disabled={!form.fullName && !form.primaryArtist}>
                AI Assist — Prefill
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {submitting ? "Submitting…" : "Join Waitlist"}
              </Button>
              {error && <span className="text-destructive text-sm">{error}</span>}
            </div>

            {form.enriched && (
              <div className="rounded-xl border p-3 text-xs">
                <div className="font-medium mb-1">Assistant reasoning</div>
                <div>Type guess: {form.enriched.typeGuess} ({Math.round((form.enriched.confidence || 0) * 100)}% conf)</div>
                <div>Manager guess: {form.enriched.managerGuess}</div>
                <div>Works: {form.enriched.notableWorks?.join(", ")}</div>
                <div>Provenance: {form.enriched.provenance?.join(" → ")}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="privacy">
          <TabsList>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="learn">How we’ll use this</TabsTrigger>
          </TabsList>
          <TabsContent value="privacy" className="text-sm text-muted-foreground">
            We’ll only use your info to evaluate access and personalize your experience. We’ll never sell your data.
          </TabsContent>
          <TabsContent value="learn" className="text-sm text-muted-foreground">
            We connect this info to our music/IP graph and your connectors during onboarding to reduce setup friction and improve recommendations.
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
