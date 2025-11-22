import * as vscode from "vscode";
import { dirname } from "path";

import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { SortingManager } from "../SortingManager";
import { fileNestingSystem } from "../FileNestingSystem";
import { track } from "./analytics";

export const moveDown =
  (context: vscode.ExtensionContext) => async (entry: Entry) => {
    try {
      // Get the parent directory path
      const parentPath = dirname(entry.path);

      // Get all siblings in the parent directory
      const siblings = await fileNestingSystem.getChildrenFromFolder(
        parentPath
      );
      const siblingNames = siblings.map((s) => s.name);

      // Move the entry down in the sorting order
      await SortingManager.moveDown(entry.path, parentPath, siblingNames);

      track("Move Down");

      // Refresh the view to show the new order
      // fileNestingDataProvider.refresh();

      vscode.window.showInformationMessage(`Moved "${entry.name}" down`);
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to move "${entry.name}" down: ${error}`
      );
    }
  };
