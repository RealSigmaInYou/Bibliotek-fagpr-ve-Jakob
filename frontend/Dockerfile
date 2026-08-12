# Dockerfile for the frontend

FROM ghcr.io/pnpm/pnpm:11 AS builder

RUN pnpm runtime set node 22 -g

WORKDIR /app
COPY . .

RUN pnpm install 

RUN pnpm run build

FROM alpinelinux/darkhttpd:latest
WORKDIR /var/www

COPY --from=builder /app/dist /var/www

EXPOSE 80

ENTRYPOINT ["darkhttpd", "/var/www", "--port", "80"]
