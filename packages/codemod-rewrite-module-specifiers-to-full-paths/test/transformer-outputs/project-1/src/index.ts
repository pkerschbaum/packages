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
