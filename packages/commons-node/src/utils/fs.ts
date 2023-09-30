import fs = require('node:fs');

import assertModule = require('@pkerschbaum/commons-ecma/util/assert');

const { check } = assertModule;

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

export = {
  fsUtils: {
    existsPath,
  },
};
