

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

type StepType = "text" | "choice" | "connectors" | "review";

type Step = {
  id: keyof SignupAnswers | "useCases" | "connectors" | "review";
  prompt: string;
  type: StepType;
  optional?: boolean;
  placeholder?: string;
  options?: string[];
  multi?: boolean;
  includeOther?: boolean;
};

type SignupAnswers = {
  role?: Role;
  fullName?: string;
  email?: string;
  org?: string;
  primaryArtist?: string;
  location?: string;
  website?: string;
  instagram?: string;
  spotify?: string;
  soundcloud?: string;
  useCases?: UseCase[];
  notes?: string;
  marketingConsent?: boolean;
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

const CONNECTORS: { key: string; label: string }[] = [
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "spotify", label: "Spotify for Artists" },
  { key: "apple_music", label: "Apple Music for Artists" },
  { key: "meta", label: "Meta Ads" },
  { key: "google_ads", label: "Google Ads" },
];

function slug(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AssistantClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const emailFromURL = sp.get("email") ?? "";

  // Message model
  type Msg = { role: "assistant" | "user"; text: string };
  const [msgs, setMsgs] = useState<Msg[]>([]);

  // Answers store
  const [answers, setAnswers] = useState<SignupAnswers>(() => ({
    email: emailFromURL || undefined,
    marketingConsent: true,
  }));

  // Connectors
  const [connect, setConnect] = useState<Record<string, boolean>>({});

  // Step index
  const [i, setI] = useState(0);

  // Text composer (for text steps + "Other")
  const [composer, setComposer] = useState("");
  const composerRef = useRef<HTMLInputElement | null>(null);

  // Selected "Other" flag (opens input under choices)
  const [otherMode, setOtherMode] = useState(false);

  // Build steps (use email from URL for display; still ask for name etc.)
  const steps = useMemo<Step[]>(
    () => [
      {
        id: "role",
        prompt: "What best describes you?",
        type: "choice",
        options: ["Artist", "Producer", "Manager", "Label", "Other"],
        includeOther: true,
      },
      {
        id: "fullName",
        prompt: "Great — what’s your name?",
        type: "text",
        placeholder: "e.g., Alex Chen",
      },
      {
        id: "org",
        prompt: "Which org / label / management are you with? (optional)",
        type: "text",
        optional: true,
        placeholder: "e.g., Atlantic Records",
      },
      {
        id: "primaryArtist",
        prompt: "Who is your primary artist / subject? (optional)",
        type: "text",
        optional: true,
        placeholder: "e.g., Metro Boomin",
      },
      {
        id: "location",
        prompt: "Where are you based? (optional)",
        type: "text",
        optional: true,
        placeholder: "City, Country",
      },
      {
        id: "useCases",
        prompt: "How can we help? Pick one or more.",
        type: "choice",
        options: USE_CASES,
        multi: true,
        includeOther: true,
      },
      {
        id: "connectors",
        prompt: "Want to connect any sources now? (optional — you can skip)",
        type: "connectors",
      },
      {
        id: "review",
        prompt: "Thanks! Review and submit?",
        type: "review",
      },
    ],
    []
  );

  // Show the current assistant prompt if not yet in msgs
  useEffect(() => {
    const current = steps[i];
    if (!current) return;
    const alreadyAsked = msgs.some((m) => m.role === "assistant" && m.text === current.prompt);
    if (!alreadyAsked) {
      setMsgs((m) => [...m, { role: "assistant", text: current.prompt }]);
    }
  }, [i, steps, msgs]);

  // Auto-focus for quick typing
  useEffect(() => {
    setTimeout(() => {
      composerRef.current?.focus();
    }, 0);
  }, [i, otherMode]);

  function next() {
    setI((x) => Math.min(x + 1, steps.length - 1));
    setComposer("");
    setOtherMode(false);
  }

  function back() {
    if (i === 0) return;
    const current = steps[i - 1];

    // Remove last user + last assistant question
    setMsgs((m) => {
      const trimmed = [...m];
      // Pop until we remove the last two bubbles (user & the question we’re stepping back to)
      let removed = 0;
      while (trimmed.length && removed < 1) {
        const last = trimmed[trimmed.length - 1];
        if (last.role === "user") removed++;
        trimmed.pop();
      }
      // Also remove the prompt for the current (we’ll re-add when re-entering)
      // Remove last assistant message if it is exactly the current prompt
      if (trimmed.length) {
        const last = trimmed[trimmed.length - 1];
        if (last.role === "assistant" && last.text === steps[i].prompt) {
          trimmed.pop();
        }
      }
      return trimmed;
    });

    // Clear the previous answer
    setAnswers((a) => {
      const copy = { ...a };
      if (current.id in copy) {
        // @ts-expect-error dynamic delete
        delete copy[current.id];
      }
      return copy;
    });

    // If stepping back from connectors, clear that too
    if (steps[i].id === "connectors") setConnect({});

    setComposer("");
    setOtherMode(false);
    setI((x) => Math.max(0, x - 1));
  }

  function submitUserBubble(text: string) {
    setMsgs((m) => [...m, { role: "user", text }]);
  }

  // ---- Choice (single / multi) ----
  function chooseOption(opt: string) {
    const current = steps[i];
    if (current.multi) {
      // toggle in multi-select (for useCases)
      setAnswers((a) => {
        const arr = Array.isArray(a.useCases) ? [...a.useCases] : [];
        const has = arr.includes(opt as UseCase);
        const nextArr = has ? arr.filter((x) => x !== (opt as UseCase)) : [...arr, opt as UseCase];
        return { ...a, useCases: nextArr };
      });
      // for multi we don't auto-advance on each click; show selection as badge row
    } else {
      // single select (e.g., role)
      setAnswers((a) => ({ ...a, [current.id]: opt as any }));
      submitUserBubble(opt);
      next();
    }
  }

  function addOther() {
    setOtherMode(true);
    setTimeout(() => composerRef.current?.focus(), 0);
  }

  function submitOther() {
    if (!composer.trim()) return;
    const current = steps[i];
    if (current.multi) {
      setAnswers((a) => {
        const arr = Array.isArray(a.useCases) ? [...a.useCases] : [];
        const nextArr = [...arr, composer.trim() as UseCase];
        return { ...a, useCases: nextArr };
      });
      submitUserBubble(`Other: ${composer.trim()}`);
      setComposer("");
      setOtherMode(false);
    } else {
      setAnswers((a) => ({ ...a, [current.id]: composer.trim() as any }));
      submitUserBubble(composer.trim());
      setComposer("");
      setOtherMode(false);
      next();
    }
  }

  // ---- Text step ----
  function submitText() {
    const current = steps[i];
    const val = composer.trim();
    if (!val && !current.optional) return; // require value if not optional
    if (!val && current.optional) {
      // user pressed Enter on empty optional: skip
      submitUserBubble("(skipped)");
      next();
      return;
    }
    setAnswers((a) => ({ ...a, [current.id]: val as any }));
    submitUserBubble(val);
    next();
  }

  // ---- Connectors step ----
  function toggleConnector(k: string) {
    setConnect((m) => ({ ...m, [k]: !m[k] }));
  }
  function submitConnectors() {
    const selected = Object.keys(connect).filter((k) => connect[k]);
    submitUserBubble(selected.length ? `Connected: ${selected.join(", ")}` : "(skipped)");
    next();
  }

  // ---- Review -> Submit to /api/signup (reuse existing API) ----
  const readyToSubmit = i === steps.length - 1;
  async function submitAll() {
    try {
      const payload = {
        role: answers.role ?? "Artist",
        fullName: answers.fullName ?? "",
        email: answers.email ?? "",
        org: answers.org ?? "",
        primaryArtist: answers.primaryArtist ?? "",
        location: answers.location ?? "",
        website: answers.website ?? "",
        instagram: answers.instagram ?? "",
        spotify: answers.spotify ?? "",
        soundcloud: answers.soundcloud ?? "",
        useCases: answers.useCases ?? [],
        notes: "",
        marketingConsent: true,
        utmSource: sp.get("utm_source"),
        utmMedium: sp.get("utm_medium"),
        utmCampaign: sp.get("utm_campaign"),
        referrer: typeof window !== "undefined" ? document.referrer || null : null,
        enriched: {
          typeGuess: answers.role ?? "Artist",
          provenance: ["chat:mvp"],
        },
        derived: {
          subjectSlug: slug(answers.primaryArtist || answers.fullName || ""),
          domain: (answers.email || "").split("@")[1]?.toLowerCase() || "",
        },
        connectors: Object.keys(connect).filter((k) => connect[k]),
      };
      // Same endpoint your signup form uses:
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push(`/thanks?email=${encodeURIComponent(payload.email)}`);
    } catch (e: any) {
      alert(e?.message || "Submission failed");
    }
  }

  // Handle Enter
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const current = steps[i];
      if (current.type === "text") submitText();
      if (current.type === "choice" && otherMode) submitOther();
      if (current.type === "connectors") submitConnectors();
    }
  }

  const current = steps[i];

  return (
    <div className="w-full max-w-3xl">
      <Card>
        <CardContent className="p-4">
          {/* Transcript */}
          <div className="space-y-2 mb-3 max-h-[55vh] overflow-auto pr-1">
            {msgs.map((m, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-3 shadow text-sm max-w-[85%] ${
                  m.role === "assistant"
                    ? "bg-muted"
                    : "bg-primary text-primary-foreground ml-auto"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Composer */}
          <div className="rounded-xl border p-3 space-y-2">
            {/* Step header + Back */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                Step {i + 1} of {steps.length}
              </div>
              <div className="ml-auto">
                <Button variant="ghost" size="sm" onClick={back} disabled={i === 0}>
                  Back
                </Button>
              </div>
            </div>

            {/* Choice (single or multi) */}
            {current.type === "choice" && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {current.options?.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => (opt === "Other" ? addOther() : chooseOption(opt))}
                      className={`px-3 py-2 border rounded-xl text-sm ${
                        answers.useCases?.includes(opt as UseCase) ? "bg-muted" : "bg-card"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {current.multi && answers.useCases && answers.useCases.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {answers.useCases.map((uc) => (
                      <Badge key={uc} variant="outline">
                        {uc}
                      </Badge>
                    ))}
                  </div>
                )}

                {otherMode && (
                  <div className="flex items-center gap-2">
                    <input
                      ref={composerRef}
                      value={composer}
                      onChange={(e) => setComposer(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Type your answer… (Enter to save)"
                      className="h-10 w-full rounded-md border px-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-600"
                    />
                    <Button size="sm" onClick={submitOther}>
                      Save
                    </Button>
                  </div>
                )}

                {current.multi && (
                  <div className="flex justify-end">
                    <Button size="sm" onClick={next}>
                      Continue
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Text */}
            {current.type === "text" && (
              <div className="space-y-2">
                <input
                  ref={composerRef}
                  value={composer}
                  onChange={(e) => setComposer(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={current.placeholder || "Type your answer…"}
                  className="h-10 w-full rounded-md border px-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-600"
                />
                <div className="text-xs text-muted-foreground">
                  {current.optional
                    ? "Optional — press Enter to skip or Continue."
                    : "Press Enter to continue."}
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={submitText}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Connectors */}
            {current.type === "connectors" && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CONNECTORS.map((c) => (
                    <label
                      key={c.key}
                      className={`flex items-center gap-2 rounded-xl border p-2 cursor-pointer ${
                        connect[c.key] ? "bg-muted" : "bg-card"
                      }`}
                    >
                      <Checkbox checked={!!connect[c.key]} onCheckedChange={() => toggleConnector(c.key)} />
                      <span className="text-sm">{c.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setConnect({}); submitConnectors(); }}>
                    Skip
                  </Button>
                  <Button size="sm" onClick={submitConnectors}>
                    Continue
                  </Button>
                </div>
              </div>
            )}

            {/* Review */}
            {current.type === "review" && (
              <div className="space-y-2">
                <div className="rounded-xl border p-3 text-xs">
                  <div className="font-medium mb-1">Summary</div>
                  <div>Role: {answers.role || "-"}</div>
                  <div>Name: {answers.fullName || "-"}</div>
                  <div>Email: {answers.email || "-"}</div>
                  <div>Org: {answers.org || "-"}</div>
                  <div>Primary Artist: {answers.primaryArtist || "-"}</div>
                  <div>Location: {answers.location || "-"}</div>
                  <div>Use cases: {(answers.useCases || []).join(", ") || "-"}</div>
                  <div>Connectors: {Object.keys(connect).filter((k)=>connect[k]).join(", ") || "-"}</div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={submitAll}>Submit</Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
