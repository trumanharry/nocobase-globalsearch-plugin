import type { Context, Next } from '@nocobase/actions';
import { Plugin } from '@nocobase/server';
import globalSearchResource from './resourcers/global-search';
import { validateSearchConfigValues } from './utils/validate-config';

export const SETTINGS_SNIPPET = 'pm.plugin-global-search.settings';

export class PluginGlobalSearchServer extends Plugin {
  async load() {
    this.app.resourceManager.define(globalSearchResource);

    // Search is available to any logged-in user; each collection query still
    // enforces that user's list/view ACL + data scopes.
    this.app.acl.allow('globalSearch', 'search', 'loggedIn');

    // Config CRUD is NOT open to all logged-in users. Roles need this snippet
    // (same name as the client settings page aclSnippet).
    this.app.acl.registerSnippet({
      name: SETTINGS_SNIPPET,
      actions: ['globalSearchConfigs:*'],
    });

    // Defense in depth: even if a role somehow gains a broad data permission on
    // globalSearchConfigs, management still requires the plugin settings snippet.
    this.app.acl.use(
      async (ctx: Context, next: Next) => {
        const resourceName = ctx.permission?.resourceName || ctx.action?.resourceName;
        if (resourceName !== 'globalSearchConfigs') {
          return next();
        }
        const roles = this.app.acl.getRoles(ctx.state.currentRoles || [ctx.state.currentRole]);
        const allowed = roles.some(
          (role) => role.name === 'root' || role.effectiveSnippets().allowed.includes(SETTINGS_SNIPPET),
        );
        if (!allowed) {
          ctx.throw(403, 'No permissions');
        }
        await next();
      },
      { before: 'core' },
    );

    const validateModel = async (model: any) => {
      validateSearchConfigValues(model.get() as Record<string, unknown>, this.db);
    };

    this.db.on('globalSearchConfigs.beforeCreate', validateModel);
    this.db.on('globalSearchConfigs.beforeUpdate', validateModel);
  }
}

export default PluginGlobalSearchServer;
