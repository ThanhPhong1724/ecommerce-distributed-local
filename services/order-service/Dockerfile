# services/order-service/Dockerfile

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

# Có thể cần build tools nếu có native dependency khác, nhưng hiện tại thì không
# RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist

# RUN apk del python3 make g++

# Expose port (ví dụ: 3004)
EXPOSE 3004

# Command to run
CMD ["node", "dist/main"]