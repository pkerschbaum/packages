const path = require('node:path');

const baseConfig = require('@pkerschbaum/config-nyc/nyc.config.cjs');

const projectRoot = path.join(__dirname, '..');

module.exports = {
  ...baseConfig,
  cwd: projectRoot,
};
