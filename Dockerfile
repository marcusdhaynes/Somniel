FROM node:24-alpine AS build
WORKDIR /app
COPY . .
RUN npm install --no-audit --no-fund && npm run build:web
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
