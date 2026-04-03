import * as vscode from "vscode";
import { dirname, parse, join } from "path";

import { config } from "../config";
import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { validateExist } from "../FileSystem";
import { track } from "./analytics";

let outputChannel: vscode.OutputChannel | undefined;

export const setNewNestedFileOutputChannel = (
  newOutputChannel: vscode.OutputChannel | undefined,
): void => {
  outputChannel = newOutputChannel;
  outputChannel?.appendLine("newNestedFile:setOutputChannel");
};

export const createNestedFile = async (
  entry: Entry,
  fileName: string,
  content?: string,
) => {
  outputChannel?.appendLine(
    `createNestedFile parent ${entry.path} fileName ${fileName}`,
  );

  const basepath = join(
    dirname(entry.path),
    `${config.fileNestingPrefix}${parse(entry.name).name}`,
  );

  const folderExists = await validateExist(basepath);

  if (!folderExists) {
    outputChannel?.appendLine(`createNestedFile creating folder ${basepath}`);
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(basepath));
  }

  const newPath = join(basepath, fileName);

  const fileExists = await validateExist(newPath);

  if (fileExists) {
    outputChannel?.appendLine(`createNestedFile already exists ${newPath}`);
    vscode.window.showErrorMessage("File already exists!");
    return;
  }

  const fileContent = content
    ? new TextEncoder().encode(content)
    : new Uint8Array(0);

  await vscode.workspace.fs.writeFile(vscode.Uri.file(newPath), fileContent);

  outputChannel?.appendLine(`createNestedFile created ${newPath}`);

  // fileNestingDataProvider.refresh();

  // await new Promise((resolve) => setTimeout(resolve, 1000));

  await vscode.commands.executeCommand("fileNestingExplorer.openEditor", {
    type: "file",
    path: newPath,
    name: fileName,
  });

  outputChannel?.appendLine(`createNestedFile opened ${newPath}`);
};

export const newNestedFile = async (entry: Entry) => {
  outputChannel?.appendLine(
    `newNestedFile entry ${entry?.path ?? "undefined"} type ${entry?.type ?? "undefined"}`,
  );

  const fileName = await vscode.window.showInputBox({
    placeHolder: "Enter file name",
  });

  if (!fileName) {
    outputChannel?.appendLine("newNestedFile canceled by user");
    return;
  }

  track("New Nested File");

  await createNestedFile(entry, fileName);

  outputChannel?.appendLine(`newNestedFile done ${fileName}`);
};
