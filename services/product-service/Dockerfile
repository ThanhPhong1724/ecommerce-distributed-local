# services/product-service/Dockerfile

# Stage 1: Build stage
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine
WORKDIR /usr/src/app

# Cài đặt build tools cần thiết (nếu có native deps, cache-manager-redis-store thường không cần)
# RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist

# RUN apk del python3 make g++ # Xóa nếu đã cài

# Expose the port (ví dụ: 3002)
EXPOSE 3002

# Command to run the application
CMD ["node", "dist/main"]