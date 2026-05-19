import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { deleteFileNestingContainer } from "./deleteFileNestingContainer";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
  exists,
} from "../test/helpers/tempWorkspace";
import { nestingFileEntry } from "../test/helpers/fixtures";
import { stubInformationMessage } from "../test/helpers/stubs";

suite("deleteFileNestingContainer", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({
      files: { "App.tsx": "", "@App/nested.tsx": "" },
    });
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("deletes the container folder after the user confirms", async () => {
    stubInformationMessage("Yes");

    await deleteFileNestingContainer(
      nestingFileEntry(path.join(root, "App.tsx")),
    );

    assert.strictEqual(exists(path.join(root, "@App")), false);
    assert.ok(exists(path.join(root, "App.tsx")));
  });

  test("does not delete when the user cancels", async () => {
    stubInformationMessage(undefined);

    await deleteFileNestingContainer(
      nestingFileEntry(path.join(root, "App.tsx")),
    );

    assert.ok(exists(path.join(root, "@App")));
  });

  test("does nothing when the container does not exist", async () => {
    const info = stubInformationMessage("Yes");
    cleanupTempWorkspace(root);
    root = createTempWorkspace({ files: { "App.tsx": "" } });

    await deleteFileNestingContainer(
      nestingFileEntry(path.join(root, "App.tsx")),
    );

    assert.strictEqual(info.called, false);
  });
});
