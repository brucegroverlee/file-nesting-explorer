export interface File {
  type: "file" | "folder";
  path: string;

  name: string;
  extension: string;
  data?: Uint8Array;
  isNesting?: boolean;
  entries?: Map<string, File | Folder>;
}

export interface Folder {
  type: "file" | "folder";
  path: string;

  name: string;
  entries: Map<string, File | Folder>;
}

export type Entry = File | Folder;
