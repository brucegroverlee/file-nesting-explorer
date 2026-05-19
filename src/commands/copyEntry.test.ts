import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { copyEntry } from "./copyEntry";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry, nestingFileEntry } from "../test/helpers/fixtures";
import {
  stubClipboard,
  stubRefresh,
  stubTreeSelection,
} from "../test/helpers/stubs";

suite("copyEntry", () => {
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

  test("stores the path in globalState.copiedEntryPaths", async () => {
    stubTreeSelection([]);
    const entry = fileEntry(path.join(root, "A.tsx"));

    await copyEntry(context)(entry);

    assert.deepStrictEqual(context.globalState.get("copiedEntryPaths"), [
      entry.path,
    ]);
  });

  test("writes the path to the clipboard", async () => {
    stubTreeSelection([]);
    const entry = fileEntry(path.join(root, "A.tsx"));

    await copyEntry(context)(entry);

    assert.ok(clipboard.write.calledOnceWith(entry.path));
  });

  test("clears cutEntryPaths when copying", async () => {
    stubTreeSelection([]);
    await context.globalState.update("cutEntryPaths", ["/some/path"]);

    await copyEntry(context)(fileEntry(path.join(root, "A.tsx")));

    assert.strictEqual(context.globalState.get("cutEntryPaths"), undefined);
  });

  test("includes the container folder when copying a nesting file", async () => {
    stubTreeSelection([]);
    const entry = nestingFileEntry(path.join(root, "App.tsx"));

    await copyEntry(context)(entry);

    const expected = [entry.path, path.join(root, "@App")];
    assert.deepStrictEqual(
      context.globalState.get("copiedEntryPaths"),
      expected,
    );
  });

  test("applies to the full selection when the clicked entry is in it", async () => {
    const a = fileEntry(path.join(root, "A.tsx"));
    const b = fileEntry(path.join(root, "B.tsx"));
    stubTreeSelection([a, b]);

    await copyEntry(context)(a);

    assert.deepStrictEqual(context.globalState.get("copiedEntryPaths"), [
      a.path,
      b.path,
    ]);
  });
});
