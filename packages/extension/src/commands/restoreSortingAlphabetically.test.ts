import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { restoreSortingAlphabetically } from "./restoreSortingAlphabetically";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
} from "../test/helpers/tempWorkspace";
import {
  fileEntry,
  folderEntry,
  nestingFileEntry,
} from "../test/helpers/fixtures";
import { stubInformationMessage } from "../test/helpers/stubs";

suite("restoreSortingAlphabetically", () => {
  let root: string;
  let info: ReturnType<typeof stubInformationMessage>;

  setup(() => {
    root = createTempWorkspace({
      folders: ["folder"],
      files: {
        "folder/.sorting": "[]",
        "App.tsx": "",
        "@App/.sorting": "[]",
      },
    });
    info = stubInformationMessage(undefined);
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("deletes the .sorting file inside a folder", async () => {
    await restoreSortingAlphabetically(folderEntry(path.join(root, "folder")));

    assert.strictEqual(exists(path.join(root, "folder", ".sorting")), false);
  });

  test("deletes the .sorting file inside a nesting file's container", async () => {
    await restoreSortingAlphabetically(
      nestingFileEntry(path.join(root, "App.tsx")),
    );

    assert.strictEqual(exists(path.join(root, "@App", ".sorting")), false);
  });

  test("ignores plain files", async () => {
    await restoreSortingAlphabetically(fileEntry(path.join(root, "App.tsx")));

    assert.ok(exists(path.join(root, "folder", ".sorting")));
  });

  test("shows an info message when no .sorting exists", async () => {
    cleanupTempWorkspace(root);
    root = createTempWorkspace({ folders: ["empty"] });
    info.resetHistory();

    await restoreSortingAlphabetically(folderEntry(path.join(root, "empty")));

    assert.ok(info.calledOnce);
  });
});
