import * as sinon from "sinon";
import * as vscode from "vscode";

import { fileNestingDataProvider } from "../../FileNestingDataProvider";
import { fileNestingTreeViewExplorer } from "../../FileNestingTreeViewExplorer";
import { Entry } from "@file-nesting/shared";

export const stubInputBox = (value: string | undefined): sinon.SinonStub =>
  sinon.stub(vscode.window, "showInputBox").resolves(value);

export const stubInformationMessage = (
  answer: string | undefined,
): sinon.SinonStub =>
  sinon.stub(vscode.window, "showInformationMessage").resolves(
    answer as never,
  );

export const stubWarningMessage = (
  answer: string | undefined,
): sinon.SinonStub =>
  sinon.stub(vscode.window, "showWarningMessage").resolves(
    answer as never,
  );

export const stubErrorMessage = (): sinon.SinonStub =>
  sinon.stub(vscode.window, "showErrorMessage").resolves(undefined);

export interface ClipboardStub {
  read: sinon.SinonStub;
  write: sinon.SinonStub;
  setValue: (value: string) => void;
}

export const stubClipboard = (initial = ""): ClipboardStub => {
  let buffer = initial;
  const read = sinon.stub().callsFake(async () => buffer);
  const write = sinon.stub().callsFake(async (text: string) => {
    buffer = text;
  });

  sinon.stub(vscode.env, "clipboard").value({
    readText: read,
    writeText: write,
  });

  return {
    read,
    write,
    setValue: (value: string) => {
      buffer = value;
    },
  };
};

export const stubExecuteCommand = (): sinon.SinonStub =>
  sinon.stub(vscode.commands, "executeCommand").resolves(undefined);

export const stubTreeSelection = (entries: Entry[]): sinon.SinonStub =>
  sinon
    .stub(fileNestingTreeViewExplorer, "getSelection")
    .returns(entries as readonly Entry[]);

export const stubRefresh = (): sinon.SinonStub =>
  sinon.stub(fileNestingDataProvider, "refresh").resolves();

export const stubWorkspaceFolders = (rootPath: string): void => {
  sinon.stub(vscode.workspace, "workspaceFolders").value([
    {
      uri: vscode.Uri.file(rootPath),
      name: "test-workspace",
      index: 0,
    },
  ]);
};

export const stubAsRelativePath = (rootPath: string): sinon.SinonStub =>
  sinon.stub(vscode.workspace, "asRelativePath").callsFake(((
    pathOrUri: string | vscode.Uri,
    _includeWorkspaceFolder?: boolean,
  ): string => {
    const p = typeof pathOrUri === "string" ? pathOrUri : pathOrUri.fsPath;
    if (p.startsWith(rootPath + "/")) {
      return p.slice(rootPath.length + 1);
    }
    if (p === rootPath) {
      return "";
    }
    return p;
  }) as never);
