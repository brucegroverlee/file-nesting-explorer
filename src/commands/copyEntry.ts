import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";

export const copyEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();
    const paths = selectedEntries.map((entry) => entry.path);

    /* console.log("fileNestingExplorer.copy", { entry, paths }); */

    context.globalState.update("cutEntryPaths", null);
    context.globalState.update("copiedEntryPaths", paths);

    vscode.env.clipboard.writeText(paths.join(" "));

    fileNestingDataProvider.refresh();
  };
