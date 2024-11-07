import * as vscode from "vscode";
import { dirname } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

// TODO make this a utility function
const getBasepath = (entry?: Entry) => {
  if (entry) {
    return entry.type === "folder" ? entry.path : dirname(entry.path);
  } else if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    return vscode.workspace.workspaceFolders[0].uri.fsPath;
  }

  throw new Error("No workspace folder found");
};

export const newFolder = async (entry: Entry) => {
  console.log("fileNestingExplorer.newFolder", entry);

  const folderName = await vscode.window.showInputBox({
    placeHolder: "Enter folder name",
  });

  if (!folderName) {
    return;
  }

  const basepath = getBasepath(entry);

  const path = `${basepath}/${folderName}`;

  const folderExists = await vscode.workspace.fs
    .stat(vscode.Uri.file(path))
    .then(
      () => true,
      () => false
    );

  if (folderExists) {
    vscode.window.showErrorMessage("Folder already exists!");
    return;
  }

  await vscode.workspace.fs.createDirectory(vscode.Uri.file(path));

  fileNestingProvider.refresh();
};
