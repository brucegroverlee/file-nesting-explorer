import * as vscode from "vscode";
import { basename, dirname, join } from "path";
import * as fs from "fs";

import { config } from "./config";
import { Entry, getName, getExtension } from "./Entry";

type DirectoryEntry = [string, vscode.FileType];

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

  public async getChildrenFromFolder(parentPath: string): Promise<Entry[]> {
    const excludedPathPatterns = this.getExcludedPathPatterns();

    const files = await vscode.workspace.fs.readDirectory(
      vscode.Uri.file(parentPath)
    );

    console.log("FileNestingSystem:getChildren files", {
      uri: parentPath,
      files,
    });

    const filteredFiles = files
      .filter(([name]) => {
        const filePath = join(parentPath, name);

        return !excludedPathPatterns.some((regex) => regex.test(filePath));
      })
      .filter(([name, type]) => {
        if (
          type === vscode.FileType.Directory &&
          name.startsWith(config.fileNestingPrefix) &&
          this.isFileContainerFolder(name, files)
        ) {
          // do not show the folder if it is a file container folder
          return false;
        }

        return true;
      })
      .map(([name, type]) => {
        const entry: Entry = {
          type: type === vscode.FileType.Directory ? "folder" : "file",
          path: join(parentPath, name),
          name,
        };

        if (entry.type === "file") {
          entry.extension = getExtension(entry.name);
        }

        if (entry.type === "file" && this.isNestingFile(entry.name, files)) {
          entry.isNesting = true;
        }

        return entry;
      })
      .sort((a, b) => {
        if (a.type === b.type) {
          return a.name.localeCompare(b.name);
        }

        return a.type === "folder" ? -1 : 1;
      });

    return filteredFiles;
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

  public async getParent(entry: Entry): Promise<Entry | null> {
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
      const parentSiblingFiles = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(dirname(parentPath))
      );

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

  private getExcludedPathPatterns(): RegExp[] {
    const excludeConfig = vscode.workspace
      .getConfiguration("files")
      .get<{ [pattern: string]: boolean }>("exclude", {});

    const excludedPatterns = Object.keys(excludeConfig).filter(
      (pattern) => excludeConfig[pattern]
    );

    const excludedPathPatterns = excludedPatterns.map(
      (pattern) =>
        new RegExp(pattern.replace(/\*\*/g, ".*").replace(/\*/g, "[^/]*"))
    );

    return excludedPathPatterns;
  }

  // if it is a directory, starts with @, and there is a file with the same name and extension .tsx or .ts
  // returns the file name
  // for example: /src/@App and there is a file /src/App.tsx, it returns App.tsx
  private isFileContainerFolder(
    folderName: string,
    files: DirectoryEntry[]
  ): string | null {
    // remove the @ symbol
    const parsedFolderName = folderName.slice(1);

    const nestingFile = files.find(([filename, type]) => {
      if (type === vscode.FileType.File) {
        return false;
      }

      if (!config.fileNestingExtensions.includes(getExtension(filename))) {
        return false;
      }

      return config.fileNestingExtensions
        .map((extension) => `${parsedFolderName}.${extension}`)
        .includes(filename);
    });

    return nestingFile ? nestingFile[0] : null;
  }

  private isNestingFile(fileName: string, files: DirectoryEntry[]): boolean {
    const name = getName(fileName);

    return files.some(
      ([filename, type]) =>
        type === vscode.FileType.Directory &&
        filename.startsWith(config.fileNestingPrefix) &&
        filename.slice(1) === name
    );
  }
}

export const fileNestingSystem = new FileNestingSystem();
