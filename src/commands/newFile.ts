import * as vscode from "vscode";
import { dirname } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";
import { validateExist } from "../FileSystem";

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

export const newFile = async (entry: Entry) => {
  console.log("fileNestingExplorer.newFile", entry);

  const fileName = await vscode.window.showInputBox({
    placeHolder: "Enter file name",
  });

  if (!fileName) {
    return;
  }

  const basepath = getBasepath(entry);

  const path = `${basepath}/${fileName}`;

  const fileExists = await validateExist(path);

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
