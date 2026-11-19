var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var validate_config_exports = {};
__export(validate_config_exports, {
  assertSafeCollectionName: () => assertSafeCollectionName,
  assertSafeSearchField: () => assertSafeSearchField,
  assertSearchFieldExists: () => assertSearchFieldExists,
  validateSearchConfigValues: () => validateSearchConfigValues
});
module.exports = __toCommonJS(validate_config_exports);
const FIELD_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
const COLLECTION_NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
function assertSafeSearchField(searchField) {
  if (typeof searchField !== "string" || !FIELD_NAME_RE.test(searchField)) {
    throw new Error("searchField must be a simple field name (letters, numbers, underscore)");
  }
  if (searchField.startsWith("$")) {
    throw new Error("searchField must not be an operator");
  }
}
function assertSafeCollectionName(collectionName, db) {
  if (typeof collectionName !== "string" || !COLLECTION_NAME_RE.test(collectionName)) {
    throw new Error("collectionName is invalid");
  }
  if (collectionName.startsWith("_")) {
    throw new Error('collectionName must not start with "_"');
  }
  if (!db.getCollection(collectionName)) {
    throw new Error(`Unknown collection: ${collectionName}`);
  }
}
function assertSearchFieldExists(collectionName, searchField, db) {
  const collection = db.getCollection(collectionName);
  if (!collection) {
    throw new Error(`Unknown collection: ${collectionName}`);
  }
  if (!collection.getField(searchField)) {
    throw new Error(`Field "${searchField}" does not exist on collection "${collectionName}"`);
  }
}
function validateSearchConfigValues(values, db) {
  if (values.collectionName !== void 0) {
    assertSafeCollectionName(values.collectionName, db);
  }
  if (values.searchField !== void 0) {
    assertSafeSearchField(values.searchField);
  }
  const collectionName = values.collectionName;
  const searchField = values.searchField || "name";
  if (collectionName) {
    assertSafeCollectionName(collectionName, db);
    assertSafeSearchField(searchField);
    assertSearchFieldExists(collectionName, searchField, db);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  assertSafeCollectionName,
  assertSafeSearchField,
  assertSearchFieldExists,
  validateSearchConfigValues
});
