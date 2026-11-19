# NocoBase Global Search Plugin

Cross-collection global search for the [NocoBase](https://www.nocobase.com/) admin UI (legacy client).

## Features

- Magnifying-glass icon in the admin header
- Live search results as you type (debounced)
- Results table with name, collection label, and **View Record**
- Per-collection URL templates for record links (`{id}`, `{collectionName}`)
- Settings page to choose which collections are searchable

## Compatibility

| Plugin | NocoBase |
|--------|----------|
| **2.1.2** (current) | **2.2.x** |
| 2.0.0 | 2.0.x (legacy build) |

Built plugins stamp `@nocobase/*` versions in `dist/externalVersion.js`. Use a build that matches your host minor line (for 2.2 hosts, `2.2.x`).

## Install

1. Download `plugin-global-search-2.1.2.tgz` from [Releases](../../releases).
2. In NocoBase: **Settings → Plugin Manager → Add → Upload local plugin**.
3. Activate if needed, then hard-refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`).

To upgrade, upload the newer `.tgz` over the existing plugin (same package name). Do not remove the old plugin first if you want to keep search configs.

## Configuration

After activation, open **Settings → Global Search**:

| Field | Description |
|-------|-------------|
| Collection | Collection to include in search |
| Display name | Label shown in results |
| Search field | Field used for `$includes` / contains matching (e.g. `name`) |
| URL template | Opened by **View Record**. Placeholders: `{id}`, `{collectionName}`. Relative (`/admin/...`) or absolute (`https://your-host/admin/.../{id}`) paths are supported. |
| Enabled | Include this collection in search |

Managing configs requires the `pm.plugin-global-search.settings` permission (typically admins).

## Security notes

- Search queries respect each user’s **list/view** permission and **data scopes** on target collections.
- `globalSearchConfigs` CRUD is limited to the plugin settings snippet (not all logged-in users).

## Project layout

```
src/
├── client/          # Legacy admin UI (header icon, modal, settings)
└── server/          # Search API, configs collection, ACL helpers
```

- Client: `PinnedPluginListProvider` → modal → `GET globalSearch:search?q=`
- Server: enabled configs → ACL-aware `$includes` queries → flat result list

## Build from source

This repository ships source under `src/` and a prebuilt `dist/` matching the latest release.

To rebuild against a NocoBase 2.2.x app:

1. Place the plugin under `packages/plugins/@nocobase/plugin-global-search` in a NocoBase 2.2.x project (for example one created with `create-nocobase-app`).
2. From the app root: `yarn install` then `yarn build @nocobase/plugin-global-search --tar`.
3. Upload the generated `.tgz` from `storage/tar/`.

Requires Node.js ≥ 22 and Yarn 1.22.x.

## License

Licensed under the [Apache License 2.0](./LICENSE).
