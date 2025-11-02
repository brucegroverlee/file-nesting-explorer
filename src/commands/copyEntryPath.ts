import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";
import { fileNestingExplorer } from "../FileNestingExplorer";

export const copyEntryPath =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingExplorer.getSelection();
    const paths = selectedEntries.map((entry) => entry.path);

    /* console.log("fileNestingExplorer.copyEntryPath", { entry, paths }); */

    context.globalState.update("cutEntryPaths", null);
    context.globalState.update("copiedEntryPaths", null);

    vscode.env.clipboard.writeText(paths.join(" "));

    fileNestingProvider.refresh();
  };
