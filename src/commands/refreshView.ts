import * as vscode from "vscode";

import { fileNestingDataProvider } from "../FileNestingDataProvider";

export const refreshView = (context: vscode.ExtensionContext) => async () => {
  await context.globalState.update("cutEntryPaths", null);
  await context.globalState.update("copiedEntryPaths", null);

  fileNestingDataProvider.refresh();
};
