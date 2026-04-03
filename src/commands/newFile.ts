import * as vscode from "vscode";
import { dirname } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { validateExist } from "../FileSystem";

let outputChannel: vscode.OutputChannel | undefined;

export const setNewFileOutputChannel = (
  newOutputChannel: vscode.OutputChannel | undefined,
): void => {
  outputChannel = newOutputChannel;
  outputChannel?.appendLine("newFile:setOutputChannel");
};

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
  try {
    outputChannel?.appendLine(
      `newFile entry ${entry?.path ?? "undefined"} type ${entry?.type ?? "undefined"}`,
    );

    const selectedEntries = fileNestingTreeViewExplorer.getSelection();

    outputChannel?.appendLine(
      `newFile selectedEntries ${selectedEntries.length}`,
    );

    /* console.log("fileNestingExplorer.newFile", { entry, selectedEntries }); */

    const fileName = await vscode.window.showInputBox({
      placeHolder: "Enter file name",
    });

    if (!fileName) {
      outputChannel?.appendLine("newFile canceled by user");
      return;
    }

    const targetEntry = selectedEntries.length === 0 ? null : entry;

    const basepath = getBasepath(targetEntry);

    const path = `${basepath}/${fileName}`;

    const fileExists = await validateExist(path);

    if (fileExists) {
      outputChannel?.appendLine(`newFile already exists ${path}`);
      vscode.window.showErrorMessage("File already exists!");
      return;
    }

    await vscode.workspace.fs.writeFile(
      vscode.Uri.file(path),
      new Uint8Array(0),
    );

    outputChannel?.appendLine(`newFile created ${path}`);

    // fileNestingDataProvider.refresh();

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    await vscode.commands.executeCommand("fileNestingExplorer.openEditor", {
      type: "file",
      path,
      name: fileName,
    });

    outputChannel?.appendLine(`newFile opened ${path}`);
  } catch (error) {
    outputChannel?.appendLine("newFile error");
    console.error("[newFile] Error:", error);
  }
};
