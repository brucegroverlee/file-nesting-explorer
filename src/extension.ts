import * as vscode from "vscode";

import { fileNestingProvider } from "./FileNestingProvider";
import { fileNestingExplorer } from "./FileNestingExplorer";
// import { fileNestingDecoratorProvider } from "./FileNestingDecoratorProvider";
import { createFileNestingCommands } from "./FileNestingCommands";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "file-nesting-explorer" is now active!'
  );

  fileNestingProvider.setContext(context);
  fileNestingExplorer.setContext(context);

  // TODO update the text color when cut an entry
  // fileNestingDecoratorProvider.setContext(context);

  createFileNestingCommands(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
