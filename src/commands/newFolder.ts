import * as vscode from "vscode";
import { dirname } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { validateExist } from "../FileSystem";

// TODO make this a utility function
const getBasepath = (entry?: Entry | null) => {
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
  const selectedEntries = fileNestingTreeViewExplorer.getSelection();

  /* console.log("fileNestingExplorer.newFolder", { entry, selectedEntries }); */

  const folderName = await vscode.window.showInputBox({
    placeHolder: "Enter folder name",
  });

  if (!folderName) {
    return;
  }

  const targetEntry = selectedEntries.length === 0 ? null : entry;

  const basepath = getBasepath(targetEntry);

  const path = `${basepath}/${folderName}`;

  const folderExists = await validateExist(path);

  if (folderExists) {
    vscode.window.showErrorMessage("Folder already exists!");
    return;
  }

  await vscode.workspace.fs.createDirectory(vscode.Uri.file(path));

  fileNestingDataProvider.refresh();
};
