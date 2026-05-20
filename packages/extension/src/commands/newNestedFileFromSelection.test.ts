import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { newNestedFileFromSelection } from "./newNestedFileFromSelection";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
  readFile,
} from "../test/helpers/tempWorkspace";
import { stubErrorMessage, stubExecuteCommand } from "../test/helpers/stubs";

const fakeEditor = (
  fsPath: string,
  selectedText: string,
): vscode.TextEditor => {
  const document = {
    uri: vscode.Uri.file(fsPath),
    getText: (range?: vscode.Range) => (range ? selectedText : ""),
    save: async () => true,
  } as unknown as vscode.TextDocument;

  const selection = {
    isEmpty: selectedText.length === 0,
  } as unknown as vscode.Selection;

  return { document, selection } as unknown as vscode.TextEditor;
};

suite("newNestedFileFromSelection", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({ files: { "App.tsx": "" } });
    stubExecuteCommand();
    sinon.stub(vscode.workspace, "applyEdit").resolves(true);
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("creates a nested file with the React template using the selected name", async () => {
    sinon
      .stub(vscode.window, "activeTextEditor")
      .value(fakeEditor(path.join(root, "App.tsx"), "Button"));

    await newNestedFileFromSelection();

    const created = path.join(root, "@App", "Button.tsx");
    assert.ok(exists(created));
    assert.ok(readFile(created).includes("export const Button"));
  });

  test("does nothing when there is no active editor", async () => {
    sinon.stub(vscode.window, "activeTextEditor").value(undefined);

    await newNestedFileFromSelection();

    assert.strictEqual(exists(path.join(root, "@App")), false);
  });

  test("shows an error for unsupported extensions", async () => {
    cleanupTempWorkspace(root);
    root = createTempWorkspace({ files: { "App.md": "" } });
    sinon
      .stub(vscode.window, "activeTextEditor")
      .value(fakeEditor(path.join(root, "App.md"), "Button"));
    const errorStub = stubErrorMessage();

    await newNestedFileFromSelection();

    assert.ok(errorStub.calledOnce);
  });
});
