import * as vscode from "vscode";
import { dirname, parse, join } from "path";

import { config } from "../config";
import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { validateExist } from "../FileSystem";

export const newNestedFile = async (entry: Entry) => {
  /* console.log("fileNestingExplorer.newNestedFile", entry); */

  const fileName = await vscode.window.showInputBox({
    placeHolder: "Enter file name",
  });

  if (!fileName) {
    return;
  }

  const basepath = join(
    dirname(entry.path),
    `${config.fileNestingPrefix}${parse(entry.name).name}`
  );

  const folderExists = await validateExist(basepath);

  if (!folderExists) {
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(basepath));
  }

  const newPath = join(basepath, fileName);

  const fileExists = await validateExist(newPath);

  if (fileExists) {
    vscode.window.showErrorMessage("File already exists!");
    return;
  }

  entry.isNesting = true;

  await vscode.workspace.fs.writeFile(
    vscode.Uri.file(newPath),
    new Uint8Array(0)
  );

  fileNestingDataProvider.refresh();

  await new Promise((resolve) => setTimeout(resolve, 100));

  vscode.commands.executeCommand("fileNestingExplorer.openEditor", {
    type: "file",
    path: newPath,
    name: fileName,
  });
};
