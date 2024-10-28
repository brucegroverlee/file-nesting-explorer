import * as vscode from "vscode";

import { Entry } from "./Entry";
import { fileNestingSystem } from "./FileNestingSystem";
import { getIcon } from "./Icon";

export class FileNestingProvider
  implements
    vscode.TreeDataProvider<Entry>,
    vscode.TreeDragAndDropController<Entry>
{
  dropMimeTypes = ["application/vnd.code.tree.fileNestingExplorer"];
  dragMimeTypes = ["text/uri-list"];

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
    console.log("FileNestingProvider:getTreeItem entry", element);

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

  public async getParent(entry: Entry): Promise<Entry | null> {
    console.log("FileNestingProvider:getParent entry", entry);

    return fileNestingSystem.getParent(entry);
  }

  public async handleDrag(
    source: Entry[],
    treeDataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    treeDataTransfer.set(
      "application/vnd.code.tree.testViewDragAndDrop",
      new vscode.DataTransferItem(source)
    );
  }

  public async handleDrop(
    target: Entry | undefined,
    sources: vscode.DataTransfer,
    token: vscode.CancellationToken
  ): Promise<void> {
    const transferItem = sources.get(
      "application/vnd.code.tree.testViewDragAndDrop"
    );

    if (!transferItem) {
      return;
    }

    const treeItems: Entry[] = transferItem.value;

    // TODO
  }
}

export const fileNestingProvider = new FileNestingProvider();
