import * as vscode from "vscode";
import { basename } from "path";

import { config } from "../config";
import { Entry, getExtension } from "../Entry";
import { createNestedFile } from "./newNestedFile";
import { track } from "./analytics";

export const newNestedFileFromSelection = async () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const selection = editor.selection;

  if (selection.isEmpty) {
    return;
  }

  const selectedText = editor.document.getText(selection).trim();

  if (!selectedText) {
    return;
  }

  const document = editor.document;
  const filePath = document.uri.fsPath;
  const fileName = basename(filePath);
  const extension = getExtension(fileName);

  if (!config.fileNestingExtensions.includes(extension)) {
    vscode.window.showErrorMessage(
      `".${extension}" files are not configured for nesting. Allowed extensions: ${config.fileNestingExtensions.join(
        ", "
      )}`
    );
    return;
  }

  const nestedFileName = `${selectedText}.${extension}`;

  track("Create Nested File From Selection");

  const entry: Entry = {
    type: "file",
    path: filePath,
    name: fileName,
    extension,
  };

  await createNestedFile(entry, nestedFileName);
};
