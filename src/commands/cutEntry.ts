import * as vscode from "vscode";
import { basename, dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { config } from "../config";
// import { fileNestingDecoratorProvider } from "../FileNestingDecoratorProvider";

export const cutEntry =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    const selectedEntries = fileNestingTreeViewExplorer.getSelection();
    const paths = selectedEntries.flatMap((selectedEntry) => {
      if (selectedEntry.type === "file" && selectedEntry.isNesting) {
        const fileNameWithoutExtension = basename(
          selectedEntry.path,
          selectedEntry.extension ? `.${selectedEntry.extension}` : ""
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

    fileNestingDataProvider.refresh();
  };
