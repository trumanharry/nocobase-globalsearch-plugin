import React from 'react';
import { PinnedPluginListProvider, SchemaComponentOptions } from '@nocobase/client';
import { GlobalSearchButton } from './components/GlobalSearchButton';

// Match NocoBase plugin patterns (PinnedPluginListProvider renders children but its
 // public type currently omits them, so keep this provider loosely typed).
export const GlobalSearchProvider = (props: any) => {
  return (
    <PinnedPluginListProvider
      items={{
        globalSearch: { order: 100, component: 'GlobalSearchButton', pin: true, snippet: '*' },
      }}
    >
      <SchemaComponentOptions components={{ GlobalSearchButton }}>{props.children}</SchemaComponentOptions>
    </PinnedPluginListProvider>
  );
};
