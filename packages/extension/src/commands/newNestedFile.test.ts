import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import {
  createNestedFile,
  newNestedFile,
} from "./newNestedFile";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
  readFile,
} from "../test/helpers/tempWorkspace";
import { fileEntry } from "../test/helpers/fixtures";
import {
  stubErrorMessage,
  stubExecuteCommand,
  stubInputBox,
} from "../test/helpers/stubs";

suite("newNestedFile", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({ files: { "App.tsx": "" } });
    stubExecuteCommand();
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("createNestedFile creates the @<name> container if missing and writes the file", async () => {
    await createNestedFile(
      fileEntry(path.join(root, "App.tsx")),
      "Button.tsx",
    );

    assert.ok(exists(path.join(root, "@App")));
    assert.ok(exists(path.join(root, "@App", "Button.tsx")));
  });

  test("createNestedFile writes the provided content", async () => {
    await createNestedFile(
      fileEntry(path.join(root, "App.tsx")),
      "Button.tsx",
      "export const Button = () => null;",
    );

    assert.strictEqual(
      readFile(path.join(root, "@App", "Button.tsx")),
      "export const Button = () => null;",
    );
  });

  test("createNestedFile shows an error when the file already exists", async () => {
    const errorStub = stubErrorMessage();
    await createNestedFile(
      fileEntry(path.join(root, "App.tsx")),
      "Button.tsx",
    );

    await createNestedFile(
      fileEntry(path.join(root, "App.tsx")),
      "Button.tsx",
    );

    assert.ok(errorStub.calledOnce);
  });

  test("newNestedFile prompts for a name and creates it", async () => {
    stubInputBox("Card.tsx");

    await newNestedFile(fileEntry(path.join(root, "App.tsx")));

    assert.ok(exists(path.join(root, "@App", "Card.tsx")));
  });

  test("newNestedFile does nothing when the user cancels", async () => {
    stubInputBox(undefined);

    await newNestedFile(fileEntry(path.join(root, "App.tsx")));

    assert.strictEqual(exists(path.join(root, "@App")), false);
  });
});
