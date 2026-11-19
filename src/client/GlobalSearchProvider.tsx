import React from 'react';
import { PinnedPluginListProvider, SchemaComponentOptions } from '@nocobase/client';
import { GlobalSearchButton } from './components/GlobalSearchButton';

// NocoBase's published type for PinnedPluginListProvider omits `children` even though
// the runtime component renders them (same pattern as other header-pin plugins).
const PinnedProvider = PinnedPluginListProvider as React.ComponentType<any>;

export const GlobalSearchProvider = (props: any) => {
  return (
    <PinnedProvider
      items={{
        globalSearch: { order: 100, component: 'GlobalSearchButton', pin: true, snippet: '*' },
      }}
    >
      <SchemaComponentOptions components={{ GlobalSearchButton }}>{props.children}</SchemaComponentOptions>
    </PinnedProvider>
  );
};
