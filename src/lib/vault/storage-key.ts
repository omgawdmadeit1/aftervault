/** Unscoped key used by the first AfterVault persist release. */
export const LEGACY_VAULT_STORAGE_KEY = "aftervault-v1";

/** Signed-out / local-only vault (not tied to an account). */
export const LOCAL_VAULT_STORAGE_KEY = "aftervault-v1:local";

export type StorageLike = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

/** Persist key for the current session. Signed-in vaults never share a key. */
export function vaultStorageKey(userId: string | null | undefined): string {
  const id = typeof userId === "string" ? userId.trim() : "";
  return id ? `${LEGACY_VAULT_STORAGE_KEY}:user:${id}` : LOCAL_VAULT_STORAGE_KEY;
}

/**
 * Move the pre-namespaced `aftervault-v1` blob onto `targetKey` once.
 * Does not overwrite an existing scoped vault.
 */
export function migrateLegacyVaultKey(
  storage: StorageLike,
  targetKey: string,
): boolean {
  if (targetKey === LEGACY_VAULT_STORAGE_KEY) return false;
  let legacy: string | null;
  try {
    legacy = storage.getItem(LEGACY_VAULT_STORAGE_KEY);
  } catch {
    return false;
  }
  if (!legacy) return false;
  try {
    if (!storage.getItem(targetKey)) {
      storage.setItem(targetKey, legacy);
    }
    storage.removeItem(LEGACY_VAULT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasStoredVault(storage: StorageLike, key: string): boolean {
  try {
    return storage.getItem(key) != null;
  } catch {
    return false;
  }
}

/**
 * Drop persist blobs that zustand cannot parse. A leftover in-memory vault
 * from the previous session must not be written onto this key on the next
 * setHasHydrated() persist.
 */
export function discardUnreadableVaultKey(storage: StorageLike, key: string): boolean {
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return false;
  }
  if (raw == null || raw === "") return false;
  try {
    JSON.parse(raw);
    return false;
  } catch {
    try {
      storage.removeItem(key);
    } catch {
      return false;
    }
    return true;
  }
}
