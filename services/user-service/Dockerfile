# services/user-service/Dockerfile

# Stage 1: Build stage (Chỉ để biên dịch TypeScript)
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
# Cài tất cả dependencies (bao gồm devDependencies) để chạy build
RUN npm install
COPY . .
RUN npm run build
# KHÔNG làm gì thêm với node_modules hay package*.json ở đây

# Stage 2: Production stage (Chạy ứng dụng)
FROM node:18-alpine
# Trước dòng CMD hoặc ENTRYPOINT
WORKDIR /usr/src/app

# Cài đặt các build tools cần thiết CHO native addons
RUN apk add --no-cache python3 make g++ wget

# Copy CHỈ package.json và package-lock.json từ thư mục gốc dự án
# Đảm bảo chúng ta có file lock nhất quán từ builder stage (hoặc từ gốc nếu không thay đổi)
COPY package*.json ./
# Hoặc copy từ builder stage nếu chắc chắn nó không bị thay đổi bởi lệnh phức tạp trước đó:
# COPY --from=builder /usr/src/app/package*.json ./

# !!! Quan trọng: Cài đặt CHỈ production dependencies VÀ KHÔNG ignore scripts
RUN npm install --production
# Nếu vẫn lỗi, thử xóa node_modules cũ (nếu có) và cache npm trước khi install
# RUN rm -rf node_modules && npm cache clean --force && npm install --production

# Copy code đã build từ builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Dọn dẹp build tools (tùy chọn)
RUN apk del python3 make g++

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["node", "dist/main"]