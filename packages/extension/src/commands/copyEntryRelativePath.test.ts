import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { copyEntryRelativePath } from "./copyEntryRelativePath";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry } from "../test/helpers/fixtures";
import {
  stubAsRelativePath,
  stubClipboard,
  stubRefresh,
  stubTreeSelection,
} from "../test/helpers/stubs";

suite("copyEntryRelativePath", () => {
  let root: string;
  let context: ReturnType<typeof createFakeExtensionContext>;
  let clipboard: ReturnType<typeof stubClipboard>;

  setup(() => {
    root = createTempWorkspace({ files: { "A.tsx": "" } });
    context = createFakeExtensionContext();
    clipboard = stubClipboard();
    stubAsRelativePath(root);
    stubRefresh();
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("writes the relative path to the clipboard", async () => {
    stubTreeSelection([]);
    const entry = fileEntry(path.join(root, "A.tsx"));

    await copyEntryRelativePath(context)(entry);

    assert.ok(clipboard.write.calledOnceWith("A.tsx"));
  });

  test("joins multiple relative paths with a space", async () => {
    const a = fileEntry(path.join(root, "A.tsx"));
    const b = fileEntry(path.join(root, "sub", "B.tsx"));
    stubTreeSelection([a, b]);

    await copyEntryRelativePath(context)(a);

    assert.ok(clipboard.write.calledOnceWith(`A.tsx ${path.join("sub", "B.tsx")}`));
  });
});
