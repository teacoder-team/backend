FROM node:20.12.0 AS base

FROM base AS builder

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn prisma generate

RUN yarn build

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --chown=nodejs:nodejs package.json yarn.lock ./

RUN yarn install --production

COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist
COPY --chown=nodejs:nodejs --from=builder /app/prisma/__generated__ ./prisma/__generated__

CMD ["node", "dist/main"]