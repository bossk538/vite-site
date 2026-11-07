import type { Meta, StoryObj } from '@storybook/react-vite';
import { Treeview } from './Button';

// 1. Default export configures the component metadata
const meta: Meta<typeof Treeview> = {
  title: 'Components/Treeview', // Sidebar hierarchy location
  component: Treeview,          // The component itself
  tags: ['autodocs'],         // Enables automatic documentation
};

export default meta;
type Story = StoryObj<typeof Treeview>;

// 2. Named exports define individual component states (stories)
export const Primary: Story = {
  args: {
    primary: true,
    label: 'Click Me',
  },
};

export const Secondary: Story = {
  args: {
    primary: false,
    label: 'Cancel',
  },
};
