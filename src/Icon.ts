import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

import { appId, AppId } from "./AppId";

export type IconPath =
  | { light: string; dark: string }
  | vscode.ThemeIcon
  | vscode.Uri
  | undefined;

function getIdeDefaultIconTheme(appId: AppId): string {
  switch (appId) {
    case "vscode":
      return "vs-seti";
    case "cursor":
      return "vs-seti";
    case "windsurf":
      return "symbols";
    default:
      return "vs-seti";
  }
}

function getIconTheme(iconTheme: string, extension?: string) {
  const iconThemePath = path.join(__dirname, "..", "icons", iconTheme);

  if (!fs.existsSync(iconThemePath)) {
    console.log("Icon theme not found", iconThemePath);
    const icon = new vscode.ThemeIcon("file");
    console.log("Icon", icon);
    return icon;
  }

  switch (extension) {
    case "js":
      return {
        light: path.join(iconThemePath, "javascript.svg"),
        dark: path.join(iconThemePath, "javascript.svg"),
      };
    case "jsx":
      return {
        light: path.join(iconThemePath, "react.svg"),
        dark: path.join(iconThemePath, "react.svg"),
      };
    case "ts":
      return {
        light: path.join(iconThemePath, "typescript.svg"),
        dark: path.join(iconThemePath, "typescript.svg"),
      };
    case "tsx":
      return {
        light: path.join(iconThemePath, "react_ts.svg"),
        dark: path.join(iconThemePath, "react_ts.svg"),
      };
    default:
      return new vscode.ThemeIcon("file");
  }
}

// Right now, the new vscode.ThemeIcon("file"); returns the actual icon of the file.
// So, I don't need to store the icon files per icon theme anymore.
/* export function getIcon(extension?: string): IconPath {
  let iconTheme = vscode.workspace
    .getConfiguration("workbench")
    .get<string>("iconTheme");

  console.log("Icon theme", iconTheme);

  if (!iconTheme) {
    iconTheme = getIdeDefaultIconTheme(appId);
  }

  return getIconTheme(iconTheme, extension);
} */

export function getIcon(extension?: string): IconPath {
  return new vscode.ThemeIcon("file");
}
