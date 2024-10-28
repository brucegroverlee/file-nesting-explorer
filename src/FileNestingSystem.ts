import * as vscode from "vscode";
import { basename, dirname, join } from "path";
import * as fs from "fs";
import * as path from "path";

import { Entry } from "./Entry";

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

  public getChildrenFromFolder(uri: string): Thenable<Entry[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(uri, { withFileTypes: true }, (err, files) => {
        if (err) {
          return reject(err);
        }

        console.log("FileNestingSystem:getChildren files", { uri, files });

        const entries: Entry[] = [];

        files.forEach((file) => {
          if (
            file.isDirectory() &&
            file.name.startsWith("@") &&
            this.isFileContainerFolder(file.name, files)
          ) {
            // do not show the folder if it is a file container folder
            return;
          }

          const entry: Entry = {
            type: file.isDirectory() ? "folder" : "file",
            path: join(uri, file.name),
            name: file.name,
          };

          if (entry.type === "file") {
            entry.extension = path.extname(entry.name).slice(1);
          }

          if (entry.type === "file" && this.isNestingFile(entry.name, files)) {
            entry.isNesting = true;
          }

          entries.push(entry);
        });

        const sortedEntries = this.sortEntries(entries);

        resolve(sortedEntries);
      });
    });
  }

  public getChildrenFromNestingFile(file: Entry): Thenable<Entry[]> {
    const fileName = file.name.slice(0, file.name.lastIndexOf("."));
    const folderPath = join(dirname(file.path), `@${fileName}`);

    return this.getChildrenFromFolder(folderPath);
  }

  public get roots(): Thenable<Entry[]> {
    if (!this.workspaceRoot) {
      return Promise.resolve([]);
    }

    return this.getChildrenFromFolder(this.workspaceRoot);
  }

  private sortEntries(entries: Entry[]): Entry[] {
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

  private isNestingFile(fileName: string, files: fs.Dirent[]): boolean {
    // remove the extension
    fileName = fileName.slice(0, fileName.lastIndexOf("."));
    return files.some(
      (f) =>
        f.isDirectory() &&
        f.name.startsWith("@") &&
        f.name.slice(1) === fileName
    );
  }

  public getParent(entry: Entry): Entry | null {
    console.log("FileNestingSystem:getParent entry", entry);

    const parentPath = dirname(entry.path);

    if (parentPath === this.workspaceRoot) {
      console.log("FileNestingSystem:getParent is root");
      return null;
    }

    const parentName = basename(parentPath);

    let parent: Entry = {
      type: "folder",
      path: parentPath,
      name: parentName,
    };

    if (parentName.startsWith("@")) {
      const parentSiblingFiles = fs.readdirSync(dirname(parentPath), {
        withFileTypes: true,
      });

      if (this.isFileContainerFolder(parentName, parentSiblingFiles)) {
        const parentFileName = `${parentName.slice(1)}.tsx`; // TODO: get the extension from the file

        parent.type = "file";
        parent.path = join(dirname(parentPath), parentFileName);
        parent.name = parentFileName;
        parent.extension = "tsx"; // TODO: get the extension from the file
        parent.isNesting = true;
      }
    }

    console.log("FileNestingSystem:getParent parent", parent);

    return parent;
  }
}

export const fileNestingSystem = new FileNestingSystem();
