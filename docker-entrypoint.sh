#!/bin/sh
set -e

echo "Starting entrypoint"

echo "Running database migrations..."
MIGRATE_ATTEMPTS="${MIGRATE_ATTEMPTS:-12}"
MIGRATE_DELAY_SECONDS="${MIGRATE_DELAY_SECONDS:-5}"
attempt=1
until ./node_modules/.bin/prisma migrate deploy; do
    if [ "$attempt" -ge "$MIGRATE_ATTEMPTS" ]; then
        echo "Database migration failed after ${attempt} attempts! Exiting..."
        exit 1
    fi
    echo "Database migration failed (attempt ${attempt}/${MIGRATE_ATTEMPTS}), retrying in ${MIGRATE_DELAY_SECONDS}s..."
    attempt=$((attempt + 1))
    sleep "$MIGRATE_DELAY_SECONDS"
done
echo "Migrations deployed successfully."

echo "Starting application..."

exec "$@"