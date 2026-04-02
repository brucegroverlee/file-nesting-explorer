import * as vscode from "vscode";

import { track } from "./analytics";

export const newNestedFileHint = async () => {
  track("New Nested File from Wrong Panel");

  const openPanel = await vscode.window.showInformationMessage(
    'This command works in the "File Nesting Explorer" panel, not the default File Explorer. Look for the "File Nesting Explorer" section at the bottom of the Explorer sidebar.',
    { modal: true },
    "Show File Nesting Explorer",
  );

  if (openPanel === "Show File Nesting Explorer") {
    await vscode.commands.executeCommand("fileNestingExplorer.focus");

    track("Open File Nesting Explorer from Hint");
  }
};
