import { expect } from '@playwright/test';
import {
  ensureNoExpected,
  matcherHint,
  MatcherHintOptions,
  printReceived,
} from 'jest-matcher-utils';

/* eslint-disable @typescript-eslint/consistent-type-definitions -- allow interface for module augmentation */
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      // eslint-disable-next-line @typescript-eslint/method-signature-style
      toBeNullish(): R;
    }
  }
}
/* eslint-enable @typescript-eslint/consistent-type-definitions */

expect.extend({
  /**
   * Based on https://github.com/facebook/jest/blob/78faa85cc85da1d0aa2a6d1ed1602de373b72e7a/packages/expect/src/matchers.ts#L380-L396.
   */
  toBeNullish(received: unknown, expected: void) {
    const matcherName = 'toBeNullish';
    const options: MatcherHintOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };
    ensureNoExpected(expected, matcherName, options);

    const pass = received === undefined || received === null;

    const message = () =>
      `${matcherHint(matcherName, undefined, '', options)}\n\n` +
      `Received: ${printReceived(received)}`;

    return { message, pass };
  },
});
