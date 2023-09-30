import fs from 'node:fs';

import { check } from '@pkerschbaum/commons-ecma/util/assert';

export const fsUtils = {
  existsPath,
};

async function existsPath(path: string): Promise<boolean> {
  try {
    await fs.promises.access(path);
    return true;
  } catch (error) {
    if (check.isNotNullish(error) && error['code'] === 'ENOENT') {
      return false;
    }

    throw error;
  }
}
