import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { newFolder } from "./newFolder";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
  mkdir,
} from "../test/helpers/tempWorkspace";
import { folderEntry } from "../test/helpers/fixtures";
import {
  stubErrorMessage,
  stubInputBox,
  stubTreeSelection,
} from "../test/helpers/stubs";

suite("newFolder", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({ folders: ["sub"] });
    stubTreeSelection([folderEntry(path.join(root, "sub"))]);
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("creates a folder under the target folder", async () => {
    stubInputBox("new-folder");

    await newFolder(folderEntry(path.join(root, "sub")));

    assert.ok(exists(path.join(root, "sub", "new-folder")));
  });

  test("does nothing when the user cancels the input", async () => {
    stubInputBox(undefined);

    await newFolder(folderEntry(path.join(root, "sub")));

    assert.strictEqual(exists(path.join(root, "sub", "new-folder")), false);
  });

  test("shows an error when the folder already exists", async () => {
    stubInputBox("existing");
    mkdir(root, path.join("sub", "existing"));
    const errorStub = stubErrorMessage();

    await newFolder(folderEntry(path.join(root, "sub")));

    assert.ok(errorStub.calledOnce);
  });
});
