import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { pasteEntry } from "./pasteEntry";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
} from "../test/helpers/tempWorkspace";
import { fileEntry, folderEntry } from "../test/helpers/fixtures";
import { stubClipboard, stubTreeSelection } from "../test/helpers/stubs";

suite("pasteEntry", () => {
  let root: string;
  let context: ReturnType<typeof createFakeExtensionContext>;

  setup(() => {
    root = createTempWorkspace({
      files: { "A.tsx": "source" },
      folders: ["dest"],
    });
    context = createFakeExtensionContext();
    stubTreeSelection([]);
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("copy + paste duplicates the file into the target folder", async () => {
    stubClipboard(path.join(root, "A.tsx"));

    await pasteEntry(context)(folderEntry(path.join(root, "dest")));

    assert.ok(exists(path.join(root, "dest", "A.tsx")));
    assert.ok(exists(path.join(root, "A.tsx")));
  });

  test("cut + paste moves the file (source removed, dest exists)", async () => {
    stubClipboard("");
    await context.globalState.update("cutEntryPaths", [
      path.join(root, "A.tsx"),
    ]);

    await pasteEntry(context)(folderEntry(path.join(root, "dest")));

    assert.ok(exists(path.join(root, "dest", "A.tsx")));
    assert.strictEqual(exists(path.join(root, "A.tsx")), false);
    assert.strictEqual(context.globalState.get("cutEntryPaths"), undefined);
  });

  test("pastes from the system clipboard when no cut/copy state exists", async () => {
    stubClipboard(path.join(root, "A.tsx"));

    await pasteEntry(context)(folderEntry(path.join(root, "dest")));

    assert.ok(exists(path.join(root, "dest", "A.tsx")));
  });

  test("appends (copy) to the filename when the destination already exists", async () => {
    require("fs").writeFileSync(
      path.join(root, "dest", "A.tsx"),
      "existing",
    );
    stubClipboard(path.join(root, "A.tsx"));

    await pasteEntry(context)(folderEntry(path.join(root, "dest")));

    assert.ok(exists(path.join(root, "dest", "A(copy).tsx")));
  });

  test("paste over the same file creates a ' copy' duplicate", async () => {
    stubClipboard(path.join(root, "A.tsx"));

    await pasteEntry(context)(fileEntry(path.join(root, "A.tsx")));

    assert.ok(exists(path.join(root, "A copy.tsx")));
  });
});
