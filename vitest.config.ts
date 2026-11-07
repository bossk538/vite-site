// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'unit',
    // Safe to explicitly list your application test locations here
    include: ['src/pages/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    environment: 'jsdom',
  },
})
