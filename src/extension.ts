import * as vscode from "vscode";

import { fileNestingDataProvider } from "./FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "./FileNestingTreeViewExplorer";
import { fileNestingSystem } from "./FileNestingSystem";
// import { fileNestingDecoratorProvider } from "./FileNestingDecoratorProvider";
import { createFileNestingCommands } from "./FileNestingCommands";
import { setNewFileOutputChannel } from "./commands/newFile";
import { setNewNestedFileOutputChannel } from "./commands/newNestedFile";
import { setOpenEditorOutputChannel } from "./commands/openEditor";
import { initMixpanel, track } from "./commands/analytics";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "file-nesting-explorer" is now active!',
  );

  const outputChannel =
    context.extensionMode === vscode.ExtensionMode.Development
      ? vscode.window.createOutputChannel("File Nesting Explorer")
      : undefined;

  if (outputChannel) {
    context.subscriptions.push(outputChannel);
  }

  fileNestingSystem.setOutputChannel(outputChannel);
  fileNestingDataProvider.setOutputChannel(outputChannel);
  fileNestingTreeViewExplorer.setOutputChannel(outputChannel);
  setNewFileOutputChannel(outputChannel);
  setNewNestedFileOutputChannel(outputChannel);
  setOpenEditorOutputChannel(outputChannel);

  initMixpanel(context);
  fileNestingDataProvider.setContext(context);
  fileNestingTreeViewExplorer.setContext(context);

  // TODO update the text color when cut an entry
  // fileNestingDecoratorProvider.setContext(context);

  createFileNestingCommands(context);

  showWelcomeHint(context);
}

async function showWelcomeHint(context: vscode.ExtensionContext) {
  const welcomeHintShown = context.globalState.get<boolean>("welcomeHintShown");

  if (welcomeHintShown) {
    return;
  }

  track("Welcome Hint Shown");

  const openPanel = await vscode.window.showInformationMessage(
    'Welcome to File Nesting Explorer! To create nested files and folders, use the "File Nesting Explorer" panel at the bottom of the Explorer sidebar, not the default File Explorer.',
    { modal: true },
    "Show File Nesting Explorer",
  );

  if (openPanel === "Show File Nesting Explorer") {
    await vscode.commands.executeCommand("fileNestingExplorer.focus");

    await context.globalState.update("welcomeHintShown", true);

    track("Open File Nesting Explorer from Welcome Hint");
  }
}

// This method is called when your extension is deactivated
export function deactivate() {
  // The file system watcher will be automatically disposed through the context subscriptions
}
