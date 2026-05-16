import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { FileEntry } from './FileEntry';

import type { Entry } from '../../../../Entry';

const fileEntry: Entry = {
  type: 'file',
  name: 'App.tsx',
  path: '/my-app/src/App.tsx',
  extension: 'tsx',
};

const meta = {
  component: FileEntry,
  tags: ['ai-generated'],
} satisfies Meta<typeof FileEntry>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { entry: fileEntry, depth: 0 },
  // Smoke check: the file's name (a prop value) reaches the DOM.
  play: async ({ canvas }) => {
    await expect(canvas.getByText('App.tsx')).toBeInTheDocument();
  },
};

export const Indented: Story = {
  args: { entry: fileEntry, depth: 3 },
};

export const LongName: Story = {
  args: {
    entry: {
      type: 'file',
      name: 'this-is-a-really-long-file-name-that-should-truncate.tsx',
      path: '/my-app/src/this-is-a-really-long-file-name-that-should-truncate.tsx',
      extension: 'tsx',
    },
    depth: 1,
  },
};
