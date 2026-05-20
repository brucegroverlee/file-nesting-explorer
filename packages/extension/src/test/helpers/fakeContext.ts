import * as vscode from "vscode";

/**
 * Minimal in-memory ExtensionContext used by tests. Only `globalState` is
 * implemented because that is the only context surface used by the commands
 * under test (cutEntryPaths / copiedEntryPaths / welcomeHintShown).
 */
export const createFakeExtensionContext = (
  overrides: Partial<{
    extensionMode: vscode.ExtensionMode;
  }> = {},
) => {
  const store = new Map<string, unknown>();

  const globalState = {
    keys: () => Array.from(store.keys()),
    get: <T>(key: string, defaultValue?: T): T | undefined => {
      return store.has(key) ? (store.get(key) as T) : defaultValue;
    },
    update: (key: string, value: unknown) => {
      if (value === null || value === undefined) {
        store.delete(key);
      } else {
        store.set(key, value);
      }
      return Promise.resolve();
    },
    setKeysForSync: (_keys: readonly string[]) => {
      /* no-op */
    },
  };

  return {
    globalState,
    extensionMode:
      overrides.extensionMode ?? vscode.ExtensionMode.Test,
    subscriptions: [] as { dispose(): unknown }[],
  } as unknown as vscode.ExtensionContext;
};

export type FakeExtensionContext = ReturnType<typeof createFakeExtensionContext>;
