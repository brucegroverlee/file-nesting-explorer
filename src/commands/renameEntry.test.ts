import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { renameEntry } from "./renameEntry";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
  readFile,
} from "../test/helpers/tempWorkspace";
import {
  fileEntry,
  folderEntry,
  nestingFileEntry,
} from "../test/helpers/fixtures";
import { stubInputBox } from "../test/helpers/stubs";

suite("renameEntry", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({
      files: {
        "App.tsx": "",
        "@App/Inner.tsx": "",
        "old-folder/.gitkeep": "",
      },
    });
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("renames a file", async () => {
    stubInputBox("Renamed.tsx");

    await renameEntry(fileEntry(path.join(root, "App.tsx")));

    assert.strictEqual(exists(path.join(root, "App.tsx")), false);
    assert.ok(exists(path.join(root, "Renamed.tsx")));
  });

  test("renames a folder", async () => {
    stubInputBox("new-folder");

    await renameEntry(folderEntry(path.join(root, "old-folder")));

    assert.strictEqual(exists(path.join(root, "old-folder")), false);
    assert.ok(exists(path.join(root, "new-folder")));
  });

  test("renames the @<name> container when renaming a nesting file", async () => {
    stubInputBox("Renamed.tsx");

    await renameEntry(nestingFileEntry(path.join(root, "App.tsx")));

    assert.ok(exists(path.join(root, "Renamed.tsx")));
    assert.ok(exists(path.join(root, "@Renamed")));
    assert.ok(exists(path.join(root, "@Renamed", "Inner.tsx")));
    assert.strictEqual(exists(path.join(root, "@App")), false);
  });

  test("does nothing when the user cancels", async () => {
    stubInputBox(undefined);

    await renameEntry(fileEntry(path.join(root, "App.tsx")));

    assert.ok(exists(path.join(root, "App.tsx")));
  });

  test("updates the .sorting file when present", async () => {
    cleanupTempWorkspace(root);
    root = createTempWorkspace({
      files: {
        "A.tsx": "",
        "B.tsx": "",
        ".sorting": JSON.stringify(["A.tsx", "B.tsx"]),
      },
    });
    stubInputBox("Renamed.tsx");

    await renameEntry(fileEntry(path.join(root, "A.tsx")));

    const order = JSON.parse(readFile(path.join(root, ".sorting")));
    assert.deepStrictEqual(order, ["Renamed.tsx", "B.tsx"]);
  });
});
