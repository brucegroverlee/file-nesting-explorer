import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { moveDown } from "./moveDown";
import { SortingManager } from "../SortingManager";
import { fileNestingSystem } from "../FileNestingSystem";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry } from "../test/helpers/fixtures";
import { stubRefresh } from "../test/helpers/stubs";

suite("moveDown", () => {
  let root: string;
  let context: ReturnType<typeof createFakeExtensionContext>;
  let moveDownStub: sinon.SinonStub;

  setup(() => {
    root = createTempWorkspace({
      files: { "A.tsx": "", "B.tsx": "", "C.tsx": "" },
    });
    context = createFakeExtensionContext();
    moveDownStub = sinon.stub(SortingManager, "moveDown").resolves();
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

  test("delegates to SortingManager.moveDown with the parent and sibling names", async () => {
    const entry = fileEntry(path.join(root, "B.tsx"));

    await moveDown(context)(entry);

    assert.ok(
      moveDownStub.calledOnceWith(entry.path, root, [
        "A.tsx",
        "B.tsx",
        "C.tsx",
      ]),
    );
  });
});
