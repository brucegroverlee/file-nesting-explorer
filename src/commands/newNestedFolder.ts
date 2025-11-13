import * as vscode from "vscode";
import { dirname, parse, join } from "path";

import { config } from "../config";
import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { validateExist } from "../FileSystem";

export const newNestedFolder = async (entry: Entry) => {
  /* console.log("fileNestingExplorer.newNestedFolder", entry); */

  const folderName = await vscode.window.showInputBox({
    placeHolder: "Enter folder name",
  });

  if (!folderName) {
    return;
  }

  const basepath = join(
    dirname(entry.path),
    `${config.fileNestingPrefix}${parse(entry.name).name}`
  );

  const containerExists = await validateExist(basepath);

  if (!containerExists) {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(basepath));
  }

  const newPath = join(basepath, folderName);

  const folderExists = await validateExist(newPath);

  if (folderExists) {
    vscode.window.showErrorMessage("Folder already exists!");
    return;
  }

  entry.isNesting = true;

  await vscode.workspace.fs.createDirectory(vscode.Uri.file(newPath));

  fileNestingDataProvider.refresh();
};
