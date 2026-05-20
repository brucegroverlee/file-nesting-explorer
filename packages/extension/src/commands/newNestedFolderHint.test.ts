import * as assert from "assert";
import * as sinon from "sinon";

import { newNestedFolderHint } from "./newNestedFolderHint";
import {
  stubExecuteCommand,
  stubInformationMessage,
} from "../test/helpers/stubs";

suite("newNestedFolderHint", () => {
  teardown(() => sinon.restore());

  test("focuses the explorer when the user accepts the hint", async () => {
    stubInformationMessage("Show File Nesting Explorer");
    const exec = stubExecuteCommand();

    await newNestedFolderHint();

    assert.ok(exec.calledOnceWith("fileNestingExplorer.focus"));
  });

  test("does nothing when the user dismisses the hint", async () => {
    stubInformationMessage(undefined);
    const exec = stubExecuteCommand();

    await newNestedFolderHint();

    assert.strictEqual(exec.called, false);
  });
});
