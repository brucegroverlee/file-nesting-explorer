import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";
import { fileNestingExplorer } from "../FileNestingExplorer";

export const copyEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingExplorer.getSelection();
    const paths = selectedEntries.map((entry) => entry.path);

    console.log("fileNestingExplorer.copy", { entry, paths });

    context.globalState.update("cutEntryPaths", null);
    context.globalState.update("copiedEntryPaths", paths);

    vscode.env.clipboard.writeText(paths.join(" "));

    fileNestingProvider.refresh();
  };
