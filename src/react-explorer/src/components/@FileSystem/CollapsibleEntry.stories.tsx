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

// Interaction: clicking the trigger toggles `aria-expanded` on the
// CollapsibleTrigger button — proves Radix Collapsible is wired up and
// the open/close state machine in CollapsibleEntry actually responds.
export const TogglesOpen: Story = {
  args: { entry: folderEntry, depth: 0 },
  play: async ({ canvas, userEvent }) => {
    // Two buttons render: [0] is the wrapper <div role="button">,
    // [1] is the real <button> inside <CollapsibleTrigger asChild>.
    const trigger = canvas.getAllByRole("button")[1];
    await expect(trigger).toHaveAttribute("data-state", "closed");
    await userEvent.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute("data-state", "open"));
  },
};
