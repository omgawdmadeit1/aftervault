import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TEMPLATES, fillTemplate } from "@/lib/vault/templates";
import { useVaultStore } from "@/lib/vault/store";

export const Route = createFileRoute("/app/templates")({ component: TemplatesPage });

function TemplatesPage() {
  const onboardingComplete = useVaultStore((s) => s.onboardingComplete);
  const ownerName = useVaultStore((s) => s.ownerName);
  const contacts = useVaultStore((s) => s.contacts);
  const [openId, setOpenId] = useState<string | null>(TEMPLATES[0]?.id ?? null);

  if (!onboardingComplete) return <Navigate to="/app/onboarding" />;

  const primary = contacts.find((c) => c.isPrimary) ?? contacts[0];
  const vars = {
    decedent: ownerName || "[name]",
    contact_name: primary?.name ?? "[your name]",
    contact_email: primary?.email ?? "[email]",
    contact_phone: "[phone]",
    date_of_death: "[date]",
    account_details: "[account details]",
    service: "[service]",
    service_address: "[address]",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notification templates</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Calm, practical scripts for the calls and letters families usually improvise under stress.
          Customize before sending.
        </p>
      </div>

      <div className="space-y-3">
        {TEMPLATES.map((t) => {
          const open = openId === t.id;
          const body = fillTemplate(t.body, vars);
          return (
            <Card key={t.id}>
              <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <div className="mb-2">
                    <Badge variant="secondary">{t.category}</Badge>
                  </div>
                  <CardTitle>{t.title}</CardTitle>
                  <CardDescription className="mt-1">Subject: {fillTemplate(t.subject, vars)}</CardDescription>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={() => setOpenId(open ? null : t.id)}>
                    {open ? "Hide" : "View"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      await navigator.clipboard.writeText(body);
                      toast.success("Copied template body.");
                    }}
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              {open ? (
                <CardContent>
                  <pre className="whitespace-pre-wrap rounded-[var(--radius-lg)] border border-border bg-bg p-4 font-sans text-sm leading-relaxed text-fg-muted">
                    {body}
                  </pre>
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
