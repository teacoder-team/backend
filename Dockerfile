FROM node:22.19.0 AS base

RUN corepack enable

FROM base AS builder

WORKDIR /app

ENV YARN_NODE_LINKER=node-modules

COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .

RUN yarn prisma generate
RUN yarn build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV YARN_NODE_LINKER=node-modules

COPY package.json yarn.lock ./

RUN chown -R node:node /app

USER node

RUN yarn install --immutable

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma/generated ./prisma/generated

CMD ["node", "dist/main"]
