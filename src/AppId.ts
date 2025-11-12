import * as vscode from "vscode";

export type AppId = "vscode" | "cursor" | "windsurf" | "unknown";

/**
 * Detects which IDE is currently running
 * @returns AppId
 */
export function getAppId(): AppId {
  const appName = vscode.env.appName.toLowerCase();

  if (appName.includes("windsurf")) {
    return "windsurf";
  } else if (appName.includes("cursor")) {
    return "cursor";
  } else if (appName.includes("code") || appName.includes("vscode")) {
    return "vscode";
  }

  return "unknown";
}

export const appId = getAppId();
