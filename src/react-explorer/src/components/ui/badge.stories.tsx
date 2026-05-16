import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { Badge } from './badge';

const meta = {
  component: Badge,
  tags: ['ai-generated'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: 'Default' },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Secondary' },
};

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Destructive' },
};

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
};

// Single CssCheck story for the project. Badge default variant uses
// `bg-primary`, which resolves to `hsl(var(--primary))` = `hsl(240 5.9% 10%)`
// from src/index.css `:root`. If Tailwind / global CSS did not load, the
// computed background-color would not match.
export const CssCheck: Story = {
  args: { children: 'Order' },
  play: async ({ canvas }) => {
    const badge = await canvas.findByText(/order/i);
    await expect(getComputedStyle(badge).backgroundColor).toBe('rgb(24, 24, 27)');
  },
};
