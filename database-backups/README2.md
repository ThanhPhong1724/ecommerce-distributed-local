# DROP và CREATE lại database (như bạn đã làm, để đảm bảo sạch sẽ):
docker-compose exec -T postgres_db psql -U myuser -d postgres -c "DROP DATABASE IF EXISTS ecom_dev_db;"

docker-compose exec -T postgres_db psql -U myuser -d postgres -c "CREATE DATABASE ecom_dev_db OWNER myuser ENCODING 'UTF8' LC_COLLATE='C.UTF-8' LC_CTYPE='C.UTF-8' TEMPLATE template0;"

# Copy file backup vào bên trong container postgres_db:
# Tìm tên container nếu bạn chưa biết chắc
# $containerName = docker ps --filter "label=com.docker.compose.service=postgres_db" --format "{{.Names}}" | Select-Object -First 1
# Giả sử tên container là ecommerce-distributed-local-postgres_db-1 (thay bằng tên đúng của bạn)

docker cp "d:/ecommerce-distributed-local/database-backups/ecommerce_backup.sql" postgres_db_container:/tmp/ecommerce_backup.sql

# Thực thi psql với file backup bên trong container:
docker-compose exec -T postgres_db psql -U myuser -d ecom_dev_db -f /tmp/ecommerce_backup.sql

# --- Cho database user product (ecommerce_up_db) ---
# DROP và CREATE lại database:
docker-compose exec -T postgres_db_user_product psql -U user_product_admin -d postgres -c "DROP DATABASE IF EXISTS ecommerce_up_db;"
docker-compose exec -T postgres_db_user_product psql -U user_product_admin -d postgres -c "CREATE DATABASE ecommerce_up_db OWNER user_product_admin ENCODING 'UTF8' LC_COLLATE='C.UTF-8' LC_CTYPE='C.UTF-8' TEMPLATE template0;"

# Copy file backup:
docker cp "d:/ecommerce-distributed-local/database-backups/user_product_backup.sql" postgres_db_up_container:/tmp/user_product_backup.sql

# Thực thi psql với file backup:
docker-compose exec -T postgres_db_user_product psql -U user_product_admin -d ecommerce_up_db -f /tmp/user_product_backup.sql

# --- Cho database order cart (ecommerce_oc_db) ---
# DROP và CREATE lại database:
docker-compose exec -T postgres_db_order_cart psql -U order_cart_admin -d postgres -c "DROP DATABASE IF EXISTS ecommerce_oc_db;"
docker-compose exec -T postgres_db_order_cart psql -U order_cart_admin -d postgres -c "CREATE DATABASE ecommerce_oc_db OWNER order_cart_admin ENCODING 'UTF8' LC_COLLATE='C.UTF-8' LC_CTYPE='C.UTF-8' TEMPLATE template0;"

# Copy file backup:
docker cp "d:/ecommerce-distributed-local/database-backups/order_cart_backup.sql" postgres_db_oc_container:/tmp/order_cart_backup.sql

# Thực thi psql với file backup:
docker-compose exec -T postgres_db_order_cart psql -U order_cart_admin -d ecommerce_oc_db -f /tmp/order_cart_backup.sql