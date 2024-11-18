import * as vscode from "vscode";

class FileNestingDecoratorProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<
    vscode.Uri | vscode.Uri[] | undefined
  >();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;
  private context: vscode.ExtensionContext | null = null;

  public setContext(context: vscode.ExtensionContext) {
    this.context = context;

    context.subscriptions.push(
      vscode.window.registerFileDecorationProvider(this)
    );
  }

  public updateDecorations(uris?: vscode.Uri[]) {
    this._onDidChangeFileDecorations.fire(uris);
  }

  provideFileDecoration(
    uri: vscode.Uri,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.FileDecoration> {
    const cutEntryPath = this.context?.globalState.get<string>("cutEntryPath");

    if (cutEntryPath && uri.fsPath === cutEntryPath) {
      return {
        badge: "📌",
        tooltip: "Cut",
        color: new vscode.ThemeColor("editorError.foreground"),
      };
    }
  }
}

export const fileNestingDecoratorProvider = new FileNestingDecoratorProvider();
