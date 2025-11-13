import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
// import { fileNestingDecoratorProvider } from "../FileNestingDecoratorProvider";

export const cutEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();
    const paths = selectedEntries.map((entry) => entry.path);

    /* console.log("fileNestingExplorer.cut", { entry, paths }); */

    context.globalState.update("cutEntryPaths", paths);
    context.globalState.update("copiedEntryPaths", null);

    vscode.env.clipboard.writeText(paths.join(" "));

    /* fileNestingDecoratorProvider.updateDecorations([
      vscode.Uri.file(entry.path),
    ]); */

    fileNestingDataProvider.refresh();
  };
