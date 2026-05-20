import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { newNestedFolder } from "./newNestedFolder";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
  mkdir,
} from "../test/helpers/tempWorkspace";
import { fileEntry } from "../test/helpers/fixtures";
import {
  stubErrorMessage,
  stubInputBox,
} from "../test/helpers/stubs";

suite("newNestedFolder", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({ files: { "App.tsx": "" } });
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("creates the @<name> container and the nested folder", async () => {
    stubInputBox("hooks");

    await newNestedFolder(fileEntry(path.join(root, "App.tsx")));

    assert.ok(exists(path.join(root, "@App")));
    assert.ok(exists(path.join(root, "@App", "hooks")));
  });

  test("does nothing when the user cancels", async () => {
    stubInputBox(undefined);

    await newNestedFolder(fileEntry(path.join(root, "App.tsx")));

    assert.strictEqual(exists(path.join(root, "@App")), false);
  });

  test("shows an error when the nested folder already exists", async () => {
    stubInputBox("hooks");
    mkdir(root, path.join("@App", "hooks"));
    const errorStub = stubErrorMessage();

    await newNestedFolder(fileEntry(path.join(root, "App.tsx")));

    assert.ok(errorStub.calledOnce);
  });
});
