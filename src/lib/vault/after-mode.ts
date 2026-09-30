/**
 * After mode is a view of the live estate vault.
 *
 * Never call `hydrateDemo()` when opening After mode. That helper persist-replaces
 * the entire snapshot (owner name, designated contacts, and items) with the
 * sample Jordan Lee vault. A user who finished onboarding but has not added
 * items yet would lose their real contacts.
 */
export function planAfterModeOpen(): { hydrateSampleVault: false; activateRelease: true } {
  return { hydrateSampleVault: false, activateRelease: true };
}
