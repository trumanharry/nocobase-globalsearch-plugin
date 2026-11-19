import type { Database } from '@nocobase/database';

const FIELD_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const COLLECTION_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** Relative admin paths only — blocks schemes, protocol-relative, and javascript: URLs. */
export function isSafeUrlTemplate(template: unknown): boolean {
  if (template == null || template === '') {
    return true;
  }
  if (typeof template !== 'string') {
    return false;
  }
  const value = template.trim();
  if (!value.startsWith('/')) {
    return false;
  }
  if (value.startsWith('//')) {
    return false;
  }
  if (/[\r\n\0]/.test(value)) {
    return false;
  }
  // Reject anything that still looks like a scheme after the leading slash edge cases
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
    return false;
  }
  return true;
}

export function assertSafeUrlTemplate(template: unknown) {
  if (!isSafeUrlTemplate(template)) {
    throw new Error('urlTemplate must be a relative path starting with "/" (no external URLs)');
  }
}

export function assertSafeSearchField(searchField: unknown) {
  if (typeof searchField !== 'string' || !FIELD_NAME_RE.test(searchField)) {
    throw new Error('searchField must be a simple field name (letters, numbers, underscore)');
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
  if (values.urlTemplate !== undefined) {
    assertSafeUrlTemplate(values.urlTemplate);
  }
  const collectionName = values.collectionName as string | undefined;
  const searchField = (values.searchField as string | undefined) || 'name';
  if (collectionName) {
    assertSafeCollectionName(collectionName, db);
    assertSafeSearchField(searchField);
    assertSearchFieldExists(collectionName, searchField, db);
  }
}
