import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { deleteEntry } from "./deleteEntry";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
} from "../test/helpers/tempWorkspace";
import { fileEntry, folderEntry } from "../test/helpers/fixtures";
import {
  stubErrorMessage,
  stubInformationMessage,
  stubTreeSelection,
} from "../test/helpers/stubs";

suite("deleteEntry", () => {
  let root: string;
  let context: ReturnType<typeof createFakeExtensionContext>;

  setup(() => {
    root = createTempWorkspace({
      files: { "A.tsx": "", "B.tsx": "" },
      folders: ["sub"],
    });
    context = createFakeExtensionContext();
    stubErrorMessage();
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("deletes the file after the user confirms", async () => {
    stubInformationMessage("Yes");
    stubTreeSelection([]);

    await deleteEntry(context)(fileEntry(path.join(root, "A.tsx")));

    assert.strictEqual(exists(path.join(root, "A.tsx")), false);
  });

  test("does not delete when the user cancels the confirmation", async () => {
    stubInformationMessage(undefined);
    stubTreeSelection([]);

    await deleteEntry(context)(fileEntry(path.join(root, "A.tsx")));

    assert.ok(exists(path.join(root, "A.tsx")));
  });

  test("deletes a folder recursively", async () => {
    stubInformationMessage("Yes");
    stubTreeSelection([]);

    await deleteEntry(context)(folderEntry(path.join(root, "sub")));

    assert.strictEqual(exists(path.join(root, "sub")), false);
  });

  test("deletes all selected entries on multi-selection", async () => {
    stubInformationMessage("Yes");
    const a = fileEntry(path.join(root, "A.tsx"));
    const b = fileEntry(path.join(root, "B.tsx"));
    stubTreeSelection([a, b]);

    await deleteEntry(context)(a);

    assert.strictEqual(exists(a.path), false);
    assert.strictEqual(exists(b.path), false);
  });

  test("uses a modal confirmation dialog", async () => {
    const info = stubInformationMessage("Yes");
    stubTreeSelection([]);

    await deleteEntry(context)(fileEntry(path.join(root, "A.tsx")));

    const args = info.firstCall.args;
    assert.deepStrictEqual((args[1] as vscode.MessageOptions).modal, true);
  });
});
