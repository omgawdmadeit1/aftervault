import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LEGACY_VAULT_STORAGE_KEY,
  LOCAL_VAULT_STORAGE_KEY,
  claimLocalVaultForUser,
  hasStoredVault,
  migrateLegacyVaultKey,
  vaultStorageKey,
} from "./storage-key.ts";

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
    dump: () => Object.fromEntries(map),
  };
}

describe("vaultStorageKey", () => {
  it("isolates signed-in users from each other and from the local vault", () => {
    const alice = vaultStorageKey("alice");
    const bob = vaultStorageKey("bob");
    const local = vaultStorageKey(null);
    assert.equal(local, LOCAL_VAULT_STORAGE_KEY);
    assert.notEqual(alice, bob);
    assert.notEqual(alice, local);
    assert.notEqual(bob, local);
  });

  it("treats blank ids as local so they cannot collide with a real user key", () => {
    assert.equal(vaultStorageKey("  "), LOCAL_VAULT_STORAGE_KEY);
    assert.equal(vaultStorageKey(""), LOCAL_VAULT_STORAGE_KEY);
    assert.equal(vaultStorageKey(undefined), LOCAL_VAULT_STORAGE_KEY);
  });
});

describe("migrateLegacyVaultKey", () => {
  it("moves the shared legacy blob onto the current user key once", () => {
    const storage = memoryStorage({
      [LEGACY_VAULT_STORAGE_KEY]: JSON.stringify({ state: { ownerName: "Jordan" } }),
    });
    const target = vaultStorageKey("alice");
    assert.equal(migrateLegacyVaultKey(storage, target), true);
    assert.equal(hasStoredVault(storage, LEGACY_VAULT_STORAGE_KEY), false);
    assert.equal(hasStoredVault(storage, target), true);
    assert.match(storage.dump()[target] ?? "", /Jordan/);
  });

  it("does not overwrite an already-scoped vault", () => {
    const target = vaultStorageKey("alice");
    const storage = memoryStorage({
      [LEGACY_VAULT_STORAGE_KEY]: JSON.stringify({ state: { ownerName: "Legacy" } }),
      [target]: JSON.stringify({ state: { ownerName: "Alice" } }),
    });
    migrateLegacyVaultKey(storage, target);
    assert.equal(hasStoredVault(storage, LEGACY_VAULT_STORAGE_KEY), false);
    assert.match(storage.dump()[target] ?? "", /Alice/);
    assert.doesNotMatch(storage.dump()[target] ?? "", /Legacy/);
  });
});

describe("claimLocalVaultForUser", () => {
  it("moves a signed-out vault onto a first-time user key", () => {
    const userKey = vaultStorageKey("alice");
    const storage = memoryStorage({
      [LOCAL_VAULT_STORAGE_KEY]: JSON.stringify({
        state: { ownerName: "Alice", items: [{ title: "Life insurance packet" }] },
      }),
    });
    assert.equal(claimLocalVaultForUser(storage, userKey), true);
    assert.equal(hasStoredVault(storage, LOCAL_VAULT_STORAGE_KEY), false);
    assert.match(storage.dump()[userKey] ?? "", /Life insurance packet/);
  });

  it("does not overwrite an existing signed-in vault", () => {
    const userKey = vaultStorageKey("alice");
    const storage = memoryStorage({
      [LOCAL_VAULT_STORAGE_KEY]: JSON.stringify({ state: { ownerName: "Guest" } }),
      [userKey]: JSON.stringify({ state: { ownerName: "Alice" } }),
    });
    assert.equal(claimLocalVaultForUser(storage, userKey), false);
    assert.match(storage.dump()[userKey] ?? "", /Alice/);
    assert.doesNotMatch(storage.dump()[userKey] ?? "", /Guest/);
    assert.equal(hasStoredVault(storage, LOCAL_VAULT_STORAGE_KEY), true);
  });

  it("does nothing while still signed out", () => {
    const storage = memoryStorage({
      [LOCAL_VAULT_STORAGE_KEY]: JSON.stringify({ state: { ownerName: "Guest" } }),
    });
    assert.equal(claimLocalVaultForUser(storage, LOCAL_VAULT_STORAGE_KEY), false);
    assert.equal(hasStoredVault(storage, LOCAL_VAULT_STORAGE_KEY), true);
  });
});

describe("cross-account isolation", () => {
  it("keeps Alice's vault out of Bob's key after a session switch", () => {
    const aliceKey = vaultStorageKey("alice");
    const bobKey = vaultStorageKey("bob");
    const storage = memoryStorage({
      [aliceKey]: JSON.stringify({
        state: { ownerName: "Alice", items: [{ title: "Alice checking ****4821" }] },
      }),
    });

    assert.equal(hasStoredVault(storage, bobKey), false);
    assert.match(storage.dump()[aliceKey] ?? "", /Alice checking/);
  });
});
