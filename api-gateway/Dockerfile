# api-gateway/Dockerfile

# Sử dụng image Nginx chính thức, phiên bản alpine gọn nhẹ
FROM nginx:1.25-alpine

# Xóa file cấu hình mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy file cấu hình tùy chỉnh của bạn vào thư mục cấu hình của Nginx trong container
COPY nginx.conf /etc/nginx/nginx.conf

# Mở port 80 để Nginx lắng nghe
EXPOSE 80

# Lệnh mặc định để khởi chạy Nginx khi container bắt đầu
# 'daemon off;' để Nginx chạy ở foreground, cần thiết cho Docker
CMD ["nginx", "-g", "daemon off;"]