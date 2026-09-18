#!/bin/sh

set -e

echo "Running database migrations..."

bunx prisma migrate deploy

echo "Database migrations completed."

echo "Starting application..."

exec bun run dist/main.js