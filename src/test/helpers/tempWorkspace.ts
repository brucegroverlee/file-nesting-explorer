import * as fs from "fs";
import * as os from "os";
import * as path from "path";

export interface TempWorkspaceOptions {
  files?: Record<string, string>;
  folders?: string[];
}

export function createTempWorkspace(
  options: TempWorkspaceOptions = {},
): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "file-nesting-test-"));

  for (const folder of options.folders ?? []) {
    fs.mkdirSync(path.join(root, folder), { recursive: true });
  }

  for (const [rel, content] of Object.entries(options.files ?? {})) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }

  return root;
}

export function cleanupTempWorkspace(root: string | undefined): void {
  if (!root) {
    return;
  }
  if (fs.existsSync(root)) {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

export function writeFile(root: string, rel: string, content = ""): string {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
  return full;
}

export function mkdir(root: string, rel: string): string {
  const full = path.join(root, rel);
  fs.mkdirSync(full, { recursive: true });
  return full;
}

export function exists(p: string): boolean {
  return fs.existsSync(p);
}

export function readFile(p: string): string {
  return fs.readFileSync(p, "utf8");
}
