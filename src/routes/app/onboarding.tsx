import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVaultStore } from "@/lib/vault/store";

export const Route = createFileRoute("/app/onboarding")({ component: OnboardingPage });

function OnboardingPage() {
  const navigate = useNavigate();
  const onboardingComplete = useVaultStore((s) => s.onboardingComplete);
  const completeOnboarding = useVaultStore((s) => s.completeOnboarding);
  const hydrateDemo = useVaultStore((s) => s.hydrateDemo);

  const [ownerName, setOwnerName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [relationship, setRelationship] = useState("Spouse / partner");

  if (onboardingComplete) {
    return <Navigate to="/app" />;
  }

  function finish() {
    if (!ownerName.trim()) {
      toast.error("Add your name so templates can personalize later.");
      return;
    }
    if (!contactName.trim() || !contactEmail.trim()) {
      toast.error("Add at least one designated contact.");
      return;
    }
    completeOnboarding({
      ownerName: ownerName.trim(),
      contacts: [
        {
          name: contactName.trim(),
          email: contactEmail.trim(),
          relationship: relationship.trim() || "Trusted person",
          isPrimary: true,
          notifyOnRelease: true,
        },
      ],
    });
    toast.success("Vault ready. Answer one prompt when you have two minutes.");
    void navigate({ to: "/app" });
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Set up in under two minutes</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Start your living vault</h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          Name who can open After mode later. You can add more contacts anytime. This is operational
          planning only — not a will.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About you</CardTitle>
          <CardDescription>Used in checklist copy and notification templates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Your full name</span>
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Jordan Lee"
              autoComplete="name"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Primary designated contact</CardTitle>
          <CardDescription>
            The person who should receive the guided checklist when After mode is triggered.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Name</span>
            <Input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Alex Lee"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Email</span>
            <Input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="alex@example.com"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Relationship</span>
            <Input
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Spouse / partner"
            />
          </label>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="sm:flex-1" onClick={finish}>
          Create vault
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="sm:flex-1"
          onClick={() => {
            hydrateDemo();
            toast.success("Sample vault loaded — explore After mode when ready.");
            void navigate({ to: "/app" });
          }}
        >
          Load sample vault
        </Button>
      </div>
    </div>
  );
}
