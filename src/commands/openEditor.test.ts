import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { openEditor } from "./openEditor";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry } from "../test/helpers/fixtures";
import { stubExecuteCommand, stubWarningMessage } from "../test/helpers/stubs";

suite("openEditor", () => {
  let root: string;
  let showTextDocument: sinon.SinonStub;

  setup(() => {
    root = createTempWorkspace({ files: { "A.tsx": "console.log('hi');\n" } });
    showTextDocument = sinon
      .stub(vscode.window, "showTextDocument")
      .resolves({} as vscode.TextEditor);
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("opens the document as a preview on a single click", async () => {
    await openEditor(fileEntry(path.join(root, "A.tsx")));

    const opts = showTextDocument.firstCall
      .args[1] as vscode.TextDocumentShowOptions;
    assert.strictEqual(opts.preview, true);
  });

  test("opens without preview on a quick second click (double click)", async () => {
    const entry = fileEntry(path.join(root, "A.tsx"));
    await openEditor(entry);
    await openEditor(entry);

    const opts = showTextDocument.secondCall
      .args[1] as vscode.TextDocumentShowOptions;
    assert.strictEqual(opts.preview, false);
  });

  test("prompts before opening a file larger than 5MB", async () => {
    const bigPath = path.join(root, "big.bin");
    const fd = fs.openSync(bigPath, "w");
    fs.writeSync(fd, Buffer.alloc(1024), 0, 1024, 6 * 1024 * 1024 - 1);
    fs.closeSync(fd);
    const warn = stubWarningMessage(undefined);

    await openEditor(fileEntry(bigPath));

    assert.ok(warn.calledOnce);
    assert.strictEqual(showTextDocument.called, false);
  });

  test("falls back to vscode.open when showTextDocument fails", async () => {
    showTextDocument.rejects(new Error("binary"));
    const exec = stubExecuteCommand();

    await openEditor(fileEntry(path.join(root, "A.tsx")));

    assert.ok(exec.calledOnceWith("vscode.open"));
  });
});
