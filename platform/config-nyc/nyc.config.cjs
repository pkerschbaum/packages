module.exports = {
  extension: ['.ts', '.cts', '.mts', '.tsx', '.ctsx', '.mtsx'],
  exclude: ['**/*.d.ts', '**/*.d.cts', '**/*.d.mts', '**/*.d.tsx', '**/*.d.ctsx', '**/*.d.mtsx'],
  all: true,
  excludeAfterRemap: 'false',
  reporter: ['html', 'lcov'],
};
