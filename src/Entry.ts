import * as vscode from "vscode";
import { dirname, basename, extname, parse, join } from "path";

export interface Entry {
  type: "file" | "folder";
  /**
   * The full path of the file or folder in the file system. Similar to the URI in vscode, but without the scheme.
   * For example, `/this/is/a/path/to/a/Component.tsx`.
   */
  path: string;
  /**
   * The name of the file or folder. For example, `Component.tsx`.
   */
  name: string;
  /**
   * The file extension. For example, `tsx`.
   */
  extension?: string;
  isNesting?: boolean;
}

/**
 * Returns the file's name without the extension. For example, for the file `/this/is/a/path/to/a/Component.tsx`, it returns `Component`.
 * @param filename The full path of the file.
 * @returns
 */
export const getName = (filename: string) => {
  return parse(filename).name;
};

/**
 * Returns the file's extension. For example, for the file `/this/is/a/path/to/a/Component.tsx`, it returns `tsx`.
 * @param filename The full path of the file.
 * @returns
 */
export const getExtension = (filename: string) => {
  return extname(filename).slice(1);
};

// TODO
// export function createEntry(uri: string): Entry {};

// TODO
// export function toTreeItem(entry: Entry): vscode.TreeItem {};

// TODO
// export function toEntry(treeItem: vscode.TreeItem): Entry {};
