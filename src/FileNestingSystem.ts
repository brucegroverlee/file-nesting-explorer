import * as vscode from "vscode";
import { basename, dirname, join } from "path";
import * as fs from "fs";
import * as path from "path";

import { FNSEntry } from "./Entry";

class FileNestingSystem {
  private workspaceRoot: string | undefined;

  constructor() {
    if (
      vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
    ) {
      this.workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
  }

  public getChildren(uri: string): Thenable<FNSEntry[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(uri, { withFileTypes: true }, (err, files) => {
        if (err) {
          return reject(err);
        }

        const entries: FNSEntry[] = files.map((file) => {
          const entry: FNSEntry = {
            type: file.isDirectory() ? "folder" : "file",
            path: join(uri, file.name),
            name: file.name,
          };

          if (!file.isDirectory()) {
            entry.extension = path.extname(file.name).slice(1);
          }

          return entry;
        });

        // sort folders first, then file
        const sortedEntries = this.sortEntries(entries);

        resolve(sortedEntries);
      });
    });
  }

  public get roots(): Thenable<FNSEntry[]> {
    if (!this.workspaceRoot) {
      return Promise.resolve([]);
    }

    return this.getChildren(this.workspaceRoot);
  }

  // sort alphabetically
  private sortEntries(entries: FNSEntry[]): FNSEntry[] {
    return entries.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }

      return a.type === "folder" ? -1 : 1;
    });
  }
}

export const fileNestingSystem = new FileNestingSystem();
