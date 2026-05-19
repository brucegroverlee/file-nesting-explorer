# Testing guide

A short tutorial on how to run, write, and debug the unit tests that protect the extension's behavior.

## Overview

There are two test layers in this repo:

- **Unit tests** — under [src/test/](../src/test/). They run inside a real VS Code test instance (`@vscode/test-cli`), so the `vscode` module is available naturally. UI and clipboard APIs are stubbed with `sinon`, and filesystem ops use real temp directories. This is what this guide covers.
- **UI tests** — under [src/ui-test/](../src/ui-test/). End-to-end smoke tests driven by `vscode-extension-tester`. Run with `npm run ui:test`. Not covered here.

## Running the suite

Full pipeline (compile + lint + tests):

```bash
npm test
```

Behind the scenes:

1. `pretest` runs `npm run compile` (TypeScript → `out/` + webview bundle) and `npm run lint`.
2. `vscode-test` reads [.vscode-test.mjs](../.vscode-test.mjs) (pattern `out/test/**/*.test.js`), launches a clean VS Code instance, and runs Mocha against the compiled tests.

## Running a single test or suite

The Mocha test grep flag works through `@vscode/test-cli`:

```bash
npm run compile
npx vscode-test --grep "copyEntry"
```

You can also focus a test in source by switching `test(...)` to `test.only(...)` (or `suite.only(...)`). Remember to remove it before committing — there's no CI guard for stray `.only`.

## Folder layout

Test files live next to the source files they protect:

```
src/
├── FileSystem.test.ts                  ← tests for FileSystem.ts
├── FileNestingSystem.test.ts
├── FileNestingDataProvider.test.ts
├── FileNestingTreeViewExplorer.test.ts
├── DragAndDropController.test.ts
├── ReactExplorerViewProvider.test.ts
├── commands/
│   ├── copyEntry.test.ts               ← tests for copyEntry.ts
│   ├── pasteEntry.test.ts
│   ├── … (one *.test.ts per command)
│   └── common/
│       └── getTargetEntries.test.ts
└── test/
    ├── extension.test.ts               ← placeholder (kept here)
    └── helpers/
        ├── tempWorkspace.ts   # create/cleanup unique temp dirs; writeFile / mkdir
        ├── fixtures.ts        # Entry factories: fileEntry / folderEntry / nestingFileEntry
        ├── stubs.ts           # sinon stub factories for vscode APIs
        └── fakeContext.ts     # in-memory ExtensionContext (globalState)
```

The runner glob in [.vscode-test.mjs](../.vscode-test.mjs) picks up `out/*.test.js`, `out/test/**/*.test.js`, and `out/commands/**/*.test.js` — intentionally excluding `out/ui-test/` (end-to-end tests, a separate concern).

## Writing a new test

Standard pattern: temp workspace + sinon stubs in `beforeEach`, `sinon.restore()` + cleanup in `afterEach`.

```ts
import * as assert from "assert";
import * as path from "path";
import * as sinon from "sinon";

import { copyEntry } from "./copyEntry";
import { createFakeExtensionContext } from "../test/helpers/fakeContext";
import {
  cleanupTempWorkspace,
  createTempWorkspace,
} from "../test/helpers/tempWorkspace";
import { fileEntry } from "../test/helpers/fixtures";
import {
  stubClipboard,
  stubRefresh,
  stubTreeSelection,
} from "../test/helpers/stubs";

suite("copyEntry", () => {
  let root: string;
  let context: ReturnType<typeof createFakeExtensionContext>;
  let clipboard: ReturnType<typeof stubClipboard>;

  beforeEach(() => {
    root = createTempWorkspace({ files: { "A.tsx": "" } });
    context = createFakeExtensionContext();
    clipboard = stubClipboard();
    stubRefresh();
    stubTreeSelection([]);
  });

  afterEach(() => {
    sinon.restore();
    cleanupTempWorkspace(root);
  });

  test("writes the path to the clipboard", async () => {
    const entry = fileEntry(path.join(root, "A.tsx"));
    await copyEntry(context)(entry);
    assert.ok(clipboard.write.calledOnceWith(entry.path));
  });
});
```

Two rules that matter in practice:

1. **Always `sinon.restore()` in `afterEach`.** Stubs leak across suites and cause confusing "already wrapped" errors.
2. **Never assume CWD.** Use absolute paths from `createTempWorkspace()`. The test workspace VS Code opens is unrelated.

## Helpers cheat sheet

| Helper | Purpose | Example |
| --- | --- | --- |
| `createTempWorkspace({ files, folders })` | Make a unique temp dir, seed files/folders | `root = createTempWorkspace({ files: { "App.tsx": "" } })` |
| `cleanupTempWorkspace(root)` | Recursive delete of a temp workspace | `cleanupTempWorkspace(root)` |
| `writeFile(root, rel, content)` / `mkdir(root, rel)` | Mutate the workspace inside a test | `writeFile(root, "sub/B.tsx", "")` |
| `exists(p)` / `readFile(p)` | Assert on the resulting filesystem | `assert.ok(exists(path.join(root, "@App")))` |
| `fileEntry(p)` / `folderEntry(p)` / `nestingFileEntry(p)` | Build `Entry` objects with the right `type` / `extension` / `isNesting` | `fileEntry(path.join(root, "A.tsx"))` |
| `createFakeExtensionContext()` | Minimal `ExtensionContext` with in-memory `globalState` | `await context.globalState.update("cutEntryPaths", […])` |
| `stubInputBox(value)` | Stub `vscode.window.showInputBox` | `stubInputBox("Component.tsx")` |
| `stubInformationMessage(answer)` / `stubWarningMessage(answer)` | Stub modal dialogs | `stubInformationMessage("Yes")` |
| `stubClipboard(initial?)` | Spy on `readText` / `writeText` with a backing buffer | `clipboard.write.calledOnceWith(…)` |
| `stubExecuteCommand()` | Swallow `vscode.commands.executeCommand` calls | `assert.ok(exec.calledOnceWith("workbench.action.findInFiles", …))` |
| `stubTreeSelection(entries)` | Override `fileNestingTreeViewExplorer.getSelection()` | `stubTreeSelection([a, b])` |
| `stubRefresh()` | No-op the data provider's refresh | `stubRefresh()` |
| `stubWorkspaceFolders(root)` | Pretend `root` is the open workspace | needed for `newFile` / `newFolder` root fallback |
| `stubAsRelativePath(root)` | Make `asRelativePath` work without a real workspace | needed for `copyEntryRelativePath`, `findInFolder` |

## Debugging

The simplest workflow:

```bash
npm run compile && npx vscode-test --grep "the test name"
```

To attach the VS Code debugger, add an "Extension Tests" launch configuration in `.vscode/launch.json` pointing at `out/test/**/*.test.js`. The `@vscode/test-electron` README has a copy-paste example.

When a test prints nothing but fails, suspect:

- A leaked stub (`sinon.restore()` missing in a previous `afterEach`).
- A stale `out/` from before TS changes — re-run `npm run compile`.
- The Mocha global timeout (2s by default). For tests that exercise `refresh(wait=true)`, that's 500ms — fine; for anything that polls, raise it explicitly with `this.timeout(...)`.
