import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";
import { isVaultReadyForUser, useVaultStore } from "@/lib/vault/store";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, isPending } = useCurrentUserState();
  const hasHydrated = useVaultStore((s) => s._hasHydrated);
  const hydratedUserId = useVaultStore((s) => s.hydratedUserId);
  const vaultReady = isVaultReadyForUser(hasHydrated, hydratedUserId, user?.id);

  if (isPending || !vaultReady) {
    return (
      <div className="grid min-h-dvh place-items-center bg-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-[var(--radius-md)] bg-primary-soft" />
          <p className="text-sm text-fg-muted">Opening your vault…</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      {authEnabled && !user ? (
        <div className="mx-auto mb-4 max-w-4xl rounded-[var(--radius-lg)] border border-border bg-bg-elevated px-4 py-3 text-sm text-fg-muted">
          You're exploring with a local browser vault.{" "}
          <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          anytime for a personal account session.
        </div>
      ) : null}
      <Outlet />
    </AppShell>
  );
}
