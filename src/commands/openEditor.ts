import * as vscode from "vscode";

import { Entry } from "../Entry";

let lastClickTime = 0;
let lastClickedPath: string | undefined;

function isDoubleClick(element: Entry) {
  const currentTime = new Date().getTime();
  const timeDiff = currentTime - lastClickTime;

  let isDoubleClick = false;

  if (lastClickedPath && lastClickedPath === element.path && timeDiff < 1000) {
    isDoubleClick = true;
  }

  lastClickTime = currentTime;
  lastClickedPath = element.path;

  return isDoubleClick;
}

export const openEditor = async (element: Entry) => {
  const uri = vscode.Uri.file(element.path);

  /* console.log("fileNestingExplorer.openEditor", { element, uri }); */

  const editor = await vscode.window.showTextDocument(uri, {
    preserveFocus: true,
    preview: !isDoubleClick(element),
  });
};
