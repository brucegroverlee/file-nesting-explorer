import * as assert from "assert";
import * as path from "path";

import {
  normalizeNFC,
  validateExist,
  validateFiles,
} from "./FileSystem";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "./test/helpers/tempWorkspace";

suite("FileSystem", () => {
  let root: string;

  setup(() => {
    root = createTempWorkspace({ files: { "A.tsx": "" } });
  });

  teardown(() => {
    cleanupTempWorkspace(root);
  });

  suite("normalizeNFC", () => {
    test("returns the same string for ASCII input", () => {
      assert.strictEqual(normalizeNFC("hello"), "hello");
    });

    test("returns the same array shape for an array input", () => {
      const out = normalizeNFC(["a", "b"]);
      assert.deepStrictEqual(out, ["a", "b"]);
    });
  });

  suite("validateExist", () => {
    test("resolves true for an existing file", async () => {
      assert.strictEqual(await validateExist(path.join(root, "A.tsx")), true);
    });

    test("resolves false for a missing path", async () => {
      assert.strictEqual(
        await validateExist(path.join(root, "missing.tsx")),
        false,
      );
    });
  });

  suite("validateFiles", () => {
    test("returns true when every path exists", async () => {
      assert.strictEqual(
        await validateFiles([path.join(root, "A.tsx")]),
        true,
      );
    });

    test("returns false when any path is missing", async () => {
      assert.strictEqual(
        await validateFiles([
          path.join(root, "A.tsx"),
          path.join(root, "missing.tsx"),
        ]),
        false,
      );
    });
  });
});
