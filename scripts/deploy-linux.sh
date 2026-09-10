#!/usr/bin/env bash
set -eu
revision=${1:?revision required}
base=/opt/lawebs-portfolio
release="$base/releases/$revision"
test -f "$base/incoming/$revision.tar.gz"
mkdir -p "$release"
tar -xzf "$base/incoming/$revision.tar.gz" -C "$release"
SITE_ORIGIN=https://lawebs.co.il node "$release/scripts/build.mjs"
node "$release/scripts/check.mjs"
test -f "$release/dist/index.html"
mkdir -p "$base/www"
backup="$base/backups/$(date +%Y%m%d%H%M%S)"
mkdir -p "$backup"
if [ -d "$base/www/current" ]; then cp -a "$base/www/current/." "$backup/"; fi
rm -rf "$base/www/current"
mv "$release/dist" "$base/www/current"
ln -sfn "$release" "$base/current"
chown -R www-data:www-data "$base/www/current"
chmod -R a+rX "$base/www/current"
nginx -t
systemctl reload nginx
rm -f "$base/incoming/$revision.tar.gz"
echo "deployed $revision"
