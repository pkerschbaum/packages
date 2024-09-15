import { noop } from '#pkg/some-module';
export * from '#pkg/some-module';
async function blah() {
  await import('#pkg/some-module');
}
require('#pkg/some-module');
import foo = require('#pkg/some-module');
typeof import('#pkg/some-module');
type Type = import('#pkg/some-module').Type;
declare module '#pkg/some-module' {
  export type Type2 = {};
}
