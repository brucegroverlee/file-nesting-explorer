import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { findInFolder } from "./findInFolder";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry, folderEntry } from "../test/helpers/fixtures";
import {
  stubAsRelativePath,
  stubExecuteCommand,
  stubTreeSelection,
} from "../test/helpers/stubs";

suite("findInFolder", () => {
  let root: string;
  let executeCommand: sinon.SinonStub;

  setup(() => {
    root = createTempWorkspace({ folders: ["src"] });
    stubAsRelativePath(root);
    executeCommand = stubExecuteCommand();
    stubTreeSelection([]);
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("invokes workbench.action.findInFiles with the folder path", async () => {
    await findInFolder(folderEntry(path.join(root, "src")));

    assert.ok(
      executeCommand.calledOnceWith("workbench.action.findInFiles", {
        filesToInclude: "./src",
      }),
    );
  });

  test("uses the dirname when entry is a file", async () => {
    await findInFolder(fileEntry(path.join(root, "src", "App.tsx")));

    assert.ok(
      executeCommand.calledOnceWith("workbench.action.findInFiles", {
        filesToInclude: "./src",
      }),
    );
  });

  test("falls back to selection when entry is undefined", async () => {
    sinon.restore();
    stubAsRelativePath(root);
    executeCommand = stubExecuteCommand();
    stubTreeSelection([folderEntry(path.join(root, "src"))]);

    await findInFolder(undefined as unknown as ReturnType<typeof folderEntry>);

    assert.ok(executeCommand.calledOnce);
  });

  test("does nothing when there is neither entry nor selection", async () => {
    await findInFolder(undefined as unknown as ReturnType<typeof folderEntry>);

    assert.strictEqual(executeCommand.called, false);
  });
});
