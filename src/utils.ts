import glob from 'glob';

export function assertsHasValue<T>(
  value: T,
  errorMessage: string,
): asserts value is Exclude<T, null | undefined | void> {
  if (value === null || value === undefined) {
    throw new Error(errorMessage);
  }
}

export function globSync(
  patterns: string | string[],
  ignorePatterns: string[],
): string[] {
  if (typeof patterns === 'string') {
    patterns = [patterns];
  }

  return patterns.reduce(
    (acc, pattern) =>
      acc.concat(glob.sync(pattern, { nodir: true, ignore: ignorePatterns })),
    [] as string[],
  );
}

const targets = [' ', '[', ']'] as const;
export function escapeFilePath(filePath: string) {
  targets.forEach((w) => {
    filePath = filePath.split(w).join(`\\${w}`);
  });

  return filePath;
}
