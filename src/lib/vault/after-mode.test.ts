import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planAfterModeOpen } from "./after-mode.ts";

describe("planAfterModeOpen", () => {
  it("never hydrates the sample vault, even when the live vault has no items", () => {
    const plan = planAfterModeOpen();
    assert.equal(plan.hydrateSampleVault, false);
    assert.equal(plan.activateRelease, true);
  });
});
