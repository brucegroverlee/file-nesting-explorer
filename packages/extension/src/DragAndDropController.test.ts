import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { DragAndDropController } from "./DragAndDropController";
import { Entry } from "@file-nesting/shared";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
} from "./test/helpers/tempWorkspace";
import {
  fileEntry,
  folderEntry,
  nestingFileEntry,
} from "./test/helpers/fixtures";
import { stubWorkspaceFolders } from "./test/helpers/stubs";

const transferOf = (sources: Entry[]): vscode.DataTransfer =>
  ({
    get: (mime: string) =>
      mime === "application/vnd.code.tree.fileNestingExplorer"
        ? { value: sources }
        : undefined,
  } as unknown as vscode.DataTransfer);

const cancel = { isCancellationRequested: false } as vscode.CancellationToken;

suite("DragAndDropController", () => {
  let root: string;
  let controller: DragAndDropController;

  setup(() => {
    controller = new DragAndDropController();
    root = createTempWorkspace({
      files: {
        "A.tsx": "",
        "App.tsx": "",
        "@App/Inner.tsx": "",
      },
      folders: ["dest"],
    });
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("moves a file into a target folder", async () => {
    const source = fileEntry(path.join(root, "A.tsx"));

    await controller.handleDrop(
      folderEntry(path.join(root, "dest")),
      transferOf([source]),
      cancel,
    );

    assert.strictEqual(exists(source.path), false);
    assert.ok(exists(path.join(root, "dest", "A.tsx")));
  });

  test("drops onto a regular file → moves to that file's parent folder", async () => {
    const source = fileEntry(path.join(root, "A.tsx"));
    require("fs").writeFileSync(path.join(root, "dest", "Other.tsx"), "");

    await controller.handleDrop(
      fileEntry(path.join(root, "dest", "Other.tsx")),
      transferOf([source]),
      cancel,
    );

    assert.ok(exists(path.join(root, "dest", "A.tsx")));
  });

  test("drops onto a nesting file → moves into the @<name> container", async () => {
    const source = fileEntry(path.join(root, "A.tsx"));

    await controller.handleDrop(
      nestingFileEntry(path.join(root, "App.tsx")),
      transferOf([source]),
      cancel,
    );

    assert.ok(exists(path.join(root, "@App", "A.tsx")));
  });

  test("dragging a nesting file moves both the file and its container", async () => {
    const sourceApp = nestingFileEntry(path.join(root, "App.tsx"));

    await controller.handleDrop(
      folderEntry(path.join(root, "dest")),
      transferOf([sourceApp]),
      cancel,
    );

    assert.ok(exists(path.join(root, "dest", "App.tsx")));
    assert.ok(exists(path.join(root, "dest", "@App", "Inner.tsx")));
    assert.strictEqual(exists(path.join(root, "App.tsx")), false);
    assert.strictEqual(exists(path.join(root, "@App")), false);
  });

  test("does not allow moving a folder into itself or a descendant", async () => {
    const fs = require("fs");
    fs.mkdirSync(path.join(root, "outer"));
    fs.mkdirSync(path.join(root, "outer", "inner"));
    const source = folderEntry(path.join(root, "outer"));

    await controller.handleDrop(
      folderEntry(path.join(root, "outer", "inner")),
      transferOf([source]),
      cancel,
    );

    assert.ok(exists(path.join(root, "outer")));
  });

  test("does not overwrite when the destination already exists", async () => {
    require("fs").writeFileSync(path.join(root, "dest", "A.tsx"), "existing");
    const source = fileEntry(path.join(root, "A.tsx"));

    await controller.handleDrop(
      folderEntry(path.join(root, "dest")),
      transferOf([source]),
      cancel,
    );

    // Source is preserved, destination unchanged
    assert.ok(exists(source.path));
    assert.strictEqual(
      require("fs").readFileSync(path.join(root, "dest", "A.tsx"), "utf8"),
      "existing",
    );
  });

  test("dropping at root level uses the workspace folder", async () => {
    stubWorkspaceFolders(root);
    const source = fileEntry(path.join(root, "dest", "moved.tsx"));
    require("fs").writeFileSync(source.path, "");

    await controller.handleDrop(undefined, transferOf([source]), cancel);

    assert.ok(exists(path.join(root, "moved.tsx")));
  });

  test("handleDrag stores the source entries in the data transfer", async () => {
    const transfer = new vscode.DataTransfer();
    const sources = [fileEntry(path.join(root, "A.tsx"))];

    await controller.handleDrag(sources, transfer, cancel);

    const item = transfer.get("application/vnd.code.tree.fileNestingExplorer");
    assert.deepStrictEqual(item?.value, sources);
  });
});
