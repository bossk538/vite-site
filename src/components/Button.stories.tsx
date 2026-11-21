// src/components/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';

// 1. Default export configures the component metadata
const meta: Meta<typeof Button> = {
  title: 'Components/Button', // Sidebar hierarchy location
  component: Button,          // The component itself
  tags: ['autodocs'],         // Enables automatic documentation
};

export default meta;
type Story = StoryObj<typeof Button>;

// 2. Named exports define individual component states (stories)
export const Primary: Story = {
  args: {
//    primary: true,
//    label: 'Click Me',
    intent: 'primary',
    size: 'large',
    children: ['foo'],
  },
};

export const Secondary: Story = {
  args: {
//    primary: false,
//    label: 'Cancel',
    intent: 'secondary',
    size: 'large',
    children: ['nar'],
  },
};
