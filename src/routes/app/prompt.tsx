import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_META, PROMPTS, getNextPrompt } from "@/lib/vault/prompts";
import { useVaultStore } from "@/lib/vault/store";

export const Route = createFileRoute("/app/prompt")({ component: PromptPage });

function PromptPage() {
  const onboardingComplete = useVaultStore((s) => s.onboardingComplete);
  const answeredPromptIds = useVaultStore((s) => s.answeredPromptIds);
  const currentPromptIndex = useVaultStore((s) => s.currentPromptIndex);
  const answerPrompt = useVaultStore((s) => s.answerPrompt);
  const skipPrompt = useVaultStore((s) => s.skipPrompt);

  const currentPrompt = useMemo(
    () => getNextPrompt(answeredPromptIds, currentPromptIndex),
    [answeredPromptIds, currentPromptIndex],
  );

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});

  const progress = useMemo(() => {
    const total = PROMPTS.length;
    const done = answeredPromptIds.length;
    return { total, done, pct: Math.round((Math.min(done, total) / total) * 100) };
  }, [answeredPromptIds]);

  if (!onboardingComplete) return <Navigate to="/app/onboarding" />;

  function onSave() {
    if (!currentPrompt) return;
    if (!title.trim() && !Object.values(fields).some(Boolean)) {
      toast.error("Add a short title or at least one detail.");
      return;
    }
    answerPrompt({
      promptId: currentPrompt.id,
      title: title.trim() || currentPrompt.question,
      summary: summary.trim() || undefined,
      fields,
    });
    setTitle("");
    setSummary("");
    setFields({});
    toast.success("Saved to your vault. One less thing only you knew.");
  }

  if (!currentPrompt) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Prompt set complete</h1>
        <p className="text-sm text-fg-muted">
          You answered the starter weekly questions. Keep refining entries in the vault, or wait for
          the next cadence of prompts in a full product release.
        </p>
        <Button asChild>
          <Link to="/app/vault">Open vault</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Weekly micro-prompt</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">One small question</h1>
        </div>
        <Badge variant="secondary">
          {progress.done}/{progress.total}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <Badge variant="default" className="w-fit">
            {CATEGORY_META[currentPrompt.category].label}
          </Badge>
          <CardTitle className="text-xl leading-snug">{currentPrompt.question}</CardTitle>
          {currentPrompt.help ? <CardDescription>{currentPrompt.help}</CardDescription> : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Short title for this entry</span>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Primary Gmail recovery"
            />
          </label>

          {currentPrompt.fieldHints.map((hint) => (
            <label key={hint} className="block space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">{hint}</span>
              <Input
                value={fields[hint] ?? ""}
                onChange={(e) => setFields((f) => ({ ...f, [hint]: e.target.value }))}
                placeholder={hint}
              />
            </label>
          ))}

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Optional note</span>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Anything else your people should know"
            />
          </label>

          <div className="flex flex-col gap-2 pt-1 sm:flex-row">
            <Button className="sm:flex-1" onClick={onSave}>
              Save to vault
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="sm:flex-1"
              onClick={() => {
                skipPrompt(currentPrompt.id);
                setTitle("");
                setSummary("");
                setFields({});
                toast.message("Skipped for now — you can revisit later.");
              }}
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-fg-subtle">
        Tip: accuracy beats completeness. Capture the truth you know today.
      </p>
    </div>
  );
}
