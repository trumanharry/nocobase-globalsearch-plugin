import { Context, Next } from '@nocobase/actions';
import { searchCollectionWithAcl } from '../utils/search-with-acl';
import { assertSafeSearchField } from '../utils/validate-config';

const MIN_QUERY_LENGTH = 2;
const MAX_CONFIGS = 50;

export default {
  name: 'globalSearch',
  actions: {
    async search(ctx: Context, next: Next) {
      const { q } = ctx.action.params;

      if (!q || String(q).trim().length < MIN_QUERY_LENGTH) {
        ctx.body = [];
        return next();
      }

      const query = String(q).trim();

      const configs = await ctx.db.getRepository('globalSearchConfigs').find({
        filter: { enabled: true },
        limit: MAX_CONFIGS,
      });

      if (!configs.length) {
        ctx.body = [];
        return next();
      }

      const resultSets = await Promise.all(
        configs.map(async (config) => {
          const collectionName = String(config.get('collectionName') || '');
          const searchField = String(config.get('searchField') || 'name');
          const displayName = String(config.get('displayName') || collectionName);
          const urlTemplate = String(config.get('urlTemplate') || '');

          try {
            assertSafeSearchField(searchField);
            if (!collectionName || collectionName.startsWith('_')) {
              return [];
            }

            const rows = await searchCollectionWithAcl(ctx, {
              collectionName,
              searchField,
              query,
            });

            return rows.map((row) => ({
              id: row.get('id'),
              name: row.get(searchField) ?? row.get('id'),
              collectionName,
              displayName,
              urlTemplate,
            }));
          } catch {
            // Missing collection/field, ACL parse errors, etc. — skip quietly
            return [];
          }
        }),
      );

      ctx.body = resultSets.flat();
      return next();
    },
  },
};
