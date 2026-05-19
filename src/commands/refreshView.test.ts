import * as assert from "assert";
import * as sinon from "sinon";

import { refreshView } from "./refreshView";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import { stubRefresh } from "../test/helpers/stubs";

suite("refreshView", () => {
  teardown(() => sinon.restore());

  test("clears cutEntryPaths and copiedEntryPaths and triggers a refresh", async () => {
    const context = createFakeExtensionContext();
    await context.globalState.update("cutEntryPaths", ["/x"]);
    await context.globalState.update("copiedEntryPaths", ["/y"]);
    const refresh = stubRefresh();

    await refreshView(context)();

    assert.strictEqual(context.globalState.get("cutEntryPaths"), undefined);
    assert.strictEqual(context.globalState.get("copiedEntryPaths"), undefined);
    assert.ok(refresh.calledOnce);
  });
});
