import * as vscode from "vscode";
import { dirname, parse, join } from "path";

import { config } from "../config";
import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";
import { validateExist } from "../FileSystem";

export const deleteFileNestingContainer = async (entry: Entry) => {
  console.log("fileNestingExplorer.deleteFileNestingContainer", entry);

  const containerPath = join(
    dirname(entry.path),
    `${config.fileNestingPrefix}${parse(entry.name).name}`
  );

  const containerExists = await validateExist(containerPath);

  if (!containerExists) {
    return;
  }

  const result = await vscode.window.showInformationMessage(
    `Are you sure you want to delete the ${entry.name}'s file container?`,
    { modal: true },
    "Yes"
  );

  if (result !== "Yes") {
    return;
  }

  await vscode.workspace.fs.delete(vscode.Uri.file(containerPath), {
    recursive: true,
    useTrash: true,
  });

  fileNestingProvider.refresh();
};
