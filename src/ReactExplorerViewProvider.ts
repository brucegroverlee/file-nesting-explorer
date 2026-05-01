import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

/**
 * WebviewView provider for the "React Explorer" panel. Loads the Vite-built
 * bundle from `dist/react-explorer/` and rewrites its asset URLs through
 * `asWebviewUri` so the sandboxed webview can resolve them.
 */
export class ReactExplorerViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "reactExplorer";

  private readonly distUri: vscode.Uri;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.distUri = vscode.Uri.joinPath(
      context.extensionUri,
      "dist",
      "react-explorer",
    );
  }

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): void | Thenable<void> {
    webviewView.webview.options = {
      enableScripts: true,
      // Restrict what the webview can load to the built bundle only.
      localResourceRoots: [this.distUri],
    };

    const render = () => {
      webviewView.webview.html = this.getHtml(webviewView.webview);
    };

    render();

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

    html = html.replace(
      /<head>/,
      `<head>\n    <meta http-equiv="Content-Security-Policy" content="${csp}">`,
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
