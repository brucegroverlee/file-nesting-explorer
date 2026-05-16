import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

import { Entry } from "./Entry";
import { fileNestingSystem } from "./FileNestingSystem";

async function computeAncestorPaths(filePath: string): Promise<string[]> {
  const ancestors: string[] = [];
  let current: Entry | null = {
    type: "file",
    path: filePath,
    name: path.basename(filePath),
  };

  // Guard against pathological cycles.
  for (let i = 0; i < 64 && current; i++) {
    const parent = await fileNestingSystem.getParent(current);
    if (!parent) {
      break;
    }
    ancestors.push(parent.path);
    current = parent;
  }

  return ancestors;
}

type IncomingMessage =
  | { id: number; type: "getRoots" }
  | { id: number; type: "getChildren"; entry: Entry }
  | { id: number; type: "openEditor"; entry: Entry }
  | { id: number; type: "getActiveEditor" };

/**
 * WebviewView provider for the "React Explorer" panel. Loads the Vite-built
 * bundle from `dist/react-explorer/` and rewrites its asset URLs through
 * `asWebviewUri` so the sandboxed webview can resolve them.
 */
export class ReactExplorerViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "reactExplorer";

  private readonly distUri: vscode.Uri;
  private readonly materialIconsUri: vscode.Uri;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.distUri = vscode.Uri.joinPath(
      context.extensionUri,
      "dist",
      "react-explorer",
    );
    this.materialIconsUri = vscode.Uri.joinPath(
      context.extensionUri,
      "icons",
      "material-icon-theme",
    );
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      // Restrict what the webview can load to the built bundle and the
      // bundled material-icon-theme SVGs.
      localResourceRoots: [this.distUri, this.materialIconsUri],
    };

    const render = () => {
      webviewView.webview.html = this.getHtml(webviewView.webview);
    };

    render();

    const postActiveEditor = async () => {
      const editor = vscode.window.activeTextEditor;
      const activePath =
        editor && editor.document.uri.scheme === "file"
          ? editor.document.uri.fsPath
          : null;

      const ancestors = activePath
        ? await computeAncestorPaths(activePath)
        : [];

      webviewView.webview.postMessage({
        type: "activeEditorChanged",
        path: activePath,
        ancestors,
      });
    };

    // Push the current state once and then on every active-editor change.
    postActiveEditor();

    const activeEditorSub = vscode.window.onDidChangeActiveTextEditor(() => {
      // Always push; webview filters when it's not interested. We don't gate
      // on visibility because tab switches still happen while the panel is
      // visible elsewhere in the layout.
      postActiveEditor();
    });

    const visibilitySub = webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        postActiveEditor();
      }
    });

    webviewView.onDidDispose(() => {
      activeEditorSub.dispose();
      visibilitySub.dispose();
    });

    webviewView.webview.onDidReceiveMessage(
      async (message: IncomingMessage) => {
        if (!message || typeof message.id !== "number") {
          return;
        }

        try {
          let entries: Entry[] = [];

          if (message.type === "getRoots") {
            entries = await fileNestingSystem.roots;
          } else if (message.type === "getChildren") {
            const entry = message.entry;
            if (entry.type === "file" && entry.isNesting) {
              entries =
                await fileNestingSystem.getChildrenFromNestingFile(entry);
            } else {
              entries = await fileNestingSystem.getChildrenFromFolder(
                entry.path,
              );
            }
          } else if (message.type === "openEditor") {
            await vscode.commands.executeCommand(
              "fileNestingExplorer.openEditor",
              message.entry,
            );
          } else if (message.type === "getActiveEditor") {
            // Synchronous reply via the standard response channel (also
            // pushes the dedicated `activeEditorChanged` so any subscriber
            // updates regardless of which path is in use).
            postActiveEditor();
          }

          webviewView.webview.postMessage({
            id: message.id,
            ok: true,
            entries,
          });
        } catch (error) {
          webviewView.webview.postMessage({
            id: message.id,
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      },
    );

    // In development, watch the built bundle so saving a source file in
    // src/react-explorer/ (with `npm run watch:webview` running) triggers a
    // reload of this panel automatically.
    if (this.context.extensionMode === vscode.ExtensionMode.Development) {
      const pattern = new vscode.RelativePattern(
        this.distUri,
        "{index.html,assets/*}",
      );
      const watcher = vscode.workspace.createFileSystemWatcher(pattern);

      // Debounce rapid successive writes from Vite emitting multiple files.
      let timer: NodeJS.Timeout | undefined;
      const scheduleReload = () => {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(() => {
          if (webviewView.visible) {
            render();
          }
        }, 150);
      };

      watcher.onDidChange(scheduleReload);
      watcher.onDidCreate(scheduleReload);

      webviewView.onDidDispose(() => {
        if (timer) {
          clearTimeout(timer);
        }
        watcher.dispose();
      });
    }
  }

  private getHtml(webview: vscode.Webview): string {
    const indexPath = path.join(this.distUri.fsPath, "index.html");

    if (!fs.existsSync(indexPath)) {
      return this.getMissingBundleHtml();
    }

    const nonce = getNonce();
    const cspSource = webview.cspSource;
    let html = fs.readFileSync(indexPath, "utf8");

    // Rewrite every src/href that Vite emitted with a relative ./assets path
    // to a webview-safe URI.
    html = html.replace(
      /(src|href)="\.?\/?(assets\/[^"']+)"/g,
      (_match, attr: string, assetPath: string) => {
        const assetUri = webview.asWebviewUri(
          vscode.Uri.joinPath(this.distUri, ...assetPath.split("/")),
        );
        return `${attr}="${assetUri.toString()}"`;
      },
    );

    // Inject CSP + nonce into the <head>. Vite module scripts are marked with
    // type="module"; we stamp a nonce onto each <script> so the CSP allows it.
    html = html.replace(/<script /g, `<script nonce="${nonce}" `);

    const csp = [
      `default-src 'none'`,
      `img-src ${cspSource} https: data:`,
      `style-src ${cspSource} 'unsafe-inline'`,
      `font-src ${cspSource}`,
      `script-src 'nonce-${nonce}'`,
      `connect-src ${cspSource}`,
    ].join("; ");

    const materialIconsBaseUri = webview
      .asWebviewUri(this.materialIconsUri)
      .toString();

    html = html.replace(
      /<head>/,
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">\n    <script nonce="${nonce}">window.__materialIconBaseUri=${JSON.stringify(materialIconsBaseUri)};</script>`,
    );

    return html;
  }

  private getMissingBundleHtml(): string {
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
  <title>React Explorer</title>
  <style>
    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 16px; font-size: 12px; line-height: 1.5; }
    code { background: var(--vscode-textCodeBlock-background, rgba(127,127,127,0.15)); padding: 1px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <p><strong>React Explorer bundle not found.</strong></p>
  <p>Run <code>npm run build:webview</code> (or <code>npm run compile</code>) and reload this view.</p>
</body>
</html>`;
  }
}

function getNonce(): string {
  let text = "";
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}
