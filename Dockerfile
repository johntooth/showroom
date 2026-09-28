# syntax=docker/dockerfile:1

FROM node:24-slim AS build
WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:24-slim AS run
WORKDIR /app

COPY --from=build /app/dist ./public
COPY server ./server

ENV NODE_ENV=production \
    STATIC_DIR=/app/public \
    DATA_DIR=/data \
    PORT=8080

RUN mkdir -p /data && chown -R node:node /data
USER node
VOLUME /data
EXPOSE 8080

CMD ["node", "server/index.js"]
