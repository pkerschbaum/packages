// @ts-check
const baseEslintConfig = require('@pkerschbaum/config-eslint/eslint-ecma.cjs');

module.exports = {
  ...baseEslintConfig,
  parserOptions: {
    ...baseEslintConfig.parserOptions,
    tsconfigRootDir: __dirname,
  },
  rules: {
    ...baseEslintConfig.rules,
    'n/no-process-env': 'off',
  },
};
