FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Copy non-TS files that tsc doesn't handle
RUN cp -r src/config/*.sql dist/config/ 2>/dev/null || true
RUN mkdir -p uploads/cars

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 5001

CMD ["/app/docker-entrypoint.sh"]
