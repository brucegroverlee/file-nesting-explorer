import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { editSortingFile } from "./editSortingFile";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { folderEntry, nestingFileEntry, fileEntry } from "../test/helpers/fixtures";
import { stubInformationMessage } from "../test/helpers/stubs";

suite("editSortingFile", () => {
  let root: string;
  let openTextDocument: sinon.SinonStub;
  let showTextDocument: sinon.SinonStub;

  setup(() => {
    root = createTempWorkspace({
      folders: ["folder"],
      files: {
        "folder/.sorting": "[]",
        "App.tsx": "",
        "@App/.sorting": "[]",
      },
    });

    openTextDocument = sinon
      .stub(vscode.workspace, "openTextDocument")
      .resolves({} as vscode.TextDocument);
    showTextDocument = sinon
      .stub(vscode.window, "showTextDocument")
      .resolves({} as vscode.TextEditor);
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("opens .sorting from a folder", async () => {
    await editSortingFile(folderEntry(path.join(root, "folder")));

    const args = openTextDocument.firstCall.args[0] as vscode.Uri;
    assert.strictEqual(args.fsPath, path.join(root, "folder", ".sorting"));
    assert.ok(showTextDocument.calledOnce);
  });

  test("opens .sorting from a nesting file's container", async () => {
    await editSortingFile(nestingFileEntry(path.join(root, "App.tsx")));

    const args = openTextDocument.firstCall.args[0] as vscode.Uri;
    assert.strictEqual(args.fsPath, path.join(root, "@App", ".sorting"));
  });

  test("shows info when no .sorting file exists", async () => {
    const info = stubInformationMessage(undefined);
    cleanupTempWorkspace(root);
    root = createTempWorkspace({ folders: ["empty"] });

    await editSortingFile(folderEntry(path.join(root, "empty")));

    assert.ok(info.calledOnce);
    assert.strictEqual(openTextDocument.called, false);
  });

  test("ignores plain files (no isNesting)", async () => {
    await editSortingFile(fileEntry(path.join(root, "App.tsx")));

    assert.strictEqual(openTextDocument.called, false);
  });
});
