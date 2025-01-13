# pkerschbaum OSS <!-- omit in toc -->

- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Build \& Run](#build--run)
  - [Additional commands for development](#additional-commands-for-development)
- [Updating TypeScript](#updating-typescript)

## Development

### Prerequisites

- **Node.js:** It is recommended to use [nvm](https://github.com/nvm-sh/nvm) and run `nvm use`, this will automatically switch to the Node.js version mentioned in the file [`.nvmrc`](./.nvmrc).  
   Alternatively you can install Node.js directly, please refer to `.nvmrc` of this project to determine the Node.js version to use.
- **pnpm:** This monorepo ("workspace") uses [`pnpm`](https://pnpm.io/) as package manager.  
  It is recommended to use `corepack` of Node.js, just run:

  ```sh
  corepack enable
  ```

  `pnpm` commands should now be available (and the `pnpm` version specified in `package.json#packageManager` will be automatically used).

- **Toolchain for native Node.js modules:** Run the installation instructions "A C/C++ compiler tool chain for your platform" of [microsoft/vscode/wiki/How-to-Contribute#prerequisites](https://github.com/microsoft/vscode/wiki/How-to-Contribute#prerequisites).

### Build & Run

1. **Install all dependencies:**

   ```sh
   pnpm install
   ```

1. **Run an initial build:**

   ```sh
   pnpm run build
   ```

### Additional commands for development

See `scripts` of [`./package.json`](./package.json) for available scripts in the workspace.

## Updating TypeScript

We use the custom transformer (plugin) [`typescript-transform-paths`](https://github.com/LeDDGroup/typescript-transform-paths) in our TypeScript codebase. This enables authoring TypeScript sources with path aliases but during TypeScript compilation, they are replaced by relative paths.  
That avoids all sorts of difficulties supporting path aliases in Node.js, Next.js, etc.

Such custom transformers (plugins) are not supported by TypeScript out-of-the-box, so we apply [`ts-patch`](https://github.com/nonara/ts-patch) to the `typescript` package.  
To better incorporate with pnpm (<https://github.com/pnpm/pnpm/issues/6111>) we create a pnpm patch via `ts-patch`, using [`@pkerschbaum/pkg-management`](https://www.npmjs.com/package/@pkerschbaum/pkg-management).

Consequently, to update TypeScript to a new version, this procedure is required:

1. Remove current patch:

   ```bash
   pnpm patch-remove typescript@5.5.4 # <-- look this up in package.json#pnpm.patchedDependencies
   ```

1. Update `typescript` everywhere:

   ```bash
   pnpm -r update typescript@5.6.3 # <-- new version here
   ```

1. Run:

   ```bash
   pnpm --package="@pkerschbaum/pkg-management@2.1.0" dlx create-pnpm-patch-via-ts-patch \
      --typescript-version=5.6.3 \ # <-- new version of `typescript` here
      --ts-patch-version=3.3.0 # <-- latest version of `ts-patch` here
   ```

In the future, when all tools (like Node.js, Next.js builds, Playwright, ...) support ["subpath imports"](https://nodejs.org/api/packages.html#subpath-imports) correctly, we can configure `#pkg/*` imports via subpath imports and remove that "patching" approach altogether.
