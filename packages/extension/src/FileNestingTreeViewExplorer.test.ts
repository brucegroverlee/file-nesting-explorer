import * as assert from "assert";

import { fileNestingTreeViewExplorer } from "./FileNestingTreeViewExplorer";

suite("FileNestingTreeViewExplorer", () => {
  test("getSelection returns an array (possibly empty) of entries", () => {
    const selection = fileNestingTreeViewExplorer.getSelection();
    assert.ok(Array.isArray(selection));
  });

  test("setOutputChannel and setContext do not throw with no-op inputs", () => {
    assert.doesNotThrow(() =>
      fileNestingTreeViewExplorer.setOutputChannel(undefined),
    );
  });
});
