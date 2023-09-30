import invariant = require('#pkg/util/invariant');

function uniqueValues<T, U>(array: T[], getPropToCompare?: (item: T) => U): T[] {
  const result: T[] = [];
  const getThingToCompare = getPropToCompare ?? ((item) => item);

  for (const item of array) {
    if (
      !result.some((existingItem) => getThingToCompare(existingItem) === getThingToCompare(item))
    ) {
      result.push(item);
    }
  }

  return result;
}

function shallowCopy<T>(array: T[]): T[] {
  return [...array];
}

function reverse<T>(array: T[]): T[] {
  return shallowCopy(array).reverse();
}

function pickElementAndRemove<T>(array: T[], elementIndex: number): T | undefined {
  const elementArray = array.splice(elementIndex, 1);
  if (elementArray.length === 0) {
    return undefined;
  }
  return elementArray[0];
}

function partitionArray<T>(
  array: T[],
  options: { countOfPartitions: number } | { itemsPerPartition: number },
): T[][] {
  const partitions: T[][] = [];

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if ('countOfPartitions' in options && options.countOfPartitions !== undefined) {
    const { countOfPartitions } = options;

    for (let i = 0; i < countOfPartitions; i++) {
      partitions[i] = [];
    }
    for (const [i, item] of array.entries()) {
      const partitionToAddTo = partitions[i % countOfPartitions];
      invariant(partitionToAddTo);
      partitionToAddTo.push(item);
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if ('itemsPerPartition' in options && options.itemsPerPartition !== undefined) {
    const { itemsPerPartition } = options;

    let currentPartition: T[] = [];
    for (const item of array) {
      if (currentPartition.length === itemsPerPartition) {
        partitions.push(currentPartition);
        currentPartition = [];
      }
      currentPartition.push(item);
    }
    partitions.push(currentPartition);
  }

  return partitions;
}

export = {
  arrays: {
    uniqueValues,
    shallowCopy,
    reverse,
    pickElementAndRemove,
    partitionArray,
  },
};
