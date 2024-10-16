import * as vscode from "vscode";

import { FileNestingProvider, File } from "./FileNestingExplorer";

let lastClickTime = 0;
let lastClickedPath: string | undefined;

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "file-nesting-explorer" is now active!'
  );

  const disposable = vscode.commands.registerCommand(
    "file-nesting-explorer.helloWorld",
    () => {
      vscode.window.showInformationMessage(
        "Hello World from File nesting explorer!"
      );
    }
  );
  context.subscriptions.push(disposable);

  const fileNestingProvider = new FileNestingProvider();
  vscode.window.registerTreeDataProvider(
    "fileNestingExplorer",
    fileNestingProvider
  );

  vscode.commands.registerCommand("fileNestingExplorer.newFile", () => {
    vscode.window.showInformationMessage("New file!");
  });

  vscode.commands.registerCommand("fileNestingExplorer.newFolder", () => {
    vscode.window.showInformationMessage("New folder!");
  });

  vscode.commands.registerCommand("fileNestingExplorer.refresh", () => {
    vscode.window.showInformationMessage("Refreshing!");
  });

  vscode.commands.registerCommand("fileNestingExplorer.collapse", () => {
    vscode.window.showInformationMessage("Collapsing!");
  });

  vscode.commands.registerCommand(
    "fileNestingExplorer.openEditor",
    async (element: File) => {
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastClickTime;

      let isDoubleClick = false;

      if (
        lastClickedPath &&
        lastClickedPath === element.path &&
        timeDiff < 500
      ) {
        isDoubleClick = true;
      }

      lastClickTime = currentTime;
      lastClickedPath = element.path;
      console.log({
        currentTime,
        lastClickTime,
        timeDiff,
        isDoubleClick,
      });

      // Lógica para abrir el editor con el nombre y contenido especificados
      const sanitizedName = sanitizeFileName(element.name);
      const uri = vscode.Uri.parse(`untitled:${sanitizedName}`);

      const document = await vscode.workspace.openTextDocument(uri);
      const editor = await vscode.window.showTextDocument(document, {
        preview: !isDoubleClick,
      });

      await editor.edit((editBuilder) => {
        editBuilder.replace(
          new vscode.Position(0, 0),
          "console.log('Holiiiiii')"
        );
      });
    }
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
