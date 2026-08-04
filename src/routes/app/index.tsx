import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  MessageSquareQuote,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { checklistStats } from "@/lib/vault/checklist";
import { CATEGORY_META, getNextPrompt } from "@/lib/vault/prompts";
import { useVaultStore } from "@/lib/vault/store";
import type { VaultCategory } from "@/lib/vault/types";

export const Route = createFileRoute("/app/")({ component: DashboardPage });

function DashboardPage() {
  const user = useCurrentUser();
  const onboardingComplete = useVaultStore((s) => s.onboardingComplete);
  const ownerName = useVaultStore((s) => s.ownerName);
  const items = useVaultStore((s) => s.items);
  const contacts = useVaultStore((s) => s.contacts);
  const releaseTriggered = useVaultStore((s) => s.releaseTriggered);
  const checklist = useVaultStore((s) => s.checklist);
  const answeredPromptIds = useVaultStore((s) => s.answeredPromptIds);
  const currentPromptIndex = useVaultStore((s) => s.currentPromptIndex);
  const hydrateDemo = useVaultStore((s) => s.hydrateDemo);

  const completeness = useMemo(() => {
    const byCategory = (Object.keys(CATEGORY_META) as VaultCategory[]).map((category) => {
      const count = items.filter((i) => i.category === category).length;
      const pct = Math.min(100, Math.round((count / 2) * 100));
      return {
        category,
        label: CATEGORY_META[category].label,
        pct,
        count,
      };
    });
    const weighted = byCategory.reduce(
      (sum, row) => sum + row.pct * CATEGORY_META[row.category].weight,
      0,
    );
    const weightTotal = byCategory.reduce(
      (sum, row) => sum + CATEGORY_META[row.category].weight,
      0,
    );
    return {
      overall: Math.round(weighted / weightTotal),
      byCategory,
    };
  }, [items]);

  const currentPrompt = useMemo(
    () => getNextPrompt(answeredPromptIds, currentPromptIndex),
    [answeredPromptIds, currentPromptIndex],
  );

  if (!onboardingComplete) {
    return <Navigate to="/app/onboarding" />;
  }

  const stats = checklistStats(checklist);
  const firstName =
    ownerName?.split(" ")[0] || user?.displayName?.split(" ")[0] || "there";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Before mode</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
            Your operational manual is {completeness.overall}% complete. Keep answering one small
            question a week — it compounds into real protection for your people.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/app/prompt">
              This week's prompt
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/app/after">After mode</Link>
          </Button>
        </div>
      </div>

      {releaseTriggered ? (
        <Card className="border-primary/30 bg-primary-soft/40">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <ClipboardList className="size-4" />
                After mode is active
              </div>
              <p className="mt-1 text-sm text-fg-muted">
                Checklist {stats.done}/{stats.total} complete · ~{stats.minutesLeft} min remaining
              </p>
            </div>
            <Button asChild>
              <Link to="/app/after">Open checklist</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vault completeness</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{completeness.overall}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completeness.overall} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Vault entries</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{items.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-fg-muted">Across all categories</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Designated contacts</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{contacts.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-fg-muted">People who can receive After access</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Next prompt</CardTitle>
              <Badge variant="secondary">~2 min</Badge>
            </div>
            <CardDescription>
              {currentPrompt
                ? currentPrompt.question
                : "You have answered the full starter set. Add custom vault items anytime."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/app/prompt">
                <MessageSquareQuote className="size-4" />
                Answer prompt
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/app/vault">
                <BookOpen className="size-4" />
                Browse vault
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category coverage</CardTitle>
            <CardDescription>Aim for two solid entries per category.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {completeness.byCategory.map((row) => (
              <div key={row.category}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-fg">{row.label}</span>
                  <span className="tabular-nums text-fg-subtle">
                    {row.count} · {row.pct}%
                  </span>
                </div>
                <Progress value={row.pct} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            Trust posture
          </CardTitle>
          <CardDescription>
            Sensitive operational details stay local in this demo vault. Production AfterVault uses
            strong encryption, access controls, and an auditable release protocol.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="secondary">
            <Link to="/app/contacts">
              <Users className="size-4" />
              Manage contacts
            </Link>
          </Button>
          <Button type="button" variant="outline" onClick={() => hydrateDemo()}>
            Load sample vault
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
