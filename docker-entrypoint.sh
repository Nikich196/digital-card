#!/bin/sh
set -e

# The database has to be usable the moment the container starts, so migrations
# and seeding run here rather than being a manual step. Both are idempotent:
# `migrate deploy` skips applied migrations, the seed upserts on a stable slug.
echo "==> applying migrations"
npx prisma migrate deploy

echo "==> seeding profile data"
# Напрямую скомпилированным файлом, а не через `prisma db seed`: та
# команда запускает seed.ts под ts-node, которого в рантайм-образе нет.
node dist/prisma/seed.js

echo "==> starting application"
exec "$@"
