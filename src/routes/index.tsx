import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignedIn, SignedOut } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: LandingPage });

function LandingPage() {
  const { isPending } = useCurrentUserState();

  return (
    <div className="min-h-dvh bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <BrandMark />
        <div className="flex items-center gap-2">
          {isPending ? (
            <div className="h-10 w-24 animate-pulse rounded-[var(--radius-md)] bg-bg-subtle" />
          ) : (
            <>
              <SignedOut>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/app">
                    Open vault
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild>
                  <Link to="/app">
                    Open vault
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </SignedIn>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Badge variant="secondary" className="mb-5">
                Peace of mind that compounds
              </Badge>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-fg sm:text-5xl sm:leading-[1.08]">
                The operational manual for your life.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
                Capture the accounts, auto-pays, document locations, and practical wishes that only
                live in your head — one small weekly prompt at a time. When the moment comes, your
                people get a clear Day 1 / Week 1 / Month 1 checklist instead of chaos.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg">
                  <Link to="/app">
                    Build your vault
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-fg-subtle">
                Not a will. Not legal advice. Pure logistics for the people you love.
              </p>
            </div>

            <Card className="relative overflow-hidden border-border/80 bg-bg-elevated">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-primary" />
              <CardHeader>
                <div className="mb-2 flex items-center gap-2 text-primary">
                  <Shield className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Before mode</span>
                </div>
                <CardTitle className="text-xl">One question a week</CardTitle>
                <CardDescription>
                  “Does anyone else know the password or recovery method for your primary email?”
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[var(--radius-lg)] border border-border bg-bg p-4">
                  <div className="mb-2 flex items-center justify-between text-xs text-fg-subtle">
                    <span>Vault completeness</span>
                    <span className="font-medium text-primary">42%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-subtle">
                    <div className="h-full w-[42%] rounded-full bg-primary" />
                  </div>
                  <ul className="mt-4 space-y-2.5 text-sm text-fg-muted">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      Primary bank auto-pays mapped
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      Home deed location recorded
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock3 className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                      Life insurance still open
                    </li>
                  </ul>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-primary/20 bg-primary-soft/60 p-4">
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles className="size-3.5" />
                    After mode
                  </div>
                  <p className="text-sm leading-relaxed text-fg">
                    Designated person unlocks a guided checklist with pre-filled notification
                    templates — so they never start from a blank spreadsheet.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border bg-bg-elevated">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-3">
            {[
              {
                icon: MessageSquareIcon,
                title: "Before: progressive capture",
                body: "Tiny weekly prompts build your operational manual over years with near-zero effort.",
              },
              {
                icon: Lock,
                title: "Trust as the product",
                body: "Designated contacts, release controls, and clear audit posture. Your data stays sealed until you say otherwise.",
              },
              {
                icon: ClipboardIcon,
                title: "After: guided checklist",
                body: "Day 1, Week 1, Month 1 tasks generated from your vault — with scripts for banks, SSA, and subscriptions.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[var(--radius-xl)] border border-border bg-bg p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-4 grid size-10 place-items-center rounded-[var(--radius-md)] bg-primary-soft text-primary">
                  <item.icon className="size-5" />
                </div>
                <h2 className="text-base font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="rounded-[var(--radius-2xl)] border border-border bg-[linear-gradient(180deg,var(--color-bg-elevated),var(--color-bg))] px-6 py-10 text-center shadow-[var(--shadow-card)] sm:px-12">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Families inherit 12–18 months of admin.
              <br className="hidden sm:block" /> You can leave them a map instead.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-base">
              AfterVault captures what only you know — before it is gone — and turns it into calm,
              step-by-step action when someone else needs it most.
            </p>
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg">
                <Link to="/app">
                  Start your operational manual
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-fg-subtle">
        AfterVault · Operational logistics only · Not legal advice · Not a will
      </footer>
    </div>
  );
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}
