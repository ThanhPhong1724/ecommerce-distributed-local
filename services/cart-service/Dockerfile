# services/cart-service/Dockerfile

# Stage 1: Build stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine
RUN apk add --no-cache wget
WORKDIR /usr/src/app

# Không cần build tools vì ioredis thường không có native deps phức tạp như bcrypt
# COPY package.json và package-lock.json
COPY --from=builder /usr/src/app/package*.json ./

# Cài production dependencies
RUN npm install --production

# Copy code đã build
COPY --from=builder /usr/src/app/dist ./dist

# Expose port (ví dụ: 3003)
EXPOSE 3003

# Command to run
CMD ["node", "dist/main"]