import * as vscode from "vscode";

import { fileNestingProvider } from "./FileNestingProvider";
import { FileNestingExplorer } from "./FileNestingExplorer";
import { createFileNestingCommands } from "./FileNestingCommands";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "file-nesting-explorer" is now active!'
  );

  new FileNestingExplorer(context);

  createFileNestingCommands(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
