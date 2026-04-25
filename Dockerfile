FROM oven/bun:1.1-slim AS base
WORKDIR /app

COPY package.json bun.lock ./ 
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

FROM base AS build
WORKDIR /app

COPY prisma ./prisma/
RUN bunx prisma generate

COPY . .
RUN bun run build

FROM oven/bun:1.1-slim AS release
WORKDIR /app

RUN chown bun:bun /app

COPY --from=build --chown=bun:bun /app/dist ./dist
COPY --from=build --chown=bun:bun /app/emails ./emails
COPY --from=build --chown=bun:bun /app/prisma/generated ./prisma/generated

USER bun

ENTRYPOINT ["bun", "run", "dist/main.js"]