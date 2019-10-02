FROM bitnami/nginx:1.16
RUN rm -rf /app/*
COPY dist/* /app/