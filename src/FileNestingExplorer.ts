import * as vscode from "vscode";

import { RootFolder } from "./VirtualFileSystem";
import { getIcon } from "./Icon";

export interface File {
  type: "file" | "folder";
  path: string;

  name: string;
  extension: string;
  data?: Uint8Array;
  isNesting?: boolean;
  entries?: Map<string, File | Folder>;
}

export interface Folder {
  type: "file" | "folder";
  path: string;

  name: string;
  entries: Map<string, File | Folder>;
}

export type Entry = File | Folder;

export class FileNestingProvider implements vscode.TreeDataProvider<Entry> {
  getTreeItem(element: Entry): vscode.TreeItem {
    console.log("FileNestingProvider:getTreeItem Entry", element);

    const treeItem = new vscode.TreeItem(element.name);
    treeItem.contextValue = element.type === "folder" ? "folder" : "file";
    treeItem.resourceUri = vscode.Uri.file(element.path);

    if (element.type === "folder") {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }

    if (element.type === "file" && (element as File).isNesting) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

      treeItem.iconPath = getIcon((element as File).extension);
    }

    console.log("FileNestingProvider:getTreeItem TreeItem", treeItem);
    return treeItem;
  }

  getChildren(element?: Entry): Thenable<Entry[]> {
    console.log("FileNestingProvider:getChildren", element);

    if (!element) {
      return Promise.resolve([...RootFolder.entries.values()]);
    }

    return Promise.resolve(
      element.entries ? [...element.entries.values()] : []
    );
  }
}

export class FileNestingExplorer {}
