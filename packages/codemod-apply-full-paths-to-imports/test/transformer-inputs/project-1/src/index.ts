import defaultExport from '#pkg/some-module';
import * as name from '#pkg/some-module';
import { noop } from '#pkg/some-module';

export * from '#pkg/some-module';
export { noop } from '#pkg/some-module';

import foo = require('#pkg/some-module');
require('#pkg/some-module');

async function someFunction() {
  await import('#pkg/some-module');
}
typeof import('#pkg/some-module');
type Type = import('#pkg/some-module').Type;

declare module '#pkg/some-module' {
  export type Type2 = {};
}
