import * as vscode from "vscode";
import { basename, parse } from "path";

import { config } from "../config";
import { Entry, getExtension } from "../Entry";
import { createNestedFile } from "./newNestedFile";
import { track } from "./analytics";

const getComponentTemplate = (componentName: string) => {
  return `export const ${componentName} = () => {
  return (
    <div>${componentName}</div>
  )
}
`;
};

const addImportToParentFile = async (
  document: vscode.TextDocument,
  parentFileName: string,
  componentName: string
) => {
  const text = document.getText();
  const lines = text.split("\n");

  let lastImportLine = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trimStart().startsWith("import ")) {
      lastImportLine = i;
    }
  }

  const importPath = `./${config.fileNestingPrefix}${parse(parentFileName).name}/${componentName}`;
  const importStatement = `import { ${componentName} } from "${importPath}"`;

  const edit = new vscode.WorkspaceEdit();
  const insertPosition = new vscode.Position(lastImportLine + 1, 0);
  edit.insert(document.uri, insertPosition, importStatement + "\n");

  await vscode.workspace.applyEdit(edit);
  await document.save();
};

export const newNestedFileFromSelection = async () => {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return;
  }

  const selection = editor.selection;

  if (selection.isEmpty) {
    return;
  }

  const selectedText = editor.document.getText(selection).trim();

  if (!selectedText) {
    return;
  }

  const document = editor.document;
  const filePath = document.uri.fsPath;
  const fileName = basename(filePath);
  const extension = getExtension(fileName);

  if (!config.fileNestingExtensions.includes(extension)) {
    vscode.window.showErrorMessage(
      `".${extension}" files are not configured for nesting. Allowed extensions: ${config.fileNestingExtensions.join(
        ", "
      )}`
    );
    return;
  }

  const componentName = selectedText;
  const nestedFileName = `${componentName}.${extension}`;

  track("Create Nested File From Selection");

  const entry: Entry = {
    type: "file",
    path: filePath,
    name: fileName,
    extension,
  };

  await createNestedFile(entry, nestedFileName, getComponentTemplate(componentName));
  await addImportToParentFile(document, fileName, componentName);
};
