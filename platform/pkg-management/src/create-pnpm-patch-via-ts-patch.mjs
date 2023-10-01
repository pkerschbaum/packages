import '#pkg/polyfill-explicit-resource-management.mjs';

import { findWorkspaceDir } from '@pnpm/find-workspace-dir';
import { buildDependenciesHierarchy } from '@pnpm/reviewing.dependencies-hierarchy';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { temporaryDirectory } from 'tempy';
import { $ } from 'zx';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const monorepoRootDir = await findWorkspaceDir(__dirname);
assert(monorepoRootDir);
const workspaceDir = path.join(__dirname, '..');

console.log(
  'determining version of "typescript" we have currently in use by looking at the symlinked node_modules for this workspace project',
);

const depsInfos = await buildDependenciesHierarchy([workspaceDir], {
  lockfileDir: monorepoRootDir,
  depth: 0,
});

/**
 * @type {string | undefined}
 */
const typescriptVersion = depsInfos[workspaceDir]?.devDependencies?.find(
  (dep) => dep.name === 'typescript',
)?.version;
if (!typescriptVersion) {
  throw new Error(
    `could not determine the version of "typescript" to patch, reason: could not find "typescript"!`,
  );
}

console.log(`found typescript@${typescriptVersion}`);

$.cwd = __dirname;
await using typeScriptTempDir = createTempDir();
await $`pnpm patch --edit-dir=${typeScriptTempDir.path} typescript@${typescriptVersion}`;
await $`pnpm add ts-patch@3.0.2`;
await $`pnpm exec ts-patch --dir=${typeScriptTempDir.path} install`;
await $`pnpm rm ts-patch`;
await $`pnpm patch-commit ${typeScriptTempDir.path}`;

function createTempDir() {
  const dir = temporaryDirectory();
  return {
    path: dir,
    async [Symbol.asyncDispose]() {
      await fs.promises.rm(dir, { recursive: true });
    },
  };
}
