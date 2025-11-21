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

export const newFile = async (entry: Entry) => {
  const selectedEntries = fileNestingTreeViewExplorer.getSelection();

  /* console.log("fileNestingExplorer.newFile", { entry, selectedEntries }); */

  const fileName = await vscode.window.showInputBox({
    placeHolder: "Enter file name",
  });

  if (!fileName) {
    return;
  }

  const targetEntry = selectedEntries.length === 0 ? null : entry;

  const basepath = getBasepath(targetEntry);

  const path = `${basepath}/${fileName}`;

  const fileExists = await validateExist(path);

  if (fileExists) {
    vscode.window.showErrorMessage("File already exists!");
    return;
  }

  await vscode.workspace.fs.writeFile(vscode.Uri.file(path), new Uint8Array(0));

  // fileNestingDataProvider.refresh();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  vscode.commands.executeCommand("fileNestingExplorer.openEditor", {
    type: "file",
    path,
    name: fileName,
  });
};
