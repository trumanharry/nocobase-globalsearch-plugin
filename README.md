# NocoBase Global Search Plugin

A custom [NocoBase](https://www.nocobase.com/) plugin that adds a global cross-collection search feature to the admin interface (legacy client).

## Features

- **Magnifying glass icon** in the admin header — always one click away
- **Live search results** as you type (debounced), across multiple collections
- **Results table** with Name, Collection, and a "View Record" button
- **Configurable per-collection URL templates** for "View Record" links
- **Admin settings page** for managing which collections are searchable

## Compatibility

| Plugin version | NocoBase version |
|---|---|
| 2.1.0 | **2.2.x** (tested toolchain: 2.2.47; also for 2.2.18 → latest) |
| 2.0.0 | 2.0.41+ |

> Rebuild against a 2.2.x toolchain so `dist/externalVersion.js` satisfies the Plugin Manager dependency check on 2.2 hosts.

## Installation (production)

1. Download the `.tgz` from the latest [GitHub Actions artifact](../../actions) or [Releases](../../releases).
2. In NocoBase: **Settings → Plugin Manager → Add → Upload local plugin**.
3. Activate the plugin (or upgrade over the previous version).
4. Hard refresh the browser (`Ctrl+Shift+R` / `Cmd+Shift+R`).

## Build via GitHub Actions (recommended — no local yarn install)

This repo builds the plugin in CI using `create-nocobase-app@2.2.47` (overrideable).

1. Push to `main`, open a PR, or run **Actions → Build plugin → Run workflow**.
2. Download the `plugin-global-search-*` artifact (a `.tgz`).
3. On **Run workflow**, leave **create_release** enabled to also publish a GitHub Release with the tarball.

Manual workflow inputs:

- `nocobase_version` — npm version of `create-nocobase-app` (default `2.2.47`)
- `create_release` — attach the tarball to a `v*` GitHub Release

## Build locally (optional)

Requires Node.js ≥ 22 and Yarn 1.22.x. This still runs `yarn install` inside a temporary app (same as CI), just on your machine:

```bash
# from this repo root
export NOCOBASE_VERSION=2.2.47
bash scripts/ci-build.sh
# → release/@nocobase/plugin-global-search-2.1.0.tgz (path may vary)
```

## Configuration

After activation:

1. Go to **Settings → Global Search**.
2. **Add Collection** and set:
   - **Collection** — existing NocoBase collection
   - **Display Name** — label in results
   - **Search Field** — field for `$includes` / LIKE (e.g. `name`)
   - **URL Template** — e.g. `/admin/your-page-id?popupuid={id}`
   - **Enabled** — include in search

## Architecture

```
src/
├── index.ts
├── client/
│   ├── index.tsx
│   ├── GlobalSearchProvider.tsx
│   ├── components/
│   │   ├── GlobalSearchButton.tsx
│   │   └── GlobalSearchModal.tsx
│   └── settings/
│       └── GlobalSearchSettings.tsx
└── server/
    ├── index.ts
    ├── collections/global-search-configs.ts
    └── resourcers/global-search.ts
```

- Client: `PinnedPluginListProvider` header icon → modal → `GET globalSearch:search?q=`
- Server: enabled configs → parallel `$includes` queries → flat result list

## License

Apache-2.0
