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
var search_with_acl_exports = {};
__export(search_with_acl_exports, {
  searchCollectionWithAcl: () => searchCollectionWithAcl
});
module.exports = __toCommonJS(search_with_acl_exports);
var import_acl = require("@nocobase/acl");
var import_utils = require("@nocobase/utils");
const PER_COLLECTION_LIMIT = 10;
function getTimezone(ctx) {
  var _a, _b, _c, _d, _e, _f;
  return ((_b = (_a = ctx.request) == null ? void 0 : _a.get) == null ? void 0 : _b.call(_a, "x-timezone")) ?? ((_d = (_c = ctx.request) == null ? void 0 : _c.header) == null ? void 0 : _d["x-timezone"]) ?? ((_f = (_e = ctx.req) == null ? void 0 : _e.headers) == null ? void 0 : _f["x-timezone"]);
}
function getRoles(ctx) {
  var _a, _b;
  if (Array.isArray((_a = ctx.state) == null ? void 0 : _a.currentRoles) && ctx.state.currentRoles.length) {
    return ctx.state.currentRoles;
  }
  if ((_b = ctx.state) == null ? void 0 : _b.currentRole) {
    return [ctx.state.currentRole];
  }
  return ["anonymous"];
}
function canListCollection(ctx, collectionName) {
  const roles = getRoles(ctx);
  if (roles.includes("root")) {
    return { params: {} };
  }
  const can = typeof ctx.can === "function" ? ctx.can.bind(ctx) : ctx.app.acl.can.bind(ctx.app.acl);
  return can({ roles, resource: collectionName, action: "list" }) || can({ roles, resource: collectionName, action: "view" }) || null;
}
function isFieldAllowed(permission, searchField) {
  var _a;
  const fields = (_a = permission == null ? void 0 : permission.params) == null ? void 0 : _a.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    return true;
  }
  if (fields.includes("*") || fields.includes(searchField)) {
    return true;
  }
  return false;
}
async function searchCollectionWithAcl(ctx, options) {
  var _a, _b;
  const { collectionName, searchField, query } = options;
  const permission = canListCollection(ctx, collectionName);
  if (!permission) {
    return [];
  }
  if (!isFieldAllowed(permission, searchField)) {
    return [];
  }
  const repo = ctx.db.getRepository(collectionName);
  if (!repo) {
    return [];
  }
  const collection = ctx.db.getCollection(collectionName);
  let aclFilter = (_a = permission == null ? void 0 : permission.params) == null ? void 0 : _a.filter;
  if (aclFilter && collection) {
    (0, import_acl.checkFilterParams)(collection, aclFilter);
    aclFilter = await (0, import_acl.parseJsonTemplate)(aclFilter, {
      collection,
      state: ctx.state,
      timezone: getTimezone(ctx),
      userProvider: (0, import_acl.createUserProvider)({
        db: ctx.db,
        currentUser: (_b = ctx.state) == null ? void 0 : _b.currentUser
      })
    });
  }
  const filter = (0, import_utils.assign)({ [searchField]: { $includes: query } }, aclFilter || {}, {
    filter: "andMerge"
  });
  const rows = await repo.find({
    filter,
    limit: PER_COLLECTION_LIMIT,
    fields: ["id", searchField]
  });
  return rows;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  searchCollectionWithAcl
});
