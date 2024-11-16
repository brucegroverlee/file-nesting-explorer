import * as vscode from "vscode";

import { Entry } from "../Entry";

export const copyEntry = async (entry: Entry) => {
  console.log("fileNestingExplorer.copy", entry);

  vscode.env.clipboard.writeText(entry.path);
};
