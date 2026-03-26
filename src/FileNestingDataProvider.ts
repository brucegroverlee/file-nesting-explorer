import * as vscode from "vscode";

import { config } from "./config";
import { Entry } from "./Entry";
import { fileNestingSystem } from "./FileNestingSystem";
import { getIcon } from "./Icon";

export class FileNestingDataProvider implements vscode.TreeDataProvider<Entry> {
  private _onDidChangeTreeData: vscode.EventEmitter<Entry | undefined | void> =
    new vscode.EventEmitter<Entry | undefined | void>();

  readonly onDidChangeTreeData: vscode.Event<Entry | undefined | void> =
    this._onDidChangeTreeData.event;

  private context: vscode.ExtensionContext | null = null;
  private fileSystemWatcher: vscode.FileSystemWatcher | null = null;

  public setContext(context: vscode.ExtensionContext) {
    this.context = context;
    this.setupFileSystemWatcher(context);
  }

  private setupFileSystemWatcher(context: vscode.ExtensionContext) {
    // Create a file system watcher for all files and directories in the workspace
    this.fileSystemWatcher = vscode.workspace.createFileSystemWatcher(
      "**/*",
      false, // Don't ignore create events
      false, // Don't ignore change events
      false, // Don't ignore delete events
    );

    // Listen for file/folder creation
    this.fileSystemWatcher.onDidCreate((uri) => {
      /* console.log("FileNestingProvider: File created", uri.fsPath); */
      this.refresh();
    });

    // Listen for file/folder deletion
    this.fileSystemWatcher.onDidDelete((uri) => {
      /* console.log("FileNestingProvider: File deleted", uri.fsPath); */
      this.refresh();
    });

    // Listen for file/folder changes (like renames)
    this.fileSystemWatcher.onDidChange((uri) => {
      /* console.log("FileNestingProvider: File changed", uri.fsPath); */
      // Only refresh on directory changes to avoid excessive refreshes on file content changes
      vscode.workspace.fs.stat(uri).then(
        (stat) => {
          if (stat.type === vscode.FileType.Directory) {
            this.refresh();
          }
        },
        () => {
          // File might have been deleted, refresh anyway
          this.refresh();
        },
      );
    });

    // Dispose the watcher when the extension is deactivated
    context.subscriptions.push(this.fileSystemWatcher);
  }

  /* public refresh(): void {
    try {
      this._onDidChangeTreeData.fire();
    } catch (error) {
      vscode.window.showErrorMessage("Error refreshing file nesting explorer");
      console.error("[FileNestingDataProvider:refresh] Error:", error);
    }
  } */

  public async refresh(wait: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      try {
        if (wait) {
          setTimeout(() => {
            this._onDidChangeTreeData.fire();
            resolve();
          }, 500);
        } else {
          this._onDidChangeTreeData.fire();
          resolve();
        }
      } catch (error) {
        console.error("[FileNestingDataProvider:refresh] Error:", error);
        resolve();
      }
    });
  }

  getChildren(element?: Entry): vscode.ProviderResult<Entry[]> {
    try {
      /* console.log("FileNestingProvider:getChildren", element); */

      if (!element) {
        return fileNestingSystem.roots;
      }

      if (element.type === "file" && element.isNesting) {
        const children = fileNestingSystem.getChildrenFromNestingFile(element);
        /* console.log(
        "FileNestingProvider:getChildren children from nesting file",
        children
      ); */
        return children;
      }

      const children = fileNestingSystem.getChildrenFromFolder(element.path);
      /* console.log(
      "FileNestingProvider:getChildren children from folder",
      children
    ); */
      return children;
    } catch (error) {
      vscode.window.showErrorMessage(
        "Error getting children from folder " + element?.path,
      );
      console.error("[FileNestingDataProvider:getChildren] Error:", error);
      return [];
    }
  }

  getTreeItem(entry: Entry): vscode.TreeItem {
    try {
      /* console.log("FileNestingProvider:getTreeItem entry", entry); */

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
        if (entry.isNesting) {
          treeItem.contextValue = "nesting_file";
        } else {
          treeItem.contextValue = "file_with_nesting_extension";
        }
      }

      if (entry.type === "file" && entry.isNesting) {
        treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        treeItem.iconPath = getIcon(entry.extension);
      }

      /* console.log("FileNestingProvider:getTreeItem TreeItem", treeItem); */
      return treeItem;
    } catch (error) {
      vscode.window.showErrorMessage(
        "Error getting tree item for " + entry.name,
      );
      console.error("[FileNestingDataProvider:getTreeItem] Error:", error);
      return new vscode.TreeItem(entry.name);
    }
  }

  public async getParent(entry: Entry): Promise<Entry | null> {
    try {
      /* console.log("FileNestingProvider:getParent entry", entry); */

      return fileNestingSystem.getParent(entry);
    } catch (error) {
      vscode.window.showErrorMessage("Error getting parent for " + entry.name);
      console.error("[FileNestingDataProvider:getParent] Error:", error);
      return null;
    }
  }
}

export const fileNestingDataProvider = new FileNestingDataProvider();
