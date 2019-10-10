FROM node:12.8-alpine AS builder

COPY package.json package-lock.json ./
RUN npm i && mkdir /ng-app && mv ./node_modules ./ng-app
WORKDIR /ng-app
COPY . .

RUN npm run build

FROM bitnami/nginx:1.16
COPY --from=builder /ng-app/dist /app/
COPY my_server_block.conf /opt/bitnami/nginx/conf/server_blocks/my_server_block.conf
