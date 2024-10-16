import * as vscode from "vscode";

import { Entry, File } from "./Entry";
import { RootFolder } from "./VirtualFileSystem";
import { getIcon } from "./Icon";

export class FileNestingProvider implements vscode.TreeDataProvider<Entry> {
  getChildren(element?: Entry): Thenable<Entry[]> {
    console.log("FileNestingProvider:getChildren", element);

    if (!element) {
      return Promise.resolve([...RootFolder.entries.values()]);
    }

    return Promise.resolve(
      element.entries ? [...element.entries.values()] : []
    );
  }

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
