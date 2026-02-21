FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/

RUN npm install
RUN npx tsc -b