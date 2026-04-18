FROM node:22.19.0-alpine AS base

RUN corepack enable

FROM base AS builder

WORKDIR /app

ENV NODE_ENV=development
ENV YARN_NODE_LINKER=node-modules

COPY .yarnrc.yml package.json yarn.lock ./
COPY .yarn ./.yarn

RUN yarn install --immutable

COPY . .

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/teacoder?schema=public"

RUN yarn prisma generate
RUN yarn run build

RUN yarn workspaces focus --production

FROM node:22.19.0-alpine AS runner

WORKDIR /app

RUN corepack enable
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV YARN_NODE_LINKER=node-modules

RUN chown -R node:node /app
USER node

COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/prisma.config.ts ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma

CMD ["node", "dist/main"]