import * as assert from "assert";
import * as path from "path";

import * as vscode from "vscode";

import { Entry } from "../../Entry";

suite("fileNestingExplorer.newFolder command", () => {
  let workspaceRoot: string;
  let originalShowInputBox: typeof vscode.window.showInputBox;
  let targetUri: vscode.Uri | undefined;

  suiteSetup(async () => {
    const folders = vscode.workspace.workspaceFolders;

    assert.ok(folders && folders[0], "Workspace failed to load for tests");

    workspaceRoot = folders[0].uri.fsPath;

    const extension = vscode.extensions.getExtension(
      "GroverLee.file-nesting-explorer"
    );

    await extension?.activate();
  });

  setup(() => {
    originalShowInputBox = vscode.window.showInputBox;
  });

  teardown(async () => {
    (vscode.window as any).showInputBox = originalShowInputBox;

    if (targetUri) {
      try {
        await vscode.workspace.fs.delete(targetUri, {
          recursive: true,
          useTrash: false,
        });
      } catch {
        // Ignore cleanup errors for now; the workspace is isolated to tests
      }
    }
  });

  test("creates a folder in the workspace when the user provides a name", async () => {
    const folderName = "NewFolderFromTests";
    targetUri = vscode.Uri.file(path.join(workspaceRoot, folderName));

    // Ensure a clean slate
    try {
      await vscode.workspace.fs.delete(targetUri, {
        recursive: true,
        useTrash: false,
      });
    } catch {
      // It's fine if the folder does not exist yet
    }

    (vscode.window as any).showInputBox = async () => folderName;

    const entry: Entry = {
      type: "folder",
      path: workspaceRoot,
      name: path.basename(workspaceRoot),
    };

    await vscode.commands.executeCommand(
      "fileNestingExplorer.newFolder",
      entry
    );

    const stat = await vscode.workspace.fs.stat(targetUri);

    assert.strictEqual(
      stat.type,
      vscode.FileType.Directory,
      "The command should create a directory for the provided name"
    );
  });
});
