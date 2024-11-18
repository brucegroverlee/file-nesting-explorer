import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const copyEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    console.log("fileNestingExplorer.copy", entry);

    context.globalState.update("cutEntryPath", null);

    vscode.env.clipboard.writeText(entry.path);

    fileNestingProvider.refresh();
  };
