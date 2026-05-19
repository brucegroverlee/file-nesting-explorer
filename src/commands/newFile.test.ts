import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { newFile } from "./newFile";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
} from "../test/helpers/tempWorkspace";
import { folderEntry } from "../test/helpers/fixtures";
import {
  stubErrorMessage,
  stubExecuteCommand,
  stubInputBox,
  stubTreeSelection,
} from "../test/helpers/stubs";

suite("newFile", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({ folders: ["sub"] });
    stubTreeSelection([folderEntry(path.join(root, "sub"))]);
    stubExecuteCommand();
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("creates a file under the target folder", async () => {
    stubInputBox("Component.tsx");

    await newFile(folderEntry(path.join(root, "sub")));

    assert.ok(exists(path.join(root, "sub", "Component.tsx")));
  });

  test("does nothing when the user cancels the input", async () => {
    stubInputBox(undefined);

    await newFile(folderEntry(path.join(root, "sub")));

    assert.strictEqual(exists(path.join(root, "sub", "Component.tsx")), false);
  });

  test("shows an error and does not overwrite when the file already exists", async () => {
    stubInputBox("Component.tsx");
    const errorStub = stubErrorMessage();
    const filePath = path.join(root, "sub", "Component.tsx");
    require("fs").writeFileSync(filePath, "existing");

    await newFile(folderEntry(path.join(root, "sub")));

    assert.ok(errorStub.calledOnce);
    assert.strictEqual(
      require("fs").readFileSync(filePath, "utf8"),
      "existing",
    );
  });
});
