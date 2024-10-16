import * as vscode from "vscode";

import { Entry, File, FNSEntry } from "./Entry";
import { fileNestingSystem } from "./FileNestingSystem";
import { getIcon } from "./Icon";

export class FileNestingProvider implements vscode.TreeDataProvider<FNSEntry> {
  getChildren(element?: FNSEntry): Thenable<FNSEntry[]> {
    console.log("FileNestingProvider:getChildren", element);

    if (!element) {
      return Promise.resolve(fileNestingSystem.roots);
    }

    return Promise.resolve(fileNestingSystem.getChildren(element.path));
  }

  getTreeItem(element: FNSEntry): vscode.TreeItem {
    console.log("FileNestingProvider:getTreeItem FNSEntry", element);

    const treeItem = new vscode.TreeItem(element.name);
    treeItem.contextValue = element.type === "folder" ? "folder" : "file";
    treeItem.resourceUri = vscode.Uri.file(element.path);

    if (element.type === "folder") {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }

    if (element.type === "file" && (element as File).isNesting) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

      treeItem.iconPath = getIcon((element as File).extension);

      treeItem.command = {
        command: "fileNestingExplorer.openEditor",
        title: "Open Editor",
        arguments: [element],
      };
    }

    console.log("FileNestingProvider:getTreeItem TreeItem", treeItem);
    return treeItem;
  }
}

export const fileNestingProvider = new FileNestingProvider();
