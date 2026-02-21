FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY packages/event-contracts/package.json ./packages/event-contracts/
COPY packages/kafka-client/package.json ./packages/kafka-client/
COPY packages/logger/package.json ./packages/logger/
COPY apps/web-client/package.json ./apps/web-client/

RUN npm install

COPY . .

RUN npx tsc -b