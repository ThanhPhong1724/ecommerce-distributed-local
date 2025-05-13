# Tạo thư mục chứa file backup
mkdir -p d:/ecommerce-distributed-local/database-backups

# Tạo ra file backup từ db
docker-compose exec postgres_db pg_dump -U myuser ecom_dev_db > d:/ecommerce-distributed-local/database-backups/ecommerce_backup.sql

# Đảm bảo container ps đang chạy
docker-compose ps

# Nếu database chưa tồn tại, tạo mới
docker-compose exec postgres_db psql -U myuser -c "CREATE DATABASE ecom_dev_db;"

# Import dữ liệu từ file backup
docker-compose exec -T postgres_db psql -U myuser ecom_dev_db < d:/ecommerce-distributed-local/database-backups/ecommerce_backup.sql

# 1. Drop database cũ nếu tồn tại (kết nối tới 'postgres' DB)
docker-compose exec -T postgres_db psql -U myuser -d postgres -c "DROP DATABASE IF EXISTS ecom_dev_db;"

# 2. Tạo lại database mới (kết nối tới 'postgres' DB)
docker-compose exec -T postgres_db psql -U myuser -d postgres -c "CREATE DATABASE ecom_dev_db OWNER myuser;"

# 3. Restore dữ liệu vào database vừa tạo (kết nối tới 'ecom_dev_db')
Get-Content "d:/ecommerce-distributed-local/database-backups/ecommerce_backup.sql" | docker-compose exec -T postgres_db psql -U myuser -d ecom_dev_db

# Kết nối vào container postgres
docker-compose exec postgres_db psql -U myuser ecom_dev_db -f /database-backups/update_products.sql

# Kết nối vào database
docker-compose exec postgres_db psql -U myuser -d ecom_dev_db

# @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
# 1. Tạo backup bên trong container với PGCLIENTENCODING=UTF8
docker-compose exec -e PGCLIENTENCODING=UTF8 postgres_db pg_dump -U myuser -d ecom_dev_db -F p -f /tmp/ecommerce_backup.sql

# 2. Copy file từ container ra host (thay postgres_db_container_name bằng tên container thực tế nếu cần)
# Tìm tên container: docker ps --filter "name=postgres_db" --format "{{.Names}}"
# Giả sử tên container là ecommerce-distributed-local-postgres_db-1
docker cp postgres_db_container:/tmp/ecommerce_backup.sql "d:/ecommerce-distributed-local/database-backups/"

# 3. (Optional) Xóa file tạm trong container
docker-compose exec postgres_db rm /tmp/ecommerce_backup.sql