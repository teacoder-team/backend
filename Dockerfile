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

RUN yarn prisma generate
RUN yarn build

RUN yarn workspaces focus --production

FROM node:22.19.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV YARN_NODE_LINKER=node-modules

RUN apk add --no-cache libc6-compat openssl

RUN chown -R node:node /app
USER node

COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

COPY --from=builder /app/prisma/generated ./prisma/generated

CMD ["node", "dist/main"]
