import { findWorkspacePackagesNoCheck } from '@pnpm/find-workspace-packages';
import assert from 'node:assert';
import { $ } from 'zx';

/**
 * @param {import("#pkg/types.js").CodemodRunOptions} options
 */
export async function run({ monorepoPath }) {
  const [rootProject, ...workspaceProjects] = await findWorkspacePackagesNoCheck(monorepoPath);

  /** @type {{ [depName in string]: string }} */
  const allToolingDeps = {};

  for (const project of workspaceProjects) {
    if (!project.manifest.devDependencies) {
      continue;
    }

    for (const [depName, version] of Object.entries(project.manifest.devDependencies)) {
      if (
        depName.startsWith('@typescript-eslint/') ||
        depName.startsWith('eslint') ||
        depName.includes('eslint-plugin-') ||
        depName.startsWith('typescript') ||
        depName.startsWith('prettier') ||
        depName === 'lint-staged' ||
        depName === 'husky'
      ) {
        allToolingDeps[depName] = version;
        delete project.manifest.devDependencies[depName];
      }
    }

    await project.writeProjectManifest(project.manifest);
  }

  assert(rootProject);
  rootProject.manifest.devDependencies = {
    ...rootProject.manifest.devDependencies,
    ...allToolingDeps,
  };
  await rootProject.writeProjectManifest(rootProject.manifest);

  $.cwd = monorepoPath;
  await $`source ~/.nvm/nvm.sh && nvm use && pnpm format && pnpm install && pnpm build && pnpm lint:fix`;
}
