import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';

const meta = {
  component: Card,
  tags: ['ai-generated'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    className: 'w-72',
    children: (
      <>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>my-app</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs">3 folders, 12 files</p>
        </CardContent>
        <CardFooter>
          <span className="text-xs text-muted-foreground">Updated just now</span>
        </CardFooter>
      </>
    ),
  },
};

export const HeaderOnly: Story = {
  args: {
    className: 'w-72',
    children: (
      <CardHeader>
        <CardTitle>Header only</CardTitle>
      </CardHeader>
    ),
  },
};
