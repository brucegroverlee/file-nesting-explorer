import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { cutEntry } from "./cutEntry";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry, nestingFileEntry } from "../test/helpers/fixtures";
import { stubClipboard, stubTreeSelection } from "../test/helpers/stubs";

suite("cutEntry", () => {
  let root: string;
  let context: ReturnType<typeof createFakeExtensionContext>;
  let clipboard: ReturnType<typeof stubClipboard>;

  setup(() => {
    root = createTempWorkspace({ files: { "A.tsx": "" } });
    context = createFakeExtensionContext();
    clipboard = stubClipboard();
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("stores the path in globalState.cutEntryPaths", async () => {
    stubTreeSelection([]);
    const entry = fileEntry(path.join(root, "A.tsx"));

    await cutEntry(context)(entry);

    assert.deepStrictEqual(context.globalState.get("cutEntryPaths"), [
      entry.path,
    ]);
  });

  test("clears copiedEntryPaths", async () => {
    stubTreeSelection([]);
    await context.globalState.update("copiedEntryPaths", ["/x"]);

    await cutEntry(context)(fileEntry(path.join(root, "A.tsx")));

    assert.strictEqual(context.globalState.get("copiedEntryPaths"), undefined);
  });

  test("writes the path(s) to the clipboard", async () => {
    stubTreeSelection([]);
    const entry = fileEntry(path.join(root, "A.tsx"));

    await cutEntry(context)(entry);

    assert.ok(clipboard.write.calledOnceWith(entry.path));
  });

  test("includes the container folder when cutting a nesting file", async () => {
    stubTreeSelection([]);
    const entry = nestingFileEntry(path.join(root, "App.tsx"));

    await cutEntry(context)(entry);

    assert.deepStrictEqual(context.globalState.get("cutEntryPaths"), [
      entry.path,
      path.join(root, "@App"),
    ]);
  });
});
