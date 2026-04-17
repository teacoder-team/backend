FROM node:22.19.0 AS base

RUN corepack enable

FROM base AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --immutable

COPY . .

RUN yarn prisma generate
RUN yarn build

FROM base AS runner

WORKDIR /app

USER node

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --immutable

COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma/generated ./prisma/generated

CMD ["node", "dist/main"]
