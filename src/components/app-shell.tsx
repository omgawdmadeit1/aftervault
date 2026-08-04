import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  ClipboardList,
  FileText,
  Home,
  Menu,
  MessageSquareQuote,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/lib/auth/gates";
import { cn } from "@/lib/utils";

const NAV: {
  to: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  primaryMobile?: boolean;
}[] = [
  { to: "/app", label: "Dashboard", shortLabel: "Home", icon: Home, exact: true, primaryMobile: true },
  {
    to: "/app/prompt",
    label: "Weekly prompt",
    shortLabel: "Prompt",
    icon: MessageSquareQuote,
    primaryMobile: true,
  },
  { to: "/app/vault", label: "Vault", shortLabel: "Vault", icon: BookOpen, primaryMobile: true },
  { to: "/app/contacts", label: "Contacts", shortLabel: "People", icon: Users },
  {
    to: "/app/after",
    label: "After mode",
    shortLabel: "After",
    icon: ClipboardList,
    primaryMobile: true,
  },
  { to: "/app/templates", label: "Templates", shortLabel: "Templates", icon: FileText },
];

const MOBILE_TABS = NAV.filter((n) => n.primaryMobile);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-bg pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto flex min-h-dvh max-w-6xl">
        <aside className="hidden w-60 shrink-0 border-r border-border bg-bg-elevated/70 px-4 py-6 md:flex md:flex-col">
          <BrandMark to="/app" className="mb-8 px-2" />
          <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
            {NAV.map((item) => {
              const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-fg-muted hover:bg-bg-subtle hover:text-fg",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-border pt-4">
            <p className="mb-3 px-2 text-xs leading-relaxed text-fg-subtle">
              Operational knowledge only — not a will or legal advice.
            </p>
            <div className="px-1">
              <UserButton />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-[var(--grok-banner-h,0px)] z-20 flex items-center justify-between gap-3 border-b border-border bg-bg/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-bg/80 md:hidden">
            <BrandMark to="/app" />
            <Button
              variant="secondary"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </Button>
          </header>

          {open ? (
            <div className="border-b border-border bg-bg-elevated px-3 py-3 md:hidden">
              <nav className="flex flex-col gap-1" aria-label="More">
                {NAV.map((item) => {
                  const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex min-h-11 items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium",
                        active ? "bg-primary-soft text-primary" : "text-fg-muted",
                      )}
                    >
                      <Icon className="size-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-3 border-t border-border pt-3">
                <UserButton />
              </div>
            </div>
          ) : null}

          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
        </div>
      </div>

      {/* Mobile bottom tabs — primary PWA navigation */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg-elevated/95 backdrop-blur supports-[backdrop-filter]:bg-bg-elevated/90 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="mx-auto grid max-w-lg grid-cols-4 gap-0 px-1 pt-1">
          {MOBILE_TABS.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] px-1 py-1.5 text-[10px] font-medium transition-colors",
                    active ? "text-primary" : "text-fg-subtle",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full transition-colors",
                      active && "bg-primary-soft",
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <span className="leading-none">{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
