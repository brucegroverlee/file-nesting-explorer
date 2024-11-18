import * as vscode from "vscode";

import { newFile } from "./commands/newFile";
import { newFolder } from "./commands/newFolder";
import { refreshView } from "./commands/refreshView";
import { newNestedFile } from "./commands/newNestedFile";
import { newNestedFolder } from "./commands/newNestedFolder";
import { copyEntry } from "./commands/copyEntry";
import { cutEntry } from "./commands/cutEntry";
import { pasteEntry } from "./commands/pasteEntry";
import { copyEntryPath } from "./commands/copyEntryPath";
import { copyEntryRelativePath } from "./commands/copyEntryRelativePath";
import { renameEntry } from "./commands/renameEntry";
import { deleteEntry } from "./commands/deleteEntry";
import { openEditor } from "./commands/openEditor";

export function createFileNestingCommands(context: vscode.ExtensionContext) {
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
    vscode.commands.registerCommand(
      "fileNestingExplorer.newNestedFile",
      newNestedFile
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.newNestedFolder",
      newNestedFolder
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.cut",
      cutEntry(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.copy",
      copyEntry(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.paste",
      pasteEntry(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.copyPath",
      copyEntryPath(context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.copyRelativePath",
      copyEntryRelativePath(context)
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
