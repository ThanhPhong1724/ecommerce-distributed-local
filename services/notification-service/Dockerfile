# services/notification-service/Dockerfile

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

# Không cần build tools
COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist

# Không cần Expose port vì nó không mở port HTTP

# Command to run
CMD ["node", "dist/main"]