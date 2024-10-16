import * as vscode from "vscode";
import * as path from "path";

export function getIcon(extension: string) {
  switch (extension) {
    case "js":
      return {
        light: path.join(__filename, "..", "..", "icons", "javascript.svg"),
        dark: path.join(__filename, "..", "..", "icons", "javascript.svg"),
      };
    case "jsx":
      return {
        light: path.join(__filename, "..", "..", "icons", "react.svg"),
        dark: path.join(__filename, "..", "..", "icons", "react.svg"),
      };
    case "ts":
      return {
        light: path.join(__filename, "..", "..", "icons", "typescript.svg"),
        dark: path.join(__filename, "..", "..", "icons", "typescript.svg"),
      };
    case "tsx":
      return {
        light: path.join(__filename, "..", "..", "icons", "react_ts.svg"),
        dark: path.join(__filename, "..", "..", "icons", "react_ts.svg"),
      };
    default:
      // for more information on vscode.ThemeIcon, visit:
      // https://code.visualstudio.com/api/references/icons-in-labels#icon-listing
      return new vscode.ThemeIcon("file");
  }
}
