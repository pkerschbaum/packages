# pkerschbaum OSS <!-- omit in toc -->

- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Build \& Run](#build--run)
  - [Additional commands for development](#additional-commands-for-development)

## Development

### Prerequisites

- **Install Node.js:** For the version to use, please refer to the file [.nvmrc](./.nvmrc) of this repository.  
  It is recommended to use [nvm](https://github.com/nvm-sh/nvm) and run `nvm use`, this will automatically switch to the Node.js version mentioned in `.nvmrc`.
- **Install pnpm:** This monorepo uses [`pnpm`](https://pnpm.io/) as package manager.  
  For the version to use, look at the field `"packageManager"` of the [package.json](./package.json).  
  For installation instructions see [pnpm.io/installation](https://pnpm.io/installation); it should boil down to this command:

  ```sh
  npm i -g pnpm@8.1.1 # <-- look up the version in package.json "packageManager"
  ```

- **Make sure you can compile native npm dependencies:** If you need guidance for that, follow the sections "Python" and "C/C++ compiler tool chain for your platform" of the "Prerequisites" installation guide of [microsoft/vscode/wiki/How-to-Contribute#prerequisites](https://github.com/microsoft/vscode/wiki/How-to-Contribute#prerequisites).

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
