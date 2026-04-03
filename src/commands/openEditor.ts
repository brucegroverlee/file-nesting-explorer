import * as vscode from "vscode";

import { Entry } from "../Entry";

let lastClickTime = 0;
let lastClickedPath: string | undefined;
let outputChannel: vscode.OutputChannel | undefined;

export const setOpenEditorOutputChannel = (
  newOutputChannel: vscode.OutputChannel | undefined,
): void => {
  outputChannel = newOutputChannel;
  outputChannel?.appendLine("openEditor:setOutputChannel");
};

function isDoubleClick(element: Entry) {
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastClickTime;

  let isDoubleClick = false;

  if (lastClickedPath && lastClickedPath === element.path && timeDiff < 1000) {
    isDoubleClick = true;
  }

  lastClickTime = currentTime;
  lastClickedPath = element.path;

  return isDoubleClick;
}

export const openEditor = async (element: Entry) => {
  const uri = vscode.Uri.file(element.path);

  outputChannel?.appendLine(
    `openEditor file ${element.path} uri ${uri.fsPath}`,
  );

  const maxFileSizeInBytes = 5 * 1024 * 1024; // 5 MB

  try {
    const stat = await vscode.workspace.fs.stat(uri);

    if (stat.size > maxFileSizeInBytes) {
      const openAnyway = await vscode.window.showWarningMessage(
        "This file is large and may be slow to open. Do you want to open it anyway?",
        { modal: true },
        "Open Anyway",
      );

      if (openAnyway !== "Open Anyway") {
        return;
      }
    }
  } catch (error) {
    // If we cannot stat the file for some reason, fall back to normal behavior.
    outputChannel?.appendLine(
      `openEditor error checking file size for ${element.path}`,
    );
    console.error("[openEditor] Error checking file size:", error);
  }

  try {
    await vscode.window.showTextDocument(uri, {
      preserveFocus: true,
      preview: !isDoubleClick(element),
    });
  } catch (error) {
    // If the file cannot be opened as a text document (e.g. binary files like .ico),
    // fall back to VS Code's default file opener.
    outputChannel?.appendLine(
      `openEditor fallback vscode.open for ${element.path}`,
    );
    await vscode.commands.executeCommand("vscode.open", uri);
  }
};
