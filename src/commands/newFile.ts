import * as vscode from "vscode";
import { dirname } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const newFile = async (entry: Entry) => {
  console.log("fileNestingExplorer.newFile", entry);

  const fileName = await vscode.window.showInputBox({
    placeHolder: "Enter file name",
  });

  if (!fileName) {
    return;
  }

  const basepath = entry.type === "folder" ? entry.path : dirname(entry.path);

  const path = `${basepath}/${fileName}`;

  const fileExists = await vscode.workspace.fs.stat(vscode.Uri.file(path)).then(
    () => true,
    () => false
  );

  if (fileExists) {
    vscode.window.showErrorMessage("File already exists!");
    return;
  }

  await vscode.workspace.fs.writeFile(vscode.Uri.file(path), new Uint8Array(0));

  fileNestingProvider.refresh();

  vscode.commands.executeCommand("fileNestingExplorer.openEditor", {
    type: "file",
    path,
    name: fileName,
  });
};
