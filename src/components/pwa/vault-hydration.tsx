import { useEffect } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { hydrateVaultForUser, useVaultStore } from "@/lib/vault/store";

/**
 * Client-only rehydrate of the vault store (avoids SSR localStorage issues).
 * Waits for the session so a second account on the same browser cannot
 * inherit the previous user's persist blob.
 */
export function VaultHydration() {
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    if (isPending) return;
    let cancelled = false;
    void hydrateVaultForUser(user?.id ?? null)
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) useVaultStore.getState().setHasHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isPending, user?.id]);

  return null;
}
