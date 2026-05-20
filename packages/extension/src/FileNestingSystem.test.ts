import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";
import * as vscode from "vscode";

import { fileNestingSystem } from "./FileNestingSystem";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "./test/helpers/tempWorkspace";

suite("FileNestingSystem", () => {
  let root: string;

  setup(() => {
    sinon
      .stub(vscode.workspace, "getConfiguration")
      .returns({
        get: <T>(_key: string, defaultValue?: T): T | undefined => defaultValue,
      } as unknown as vscode.WorkspaceConfiguration);
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("getChildrenFromFolder lists folders first, then files alphabetically", async () => {
    root = createTempWorkspace({
      files: { "a.tsx": "", "b.tsx": "" },
      folders: ["zfolder", "afolder"],
    });

    const children = await fileNestingSystem.getChildrenFromFolder(root);
    const names = children.map((c) => c.name);

    assert.deepStrictEqual(names, ["afolder", "zfolder", "a.tsx", "b.tsx"]);
  });

  test("getChildrenFromFolder hides container folders (@<name>) that have a matching file", async () => {
    root = createTempWorkspace({
      files: {
        "App.tsx": "",
        "@App/Inner.tsx": "",
      },
    });

    const children = await fileNestingSystem.getChildrenFromFolder(root);
    const names = children.map((c) => c.name);

    assert.ok(names.includes("App.tsx"));
    assert.strictEqual(names.includes("@App"), false);
  });

  test("getChildrenFromFolder marks the matching file as isNesting", async () => {
    root = createTempWorkspace({
      files: {
        "App.tsx": "",
        "@App/Inner.tsx": "",
      },
    });

    const children = await fileNestingSystem.getChildrenFromFolder(root);
    const app = children.find((c) => c.name === "App.tsx");

    assert.strictEqual(app?.isNesting, true);
  });

  test("getChildrenFromFolder hides .sorting files", async () => {
    root = createTempWorkspace({
      files: {
        ".sorting": "[]",
        "A.tsx": "",
      },
    });

    const children = await fileNestingSystem.getChildrenFromFolder(root);
    const names = children.map((c) => c.name);

    assert.strictEqual(names.includes(".sorting"), false);
  });

  test("getChildrenFromFolder applies custom .sorting order when present", async () => {
    root = createTempWorkspace({
      files: {
        "A.tsx": "",
        "B.tsx": "",
        "C.tsx": "",
        ".sorting": JSON.stringify(["C.tsx", "A.tsx", "B.tsx"]),
      },
    });

    const children = await fileNestingSystem.getChildrenFromFolder(root);
    const names = children.map((c) => c.name);

    assert.deepStrictEqual(names, ["C.tsx", "A.tsx", "B.tsx"]);
  });

  test("getChildrenFromNestingFile returns the contents of the @<name> folder", async () => {
    root = createTempWorkspace({
      files: {
        "App.tsx": "",
        "@App/Inner.tsx": "",
        "@App/Other.tsx": "",
      },
    });

    const children = await fileNestingSystem.getChildrenFromNestingFile({
      type: "file",
      path: path.join(root, "App.tsx"),
      name: "App.tsx",
      extension: "tsx",
      isNesting: true,
    });
    const names = children.map((c) => c.name).sort();

    assert.deepStrictEqual(names, ["Inner.tsx", "Other.tsx"]);
  });

  test("getParent returns the parent folder for a regular file", async () => {
    root = createTempWorkspace({ files: { "sub/A.tsx": "" } });

    const parent = await fileNestingSystem.getParent({
      type: "file",
      path: path.join(root, "sub", "A.tsx"),
      name: "A.tsx",
    });

    assert.strictEqual(parent?.type, "folder");
    assert.strictEqual(parent?.name, "sub");
  });

  test("getParent returns the nesting file when the parent folder is a container", async () => {
    root = createTempWorkspace({
      files: { "App.tsx": "", "@App/Inner.tsx": "" },
    });

    const parent = await fileNestingSystem.getParent({
      type: "file",
      path: path.join(root, "@App", "Inner.tsx"),
      name: "Inner.tsx",
    });

    assert.strictEqual(parent?.type, "file");
    assert.strictEqual(parent?.name, "App.tsx");
    assert.strictEqual(parent?.isNesting, true);
  });
});
