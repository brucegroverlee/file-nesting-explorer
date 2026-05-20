import * as assert from "assert";
import * as sinon from "sinon";

import { newNestedFileHint } from "./newNestedFileHint";
import {
  stubExecuteCommand,
  stubInformationMessage,
} from "../test/helpers/stubs";

suite("newNestedFileHint", () => {
  teardown(() => sinon.restore());

  test("focuses the explorer when the user accepts the hint", async () => {
    stubInformationMessage("Show File Nesting Explorer");
    const exec = stubExecuteCommand();

    await newNestedFileHint();

    assert.ok(exec.calledOnceWith("fileNestingExplorer.focus"));
  });

  test("does nothing when the user dismisses the hint", async () => {
    stubInformationMessage(undefined);
    const exec = stubExecuteCommand();

    await newNestedFileHint();

    assert.strictEqual(exec.called, false);
  });
});
