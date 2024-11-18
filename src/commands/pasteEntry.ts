import * as vscode from "vscode";
import { basename, dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingProvider } from "../FileNestingProvider";

export const pasteEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const cutEntryPath = context.globalState.get<string>("cutEntryPath");

    const copiedPath = await vscode.env.clipboard.readText();

    console.log("fileNestingExplorer.paste", {
      entry,
      cutEntryPath,
      copiedPath,
    });

    if (!copiedPath) {
      return;
    }

    if (cutEntryPath && cutEntryPath !== copiedPath) {
      return;
    }

    if (copiedPath === entry.path) {
      // paste into the same folder with  the suffix " - Copy"
      const newPath = `${entry.path}(copy)`;

      await vscode.workspace.fs.copy(
        vscode.Uri.file(copiedPath),
        vscode.Uri.file(newPath)
      );
    } else {
      const location =
        entry.type === "folder" ? entry.path : dirname(entry.path);
      const newName = basename(cutEntryPath || copiedPath);
      let newPath = join(location, newName);

      const fileExists = await vscode.workspace.fs
        .stat(vscode.Uri.file(newPath))
        .then(
          () => true,
          () => false
        );

      if (fileExists) {
        newPath = `${newPath}(copy)`;
      }

      await vscode.workspace.fs.copy(
        vscode.Uri.file(cutEntryPath || copiedPath),
        vscode.Uri.file(newPath)
      );
    }

    if (cutEntryPath) {
      context.globalState.update("cutEntryPath", null);

      await vscode.workspace.fs.delete(vscode.Uri.file(cutEntryPath));
    }

    fileNestingProvider.refresh();
  };
