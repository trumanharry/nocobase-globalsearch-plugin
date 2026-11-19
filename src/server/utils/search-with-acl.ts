import { checkFilterParams, createUserProvider, parseJsonTemplate } from '@nocobase/acl';
import type { Context } from '@nocobase/actions';
import { assign } from '@nocobase/utils';

const PER_COLLECTION_LIMIT = 10;

function getTimezone(ctx: Context): string | undefined {
  return (
    (ctx.request?.get?.('x-timezone') as string | undefined) ??
    (ctx.request?.header?.['x-timezone'] as string | undefined) ??
    (ctx.req?.headers?.['x-timezone'] as string | undefined)
  );
}

function getRoles(ctx: Context): string[] {
  if (Array.isArray(ctx.state?.currentRoles) && ctx.state.currentRoles.length) {
    return ctx.state.currentRoles;
  }
  if (ctx.state?.currentRole) {
    return [ctx.state.currentRole];
  }
  return ['anonymous'];
}

function canListCollection(ctx: Context, collectionName: string) {
  const roles = getRoles(ctx);
  if (roles.includes('root')) {
    return { params: {} } as any;
  }
  const can = typeof ctx.can === 'function' ? ctx.can.bind(ctx) : ctx.app.acl.can.bind(ctx.app.acl);
  return (
    can({ roles, resource: collectionName, action: 'list' }) ||
    can({ roles, resource: collectionName, action: 'view' }) ||
    null
  );
}

function isFieldAllowed(permission: any, searchField: string): boolean {
  const fields = permission?.params?.fields;
  if (!Array.isArray(fields) || fields.length === 0) {
    return true;
  }
  if (fields.includes('*') || fields.includes(searchField)) {
    return true;
  }
  return false;
}

/**
 * Run a LIKE/$includes search on one collection, enforcing ACL list/view permission
 * and merging any role data-scope filters onto the query.
 */
export async function searchCollectionWithAcl(
  ctx: Context,
  options: {
    collectionName: string;
    searchField: string;
    query: string;
  },
) {
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
  let aclFilter = permission?.params?.filter;
  if (aclFilter && collection) {
    checkFilterParams(collection, aclFilter);
    aclFilter = await parseJsonTemplate(aclFilter, {
      collection,
      state: ctx.state,
      timezone: getTimezone(ctx),
      userProvider: createUserProvider({
        db: ctx.db,
        currentUser: ctx.state?.currentUser,
      }),
    });
  }

  const filter = assign({ [searchField]: { $includes: query } }, aclFilter || {}, {
    filter: 'andMerge',
  });

  const rows = await repo.find({
    filter,
    limit: PER_COLLECTION_LIMIT,
    fields: ['id', searchField],
  });

  return rows;
}
