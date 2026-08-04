import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useVaultStore } from "@/lib/vault/store";

export const Route = createFileRoute("/app/contacts")({ component: ContactsPage });

function ContactsPage() {
  const onboardingComplete = useVaultStore((s) => s.onboardingComplete);
  const contacts = useVaultStore((s) => s.contacts);
  const addContact = useVaultStore((s) => s.addContact);
  const removeContact = useVaultStore((s) => s.removeContact);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("");

  if (!onboardingComplete) return <Navigate to="/app/onboarding" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Designated contacts</h1>
        <p className="mt-1 text-sm text-fg-muted">
          People who can receive After mode access under your release rules. Keep this list small and
          intentional.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add contact</CardTitle>
          <CardDescription>Primary contacts are notified first when After mode is triggered.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Relationship"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!name.trim() || !email.trim()) {
                toast.error("Name and email are required.");
                return;
              }
              addContact({
                name: name.trim(),
                email: email.trim(),
                relationship: relationship.trim() || "Trusted person",
                isPrimary: contacts.length === 0,
                notifyOnRelease: true,
              });
              setName("");
              setEmail("");
              setRelationship("");
              toast.success("Contact added.");
            }}
          >
            Add contact
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {contacts.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{c.name}</h2>
                  {c.isPrimary ? <Badge>Primary</Badge> : null}
                </div>
                <p className="mt-1 text-sm text-fg-muted">{c.email}</p>
                <p className="text-xs text-fg-subtle">{c.relationship}</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeContact(c.id)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
        {contacts.length === 0 ? (
          <p className="text-sm text-fg-muted">No contacts yet.</p>
        ) : null}
      </div>
    </div>
  );
}
