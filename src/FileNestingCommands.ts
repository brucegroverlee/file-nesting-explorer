import * as vscode from "vscode";

import { newFile } from "./commands/newFile";
import { refreshView } from "./commands/refreshView";
import { renameEntry } from "./commands/renameEntry";
import { openEditor } from "./commands/openEditor";

export function createFileNestingCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("file-nesting-explorer.helloWorld", () => {
      vscode.window.showInformationMessage("Hello World from File Nesting! V2");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.newFile", newFile)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.newFolder", () => {
      // TODO
      vscode.window.showInformationMessage("New folder!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.refresh", refreshView)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.cut", () => {
      // TODO
      vscode.window.showInformationMessage("Cut!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.copy", () => {
      // TODO
      vscode.window.showInformationMessage("Copy!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.copyPath", () => {
      // TODO
      vscode.window.showInformationMessage("Copy path!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.copyRelativePath",
      () => {
        // TODO
        vscode.window.showInformationMessage("Copy relative path!");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.rename", renameEntry)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.delete", () => {
      // TODO
      vscode.window.showInformationMessage("Delete!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.openEditor",
      openEditor
    )
  );
}
