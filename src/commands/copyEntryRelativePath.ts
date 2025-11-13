import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";

export const copyEntryRelativePath =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();
    const paths = selectedEntries.map((entry) =>
      vscode.workspace.asRelativePath(entry.path, false)
    );

    /* console.log("fileNestingExplorer.copyEntryRelativePath", { entry, paths }); */

    context.globalState.update("cutEntryPaths", null);
    context.globalState.update("copiedEntryPaths", null);

    vscode.env.clipboard.writeText(paths.join(" "));

    fileNestingDataProvider.refresh();
  };
