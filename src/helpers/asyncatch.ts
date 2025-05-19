// filepath: src/helpers/asyncatch.ts

/**
 * asyncatch - Utility for concise async error handling.
 * Usage: const [result, err] = await asyncatch(promise);
 */
export async function asyncatch<T>(promise: Promise<T>): Promise<[T | null, any]> {
  return promise.then<[T, null]>(data => [data, null]).catch<[null, any]>(err => [null, err]);
}
