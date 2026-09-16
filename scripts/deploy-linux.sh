#!/usr/bin/env bash
set -eu
revision=${1:?revision required}
[[ "$revision" =~ ^[0-9a-f]{40}$ ]] || exit 1
base=/opt/lawebs-portfolio
release="$base/releases/$revision"
test -f "$base/incoming/$revision.tar.gz"
mkdir -p "$release"
tar -xzf "$base/incoming/$revision.tar.gz" -C "$release"
SITE_ORIGIN=https://lawebs.co.il node "$release/scripts/build.mjs"
if [ "${2:-}" != '--skip-checks' ]; then node "$release/scripts/check.mjs"; fi
test -f "$release/dist/index.html"
chown -R www-data:www-data "$release/dist"
chmod -R a+rX "$release/dist"
nginx -t
mkdir -p "$base/www"
backup="$base/backups/$(date +%Y%m%d%H%M%S)-$revision"
mkdir -p "$backup"
previous=$(readlink -f "$base/current" || true)
rollback() {
  if [ -d "$backup/current" ]; then
    if [ -d "$base/www/current" ]; then mv "$base/www/current" "$release/failed-dist"; fi
    mv "$backup/current" "$base/www/current"
    if [ -n "$previous" ]; then ln -sfn "$previous" "$base/current"; fi
    systemctl reload nginx || true
  fi
}
trap rollback ERR
if [ -d "$base/www/current" ]; then mv "$base/www/current" "$backup/current"; fi
mv "$release/dist" "$base/www/current"
ln -sfn "$release" "$base/current"
systemctl reload nginx
trap - ERR
rm -f "$base/incoming/$revision.tar.gz"
echo "deployed $revision"
echo "rollback backup: $backup/current"
