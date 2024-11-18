import * as vscode from "vscode";
import { dirname, parse, join } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const newNestedFolder = async (entry: Entry) => {
  console.log("fileNestingExplorer.newNestedFolder", entry);

  const folderName = await vscode.window.showInputBox({
    placeHolder: "Enter folder name",
  });

  if (!folderName) {
    return;
  }

  const basepath = join(dirname(entry.path), `@${parse(entry.name).name}`);

  const containerExists = await vscode.workspace.fs
    .stat(vscode.Uri.file(basepath))
    .then(
      () => true,
      () => false
    );

  if (!containerExists) {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(basepath));
  }

  const newPath = join(basepath, folderName);

  const folderExists = await vscode.workspace.fs
    .stat(vscode.Uri.file(newPath))
    .then(
      () => true,
      () => false
    );

  if (folderExists) {
    vscode.window.showErrorMessage("Folder already exists!");
    return;
  }

  entry.isNesting = true;

  await vscode.workspace.fs.createDirectory(vscode.Uri.file(newPath));

  fileNestingProvider.refresh();
};
