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
var global_search_exports = {};
__export(global_search_exports, {
  default: () => global_search_default
});
module.exports = __toCommonJS(global_search_exports);
var import_search_with_acl = require("../utils/search-with-acl");
var import_validate_config = require("../utils/validate-config");
const MIN_QUERY_LENGTH = 2;
const MAX_CONFIGS = 50;
var global_search_default = {
  name: "globalSearch",
  actions: {
    async search(ctx, next) {
      const { q } = ctx.action.params;
      if (!q || String(q).trim().length < MIN_QUERY_LENGTH) {
        ctx.body = [];
        return next();
      }
      const query = String(q).trim();
      const configs = await ctx.db.getRepository("globalSearchConfigs").find({
        filter: { enabled: true },
        limit: MAX_CONFIGS
      });
      if (!configs.length) {
        ctx.body = [];
        return next();
      }
      const resultSets = await Promise.all(
        configs.map(async (config) => {
          const collectionName = String(config.get("collectionName") || "");
          const searchField = String(config.get("searchField") || "name");
          const displayName = String(config.get("displayName") || collectionName);
          const urlTemplate = String(config.get("urlTemplate") || "");
          try {
            (0, import_validate_config.assertSafeSearchField)(searchField);
            if (!collectionName || collectionName.startsWith("_")) {
              return [];
            }
            const rows = await (0, import_search_with_acl.searchCollectionWithAcl)(ctx, {
              collectionName,
              searchField,
              query
            });
            return rows.map((row) => ({
              id: row.get("id"),
              name: row.get(searchField) ?? row.get("id"),
              collectionName,
              displayName,
              urlTemplate
            }));
          } catch {
            return [];
          }
        })
      );
      ctx.body = resultSets.flat();
      return next();
    }
  }
};
