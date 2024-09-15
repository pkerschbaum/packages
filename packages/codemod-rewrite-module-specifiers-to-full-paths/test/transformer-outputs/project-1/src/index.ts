import defaultExport from '#pkg/some-module.js';
import * as name from '#pkg/some-module.js';
import { noop } from '#pkg/some-module.js';

export * from '#pkg/some-module.js';
export { noop } from '#pkg/some-module.js';

import foo = require('#pkg/some-module.js');
require('#pkg/some-module.js');

async function someFunction() {
  await import('#pkg/some-module.js');
}
typeof import('#pkg/some-module.js');
type Type = import('#pkg/some-module.js').Type;

declare module '#pkg/some-module.js' {
  export type Type2 = {};
}

''.startsWith('/');

export function isAbsolutePathModuleSpecifier(moduleSpecifier: string) {
  return moduleSpecifier.startsWith('/');
}

const blah = '';
const moduleSpecifierAbsolutePath = blah.startsWith('/');

import { constant } from '#pkg/some-directory/index.js';

import { constant as constant2 } from './some-directory/index.js';
import { constant as constant3 } from './some-directory/index.js';

import './test.png';

import { someConstant } from './lib/some-js.js';
