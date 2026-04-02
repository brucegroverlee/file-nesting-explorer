import * as vscode from "vscode";

import { newFile } from "./commands/newFile";
import { newFolder } from "./commands/newFolder";
import { refreshView } from "./commands/refreshView";
import { newNestedFile } from "./commands/newNestedFile";
import { newNestedFolder } from "./commands/newNestedFolder";
import { newNestedFileFromSelection } from "./commands/newNestedFileFromSelection";
import { copyEntry } from "./commands/copyEntry";
import { cutEntry } from "./commands/cutEntry";
import { pasteEntry } from "./commands/pasteEntry";
import { copyEntryPath } from "./commands/copyEntryPath";
import { copyEntryRelativePath } from "./commands/copyEntryRelativePath";
import { renameEntry } from "./commands/renameEntry";
import { deleteEntry } from "./commands/deleteEntry";
import { deleteFileNestingContainer } from "./commands/deleteFileNestingContainer";
import { openEditor } from "./commands/openEditor";
import { moveUp } from "./commands/moveUp";
import { moveDown } from "./commands/moveDown";
import { restoreSortingAlphabetically } from "./commands/restoreSortingAlphabetically";
import { editSortingFile } from "./commands/editSortingFile";
import { createFileNestingContainer } from "./commands/createFileNestingContainer";
import { newNestedFileHint } from "./commands/newNestedFileHint";
import { newNestedFolderHint } from "./commands/newNestedFolderHint";

export function createFileNestingCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.newFile", newFile),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.newFolder", newFolder),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.refresh",
      refreshView(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.newNestedFile",
      newNestedFile,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.newNestedFileFromSelection",
      newNestedFileFromSelection,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.newNestedFolder",
      newNestedFolder,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.createFileNestingContainer",
      createFileNestingContainer,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.deleteFileNestingContainer",
      deleteFileNestingContainer,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.cut",
      cutEntry(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.copy",
      copyEntry(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.paste",
      pasteEntry(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.copyPath",
      copyEntryPath(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.copyRelativePath",
      copyEntryRelativePath(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.rename", renameEntry),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.delete",
      deleteEntry(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.openEditor",
      openEditor,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.moveUp",
      moveUp(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.moveDown",
      moveDown(context),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.restoreSortingAlphabetically",
      restoreSortingAlphabetically,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.editSortingFile",
      editSortingFile,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.newNestedFileHint",
      newNestedFileHint,
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.newNestedFolderHint",
      newNestedFolderHint,
    ),
  );
}
