import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_META } from "@/lib/vault/prompts";
import { useVaultStore } from "@/lib/vault/store";
import type { VaultCategory, VaultItemType } from "@/lib/vault/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/vault")({ component: VaultPage });

const CATEGORIES = Object.keys(CATEGORY_META) as VaultCategory[];

function VaultPage() {
  const onboardingComplete = useVaultStore((s) => s.onboardingComplete);
  const items = useVaultStore((s) => s.items);
  const addItem = useVaultStore((s) => s.addItem);
  const deleteItem = useVaultStore((s) => s.deleteItem);
  const [filter, setFilter] = useState<VaultCategory | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState<VaultCategory>("digital");

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [items, filter],
  );

  if (!onboardingComplete) return <Navigate to="/app/onboarding" />;

  function onAdd() {
    if (!title.trim()) {
      toast.error("Give the entry a title.");
      return;
    }
    const typeMap: Record<VaultCategory, VaultItemType> = {
      digital: "account",
      financial: "autopay",
      property: "document_location",
      contacts: "contact",
      subscriptions: "subscription",
      vehicles: "vehicle",
      wishes: "wish",
    };
    addItem({
      type: typeMap[category],
      category,
      title: title.trim(),
      summary: summary.trim() || undefined,
      fields: {},
    });
    setTitle("");
    setSummary("");
    setShowAdd(false);
    toast.success("Vault entry added.");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vault</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Everything captured so far — organized for humans under stress.
          </p>
        </div>
        <Button onClick={() => setShowAdd((v) => !v)} variant={showAdd ? "secondary" : "default"}>
          {showAdd ? "Close form" : "Add entry"}
        </Button>
      </div>

      {showAdd ? (
        <Card>
          <CardHeader>
            <CardTitle>Manual entry</CardTitle>
            <CardDescription>Skip the weekly cadence when you already know the detail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Category</span>
              <select
                className="flex h-11 w-full rounded-[var(--radius-md)] border border-border bg-bg-elevated px-3 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value as VaultCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Title</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Entry title" />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Summary</span>
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Key details your designated person will need"
              />
            </label>
            <Button onClick={onAdd}>Save entry</Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        {CATEGORIES.map((c) => (
          <FilterChip
            key={c}
            active={filter === c}
            onClick={() => setFilter(c)}
            label={CATEGORY_META[c].label}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-fg-muted">
            No entries yet in this view. Answer a weekly prompt or add one manually.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{CATEGORY_META[item.category].label}</Badge>
                    <span className="text-xs text-fg-subtle">
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold tracking-tight">{item.title}</h2>
                  {item.summary ? (
                    <p className="text-sm leading-relaxed text-fg-muted">{item.summary}</p>
                  ) : null}
                  {Object.keys(item.fields).length > 0 ? (
                    <dl className="grid gap-1.5 text-sm sm:grid-cols-2">
                      {Object.entries(item.fields).map(([k, v]) =>
                        v ? (
                          <div key={k} className="rounded-[var(--radius-sm)] bg-bg-subtle/80 px-2.5 py-2">
                            <dt className="text-[11px] font-medium uppercase tracking-wide text-fg-subtle">
                              {k}
                            </dt>
                            <dd className="mt-0.5 text-fg">{v}</dd>
                          </div>
                        ) : null,
                      )}
                    </dl>
                  ) : null}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Delete entry"
                  onClick={() => {
                    deleteItem(item.id);
                    toast.message("Entry removed.");
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
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
