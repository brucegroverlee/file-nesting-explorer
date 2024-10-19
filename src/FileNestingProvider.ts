import * as vscode from "vscode";

import { Entry } from "./Entry";
import { fileNestingSystem } from "./FileNestingSystem";
import { getIcon } from "./Icon";

export class FileNestingProvider implements vscode.TreeDataProvider<Entry> {
  getChildren(element?: Entry): Thenable<Entry[]> {
    console.log("FileNestingProvider:getChildren", element);

    if (!element) {
      return Promise.resolve(fileNestingSystem.roots);
    }

    if (element.type === "file" && element.isNesting) {
      return Promise.resolve(
        fileNestingSystem.getChildrenFromNestingFile(element)
      );
    }

    return Promise.resolve(
      fileNestingSystem.getChildrenFromFolder(element.path)
    );
  }

  getTreeItem(element: Entry): vscode.TreeItem {
    console.log("FileNestingProvider:getTreeItem FNSEntry", element);

    const treeItem = new vscode.TreeItem(element.name);
    treeItem.contextValue = element.type === "folder" ? "folder" : "file";
    treeItem.resourceUri = vscode.Uri.file(element.path);

    if (element.type === "folder") {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }

    if (element.type === "file") {
      treeItem.command = {
        command: "fileNestingExplorer.openEditor",
        title: "Open Editor",
        arguments: [element],
      };
    }

    if (element.type === "file" && element.isNesting) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

      treeItem.iconPath = getIcon(element.extension);
    }

    console.log("FileNestingProvider:getTreeItem TreeItem", treeItem);
    return treeItem;
  }
}

export const fileNestingProvider = new FileNestingProvider();
