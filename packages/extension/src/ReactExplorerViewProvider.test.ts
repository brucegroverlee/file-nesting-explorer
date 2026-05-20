import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { ReactExplorerViewProvider } from "./ReactExplorerViewProvider";
import { fileNestingDataProvider } from "./FileNestingDataProvider";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "./test/helpers/tempWorkspace";

interface WebviewMessage {
  id: number;
  type: string;
  command?: string;
  entry?: unknown;
}

const fakeWebviewView = (extensionUri: vscode.Uri) => {
  const messages: unknown[] = [];
  const handlers: ((m: unknown) => Promise<void> | void)[] = [];

  const webview = {
    options: {},
    cspSource: "vscode-webview://test",
    html: "",
    asWebviewUri: (uri: vscode.Uri) =>
      vscode.Uri.parse(`https://webview.test${uri.path}`),
    postMessage: async (m: unknown) => {
      messages.push(m);
      return true;
    },
    onDidReceiveMessage: (handler: (m: unknown) => Promise<void> | void) => {
      handlers.push(handler);
      return { dispose() {} };
    },
  } as unknown as vscode.Webview;

  const view = {
    webview,
    visible: true,
    onDidChangeVisibility: () => ({ dispose() {} }),
    onDidDispose: () => ({ dispose() {} }),
  } as unknown as vscode.WebviewView;

  return {
    view,
    messages,
    send: async (msg: WebviewMessage) => {
      await Promise.all(handlers.map((h) => h(msg)));
    },
    extensionUri,
  };
};

const fakeContext = (extensionUri: vscode.Uri): vscode.ExtensionContext =>
  ({
    extensionUri,
    extensionMode: vscode.ExtensionMode.Production,
    subscriptions: [],
  } as unknown as vscode.ExtensionContext);

suite("ReactExplorerViewProvider", () => {
  let root: string;
  let extensionUri: vscode.Uri;

  setup(() => {
    root = createTempWorkspace();
    extensionUri = vscode.Uri.file(root);
    sinon.stub(fileNestingDataProvider, "onDidChangeTreeData").value(
      (() => ({ dispose() {} })) as unknown as vscode.Event<unknown>,
    );
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("getMissingBundleHtml is rendered when dist/react-explorer is absent", () => {
    const provider = new ReactExplorerViewProvider(fakeContext(extensionUri));
    const { view } = fakeWebviewView(extensionUri);

    provider.resolveWebviewView(
      view,
      {} as vscode.WebviewViewResolveContext,
      {} as vscode.CancellationToken,
    );

    assert.ok(view.webview.html.includes("React Explorer bundle not found"));
  });

  test("getHtml rewrites asset URLs through asWebviewUri and injects a CSP", () => {
    const distDir = path.join(root, "dist", "react-explorer");
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(
      path.join(distDir, "index.html"),
      `<!doctype html><html><head><script type="module" src="./assets/main.js"></script></head><body></body></html>`,
    );

    const provider = new ReactExplorerViewProvider(fakeContext(extensionUri));
    const { view } = fakeWebviewView(extensionUri);

    provider.resolveWebviewView(
      view,
      {} as vscode.WebviewViewResolveContext,
      {} as vscode.CancellationToken,
    );

    assert.ok(view.webview.html.includes("Content-Security-Policy"));
    assert.ok(view.webview.html.includes("https://webview.test"));
    assert.ok(view.webview.html.includes("nonce="));
  });

  test("rejects executeCommand messages with a command outside the allowlist", async () => {
    const provider = new ReactExplorerViewProvider(fakeContext(extensionUri));
    const { view, messages, send } = fakeWebviewView(extensionUri);

    provider.resolveWebviewView(
      view,
      {} as vscode.WebviewViewResolveContext,
      {} as vscode.CancellationToken,
    );

    await send({
      id: 1,
      type: "executeCommand",
      command: "workbench.action.closeAllEditors",
    });

    const response = messages.find(
      (m): m is { id: number; ok: boolean; error?: string } =>
        typeof m === "object" && m !== null && (m as { id?: number }).id === 1,
    );
    assert.ok(response);
    assert.strictEqual(response.ok, false);
  });

  test("forwards allowed executeCommand messages to vscode.commands.executeCommand", async () => {
    const executeStub = sinon
      .stub(vscode.commands, "executeCommand")
      .resolves(undefined);
    const provider = new ReactExplorerViewProvider(fakeContext(extensionUri));
    const { view, send } = fakeWebviewView(extensionUri);

    provider.resolveWebviewView(
      view,
      {} as vscode.WebviewViewResolveContext,
      {} as vscode.CancellationToken,
    );

    await send({
      id: 1,
      type: "executeCommand",
      command: "fileNestingExplorer.refresh",
    });

    assert.ok(
      executeStub
        .getCalls()
        .some((c) => c.args[0] === "fileNestingExplorer.refresh"),
    );
  });

  test("static viewType is 'reactExplorer'", () => {
    assert.strictEqual(ReactExplorerViewProvider.viewType, "reactExplorer");
  });
});
