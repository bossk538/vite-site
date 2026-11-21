import type { Preview } from '@storybook/react-vite'
import { ThemeProvider } from '../src/theme/ThemeProvider';
import type { Brand, Mode } from '../src/tokens/themes.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  globalTypes: {
    brand: {
      description: 'Active brand',
      toolbar: {
        title: 'Brand',
        icon: 'globe',
        items: [
          { value: 'brandA', title: 'Brand A' },
          { value: 'brandB', title: 'Brand B' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    brand: 'brandA',
    mode: 'light',
  },
  decorators: [
    (Story, context) => {
      const { brand, mode } = context.globals;
      return <ThemeProvider brand={brand} mode={mode}><Story /></ThemeProvider>;
      return (
        <div
          data-brand={brand}
          data-theme={mode}
          className={`${brand} ${brand}-${mode}`}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
