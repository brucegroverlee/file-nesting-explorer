import * as vscode from "vscode";

import { fileNestingDataProvider } from "./FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "./FileNestingTreeViewExplorer";
// import { fileNestingDecoratorProvider } from "./FileNestingDecoratorProvider";
import { createFileNestingCommands } from "./FileNestingCommands";
import { initMixpanel } from "./commands/analytics";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "file-nesting-explorer" is now active!'
  );

  initMixpanel();
  fileNestingDataProvider.setContext(context);
  fileNestingTreeViewExplorer.setContext(context);

  // TODO update the text color when cut an entry
  // fileNestingDecoratorProvider.setContext(context);

  createFileNestingCommands(context);
}

// This method is called when your extension is deactivated
export function deactivate() {
  // The file system watcher will be automatically disposed through the context subscriptions
}
