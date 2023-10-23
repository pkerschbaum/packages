import { removeTypeInfoRules } from '@pkerschbaum/typescript-eslint-rules-requiring-type-info';

if (typeof removeTypeInfoRules !== 'function') {
  throw new Error(
    `"removeTypeInfoRules" is not a function as expected! typeof removeTypeInfoRules = ${typeof removeTypeInfoRules}`,
  );
}
