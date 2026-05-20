import * as assert from "assert";

import { initMixpanel, track } from "./analytics";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";

suite("analytics", () => {
  test("track() before init does not throw", () => {
    assert.doesNotThrow(() => track("Some Event"));
  });

  test("track() with properties does not throw", () => {
    assert.doesNotThrow(() => track("Some Event", { foo: "bar" }));
  });

  test("initMixpanel() in non-production mode is a no-op (no throw)", () => {
    const context = createFakeExtensionContext();
    assert.doesNotThrow(() => initMixpanel(context));
  });

  test("initMixpanel() is idempotent (subsequent calls do not throw)", () => {
    const context = createFakeExtensionContext();
    initMixpanel(context);
    assert.doesNotThrow(() => initMixpanel(context));
  });
});
