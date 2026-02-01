#!/bin/sh
set -e
echo "Running database migrations..."
npx prisma migrate deploy
echo "Seeding database (if needed)..."
npx prisma db seed || true
exec "$@"
