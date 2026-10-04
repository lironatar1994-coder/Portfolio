#!/usr/bin/env bash
set -euo pipefail
bundle=$(cd "$(dirname "$0")/.." && pwd)
stamp=$(date -u +%Y%m%dT%H%M%SZ)
base=/opt/lawebs-portfolio
backup="$base/backups/seo-$stamp"
stage="$base/seo-staging-$stamp"
config=/etc/nginx/sites-available/lawebs.co.il.conf
map=/etc/nginx/conf.d/lawebs-seo-performance.conf
mkdir -p "$backup"
cp -a "$base/www/current" "$stage"
cp -a "$config" "$backup/nginx.conf"
if [ -f "$map" ]; then cp -a "$map" "$backup/performance.conf"; fi
cp "$bundle/public/seo.css" "$stage/seo.css"
cp "$bundle"/public/images/*-card-20261004-*w.webp "$stage/images/"
SITE_ORIGIN=https://lawebs.co.il node "$bundle/scripts/seo.mjs" "$stage"
node "$bundle/scripts/seo-check.mjs" "$stage"
test -f "$stage/googled4a548acdeaf1123.html"
rollback() {
  cp -a "$backup/nginx.conf" "$config"
  if [ -f "$backup/performance.conf" ]; then cp -a "$backup/performance.conf" "$map"; else rm -f "$map"; fi
  if [ -d "$backup/current" ]; then mv "$base/www/current" "$backup/failed-current"; mv "$backup/current" "$base/www/current"; fi
  nginx -t && systemctl reload nginx || true
}
trap rollback ERR
cat > "$map" <<'MAP'
# Defer only LA webs' existing visitor script; retain its original data attributes.
map $monitor_navigation_tag $lawebs_navigation_tag {
    default $monitor_navigation_tag;
    "~^<script (?<lawebs_navigation_attrs>.*)$" "<script defer $lawebs_navigation_attrs";
}
MAP
python3 - "$config" <<'PY'
import sys
from pathlib import Path
path=Path(sys.argv[1]); source=path.read_text()
old='''    location / {
        root /opt/lawebs-portfolio/www/current;
        try_files $uri $uri/ =404;
    }'''
new='''    # LA webs SEO release: compression, bounded asset caching, non-blocking monitoring.
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 1024;
    gzip_types text/css application/javascript application/json application/xml text/xml image/svg+xml;

    location ~ ^/(?:fonts/.*\\.woff2|images/.*\\.(?:webp|png|jpg|svg)|app\\.js|styles\\.css|seo\\.css)$ {
        root /opt/lawebs-portfolio/www/current;
        try_files $uri =404;
        expires 1h;
    }

    location / {
        root /opt/lawebs-portfolio/www/current;
        try_files $uri $uri/ =404;
        sub_filter_once on;
        sub_filter '<head>' '<head>$lawebs_navigation_tag$monitor_growth_tag';
    }'''
if 'LA webs SEO release:' not in source:
    if source.count(old)!=1: raise SystemExit('Unexpected root block; no configuration changed.')
    path.write_text(source.replace(old,new))
PY
nginx -t
chown -R www-data:www-data "$stage"
chmod -R a+rX "$stage"
mv "$base/www/current" "$backup/current"
mv "$stage" "$base/www/current"
systemctl reload nginx
trap - ERR
echo "SEO release live; rollback: $backup"
