import { useEffect } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { hydrateVaultForUser } from "@/lib/vault/store";

/**
 * Client-only rehydrate of the vault store (avoids SSR localStorage issues).
 * Waits for the session so a second account on the same browser cannot
 * inherit the previous user's persist blob. The layout also requires
 * `hydratedUserId` to match the current session — `_hasHydrated` alone
 * stays true across account switches and would otherwise flash the
 * previous estate.
 */
export function VaultHydration() {
  const { user, isPending } = useCurrentUserState();

  useEffect(() => {
    if (isPending) return;
    void hydrateVaultForUser(user?.id ?? null).catch(() => undefined);
  }, [isPending, user?.id]);

  return null;
}
