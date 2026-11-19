import type { Database } from '@nocobase/database';

const FIELD_NAME_RE = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const COLLECTION_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

export function assertSafeSearchField(searchField: unknown) {
  if (typeof searchField !== 'string' || !FIELD_NAME_RE.test(searchField)) {
    throw new Error('searchField must be a simple field name (letters, numbers, underscore, hyphen)');
  }
  if (searchField.startsWith('$')) {
    throw new Error('searchField must not be an operator');
  }
}

export function assertSafeCollectionName(collectionName: unknown, db: Database) {
  if (typeof collectionName !== 'string' || !COLLECTION_NAME_RE.test(collectionName)) {
    throw new Error('collectionName is invalid');
  }
  if (collectionName.startsWith('_')) {
    throw new Error('collectionName must not start with "_"');
  }
  if (!db.getCollection(collectionName)) {
    throw new Error(`Unknown collection: ${collectionName}`);
  }
}

export function assertSearchFieldExists(collectionName: string, searchField: string, db: Database) {
  const collection = db.getCollection(collectionName);
  if (!collection) {
    throw new Error(`Unknown collection: ${collectionName}`);
  }
  if (!collection.getField(searchField)) {
    throw new Error(`Field "${searchField}" does not exist on collection "${collectionName}"`);
  }
}

export function validateSearchConfigValues(values: Record<string, unknown>, db: Database) {
  if (values.collectionName !== undefined) {
    assertSafeCollectionName(values.collectionName, db);
  }
  if (values.searchField !== undefined) {
    assertSafeSearchField(values.searchField);
  }
  const collectionName = values.collectionName as string | undefined;
  const searchField = (values.searchField as string | undefined) || 'name';
  if (collectionName) {
    assertSafeCollectionName(collectionName, db);
    assertSafeSearchField(searchField);
    assertSearchFieldExists(collectionName, searchField, db);
  }
}
