// filepath: src/helpers/document.ts
/**
 * saveDoc - Utility to save a Mongoose document with asyncatch error handling.
 * Usage: const [saved, err] = await saveDoc(doc);
 */
import { asyncatch } from './asyncatch';

export async function saveDoc<T extends { save: () => Promise<T> }>(doc: T): Promise<[T | null, any]> {
  return asyncatch(doc.save());
}
