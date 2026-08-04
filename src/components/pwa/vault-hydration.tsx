import { useEffect } from "react";
import { useVaultStore } from "@/lib/vault/store";

/** Client-only rehydrate of the vault store (avoids SSR localStorage / infinite loop issues). */
export function VaultHydration() {
  useEffect(() => {
    const result = useVaultStore.persist.rehydrate();
    Promise.resolve(result)
      .catch(() => undefined)
      .finally(() => {
        useVaultStore.getState().setHasHydrated(true);
      });
  }, []);
  return null;
}
