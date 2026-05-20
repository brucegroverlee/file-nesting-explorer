import * as assert from "assert";
import { beforeEach, describe, it } from "mocha";

import {
  ActivityBar,
  CustomTreeSection,
  SideBarView,
  VSBrowser,
} from "vscode-extension-tester";

describe("File Nesting Explorer UI", function () {
  this.timeout(120000);

  beforeEach(async function () {
    await VSBrowser.instance.waitForWorkbench();
  });

  it("opens File Nesting Explorer in the Explorer panel", async function () {
    const activityBar = new ActivityBar();
    const explorerView = await activityBar.getViewControl("Explorer");

    assert.ok(explorerView, "Explorer view control was not found");

    await explorerView.openView();

    const sideBar = new SideBarView();
    const fileNestingSection = await sideBar
      .getContent()
      .getSection("File Nesting Explorer", CustomTreeSection);

    assert.strictEqual(
      await fileNestingSection.getTitle(),
      "File Nesting Explorer"
    );

    await fileNestingSection.expand();

    assert.strictEqual(await fileNestingSection.isExpanded(), true);
  });
});
