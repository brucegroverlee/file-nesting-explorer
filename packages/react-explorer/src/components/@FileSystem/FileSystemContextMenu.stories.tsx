import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { FileSystemContextMenu } from "./FileSystemContextMenu";

/**
 * The menu mounts in a portal so we look up items inside `document.body`
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

const meta = {
  title: "FileSystem/FileSystemContextMenu",
  component: FileSystemContextMenu,
  tags: ["ai-generated"],
  parameters: {
    layout: "centered",
  },
  // The trigger MUST be the direct child of `FileSystemContextMenu` because
  // Radix's `asChild` only forwards props/ref one level deep. Wrapping the
  // `<div>` in a function component (without `forwardRef` + prop spreading)
  // would swallow the `onContextMenu` handler and the menu would never open
  // on right-click.
  render: () => (
    <FileSystemContextMenu
      onCommand={(command) => console.log(`[story] ${command}`)}
    >
      <div
        data-testid="ctx-trigger"
        className="inline-flex items-center justify-center rounded border border-dashed border-[var(--vscode-widget-border,#888)] px-10 py-14 text-sm text-[var(--vscode-foreground)]"
      >
        Right-click here — empty file system area
      </div>
    </FileSystemContextMenu>
  ),
} satisfies Meta<typeof FileSystemContextMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    await waitFor(async () => {
      await expect(await findMenuItem("New File…")).toBeInTheDocument();
      await expect(await findMenuItem("New Folder…")).toBeInTheDocument();
      await expect(await findMenuItem("Paste")).toBeInTheDocument();
      await expect(await findMenuItem("Refresh")).toBeInTheDocument();
    });
  },
};

/**
 * Sanity check that the `onCommand` prop intercepts the dispatch: instead of
 * forwarding to the host bridge, it should call our spy. We verify by
 * clicking "Paste" and asserting our callback receives the matching
 * command id.
 */
export const InterceptsOnCommand: Story = {
  name: "onCommand intercepts dispatch",
  render: () => {
    const calls: string[] = [];
    return (
      <div className="flex flex-col items-center gap-2">
        <FileSystemContextMenu
          onCommand={(command) => {
            calls.push(command);
            // Expose via a data attribute so `play` can read it without
            // wiring a full state-management dance.
            const sink = document.querySelector<HTMLElement>("[data-sink]");
            if (sink) sink.dataset.lastCommand = command;
          }}
        >
          <div
            data-testid="ctx-trigger"
            className="inline-flex items-center justify-center rounded border border-dashed border-[var(--vscode-widget-border,#888)] px-10 py-14 text-sm text-[var(--vscode-foreground)]"
          >
            Right-click here — interception
          </div>
        </FileSystemContextMenu>
        <pre
          data-sink
          className="text-xs text-[var(--vscode-foreground)]"
        >
          last command: (none)
        </pre>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await openMenu(canvasElement);
    const pasteItem = await findMenuItem("Paste");
    await userEvent.click(pasteItem);
    await waitFor(() => {
      const sink = canvasElement.querySelector<HTMLElement>("[data-sink]");
      expect(sink?.dataset.lastCommand).toBe("fileNestingExplorer.paste");
    });
  },
};
