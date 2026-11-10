# Stage 1: Build and generate Prisma Client
FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma7.config.ts ./

# Dummy URL is only used during client generation.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

RUN npx prisma generate --config prisma7.config.ts

COPY src ./src


# Stage 2: Production image
FROM node:24-alpine AS production
RUN npm install --global npm@latest
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/src ./src

USER node

EXPOSE 3000

CMD ["npm", "start"]
