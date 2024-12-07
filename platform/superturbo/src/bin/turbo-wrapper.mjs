#!/usr/bin/env node

/**
 * this module is a wrapper for "turbo" which
 *
 * - starts an instance of a turborepo remote cache server locally which is connected to S3
 * - and sets some default values for some "turbo" CLI options
 * @module
 */

import '#pkg/set-environment-variables.mjs';

import closeWithGrace from 'close-with-grace';
import { spawn } from 'node:child_process';
import { argv } from 'node:process';

import { bootstrap } from '@pkerschbaum/garden-snail';

import { TURBO_TOKEN } from '#pkg/constants.mjs';
import { networkUtil } from '#pkg/network-util.mjs';

const turboRemoteCacheServerPort = await networkUtil.getRandomPort();

const app = await bootstrap({ port: turboRemoteCacheServerPort });

// run everything as "turbo" had been invoked directly, with the only difference that the remote cache ENV variables are added
const [_execPath, _jsFilePath, ...commandLineArguments] = argv;

// avoid turborepo update notifier
commandLineArguments.push('--no-update-notifier');

const runArgumentIndex = commandLineArguments.indexOf('run');
if (runArgumentIndex !== -1) {
  // opt out of framework inference because we should define environment variables explicitly
  if (!commandLineArguments.some((arg) => arg.startsWith('--framework-inference'))) {
    commandLineArguments.splice(runArgumentIndex + 1, 0, '--framework-inference=false');
  }

  // if no explicit "concurrency" is given, set 100% to utilize all logical processors (https://turbo.build/repo/docs/reference/command-line-reference/run#--concurrency)
  if (!commandLineArguments.some((arg) => arg.startsWith('--concurrency'))) {
    commandLineArguments.splice(runArgumentIndex + 1, 0, '--concurrency=100%');
  }
}

// set up shutdown of subprocess for "turbo"
const stopTurboAbortController = new AbortController();
closeWithGrace({ logger: { error: noop } }, () => {
  // we stop only "turbo" subprocess because when that exits, it will stop the local turborepo remote caching server
  stopTurboAbortController.abort();
});

// run turbo
spawn('turbo', commandLineArguments, {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: {
    // pass on all existing environment variables
    ...process.env,

    // configure remote cache settings for "turbo"
    TURBO_API: `http://localhost:${turboRemoteCacheServerPort}`,
    TURBO_TOKEN,
    TURBO_TEAM: 'team',
  },
  // set shell to true for windows to have binaries available (https://stackoverflow.com/a/54515183)
  shell: process.platform === 'win32',
  signal: stopTurboAbortController.signal,
}).on('exit', (code) => void shutdown(code));

/**
 * @param {number | null} code
 */
async function shutdown(code) {
  // stop local turborepo remote cache server
  await app.close();

  if (code !== null) {
    // eslint-disable-next-line n/no-process-exit
    process.exit(code);
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}
