import * as vscode from "vscode";
import { basename } from "path";

import { Entry } from "./Entry";
import { fileNestingDataProvider } from "./FileNestingDataProvider";
import { dragAndDropController } from "./DragAndDropController";

export class FileNestingTreeViewExplorer {
  private viewExplorer: vscode.TreeView<Entry>;

  constructor() {
    this.viewExplorer = vscode.window.createTreeView("fileNestingExplorer", {
      treeDataProvider: fileNestingDataProvider,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: dragAndDropController,
    });

    vscode.window.onDidChangeActiveTextEditor(() =>
      this.onActiveEditorChanged()
    );
  }

  public setContext(context: vscode.ExtensionContext) {
    context.subscriptions.push(this.viewExplorer);
  }

  public getSelection(): readonly Entry[] {
    return this.viewExplorer.selection;
  }

  private async onActiveEditorChanged(): Promise<void> {
    if (!this.viewExplorer.visible) {
      return;
    }

    const { activeTextEditor } = vscode.window;

    if (!activeTextEditor || activeTextEditor.document.uri.scheme !== "file") {
      return;
    }

    const selection = this.viewExplorer.selection;

    const focus =
      selection.length > 0 &&
      selection[0].path === activeTextEditor.document.fileName;

    /* console.log("FileNestingExplorer:onActiveEditorChanged", {
      activeTextEditor,
      selection,
      focus,
    }); */

    await this.viewExplorer.reveal(
      {
        type: "file",
        path: activeTextEditor.document.fileName,
        name: basename(activeTextEditor.document.fileName),
      },
      {
        select: true,
        expand: false,
      }
    );
  }
}

export const fileNestingTreeViewExplorer = new FileNestingTreeViewExplorer();
