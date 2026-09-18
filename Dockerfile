FROM oven/bun:1.3.10-slim AS base

WORKDIR /app

COPY package.json bun.lock ./

RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS build

WORKDIR /app

COPY prisma.config.ts tsconfig.json ./
COPY prisma ./prisma/

RUN bunx prisma generate

COPY src ./src/

RUN bun run build

FROM oven/bun:1.3.10-slim AS release

WORKDIR /app

ENV NODE_ENV=production
ENV RESOURCES_DIR=/app/resources

COPY --from=build --chown=bun:bun /app/dist ./dist
COPY --from=build --chown=bun:bun /app/prisma ./prisma
COPY --from=build --chown=bun:bun /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=bun:bun /app/node_modules ./node_modules

COPY --chown=bun:bun docker-entrypoint.sh ./docker-entrypoint.sh

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && mkdir -p resources/geo \
    && curl -fL \
       "https://github.com/P3TERX/GeoLite.mmdb/releases/download/2026.09.16/GeoLite2-City.mmdb" \
       -o resources/geo/city.mmdb \
    && chown -R bun:bun resources \
    && rm -rf /var/lib/apt/lists/*

RUN chmod +x docker-entrypoint.sh

USER bun

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["bun", "run", "dist/main.js"]