# Changelog

## 2.1.2

- Restore original **View Record** URL behavior (absolute `https://…` templates allowed again).
- Keep ACL-aware search and settings-snippet lockdown from 2.1.1.

## 2.1.1

- Enforce collection list/view permissions and data scopes on search.
- Restrict `globalSearchConfigs` management to `pm.plugin-global-search.settings`.
- Validate collection and search-field names server-side.

## 2.1.0

- Live search results while typing (debounced).
- Rebuild for NocoBase **2.2.x** dependency compatibility.

## 2.0.0

- Initial release: header search icon, modal search, settings page, cross-collection `$includes` search.
