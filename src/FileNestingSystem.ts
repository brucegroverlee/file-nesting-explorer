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

        console.log("FileNestingSystem:getChildren files", { uri, files });

        const entries: FNSEntry[] = [];

        files.forEach((file) => {
          if (
            file.isDirectory() &&
            file.name.startsWith("@") &&
            this.isFileContainerFolder(file.name, files)
          ) {
            return;
          }

          const entry: FNSEntry = {
            type: file.isDirectory() ? "folder" : "file",
            path: join(uri, file.name),
            name: file.name,
          };

          if (!file.isDirectory()) {
            entry.extension = path.extname(file.name).slice(1);
          }

          entries.push(entry);
        });

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

  private sortEntries(entries: FNSEntry[]): FNSEntry[] {
    return entries.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }

      return a.type === "folder" ? -1 : 1;
    });
  }

  // if it is a directory, starts with @, and there is a file with the same name and extension .tsx or .ts
  // return true
  // for example: /src/@App and there is a file /src/App.tsx
  private isFileContainerFolder(
    folderName: string,
    files: fs.Dirent[]
  ): boolean {
    // remove the @ symbol
    folderName = folderName.slice(1);

    return files.some(
      (f) =>
        f.isFile() &&
        (f.name === `${basename(folderName)}.ts` ||
          f.name === `${basename(folderName)}.tsx`) &&
        (f.name.endsWith(".ts") || f.name.endsWith(".tsx"))
    );
  }
}

export const fileNestingSystem = new FileNestingSystem();
