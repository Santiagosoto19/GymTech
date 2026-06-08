FROM node:20-alpine AS deps
WORKDIR /app
COPY services/notification-service/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY services/notification-service/package*.json ./
RUN npm ci
COPY services/notification-service/ ./
RUN npm run build

FROM node:20-alpine AS dev
WORKDIR /app
COPY services/notification-service/package*.json ./
RUN npm ci
COPY services/notification-service/ ./
EXPOSE 3005
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY services/notification-service/package.json ./
EXPOSE 3005
USER node
CMD ["node", "dist/server.js"]
