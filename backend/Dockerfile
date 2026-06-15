FROM node:22-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile
COPY backend/ .
RUN pnpm run build
CMD ["pnpm", "run", "start"]