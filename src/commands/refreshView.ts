import * as vscode from "vscode";

import { fileNestingProvider } from "../FileNestingProvider";

export const refreshView = (context: vscode.ExtensionContext) => async () => {
  await context.globalState.update("cutEntryPaths", null);
  await context.globalState.update("copiedEntryPaths", null);

  fileNestingProvider.refresh();
};
