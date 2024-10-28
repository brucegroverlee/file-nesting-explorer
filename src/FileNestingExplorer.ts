import * as vscode from "vscode";
import { basename } from "path";

import { Entry } from "./Entry";
import { fileNestingProvider } from "./FileNestingProvider";

export class FileNestingExplorer {
  private viewExplorer: vscode.TreeView<Entry>;

  constructor(context: vscode.ExtensionContext) {
    this.viewExplorer = vscode.window.createTreeView("fileNestingExplorer", {
      treeDataProvider: fileNestingProvider,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: fileNestingProvider,
    });

    context.subscriptions.push(this.viewExplorer);

    vscode.window.onDidChangeActiveTextEditor(() =>
      this.onActiveEditorChanged()
    );
  }

  private async onActiveEditorChanged(): Promise<void> {
    const { activeTextEditor } = vscode.window;

    if (activeTextEditor) {
      if (activeTextEditor.document.uri.scheme === "file") {
        console.log("FileNestingExplorer:onActiveEditorChanged", {
          activeTextEditor,
        });

        await this.viewExplorer.reveal(
          {
            type: "file",
            path: activeTextEditor.document.fileName,
            name: basename(activeTextEditor.document.fileName),
          },
          { focus: false, select: true, expand: false }
        );
      }
    }
  }
}
