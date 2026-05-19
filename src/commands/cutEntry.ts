import * as vscode from "vscode";
import { basename, dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { config } from "../config";
import { getTargetEntries } from "./common/getTargetEntries";
// import { fileNestingDecoratorProvider } from "../FileNestingDecoratorProvider";

export const cutEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();
    // Fall back to the invoking entry when the native TreeView has no
    // selection (e.g. command dispatched from the React webview).
    const targetEntries = getTargetEntries(entry, selectedEntries);
    const paths = targetEntries.flatMap((selectedEntry) => {
      if (selectedEntry.type === "file" && selectedEntry.isNesting) {
        const fileNameWithoutExtension = basename(
          selectedEntry.path,
          selectedEntry.extension ? `.${selectedEntry.extension}` : "",
        );

        const containerFolderName = `${config.fileNestingPrefix}${fileNameWithoutExtension}`;
        const sourceDir = dirname(selectedEntry.path);
        const containerSourcePath = join(sourceDir, containerFolderName);

        return [selectedEntry.path, containerSourcePath];
      }

      return [selectedEntry.path];
    });

    /* console.log("fileNestingExplorer.cut", { entry, paths }); */

    context.globalState.update("cutEntryPaths", paths);
    context.globalState.update("copiedEntryPaths", null);

    vscode.env.clipboard.writeText(paths.join(" "));

    /* fileNestingDecoratorProvider.updateDecorations([
      vscode.Uri.file(entry.path),
    ]); */

    // fileNestingDataProvider.refresh();
  };
