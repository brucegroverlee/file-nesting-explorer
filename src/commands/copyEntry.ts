import * as vscode from "vscode";
import { basename, dirname, join } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../FileNestingTreeViewExplorer";
import { config } from "../config";

export const copyEntry =
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

    /* console.log("fileNestingExplorer.copy", { entry, paths }); */

    context.globalState.update("cutEntryPaths", null);
    context.globalState.update("copiedEntryPaths", paths);

    vscode.env.clipboard.writeText(paths.join(" "));

    fileNestingDataProvider.refresh();
  };
