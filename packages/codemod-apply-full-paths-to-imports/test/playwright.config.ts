// extend "expect" API with some additional assertions
import '@pkerschbaum/playwright-utils/extend-expect';

import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testMatch: [/src\/.+\.spec\.ts/i],
  testDir: '..',
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFilePath}/{arg}{ext}',
};

/* eslint-disable import/no-default-export -- the config must be default-exported for the "playwright test" command */
export default config;
/* eslint-enable import/no-default-export */
