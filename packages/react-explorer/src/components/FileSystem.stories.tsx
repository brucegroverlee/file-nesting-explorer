import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { FileSystem } from "./FileSystem";

import type { Entry } from "@file-nesting/shared";

const sampleTree: Entry[] = [
  {
    type: "folder",
    name: "src",
    path: "/my-app/src",
  },
  {
    type: "file",
    name: "package.json",
    path: "/my-app/package.json",
    extension: "json",
  },
  {
    type: "file",
    name: "README.md",
    path: "/my-app/README.md",
    extension: "md",
  },
];

const meta = {
  component: FileSystem,
  tags: ["ai-generated"],
} satisfies Meta<typeof FileSystem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: { entries: [] },
};

export const Roots: Story = {
  args: { entries: sampleTree },
  // Smoke check: confirm the entries from `args` rendered as text in the DOM.
  // `toBeVisible()` alone would only prove the wrapper mounted.
  play: async ({ canvas }) => {
    await expect(canvas.getByText("src")).toBeInTheDocument();
    await expect(canvas.getByText("package.json")).toBeInTheDocument();
    await expect(canvas.getByText("README.md")).toBeInTheDocument();
  },
};

export const NestingFile: Story = {
  args: {
    entries: [
      {
        type: "file",
        name: "Button.tsx",
        path: "/my-app/src/Button.tsx",
        extension: "tsx",
        isNesting: true,
      },
      {
        type: "file",
        name: "index.ts",
        path: "/my-app/src/index.ts",
        extension: "ts",
      },
    ],
  },
};
