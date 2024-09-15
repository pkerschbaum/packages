import test, { expect } from '@playwright/test';
import path from 'node:path';

import { transform } from '#pkg/transformer';

const PATH_TO_TEST_FIXTURES = path.join(__dirname, '..', 'test-fixtures');
const fixtures = { fixture1: path.join(PATH_TO_TEST_FIXTURES, 'fixture-1') };

test('fixture-1', () => {
  transform({ project: fixtures.fixture1 });
});
