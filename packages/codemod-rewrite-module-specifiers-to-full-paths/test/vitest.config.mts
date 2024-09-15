import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, configDefaults } from 'vitest/config';

const config = defineConfig({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any -- works correctly
  plugins: [tsconfigPaths() as any],
  test: {
    coverage: {
      provider: 'v8',
      all: true,
      reporter: ['lcovonly'],
      enabled: true,
      exclude: configDefaults.coverage.exclude ?? [],
    },
  },
});

/* eslint-disable import/no-default-export -- the config must be default-exported */
export default config;
/* eslint-enable import/no-default-export */
