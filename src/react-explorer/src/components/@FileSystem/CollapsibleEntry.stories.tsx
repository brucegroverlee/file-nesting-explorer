import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, waitFor } from "storybook/test";

import { CollapsibleEntry } from "./CollapsibleEntry";

import type { Entry } from "../../../../Entry";

const folderEntry: Entry = {
  type: "folder",
  name: "components",
  path: "/my-app/src/components",
};

const nestingFileEntry: Entry = {
  type: "file",
  name: "Button.tsx",
  path: "/my-app/src/components/Button.tsx",
  extension: "tsx",
  isNesting: true,
};

const meta = {
  component: CollapsibleEntry,
  tags: ["ai-generated"],
} satisfies Meta<typeof CollapsibleEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Folder: Story = {
  args: { entry: folderEntry, depth: 0 },
};

export const NestingFile: Story = {
  args: { entry: nestingFileEntry, depth: 1 },
};

// Interaction: clicking the folder row itself toggles the Collapsible.
// For folders the SelectableRow acts as the trigger (there is no separate
// chevron button), so we click it and assert that the row's
// `data-state` switches from "closed" to "open".
export const TogglesOpen: Story = {
  args: { entry: folderEntry, depth: 0 },
  play: async ({ canvas, userEvent }) => {
    const row = canvas.getByRole("button");
    await expect(row).toHaveAttribute("data-state", "closed");
    await userEvent.click(row);
    await waitFor(() => expect(row).toHaveAttribute("data-state", "open"));
  },
};

// --- Visual states ----------------------------------------------------------
// Each story below pins one combination of (selectionState, focusState,
// isContextTarget) by passing them as explicit overrides. This lets us
// exercise the rendering without depending on the global selection/focus
// stores or the user actually clicking the row.

export const FolderUnselected: Story = {
  name: "Folder · unselected",
  args: {
    entry: folderEntry,
    depth: 0,
    selectionState: "unselected",
    focusState: "inactive",
  },
};

export const FolderSelectedFocused: Story = {
  name: "Folder · selected (focused / blue)",
  args: {
    entry: folderEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "focused",
  },
};

export const FolderSelectedInactive: Story = {
  name: "Folder · selected (inactive / grey)",
  args: {
    entry: folderEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "inactive",
  },
};

export const FolderContextTargetOnly: Story = {
  name: "Folder · context target (right-clicked, not selected)",
  args: {
    entry: folderEntry,
    depth: 0,
    selectionState: "unselected",
    focusState: "inactive",
    isContextTarget: true,
  },
};

export const FolderContextTargetWhileOtherSelected: Story = {
  name: "Folder · context target + another row selected (inactive)",
  args: {
    entry: folderEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "inactive",
    isContextTarget: true,
  },
};

export const NestingFileUnselected: Story = {
  name: "Nesting file · unselected",
  args: {
    entry: nestingFileEntry,
    depth: 0,
    selectionState: "unselected",
    focusState: "inactive",
  },
};

export const NestingFileSelectedFocused: Story = {
  name: "Nesting file · selected (focused / blue)",
  args: {
    entry: nestingFileEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "focused",
  },
};

export const NestingFileSelectedInactive: Story = {
  name: "Nesting file · selected (inactive / grey)",
  args: {
    entry: nestingFileEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "inactive",
  },
};

export const NestingFileContextTargetOnly: Story = {
  name: "Nesting file · context target (right-clicked, not selected)",
  args: {
    entry: nestingFileEntry,
    depth: 0,
    selectionState: "unselected",
    focusState: "inactive",
    isContextTarget: true,
  },
};

export const NestingFileContextTargetWhileOtherSelected: Story = {
  name: "Nesting file · context target + another row selected (inactive)",
  args: {
    entry: nestingFileEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "inactive",
    isContextTarget: true,
  },
};

export const NestingFileActiveEditor: Story = {
  name: "Nesting file · active editor",
  args: {
    entry: nestingFileEntry,
    depth: 0,
    isActiveEditor: true,
    selectionState: "selected",
    focusState: "focused",
  },
};
