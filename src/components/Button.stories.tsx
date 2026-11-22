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
    intent: 'primary',
    size: 'large',
    children: ['Primary Large'],
  },
};

export const Secondary: Story = {
  args: {
    intent: 'secondary',
    size: 'large',
    children: ['Secondary Large'],
  },
};
