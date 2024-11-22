import * as vscode from "vscode";

export function normalizeNFC(items: string): string;
export function normalizeNFC(items: string[]): string[];
export function normalizeNFC(items: string | string[]): string | string[] {
  if (process.platform !== "darwin") {
    return items;
  }

  if (Array.isArray(items)) {
    return items.map((item) => item.normalize("NFC"));
  }

  return items.normalize("NFC");
}

export async function validateExist(path: string) {
  return vscode.workspace.fs.stat(vscode.Uri.file(path)).then(
    () => true,
    () => false
  );
}

export async function validateFiles(paths: string[]) {
  const validations = await Promise.all(paths.map(validateExist));

  return validations.every((isValid) => isValid);
}
