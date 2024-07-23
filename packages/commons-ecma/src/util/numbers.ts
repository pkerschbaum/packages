import type { Increment, Range } from '#pkg/util/types.js';

export const numbers = { convert, sequence };

function convert(input: unknown): number | undefined {
  // https://stackoverflow.com/a/1421988/1700319
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  if (Number.isNaN(Number.parseFloat(input as any)) || Number.isNaN((input as any) - 0)) {
    return;
  }
  return Number(input);
}

function sequence<const FromInclusive extends number, const ToInclusive extends number>(options: {
  fromInclusive: FromInclusive;
  toInclusive: ToInclusive;
}): Array<Range<FromInclusive, Increment<ToInclusive>>> {
  return Array.from(
    Array.from({ length: options.toInclusive - (options.fromInclusive - 1) }),
    (_, i) => i + options.fromInclusive,
  ) as Array<Range<FromInclusive, Increment<ToInclusive>>>;
}
