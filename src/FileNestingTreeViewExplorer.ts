import * as vscode from "vscode";
import { basename } from "path";

import { Entry } from "./Entry";
import { fileNestingDataProvider } from "./FileNestingDataProvider";
import { dragAndDropController } from "./DragAndDropController";
import { track } from "./commands/analytics";
import { validateExist } from "./FileSystem";

export class FileNestingTreeViewExplorer {
  private viewExplorer: vscode.TreeView<Entry>;
  private outputChannel: vscode.OutputChannel | undefined;

  constructor() {
    this.viewExplorer = vscode.window.createTreeView("fileNestingExplorer", {
      treeDataProvider: fileNestingDataProvider,
      showCollapseAll: true,
      canSelectMany: true,
      dragAndDropController: dragAndDropController,
    });

    vscode.window.onDidChangeActiveTextEditor((editor) => {
      this.outputChannel?.appendLine(
        `FileNestingTreeViewExplorer:onDidChangeActiveTextEditor editor ${JSON.stringify(editor)}`,
      );

      if (!editor) {
        return;
      }

      this.onActiveEditorChanged();
    });

    this.viewExplorer.onDidChangeVisibility((e) => {
      if (e.visible) {
        track("Open File Nesting Explorer");
      } else {
        track("Close File Nesting Explorer");
      }
    });

    // Disable this for now, it fixes the duplication of files in the explorer
    // But it brought back the issue when open a binary file doesn't select the file in the explorer
    /* vscode.window.tabGroups.onDidChangeTabs(() => {
      this.onActiveTabChanged();
    }); */
  }

  public setContext(context: vscode.ExtensionContext) {
    this.outputChannel?.appendLine("FileNestingTreeViewExplorer:setContext");
    context.subscriptions.push(this.viewExplorer);
  }

  public setOutputChannel(
    outputChannel: vscode.OutputChannel | undefined,
  ): void {
    this.outputChannel = outputChannel;
    this.outputChannel?.appendLine(
      "FileNestingTreeViewExplorer:setOutputChannel",
    );
  }

  public getSelection(): readonly Entry[] {
    const selection = this.viewExplorer.selection;
    this.outputChannel?.appendLine(
      `FileNestingTreeViewExplorer:getSelection ${JSON.stringify(selection)}`,
    );
    return selection;
  }

  private async onActiveEditorChanged(): Promise<void> {
    this.outputChannel?.appendLine(
      "FileNestingTreeViewExplorer:onActiveEditorChanged",
    );

    try {
      if (!this.viewExplorer.visible) {
        this.outputChannel?.appendLine(
          "FileNestingTreeViewExplorer:onActiveEditorChanged skip because explorer is not visible",
        );
        return;
      }

      const { activeTextEditor } = vscode.window;

      if (
        !activeTextEditor ||
        activeTextEditor.document.uri.scheme !== "file"
      ) {
        this.outputChannel?.appendLine(
          `FileNestingTreeViewExplorer:onActiveEditorChanged skip because active editor is ${JSON.stringify(activeTextEditor ?? {})}`,
        );
        return;
      }

      const selection = this.viewExplorer.selection;

      this.outputChannel?.appendLine(
        `FileNestingTreeViewExplorer:onActiveEditorChanged selection ${JSON.stringify(selection)}`,
      );

      // My code, my rules. I want to keep these lines
      /* const focus =
      selection.length > 0 &&
      selection[0].path === activeTextEditor.document.fileName; */

      /* console.log("FileNestingExplorer:onActiveEditorChanged", {
      activeTextEditor,
      selection,
      focus,
    }); */

      const fileName = basename(activeTextEditor.document.fileName);

      this.outputChannel?.appendLine(
        `FileNestingTreeViewExplorer:onActiveEditorChanged reveal target ${activeTextEditor.document.fileName}`,
      );

      const fileExists = await validateExist(
        activeTextEditor.document.fileName,
      );

      if (!fileExists) {
        this.outputChannel?.appendLine(
          `FileNestingTreeViewExplorer:onActiveEditorChanged skip because file does not exist ${activeTextEditor.document.fileName}`,
        );
        return;
      }

      try {
        await this.viewExplorer.reveal(
          {
            type: "file",
            path: activeTextEditor.document.fileName,
            name: fileName,
          },
          {
            select: true,
            expand: false,
          },
        );

        this.outputChannel?.appendLine(
          `FileNestingTreeViewExplorer:onActiveEditorChanged reveal success ${activeTextEditor.document.fileName}`,
        );
      } catch (error) {
        // Silently ignore errors when trying to reveal files that are filtered out
        this.outputChannel?.appendLine(
          `FileNestingTreeViewExplorer: Could not reveal file ${activeTextEditor.document.fileName}`,
        );
      }
    } catch (error) {
      vscode.window.showErrorMessage("Error revealing file in explorer");
      console.error(
        "[FileNestingTreeViewExplorer:onActiveEditorChanged] Error:",
        error,
      );
      this.outputChannel?.appendLine(
        `FileNestingTreeViewExplorer:onActiveEditorChanged error ${JSON.stringify(error)}`,
      );
    }
  }

  private async onActiveTabChanged(): Promise<void> {
    this.outputChannel?.appendLine(
      "FileNestingTreeViewExplorer:onActiveTabChanged",
    );

    if (!this.viewExplorer.visible) {
      return;
    }

    const activeGroup = vscode.window.tabGroups.activeTabGroup;
    const activeTab = activeGroup?.activeTab;

    if (!activeTab) {
      return;
    }

    const input = activeTab.input;
    let uri: vscode.Uri | undefined;

    if (input instanceof vscode.TabInputText) {
      uri = input.uri;
    } else if (input instanceof vscode.TabInputNotebook) {
      uri = input.uri;
    } else if (input instanceof vscode.TabInputCustom) {
      uri = input.uri;
    }

    if (!uri || uri.scheme !== "file") {
      return;
    }

    const filePath = uri.fsPath;
    const fileName = basename(filePath);

    try {
      await this.viewExplorer.reveal(
        {
          type: "file",
          path: filePath,
          name: fileName,
        },
        {
          select: true,
          expand: false,
        },
      );
    } catch (error) {
      // Silently ignore errors when trying to reveal files that are filtered out
      this.outputChannel?.appendLine(
        `FileNestingTreeViewExplorer: Could not reveal file from active tab ${filePath}`,
      );
    }
  }
}

export const fileNestingTreeViewExplorer = new FileNestingTreeViewExplorer();
