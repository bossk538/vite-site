// vitest.storybook.config.ts
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config' // or your base vitest config
import { storybookTest } from '@storybook/experimental-nextjs-vite' // or your framework's storybook plugin

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      storybookTest({
        // This configuration will safely look at your main.js/ts "stories" field automatically
      }),
    ],
    test: {
      name: 'storybook',
      // No "test.include" needed here anymore as per the warning
    },
  })
)

