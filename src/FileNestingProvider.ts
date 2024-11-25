import * as vscode from "vscode";

import { config } from "./config";
import { Entry } from "./Entry";
import { fileNestingSystem } from "./FileNestingSystem";
import { getIcon } from "./Icon";

export class FileNestingProvider
  implements
    vscode.TreeDataProvider<Entry>,
    vscode.TreeDragAndDropController<Entry>
{
  private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined | void> =
    new vscode.EventEmitter<Entry | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<Entry | undefined | void> =
    this._onDidChangeTreeData.event;

  dropMimeTypes = ["application/vnd.code.tree.fileNestingExplorer"];
  dragMimeTypes = ["text/uri-list"];

  private context: vscode.ExtensionContext | null = null;

  public setContext(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public refresh(): void {
    this._onDidChangeTreeData.fire();
  }

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

  getTreeItem(entry: Entry): vscode.TreeItem {
    console.log("FileNestingProvider:getTreeItem entry", entry);

    const cutEntryPaths =
      this.context?.globalState.get<string[]>("cutEntryPaths");

    const treeItem = new vscode.TreeItem(entry.name);
    treeItem.contextValue = entry.type === "folder" ? "folder" : "file";
    treeItem.resourceUri = vscode.Uri.file(entry.path);

    if (cutEntryPaths && cutEntryPaths.includes(entry.path)) {
      treeItem.description = "cut";
    }

    if (entry.type === "folder") {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }

    if (entry.type === "file") {
      treeItem.command = {
        command: "fileNestingExplorer.openEditor",
        title: "Open Editor",
        arguments: [entry],
      };
    }

    if (
      entry.type === "file" &&
      config.fileNestingExtensions.includes(entry.extension || "")
    ) {
      treeItem.contextValue = "file_with_nesting_extension";
    }

    if (entry.type === "file" && entry.isNesting) {
      treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
      treeItem.iconPath = getIcon(entry.extension);
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
