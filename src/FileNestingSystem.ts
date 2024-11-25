import * as vscode from "vscode";
import { basename, dirname, join } from "path";
import * as fs from "fs";

import { config } from "./config";
import { Entry, getName, getExtension } from "./Entry";

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

  public getChildrenFromFolder(parentPath: string): Thenable<Entry[]> {
    const excludeConfig = vscode.workspace
      .getConfiguration("files")
      .get<{ [pattern: string]: boolean }>("exclude", {});

    const excludedPatterns = Object.keys(excludeConfig).filter(
      (pattern) => excludeConfig[pattern]
    );
    const excludedRegexes = excludedPatterns.map(
      (pattern) =>
        new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"))
    );

    return new Promise((resolve, reject) => {
      fs.readdir(parentPath, { withFileTypes: true }, (err, files) => {
        if (err) {
          return reject(err);
        }

        console.log("FileNestingSystem:getChildren files", {
          uri: parentPath,
          files,
        });

        const entries: Entry[] = [];

        files
          .filter(({ name }) => {
            const filePath = join(parentPath, name);
            return !excludedRegexes.some((regex) => regex.test(filePath));
          })
          .forEach((file) => {
            if (
              file.isDirectory() &&
              file.name.startsWith(config.fileNestingPrefix) &&
              this.isFileContainerFolder(file.name, files)
            ) {
              // do not show the folder if it is a file container folder
              return;
            }

            const entry: Entry = {
              type: file.isDirectory() ? "folder" : "file",
              path: join(parentPath, file.name),
              name: file.name,
            };

            if (entry.type === "file") {
              entry.extension = getExtension(entry.name);
            }

            if (
              entry.type === "file" &&
              this.isNestingFile(entry.name, files)
            ) {
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
    const fileName = getName(file.name);
    const folderPath = join(
      dirname(file.path),
      `${config.fileNestingPrefix}${fileName}`
    );

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
  // returns the file name
  // for example: /src/@App and there is a file /src/App.tsx, it returns App.tsx
  private isFileContainerFolder(
    folderName: string,
    files: fs.Dirent[]
  ): string | null {
    // remove the @ symbol
    const parsedFolderName = folderName.slice(1);

    const nestingFile = files.find((file) => {
      if (file.isDirectory()) {
        return false;
      }

      if (!config.fileNestingExtensions.includes(getExtension(file.name))) {
        return false;
      }

      return config.fileNestingExtensions
        .map((extension) => `${parsedFolderName}.${extension}`)
        .includes(file.name);
    });

    return nestingFile ? nestingFile.name : null;
  }

  private isNestingFile(fileName: string, files: fs.Dirent[]): boolean {
    const name = getName(fileName);

    return files.some(
      (f) =>
        f.isDirectory() &&
        f.name.startsWith(config.fileNestingPrefix) &&
        f.name.slice(1) === name
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

    if (parentName.startsWith(config.fileNestingPrefix)) {
      const parentSiblingFiles = fs.readdirSync(dirname(parentPath), {
        withFileTypes: true,
      });

      const parentNestingFile = this.isFileContainerFolder(
        parentName,
        parentSiblingFiles
      );

      if (parentNestingFile) {
        parent.type = "file";
        parent.path = join(dirname(parentPath), parentNestingFile);
        parent.name = parentNestingFile;
        parent.extension = getExtension(parentNestingFile);
        parent.isNesting = true;
      }
    }

    console.log("FileNestingSystem:getParent parent", parent);

    return parent;
  }
}

export const fileNestingSystem = new FileNestingSystem();
