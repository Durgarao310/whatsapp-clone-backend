// filepath: src/helpers/document.ts
/**
 * saveDoc - Utility to save a Mongoose document with error handling.
 * Usage: const saved = await saveDoc(doc);
 */

export async function saveDoc<T extends { save: () => Promise<T> }>(doc: T): Promise<T> {
  try {
    return await doc.save();
  } catch (err) {
    throw err;
  }
}
