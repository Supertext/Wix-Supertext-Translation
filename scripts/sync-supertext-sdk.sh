#!/usr/bin/env bash
# Copies the Supertext SDK (TypeScript) into src/vendor/supertext-sdk/, pinned to a tag or commit of
# https://github.com/Supertext/Supertext-API-SDK-and-Guide. Vendored until the package is on npm;
# then replace the folder with `npm install supertext-sdk` and change the imports.
#   scripts/sync-supertext-sdk.sh [ref]     (default: main)
set -euo pipefail
ref="${1:-main}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/src/vendor/supertext-sdk"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
git clone -q https://github.com/Supertext/Supertext-API-SDK-and-Guide "$tmp/sdk"
git -C "$tmp/sdk" checkout -q "$ref"
commit="$(git -C "$tmp/sdk" rev-parse HEAD)"
version="$(node -p "require('$tmp/sdk/sdk/typescript/package.json').version")"
rm -rf "$dest"
mkdir -p "$dest"
cp "$tmp"/sdk/sdk/typescript/src/*.ts "$dest/"
cp "$tmp/sdk/sdk/typescript/LICENSE" "$dest/LICENSE"
cat > "$dest/VERSION.md" <<MD
# Vendored Supertext SDK

- Package: supertext-sdk (TypeScript) $version
- Source: https://github.com/Supertext/Supertext-API-SDK-and-Guide/tree/$commit/sdk/typescript
- Commit: $commit

Don't edit these files: fix the SDK upstream, then run \`scripts/sync-supertext-sdk.sh <tag or commit>\`.
MD
echo "Vendored supertext-sdk $version ($commit) into src/vendor/supertext-sdk/"
