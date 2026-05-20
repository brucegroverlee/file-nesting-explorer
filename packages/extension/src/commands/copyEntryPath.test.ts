import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { copyEntryPath } from "./copyEntryPath";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry } from "../test/helpers/fixtures";
import {
  stubClipboard,
  stubRefresh,
  stubTreeSelection,
} from "../test/helpers/stubs";

suite("copyEntryPath", () => {
  let root: string;
  let context: ReturnType<typeof createFakeExtensionContext>;
  let clipboard: ReturnType<typeof stubClipboard>;

  setup(() => {
    root = createTempWorkspace({ files: { "A.tsx": "" } });
    context = createFakeExtensionContext();
    clipboard = stubClipboard();
    stubRefresh();
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("writes the absolute path to the clipboard", async () => {
    stubTreeSelection([]);
    const entry = fileEntry(path.join(root, "A.tsx"));

    await copyEntryPath(context)(entry);

    assert.ok(clipboard.write.calledOnceWith(entry.path));
  });

  test("clears cutEntryPaths and copiedEntryPaths", async () => {
    stubTreeSelection([]);
    await context.globalState.update("cutEntryPaths", ["/x"]);
    await context.globalState.update("copiedEntryPaths", ["/y"]);

    await copyEntryPath(context)(fileEntry(path.join(root, "A.tsx")));

    assert.strictEqual(context.globalState.get("cutEntryPaths"), undefined);
    assert.strictEqual(context.globalState.get("copiedEntryPaths"), undefined);
  });

  test("joins multiple selected paths with a space", async () => {
    const a = fileEntry(path.join(root, "A.tsx"));
    const b = fileEntry(path.join(root, "B.tsx"));
    stubTreeSelection([a, b]);

    await copyEntryPath(context)(a);

    assert.ok(clipboard.write.calledOnceWith(`${a.path} ${b.path}`));
  });
});
