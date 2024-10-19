export interface Entry {
  type: "file" | "folder";
  path: string;
  name: string;
  extension?: string;
  isNesting?: boolean;
}
