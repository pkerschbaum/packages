const { doSomething } = require('@pkerschbaum/test-package-for-pkg-consumption-test');

const result = doSomething();
if (!result === 'some-result') {
  throw new Error(`got wrong result`);
}
