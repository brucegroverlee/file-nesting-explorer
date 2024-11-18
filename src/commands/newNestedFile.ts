import * as vscode from "vscode";
import { dirname, parse, join } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const newNestedFile = async (entry: Entry) => {
  console.log("fileNestingExplorer.newNestedFile", entry);

  const fileName = await vscode.window.showInputBox({
    placeHolder: "Enter file name",
  });

  if (!fileName) {
    return;
  }

  const basepath = join(dirname(entry.path), `@${parse(entry.name).name}`);

  const folderExists = await vscode.workspace.fs
    .stat(vscode.Uri.file(basepath))
    .then(
      () => true,
      () => false
    );

  if (!folderExists) {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(basepath));
  }

  const newPath = join(basepath, fileName);

  const fileExists = await vscode.workspace.fs
    .stat(vscode.Uri.file(newPath))
    .then(
      () => true,
      () => false
    );

  if (fileExists) {
    vscode.window.showErrorMessage("File already exists!");
    return;
  }

  entry.isNesting = true;

  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(newPath),
    new Uint8Array(0)
  );

  fileNestingProvider.refresh();

  vscode.commands.executeCommand("fileNestingExplorer.openEditor", {
    type: "file",
    path: newPath,
    name: fileName,
  });
};
