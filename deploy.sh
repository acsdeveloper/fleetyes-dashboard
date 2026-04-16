#!/bin/bash

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_PKG="$REPO_DIR/package.json"
V4_PKG="$REPO_DIR/apps/v4/package.json"

# Capture package.json hashes before pull
root_hash_before=$(md5sum "$ROOT_PKG" 2>/dev/null | awk '{print $1}')
v4_hash_before=$(md5sum "$V4_PKG" 2>/dev/null | awk '{print $1}')

echo "==> Pulling latest changes..."
git -C "$REPO_DIR" pull

# Capture hashes after pull
root_hash_after=$(md5sum "$ROOT_PKG" 2>/dev/null | awk '{print $1}')
v4_hash_after=$(md5sum "$V4_PKG" 2>/dev/null | awk '{print $1}')

# Install if either package.json changed
if [ "$root_hash_before" != "$root_hash_after" ] || [ "$v4_hash_before" != "$v4_hash_after" ]; then
  echo "==> package.json changed — running pnpm install..."
  pnpm install --frozen-lockfile
else
  echo "==> package.json unchanged — skipping install."
fi

echo "==> Building v4..."
pnpm v4:build

echo "==> Restarting pm2 process 0..."
pm2 restart 0

echo "==> Deployment complete."
