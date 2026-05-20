import type { Meta, StoryObj } from '@storybook/react-vite';

import { MaterialIcon } from './MaterialIcon';

const meta = {
  component: MaterialIcon,
  tags: ['ai-generated'],
} satisfies Meta<typeof MaterialIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

// `window.__materialIconBaseUri` is only injected by the VS Code extension
// host. In Storybook it's undefined, so MaterialIcon renders a placeholder
// span that preserves layout — this is the documented fallback path.
export const FileTsx: Story = {
  args: { name: 'Component.tsx', type: 'file' },
};

export const FileJson: Story = {
  args: { name: 'package.json', type: 'file' },
};

export const FolderClosed: Story = {
  args: { name: 'src', type: 'folder', open: false },
};

export const FolderOpen: Story = {
  args: { name: 'src', type: 'folder', open: true },
};
