FROM node:20-alpine AS deps
WORKDIR /app
COPY services/activity-service/package*.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS build
WORKDIR /app
COPY services/activity-service/package*.json ./
RUN npm ci
COPY services/activity-service/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY services/activity-service/package.json ./
EXPOSE 3003
USER node
CMD ["node", "dist/server.js"]
