FROM node:20-alpine AS development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node . .

USER node

FROM node:20-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
RUN npm ci --only=production

COPY --chown=node:node . .
COPY --chown=node:node --from=development /usr/src/app/dist ./dist

USER node

CMD ["node", "dist/main"]
