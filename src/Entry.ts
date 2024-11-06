import * as vscode from "vscode";

export interface Entry {
  type: "file" | "folder";
  path: string;
  name: string;
  extension?: string;
  isNesting?: boolean;
}

// TODO
// export function createEntry(uri: string): Entry {};

// TODO
// export function toTreeItem(entry: Entry): vscode.TreeItem {};

// TODO
// export function toEntry(treeItem: vscode.TreeItem): Entry {};
