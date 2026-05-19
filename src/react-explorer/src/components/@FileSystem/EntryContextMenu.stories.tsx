import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { EntryContextMenu, type EntryKind } from "./EntryContextMenu";

import type { Entry } from "../../../../Entry";

const folderEntry: Entry = {
  type: "folder",
  name: "components",
  path: "/my-app/src/components",
};

const plainFileEntry: Entry = {
  type: "file",
  name: "README.md",
  path: "/my-app/README.md",
  extension: "md",
};

const fileWithNestingExtEntry: Entry = {
  type: "file",
  name: "Button.tsx",
  path: "/my-app/src/components/Button.tsx",
  extension: "tsx",
};

const nestingFileEntry: Entry = {
  type: "file",
  name: "Button.tsx",
  path: "/my-app/src/components/Button.tsx",
  extension: "tsx",
  isNesting: true,
};

/**
 * The menu mounts in a portal, so we look up items inside `document.body`
 * (Storybook's `canvas` is scoped to the story root).
 */
const findMenuItem = (label: string | RegExp) =>
  within(document.body).findByRole("menuitem", { name: label });

/**
 * Right-clicks the trigger element rendered by every story. The trigger is
 * tagged with `data-testid="ctx-trigger"` below so it's easy to find from a
 * `play` function regardless of the rendered label.
 */
const openMenu = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);
  const trigger = await canvas.findByTestId("ctx-trigger");
  await userEvent.pointer({ keys: "[MouseRight>]", target: trigger });
  return trigger;
};

type StoryArgs = {
  entry: Entry;
  kind?: EntryKind;
  label: string;
};

const meta = {
  title: "FileSystem/EntryContextMenu",
  component: EntryContextMenu,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
  // The trigger MUST be the direct child of `EntryContextMenu` because Radix's
  // `asChild` only forwards props/ref one level deep. Wrapping the `<div>` in
  // a function component (without `forwardRef` + prop spreading) would swallow
  // the `onContextMenu` handler and the menu would never open on right-click.
  render: ({ entry, kind, label }: StoryArgs) => (
    <EntryContextMenu
      entry={entry}
      kind={kind}
      onCommand={(command, target) =>
        console.log(`[story] ${command} on ${target.name}`)
      }
    >
      <div
        data-testid="ctx-trigger"
        className="inline-flex items-center justify-center rounded border border-dashed border-[var(--vscode-widget-border,#888)] px-6 py-10 text-sm text-[var(--vscode-foreground)]"
      >
        Right-click here — {label}
      </div>
    </EntryContextMenu>
  ),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<StoryArgs>;

export const Folder: Story = {
  args: {
    entry: folderEntry,
    kind: "folder",
    label: "Folder",
  },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    await waitFor(async () => {
      await expect(await findMenuItem("New File…")).toBeInTheDocument();
      await expect(await findMenuItem("New Folder…")).toBeInTheDocument();
      await expect(await findMenuItem("Find in Folder…")).toBeInTheDocument();
      await expect(
        await findMenuItem("Restore Sorting Alphabetically"),
      ).toBeInTheDocument();
    });
  },
};

export const PlainFile: Story = {
  name: "File (no nesting extension)",
  args: {
    entry: plainFileEntry,
    kind: "file",
    label: "Plain file",
  },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    await waitFor(async () => {
      await expect(await findMenuItem("Cut")).toBeInTheDocument();
      await expect(await findMenuItem("Delete")).toBeInTheDocument();
      // The "new nested" items must NOT show for plain files.
      const root = within(document.body);
      expect(root.queryByRole("menuitem", { name: "New Nested File…" })).toBe(
        null,
      );
      expect(
        root.queryByRole("menuitem", { name: "Enable Nested Files" }),
      ).toBe(null);
    });
  },
};

export const FileWithNestingExtension: Story = {
  name: "File with nesting extension",
  args: {
    entry: fileWithNestingExtEntry,
    kind: "file_with_nesting_extension",
    label: "File with nesting extension",
  },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    await waitFor(async () => {
      await expect(await findMenuItem("New Nested File…")).toBeInTheDocument();
      await expect(
        await findMenuItem("New Nested Folder…"),
      ).toBeInTheDocument();
      await expect(
        await findMenuItem("Enable Nested Files"),
      ).toBeInTheDocument();
      // Sorting items only apply to folders / nesting files.
      expect(
        within(document.body).queryByRole("menuitem", {
          name: "Edit Sorting File",
        }),
      ).toBe(null);
    });
  },
};

export const NestingFile: Story = {
  name: "Nesting file (currently nesting children)",
  args: {
    entry: nestingFileEntry,
    kind: "nesting_file",
    label: "Nesting file",
  },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    await waitFor(async () => {
      await expect(await findMenuItem("New Nested File…")).toBeInTheDocument();
      await expect(
        await findMenuItem(/Delete Nested Files/),
      ).toBeInTheDocument();
      await expect(await findMenuItem("Edit Sorting File")).toBeInTheDocument();
      // Once nesting is active, the "enable" action should be gone.
      expect(
        within(document.body).queryByRole("menuitem", {
          name: "Enable Nested Files",
        }),
      ).toBe(null);
    });
  },
};

/**
 * Sanity check the inference path: omit `kind` and verify the menu still
 * derives the right shape from the `Entry` fields alone. A folder entry
 * should yield the folder menu without an explicit `kind`.
 */
export const InferredFromEntry: Story = {
  name: "Kind inferred from Entry",
  args: {
    entry: folderEntry,
    label: "Folder (kind inferred)",
  },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    await expect(await findMenuItem("New File…")).toBeInTheDocument();
  },
};
