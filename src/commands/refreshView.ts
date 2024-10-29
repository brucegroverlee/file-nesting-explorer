import * as vscode from "vscode";

import { fileNestingProvider } from "../FileNestingProvider";

export const refreshView = () => {
  fileNestingProvider.refresh();
};
