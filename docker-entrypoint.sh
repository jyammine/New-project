#!/bin/sh
# Start-up script for the production image.
#
# Hosting platforms (Render, Railway, Fly.io, Docker volumes…) often mount persistent storage
# owned by root. When started as root, make the media folder writable for the app user, then
# drop privileges so the app itself never runs as root.
set -e

APP_USER=nextjs
APP_GROUP=nodejs
MEDIA_DIR="${MEDIA_DIR:-/app/media}"

if [ "$(id -u)" = "0" ]; then
  mkdir -p "$MEDIA_DIR" /app/.next/cache
  chown "$APP_USER:$APP_GROUP" "$MEDIA_DIR" /app/.next/cache
  # Only touch files that need it, so restarts stay fast with many uploads.
  find "$MEDIA_DIR" /app/.next/cache \! -user "$APP_USER" -exec chown "$APP_USER:$APP_GROUP" {} +

  if command -v su-exec > /dev/null 2>&1; then
    exec su-exec "$APP_USER:$APP_GROUP" "$@"
  fi
  exec setpriv --reuid="$APP_USER" --regid="$APP_GROUP" --init-groups -- "$@"
fi

exec "$@"
