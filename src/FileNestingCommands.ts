import * as vscode from "vscode";

import { newFile } from "./commands/newFile";
import { newFolder } from "./commands/newFolder";
import { refreshView } from "./commands/refreshView";
import { copyEntry } from "./commands/copyEntry";
import { pasteEntry } from "./commands/pasteEntry";
import { renameEntry } from "./commands/renameEntry";
import { deleteEntry } from "./commands/deleteEntry";
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
    vscode.commands.registerCommand("fileNestingExplorer.newFolder", newFolder)
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
    vscode.commands.registerCommand("fileNestingExplorer.copy", copyEntry)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.paste", pasteEntry)
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
    vscode.commands.registerCommand("fileNestingExplorer.delete", deleteEntry)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.openEditor",
      openEditor
    )
  );
}
