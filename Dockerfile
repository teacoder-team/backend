# syntax=docker/dockerfile:1

FROM oven/bun:1.3.10-slim AS base

WORKDIR /app

COPY --parents package.json bun.lock packages/*/package.json ./

RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS build

WORKDIR /app

COPY prisma.config.ts tsconfig.json ./
COPY prisma ./prisma/

RUN bunx prisma generate

COPY packages ./packages/
COPY src ./src/

RUN bun run build

FROM oven/bun:1.3.10-slim AS geo

WORKDIR /resources

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ARG GEOLITE_RELEASE=latest

ADD https://github.com/P3TERX/GeoLite.mmdb/releases.atom /tmp/geolite-releases.atom

COPY docker-geoip.sh ./

RUN --mount=type=cache,id=geoip,target=/cache,sharing=locked \
    sh ./docker-geoip.sh /tmp/geolite-releases.atom /cache geo/city.mmdb


FROM oven/bun:1.3.10-slim AS release

WORKDIR /app

ENV NODE_ENV=production
ENV RESOURCES_DIR=/app/resources

COPY --from=build --chown=bun:bun /app/dist ./dist
COPY --from=build --chown=bun:bun /app/prisma ./prisma
COPY --from=build --chown=bun:bun /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=bun:bun /app/node_modules ./node_modules

COPY --chown=bun:bun resources ./resources
COPY --from=geo --chown=bun:bun /resources/geo ./resources/geo

COPY --chown=bun:bun docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

USER bun

ENTRYPOINT ["./docker-entrypoint.sh"]

CMD ["bun", "run", "dist/main.js"]
