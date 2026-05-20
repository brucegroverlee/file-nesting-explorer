import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { fileNestingDataProvider } from "./FileNestingDataProvider";
import { fileNestingSystem } from "./FileNestingSystem";
import { createFakeExtensionContext } from "./test/helpers/fakeContext";
import {
  fileEntry,
  folderEntry,
  nestingFileEntry,
} from "./test/helpers/fixtures";

suite("FileNestingDataProvider", () => {
  teardown(() => sinon.restore());

  suite("getTreeItem", () => {
    test("returns a TreeItem with contextValue 'folder' for folders", () => {
      const item = fileNestingDataProvider.getTreeItem(
        folderEntry("/tmp/sub"),
      ) as vscode.TreeItem;

      assert.strictEqual(item.contextValue, "folder");
      assert.strictEqual(
        item.collapsibleState,
        vscode.TreeItemCollapsibleState.Collapsed,
      );
    });

    test("returns 'file' contextValue for plain files with unsupported extensions", () => {
      const item = fileNestingDataProvider.getTreeItem(
        fileEntry("/tmp/A.md"),
      ) as vscode.TreeItem;

      assert.strictEqual(item.contextValue, "file");
    });

    test("returns 'file_with_nesting_extension' for tsx files that are not yet nesting", () => {
      const item = fileNestingDataProvider.getTreeItem(
        fileEntry("/tmp/A.tsx"),
      ) as vscode.TreeItem;

      assert.strictEqual(item.contextValue, "file_with_nesting_extension");
    });

    test("returns 'nesting_file' contextValue for nesting files", () => {
      const item = fileNestingDataProvider.getTreeItem(
        nestingFileEntry("/tmp/App.tsx"),
      ) as vscode.TreeItem;

      assert.strictEqual(item.contextValue, "nesting_file");
      assert.strictEqual(
        item.collapsibleState,
        vscode.TreeItemCollapsibleState.Collapsed,
      );
    });

    test("attaches a 'cut' description when the path is in cutEntryPaths", () => {
      const context = createFakeExtensionContext();
      context.globalState.update("cutEntryPaths", ["/tmp/A.tsx"]);
      fileNestingDataProvider.setContext(context);

      const item = fileNestingDataProvider.getTreeItem(
        fileEntry("/tmp/A.tsx"),
      ) as vscode.TreeItem;

      assert.strictEqual(item.description, "cut");
    });

    test("attaches the openEditor command to file items", () => {
      const item = fileNestingDataProvider.getTreeItem(
        fileEntry("/tmp/A.tsx"),
      ) as vscode.TreeItem;

      assert.strictEqual(item.command?.command, "fileNestingExplorer.openEditor");
    });
  });

  suite("getChildren", () => {
    test("returns roots when no element is given", async () => {
      const roots = [folderEntry("/tmp/sub")];
      sinon.stub(fileNestingSystem, "roots").get(() => Promise.resolve(roots));

      const children = await fileNestingDataProvider.getChildren();

      assert.deepStrictEqual(children, roots);
    });

    test("delegates to getChildrenFromFolder for folder elements", async () => {
      const stub = sinon
        .stub(fileNestingSystem, "getChildrenFromFolder")
        .resolves([]);

      await fileNestingDataProvider.getChildren(folderEntry("/tmp/sub"));

      assert.ok(stub.calledOnceWith("/tmp/sub"));
    });

    test("delegates to getChildrenFromNestingFile for nesting file elements", async () => {
      const stub = sinon
        .stub(fileNestingSystem, "getChildrenFromNestingFile")
        .resolves([]);

      const entry = nestingFileEntry("/tmp/App.tsx");
      await fileNestingDataProvider.getChildren(entry);

      assert.ok(stub.calledOnceWith(entry));
    });
  });

  suite("refresh", () => {
    test("resolves immediately when wait is false", async () => {
      const start = Date.now();
      await fileNestingDataProvider.refresh(false);
      assert.ok(Date.now() - start < 200);
    });

    test("waits ~500ms when wait is true", async () => {
      const start = Date.now();
      await fileNestingDataProvider.refresh(true);
      assert.ok(Date.now() - start >= 400);
    });
  });

  // Quiet TS about unused import in the suite.
  void path;
});
