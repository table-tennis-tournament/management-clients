FROM node:lts-alpine3.14 AS builder

COPY ./package.json ./package-lock.json ./
RUN npm i && mkdir /ng-app && mv ./node_modules ./ng-app
WORKDIR /ng-app
COPY . .

RUN npm run build -- --output-path=./dist/out --configuration prod 

FROM bitnami/nginx:1.21.3
COPY --from=builder /ng-app/dist/out/ /usr/share/nginx/html
COPY --from=builder /ng-app/dist/out /app/


COPY my_server_block.conf /opt/bitnami/nginx/conf/server_blocks/my_server_block.conf
