import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { createFileNestingContainer } from "./createFileNestingContainer";
import { fileEntry, folderEntry } from "../test/helpers/fixtures";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
  mkdir,
} from "../test/helpers/tempWorkspace";

suite("createFileNestingContainer", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({ files: { "App.tsx": "" } });
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("creates the @<name> container next to the file", async () => {
    const entry = fileEntry(path.join(root, "App.tsx"));

    await createFileNestingContainer(entry);

    assert.ok(exists(path.join(root, "@App")));
  });

  test("does nothing if the container already exists", async () => {
    mkdir(root, "@App");
    const entry = fileEntry(path.join(root, "App.tsx"));

    await createFileNestingContainer(entry);

    assert.ok(exists(path.join(root, "@App")));
  });

  test("does nothing for folders", async () => {
    const entry = folderEntry(path.join(root, "some-folder"));

    await createFileNestingContainer(entry);

    assert.strictEqual(exists(path.join(root, "@some-folder")), false);
  });

  test("does nothing for files with unsupported extensions", async () => {
    const entry = fileEntry(path.join(root, "App.md"));

    await createFileNestingContainer(entry);

    assert.strictEqual(exists(path.join(root, "@App")), false);
  });
});
