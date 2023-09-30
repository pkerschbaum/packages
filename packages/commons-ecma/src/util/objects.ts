import type { ObjectLiteral } from '#pkg/util/types.js';

function shallowCopy<T>(inObject: T): T {
  return typeof inObject !== 'object' || inObject === null
    ? // Return the value if inObject is not an object
      inObject
    : // shallow copy via object spread
      { ...inObject };
}

// https://stackoverflow.com/a/52323412/1700319
function shallowIsEqual(obj1: ObjectLiteral, objToCompareWith: ObjectLiteral) {
  return (
    Object.keys(obj1).length === Object.keys(objToCompareWith).length &&
    Object.keys(obj1).every(
      (key) =>
        Object.hasOwnProperty.call(objToCompareWith, key) && obj1[key] === objToCompareWith[key],
    )
  );
}

export = {
  objects: {
    shallowCopy,
    shallowIsEqual,
  },
};
