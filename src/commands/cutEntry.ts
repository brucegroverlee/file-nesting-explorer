import * as vscode from "vscode";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";
// import { fileNestingDecoratorProvider } from "../FileNestingDecoratorProvider";

export const cutEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    console.log("fileNestingExplorer.cut", entry);

    context.globalState.update("cutEntryPath", entry.path);

    vscode.env.clipboard.writeText(entry.path);

    /* fileNestingDecoratorProvider.updateDecorations([
      vscode.Uri.file(entry.path),
    ]); */

    fileNestingProvider.refresh();
  };
