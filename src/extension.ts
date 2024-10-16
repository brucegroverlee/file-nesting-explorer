import * as vscode from "vscode";

import { FileNestingProvider } from "./FileNestingExplorer";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "file-nesting-explorer" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "file-nesting-explorer.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from File nesting explorer!"
      );
    }
  );
  context.subscriptions.push(disposable);

  const fileNestingProvider = new FileNestingProvider();
  vscode.window.registerTreeDataProvider(
    "fileNestingExplorer",
    fileNestingProvider
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
