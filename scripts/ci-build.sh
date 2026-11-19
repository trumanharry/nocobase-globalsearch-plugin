#!/usr/bin/env bash
# Build @nocobase/plugin-global-search inside a temporary create-nocobase-app
# workspace so dist/externalVersion.js is stamped against the target 2.2.x host.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NOCOBASE_VERSION="${NOCOBASE_VERSION:-2.2.47}"
APP_NAME="${APP_NAME:-ci-app}"
APP_DIR="${APP_DIR:-${ROOT_DIR}/${APP_NAME}}"
PLUGIN_NAME="@nocobase/plugin-global-search"
PLUGIN_DIR="${APP_DIR}/packages/plugins/@nocobase/plugin-global-search"

echo "==> Building ${PLUGIN_NAME} against create-nocobase-app@${NOCOBASE_VERSION}"

cd "${ROOT_DIR}"
rm -rf "${APP_DIR}"
npx --yes "create-nocobase-app@${NOCOBASE_VERSION}" "${APP_NAME}" \
  -d postgres \
  -e DB_HOST=127.0.0.1 \
  -e DB_PORT=5432 \
  -e DB_DATABASE=nocobase \
  -e DB_USER=nocobase \
  -e DB_PASSWORD=nocobase \
  -e TZ=UTC

# create-nocobase-app writes relative to cwd; relocate if APP_DIR is elsewhere
if [[ ! -d "${APP_DIR}" && -d "${ROOT_DIR}/${APP_NAME}" ]]; then
  mv "${ROOT_DIR}/${APP_NAME}" "${APP_DIR}"
fi

mkdir -p "${APP_DIR}/packages/plugins/@nocobase"
rm -rf "${PLUGIN_DIR}"
mkdir -p "${PLUGIN_DIR}"

# Copy plugin sources into the app workspace (exclude local CI/app artifacts).
tar -C "${ROOT_DIR}" \
  --exclude='.git' \
  --exclude='.ci-app' \
  --exclude='ci-app' \
  --exclude='release' \
  --exclude='.github' \
  --exclude='node_modules' \
  --exclude='*.tgz' \
  --exclude='plugin-global-search-*.tgz' \
  -cf - . | tar -C "${PLUGIN_DIR}" -xf -

cd "${APP_DIR}"
yarn install
yarn build "${PLUGIN_NAME}" --tar

ARTIFACT="$(find storage/tar -type f -name '*.tgz' | head -n 1)"
if [[ -z "${ARTIFACT}" ]]; then
  echo "ERROR: no tarball found under storage/tar" >&2
  exit 1
fi

mkdir -p "${ROOT_DIR}/release"
cp "${ARTIFACT}" "${ROOT_DIR}/release/"
echo "==> Artifact copied to ${ROOT_DIR}/release/$(basename "${ARTIFACT}")"
ls -la "${ROOT_DIR}/release"
