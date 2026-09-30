import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { PHASE_LABELS, checklistStats } from "@/lib/vault/checklist";
import { TEMPLATES, fillTemplate } from "@/lib/vault/templates";
import { planAfterModeOpen } from "@/lib/vault/after-mode";
import { useVaultStore } from "@/lib/vault/store";
import type { ChecklistPhase } from "@/lib/vault/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/after")({ component: AfterPage });

const PHASES: ChecklistPhase[] = ["immediate", "day1", "week1", "month1", "ongoing"];

function AfterPage() {
  const onboardingComplete = useVaultStore((s) => s.onboardingComplete);
  const releaseTriggered = useVaultStore((s) => s.releaseTriggered);
  const releasedAt = useVaultStore((s) => s.releasedAt);
  const ownerName = useVaultStore((s) => s.ownerName);
  const contacts = useVaultStore((s) => s.contacts);
  const checklist = useVaultStore((s) => s.checklist);
  const items = useVaultStore((s) => s.items);
  const triggerRelease = useVaultStore((s) => s.triggerRelease);
  const resetRelease = useVaultStore((s) => s.resetRelease);
  const toggleTask = useVaultStore((s) => s.toggleTask);
  const setTaskNotes = useVaultStore((s) => s.setTaskNotes);
  const markReferralShared = useVaultStore((s) => s.markReferralShared);
  const referralShared = useVaultStore((s) => s.referralShared);
  const [phase, setPhase] = useState<ChecklistPhase | "all">("all");
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const stats = checklistStats(checklist);
  const primary = contacts.find((c) => c.isPrimary) ?? contacts[0];

  const filtered = useMemo(
    () => (phase === "all" ? checklist : checklist.filter((t) => t.phase === phase)),
    [checklist, phase],
  );

  if (!onboardingComplete) return <Navigate to="/app/onboarding" />;

  if (!releaseTriggered) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <p className="text-sm font-medium text-primary">After mode</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Guided checklist when it matters</h1>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            In production, After mode unlocks only after a verified release protocol. Here you can
            safely demo the designated-person experience with your current vault data.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo release to designated person</CardTitle>
            <CardDescription>
              Generates a phased checklist from {items.length} vault entries
              {primary ? ` for ${primary.name}` : ""}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => {
                const plan = planAfterModeOpen();
                if (plan.hydrateSampleVault) return;
                if (plan.activateRelease) {
                  triggerRelease();
                  toast.success("After mode activated. Checklist is ready.");
                }
              }}
            >
              Trigger After mode (demo)
            </Button>
            <Button asChild variant="secondary">
              <Link to="/app/vault">Review vault first</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-dashed">
          <CardContent className="p-5 text-sm leading-relaxed text-fg-muted">
            Real release flow (product target): multi-factor verification, optional time delay,
            dual-control from designated contacts, and full audit logging. Never closes accounts
            automatically — it only guides humans.
          </CardContent>
        </Card>
      </div>
    );
  }

  const templateVars = {
    decedent: ownerName || "the account holder",
    contact_name: primary?.name ?? "Designated contact",
    contact_email: primary?.email ?? "",
    contact_phone: "",
    date_of_death: releasedAt ? new Date(releasedAt).toLocaleDateString() : "[date]",
    account_details: items.find((i) => i.category === "financial")?.title ?? "[account details]",
    service: "Service",
    service_address: "[service address]",
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>After mode active</Badge>
            {releasedAt ? (
              <span className="text-xs text-fg-subtle">
                Opened {new Date(releasedAt).toLocaleString()}
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Checklist for {ownerName || "your person"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted">
            Clear steps. No guessing. Work the phases in order when you can — leave notes as you go.
            This is operational guidance, not legal advice.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => resetRelease()}>
          Exit After demo
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overall progress</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stats.pct}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={stats.pct} />
            <p className="mt-2 text-xs text-fg-subtle">
              {stats.done} of {stats.total} tasks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Est. time remaining</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stats.minutesLeft}m</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-fg-subtle">
            Far less than the typical 570-hour estate admin burden.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Designated contact</CardDescription>
            <CardTitle className="text-lg">{primary?.name ?? "Not set"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-fg-subtle">{primary?.email}</CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <PhaseChip active={phase === "all"} label="All" onClick={() => setPhase("all")} />
        {PHASES.map((p) => {
          const row = stats.byPhase.find((x) => x.phase === p);
          return (
            <PhaseChip
              key={p}
              active={phase === p}
              label={`${PHASE_LABELS[p]}${row ? ` (${row.done}/${row.total})` : ""}`}
              onClick={() => setPhase(p)}
            />
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((task) => {
          const template = task.templateId
            ? TEMPLATES.find((t) => t.id === task.templateId)
            : undefined;
          const related = items.filter((i) => task.relatedItemIds.includes(i.id));
          return (
            <Card
              key={task.id}
              className={cn(task.completed && "border-primary/20 bg-primary-soft/20")}
            >
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border transition-colors",
                      task.completed
                        ? "border-primary bg-primary text-primary-fg"
                        : "border-border-strong bg-bg-elevated",
                    )}
                    aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                  >
                    {task.completed ? <Check className="size-3.5" /> : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{PHASE_LABELS[task.phase]}</Badge>
                      <span className="text-xs text-fg-subtle">~{task.estimatedMinutes} min</span>
                    </div>
                    <h2
                      className={cn(
                        "mt-1.5 text-base font-semibold tracking-tight",
                        task.completed && "text-fg-muted line-through",
                      )}
                    >
                      {task.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-fg-muted">{task.description}</p>

                    {related.length > 0 ? (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
                          From vault
                        </p>
                        {related.map((r) => (
                          <div
                            key={r.id}
                            className="rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm"
                          >
                            <div className="font-medium">{r.title}</div>
                            {r.summary ? (
                              <div className="text-fg-muted">{r.summary}</div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {template ? (
                      <div className="mt-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setActiveTemplateId((id) =>
                              id === template.id ? null : template.id,
                            )
                          }
                        >
                          {activeTemplateId === template.id ? "Hide template" : "Show template"}
                        </Button>
                        {activeTemplateId === template.id ? (
                          <div className="mt-3 rounded-[var(--radius-lg)] border border-border bg-bg p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="text-sm font-medium">{template.title}</p>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={async () => {
                                  const text = fillTemplate(template.body, {
                                    ...templateVars,
                                    service: related[0]?.title ?? "Service",
                                  });
                                  await navigator.clipboard.writeText(text);
                                  toast.success("Template copied.");
                                }}
                              >
                                <Copy className="size-3.5" />
                                Copy
                              </Button>
                            </div>
                            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-fg-muted">
                              {fillTemplate(template.body, {
                                ...templateVars,
                                service: related[0]?.title ?? "Service",
                              })}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-3">
                      <label className="block space-y-1.5">
                        <span className="text-xs font-medium text-fg-muted">Your notes</span>
                        <Textarea
                          value={task.notes}
                          onChange={(e) => setTaskNotes(task.id, e.target.value)}
                          placeholder="Confirmation numbers, who you spoke with, next follow-up…"
                          className="min-h-[72px]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-primary/25 bg-primary-soft/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Share2 className="size-4" />
            Help the next family skip the scramble
          </CardTitle>
          <CardDescription>
            After users become the strongest acquisition channel. Tell five people to set this up
            while life is calm.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant={referralShared ? "secondary" : "default"}
            onClick={async () => {
              const shareText =
                "AfterVault helps you leave an operational manual for your people — one weekly prompt at a time. Worth setting up before anyone needs it.";
              try {
                if (navigator.share) {
                  await navigator.share({ title: "AfterVault", text: shareText });
                } else {
                  await navigator.clipboard.writeText(shareText);
                  toast.success("Share text copied.");
                }
              } catch {
                await navigator.clipboard.writeText(shareText);
                toast.success("Share text copied.");
              }
              markReferralShared();
            }}
          >
            {referralShared ? "Shared — thank you" : "Share AfterVault"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PhaseChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-bg-elevated text-fg-muted hover:bg-bg-subtle",
      )}
    >
      {label}
    </button>
  );
}
