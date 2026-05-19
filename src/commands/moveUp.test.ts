import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { moveUp } from "./moveUp";
import { SortingManager } from "../SortingManager";
import { fileNestingSystem } from "../FileNestingSystem";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry } from "../test/helpers/fixtures";
import { stubRefresh } from "../test/helpers/stubs";

suite("moveUp", () => {
  let root: string;
  let context: ReturnType<typeof createFakeExtensionContext>;
  let moveUpStub: sinon.SinonStub;

  setup(() => {
    root = createTempWorkspace({
      files: { "A.tsx": "", "B.tsx": "", "C.tsx": "" },
    });
    context = createFakeExtensionContext();
    moveUpStub = sinon.stub(SortingManager, "moveUp").resolves();
    sinon.stub(fileNestingSystem, "getChildrenFromFolder").resolves([
      fileEntry(path.join(root, "A.tsx")),
      fileEntry(path.join(root, "B.tsx")),
      fileEntry(path.join(root, "C.tsx")),
    ]);
    stubRefresh();
  });

  teardown(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("delegates to SortingManager.moveUp with the parent and sibling names", async () => {
    const entry = fileEntry(path.join(root, "B.tsx"));

    await moveUp(context)(entry);

    assert.ok(
      moveUpStub.calledOnceWith(entry.path, root, [
        "A.tsx",
        "B.tsx",
        "C.tsx",
      ]),
    );
  });
});
