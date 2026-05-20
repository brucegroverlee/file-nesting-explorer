import type { Meta, StoryObj } from '@storybook/react-vite';

import { ScrollArea } from './scroll-area';

const meta = {
  component: ScrollArea,
  tags: ['ai-generated'],
} satisfies Meta<typeof ScrollArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const longList = Array.from({ length: 40 }, (_, i) => `Item ${i + 1}`);

export const Vertical: Story = {
  args: {
    className: 'h-48 w-56 rounded border',
    children: (
      <div className="p-2 text-sm">
        {longList.map((item) => (
          <div key={item} className="py-1">
            {item}
          </div>
        ))}
      </div>
    ),
  },
};

export const Short: Story = {
  args: {
    className: 'h-48 w-56 rounded border',
    children: (
      <div className="p-2 text-sm">
        <div>Single line</div>
      </div>
    ),
  },
};
