# services/payment-service/Dockerfile

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

COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist

# Expose port (ví dụ: 3005)
EXPOSE 3005

CMD ["node", "dist/main"]