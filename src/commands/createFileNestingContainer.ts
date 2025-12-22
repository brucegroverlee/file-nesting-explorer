import * as vscode from "vscode";
import { dirname, parse, join } from "path";

import { config } from "../config";
import { Entry } from "../Entry";
import { fileNestingDataProvider } from "../FileNestingDataProvider";
import { validateExist } from "../FileSystem";
import { track } from "./analytics";

export const createFileNestingContainer = async (entry: Entry) => {
  if (entry.type !== "file") {
    return;
  }

  if (!config.fileNestingExtensions.includes(entry.extension || "")) {
    return;
  }

  const containerPath = join(
    dirname(entry.path),
    `${config.fileNestingPrefix}${parse(entry.name).name}`
  );

  const containerExists = await validateExist(containerPath);

  if (containerExists) {
    return;
  }

  track("Enable Nested Files");

  await vscode.workspace.fs.createDirectory(vscode.Uri.file(containerPath));

  // fileNestingDataProvider.refresh();
};
