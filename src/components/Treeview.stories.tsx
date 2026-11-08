import type { Meta, StoryObj } from '@storybook/react-vite';
import { Treeview } from './Treeview';

// 1. Default export configures the component metadata
const meta: Meta<typeof Treeview> = {
  title: 'Components/Treeview', // Sidebar hierarchy location
  component: Treeview,          // The component itself
  tags: ['autodocs'],         // Enables automatic documentation
};

const tree = {
  heading: 'My Documents',
  group: [
    {
      heading: 'Projects',
      group: [
        { heading: 'project-1.docx', },
        { heading: 'project-2.docx', },
        { heading: 'Project 3',
          group: [
            { heading: 'project-3A.docx', },
            { heading: 'project-3B.docx', },
            { heading: 'project-3C.docx', },
          ],
        },
        { heading: 'project-4.docx', },
        { heading: 'Project 5',
          group: [
            { heading: 'project-5A.docx', },
            { heading: 'project-5B.docx', },
            { heading: 'project-5C.docx', },
            { heading: 'project-5D.docx', },
            { heading: 'project-5E.docx', },
            { heading: 'project-5F.docx', },
          ],
        },
      ],
    },
    {
      heading: 'Reports',
      group: [
        { heading: 'report-1',
          group: [
            { heading: 'report-1A.docx', },
            { heading: 'report-1B.docx', },
            { heading: 'report-1C.docx', },
          ],
        },
        { heading: 'report-2',
          group: [
            { heading: 'report-2A.docx', },
            { heading: 'report-2B.docx', },
            { heading: 'report-2C.docx', },
            { heading: 'report-2D.docx', },
          ],
        },
        { heading: 'report-3',
          group: [
            { heading: 'report-3A.docx', },
            { heading: 'report-3B.docx', },
            { heading: 'report-3C.docx', },
            { heading: 'report-3D.docx', },
          ],
        },
      ],
    },
    {
      heading: 'Letters',
      group: [
        { heading: 'letter-1',
          group: [
            { heading: 'letter-1A.docx', },
            { heading: 'letter-1B.docx', },
            { heading: 'letter-1C.docx', },
          ],
        },
        { heading: 'letter-2',
          group: [
            { heading: 'letter-2A.docx', },
            { heading: 'letter-2B.docx', },
            { heading: 'letter-2C.docx', },
            { heading: 'letter-2D.docx', },
          ],
        },
        { heading: 'letter-3',
          group: [
            { heading: 'letter-3A.docx', },
            { heading: 'letter-3B.docx', },
            { heading: 'letter-3C.docx', },
            { heading: 'letter-3D.docx', },
          ],
        },
      ],
    },
  ],
};

export default meta;
type Story = StoryObj<typeof Treeview>;

// 2. Named exports define individual component states (stories)
export const Primary: Story = {
  args: {
    tree,
    primary: true,
    label: 'Click Me',
  },
};

export const Secondary: Story = {
  args: {
    tree,
    primary: false,
    label: 'Cancel',
  },
};
