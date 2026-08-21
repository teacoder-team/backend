FROM oven/bun:1.1-slim AS base
WORKDIR /app

COPY package.json bun.lock ./
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS build
WORKDIR /app

# prisma.config.ts points at prisma/models, so it must be present before generate.
COPY prisma.config.ts tsconfig.json ./
COPY prisma ./prisma/
RUN bunx prisma generate

COPY src ./src/
RUN bun run build

FROM oven/bun:1.1-slim AS release
WORKDIR /app

ENV NODE_ENV=production
ENV RESOURCES_DIR=/app/resources

COPY --from=build --chown=bun:bun /app/dist ./dist
COPY --from=build --chown=bun:bun /app/prisma ./prisma
# The geo database and the disposable-domain list are read at boot; without
# them the instance refuses to start rather than silently skipping the checks.
COPY --chown=bun:bun resources ./resources

USER bun

EXPOSE 3000

ENTRYPOINT ["bun", "run", "dist/main.js"]
