import { basename, extname } from "path";

import { Entry } from "../../Entry";

export const fileEntry = (
  path: string,
  opts: { isNesting?: boolean } = {},
): Entry => {
  const name = basename(path);
  const extension = extname(name).slice(1);
  const entry: Entry = {
    type: "file",
    path,
    name,
  };
  if (extension) {
    entry.extension = extension;
  }
  if (opts.isNesting) {
    entry.isNesting = true;
  }
  return entry;
};

export const folderEntry = (path: string): Entry => ({
  type: "folder",
  path,
  name: basename(path),
});

export const nestingFileEntry = (path: string): Entry =>
  fileEntry(path, { isNesting: true });
