import * as vscode from "vscode";
import { dirname, parse, join } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const deleteFileNestingContainer = async (entry: Entry) => {
  console.log("fileNestingExplorer.deleteFileNestingContainer", entry);

  const containerPath = join(dirname(entry.path), `@${parse(entry.name).name}`);

  const containerExists = await vscode.workspace.fs
    .stat(vscode.Uri.file(containerPath))
    .then(
      () => true,
      () => false
    );

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
