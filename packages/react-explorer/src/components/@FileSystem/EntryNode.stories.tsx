import type { Meta, StoryObj } from '@storybook/react-vite';

import { EntryNode } from './EntryNode';

import type { Entry } from '@file-nesting/shared';

const fileEntry: Entry = {
  type: 'file',
  name: 'index.ts',
  path: '/my-app/src/index.ts',
  extension: 'ts',
};

const folderEntry: Entry = {
  type: 'folder',
  name: 'components',
  path: '/my-app/src/components',
};

const nestingFileEntry: Entry = {
  type: 'file',
  name: 'Button.tsx',
  path: '/my-app/src/components/Button.tsx',
  extension: 'tsx',
  isNesting: true,
};

const meta = {
  component: EntryNode,
  tags: ['ai-generated'],
} satisfies Meta<typeof EntryNode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const File: Story = {
  args: { entry: fileEntry },
};

export const Folder: Story = {
  args: { entry: folderEntry },
};

export const NestingFile: Story = {
  args: { entry: nestingFileEntry },
};
