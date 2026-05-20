import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FileEntry } from "./FileEntry";

import type { Entry } from "@file-nesting/shared";

const fileEntry: Entry = {
  type: "file",
  name: "App.tsx",
  path: "/my-app/src/App.tsx",
  extension: "tsx",
};

const meta = {
  component: FileEntry,
  tags: ["ai-generated"],
} satisfies Meta<typeof FileEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { entry: fileEntry, depth: 0 },
  // Smoke check: the file's name (a prop value) reaches the DOM.
  play: async ({ canvas }) => {
    await expect(canvas.getByText("App.tsx")).toBeInTheDocument();
  },
};

export const Indented: Story = {
  args: { entry: fileEntry, depth: 3 },
};

export const LongName: Story = {
  args: {
    entry: {
      type: "file",
      name: "this-is-a-really-long-file-name-that-should-truncate.tsx",
      path: "/my-app/src/this-is-a-really-long-file-name-that-should-truncate.tsx",
      extension: "tsx",
    },
    depth: 1,
  },
};

// --- Visual states ----------------------------------------------------------
// Each story below pins one combination of (selectionState, focusState,
// isContextTarget) by passing them as explicit overrides. This lets us
// exercise the rendering without depending on the global selection/focus
// stores or the user actually clicking the row.

export const Unselected: Story = {
  args: {
    entry: fileEntry,
    depth: 0,
    selectionState: "unselected",
    focusState: "inactive",
  },
};

export const SelectedFocused: Story = {
  name: "Selected (focused / blue)",
  args: {
    entry: fileEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "focused",
  },
};

export const SelectedInactive: Story = {
  name: "Selected (inactive / grey)",
  args: {
    entry: fileEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "inactive",
  },
};

export const ContextTargetOnly: Story = {
  name: "Context target (right-clicked, not selected)",
  args: {
    entry: fileEntry,
    depth: 0,
    selectionState: "unselected",
    focusState: "inactive",
    isContextTarget: true,
  },
};

export const ContextTargetWhileOtherSelected: Story = {
  name: "Context target + another row selected (inactive)",
  args: {
    entry: fileEntry,
    depth: 0,
    selectionState: "selected",
    focusState: "inactive",
    isContextTarget: true,
  },
};

export const ActiveEditor: Story = {
  args: {
    entry: fileEntry,
    depth: 0,
    isActiveEditor: true,
    selectionState: "selected",
    focusState: "focused",
  },
};
