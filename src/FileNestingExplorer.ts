import * as vscode from "vscode";
import { basename } from "path";

import { Entry } from "./Entry";
import { fileNestingProvider } from "./FileNestingProvider";

export class FileNestingExplorer {
  private viewExplorer: vscode.TreeView<Entry>;

  constructor() {
    this.viewExplorer = vscode.window.createTreeView("fileNestingExplorer", {
      treeDataProvider: fileNestingProvider,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: fileNestingProvider,
    });

    vscode.window.onDidChangeActiveTextEditor(() =>
      this.onActiveEditorChanged()
    );
  }

  public setContext(context: vscode.ExtensionContext) {
    context.subscriptions.push(this.viewExplorer);
  }

  private async onActiveEditorChanged(): Promise<void> {
    const { activeTextEditor } = vscode.window;

    if (activeTextEditor) {
      if (activeTextEditor.document.uri.scheme === "file") {
        console.log("FileNestingExplorer:onActiveEditorChanged", {
          activeTextEditor,
        });

        await this.revealFile(
          activeTextEditor.document.fileName,
          basename(activeTextEditor.document.fileName)
        );
      }
    }
  }

  // the idea of this method is to provide a way to reveal a file in the newFile command, but it's not being used
  public async revealFile(path: string, name: string) {
    await this.viewExplorer.reveal(
      {
        type: "file",
        path,
        name,
      },
      { focus: false, select: true, expand: false }
    );
  }
}

export const fileNestingExplorer = new FileNestingExplorer();
