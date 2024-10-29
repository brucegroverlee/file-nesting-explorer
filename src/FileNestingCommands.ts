import * as vscode from "vscode";

import { Entry } from "./Entry";
import { refreshView } from "./commands/refreshView";
import { renameEntry } from "./commands/renameEntry";

let lastClickTime = 0;
let lastClickedPath: string | undefined;

function sanitizeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "_");
}

export function createFileNestingCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("file-nesting-explorer.helloWorld", () => {
      vscode.window.showInformationMessage("Hello World from File Nesting! V2");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.newFile", () => {
      // TODO
      vscode.window.showInformationMessage("New file!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.newFolder", () => {
      // TODO
      vscode.window.showInformationMessage("New folder!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.refresh", refreshView)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.cut", () => {
      // TODO
      vscode.window.showInformationMessage("Cut!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.copy", () => {
      // TODO
      vscode.window.showInformationMessage("Copy!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.copyPath", () => {
      // TODO
      vscode.window.showInformationMessage("Copy path!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.copyRelativePath",
      () => {
        // TODO
        vscode.window.showInformationMessage("Copy relative path!");
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.rename", renameEntry)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("fileNestingExplorer.delete", () => {
      // TODO
      vscode.window.showInformationMessage("Delete!");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "fileNestingExplorer.openEditor",
      async (element: Entry) => {
        /* const currentTime = new Date().getTime();
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
        }); */

        // Lógica para abrir el editor con el nombre y contenido especificados
        // const sanitizedName = sanitizeFileName(element.name);
        // const uri = vscode.Uri.parse(`untitled:${sanitizedName}`);

        // const document = await vscode.workspace.openTextDocument(uri);
        const uri = vscode.Uri.file(element.path);

        console.log("fileNestingExplorer.openEditor", { element, uri });

        const editor = await vscode.window.showTextDocument(uri, {
          // preview: !isDoubleClick,
        });

        /* await editor.edit((editBuilder) => {
          editBuilder.replace(
            new vscode.Position(0, 0),
            "console.log('Holiiiiii')"
          );
        }); */
      }
    )
  );
}
