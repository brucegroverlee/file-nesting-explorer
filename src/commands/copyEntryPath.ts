import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { getTargetEntries } from "./common/getTargetEntries";

export const copyEntryPath =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();
    const targetEntries = getTargetEntries(entry, selectedEntries);

    const paths = targetEntries.map((entry) => entry.path);

    /* console.log("fileNestingExplorer.copyEntryPath", { entry, paths }); */

    context.globalState.update("cutEntryPaths", null);
    context.globalState.update("copiedEntryPaths", null);

    vscode.env.clipboard.writeText(paths.join(" "));

    fileNestingDataProvider.refresh();
  };
