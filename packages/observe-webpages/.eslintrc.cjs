const baseEslintConfig = require('@pkerschbaum/config-eslint/eslint-ecma.cjs');

module.exports = {
  ...baseEslintConfig,
  parserOptions: {
    ...baseEslintConfig.parserOptions,
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [...(baseEslintConfig.ignorePatterns || []), '**/playwright-html-report/**'],
  rules: {
    ...baseEslintConfig.rules,
  },
};
