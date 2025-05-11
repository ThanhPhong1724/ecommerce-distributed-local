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

# Xóa database cũ (nếu cần)
docker-compose exec postgres_db psql -U myuser -c "DROP DATABASE IF EXISTS ecom_dev_db;"

# Tạo database mới
docker-compose exec postgres_db psql -U myuser -c "CREATE DATABASE ecom_dev_db;"

# Import với quyền superuser
docker-compose exec -T postgres_db psql -U myuser -d ecom_dev_db < d:/ecommerce-distributed-local/database-backups/ecommerce_backup.sql

# Kết nối vào container postgres
docker-compose exec postgres_db psql -U myuser ecom_dev_db -f /database-backups/update_products.sql

# Kết nối vào database
docker-compose exec postgres_db psql -U myuser -d ecom_dev_db

# Copy và paste các lệnh SQL vào terminal
-- Cập nhật hình ảnh cho sản phẩm hiện có
UPDATE public.products 
SET img = 'https://down-vn.img.susercontent.com/file/687ad3657fc30faa7c287025b87d843c@resize_w900_nl.webp'
WHERE id = 'a3c738bb-80d5-4bb6-9f46-afcbf3e2d37e';

UPDATE public.products 
SET img = 'https://down-vn.img.susercontent.com/file/f92af179125ccc6387638efad4231020.webp'
WHERE id = 'cb5d4813-97de-447f-b9b0-b2dece7d226b';

UPDATE public.products 
SET img = 'https://down-vn.img.susercontent.com/file/84fd0ff747f14ce3b32d4ed1b23b9a3a.webp'
WHERE id = '4ad34712-cd92-43ab-98dc-5aa1ced12166';

-- Thêm sản phẩm mới
INSERT INTO public.products (
    name, 
    description, 
    price, 
    "stockQuantity", 
    "categoryId",
    img
) VALUES 
-- Áo khoác
(
    'Áo Khoác Bomber Nữ',
    'Áo khoác bomber phong cách Hàn Quốc',
    299000.00,
    50,
    '763ec452-4e65-41dc-81b6-202326fb3c62',
    'https://down-vn.img.susercontent.com/file/a3989255d673b18b372bd61a4299482e.webp'
),
(
    'Áo Khoác Jean Nam',
    'Áo khoác jean nam form rộng',
    450000.00,
    30,
    '763ec452-4e65-41dc-81b6-202326fb3c62',
    'https://down-vn.img.susercontent.com/file/sg-11134201-22110-6eqx5fzxsjjvb7'
),
(
    'Áo Khoác Cardigan',
    'Áo cardigan len dệt kim',
    355000.00,
    40,
    '763ec452-4e65-41dc-81b6-202326fb3c62',
    'https://down-vn.img.susercontent.com/file/sg-11134201-22120-zc4r0tsktmlv49'
),
-- Quần jeans
(
    'Quần Jean Baggy',
    'Quần jean baggy ống rộng',
    420000.00,
    45,
    'b8d1c381-24d9-460b-93ca-781bdcfac3e9',
    'https://down-vn.img.susercontent.com/file/sg-11134201-22100-g8jj8pgjy3iv68'
),
(
    'Quần Jean Skinny',
    'Quần jean skinny co giãn',
    380000.00,
    35,
    'b8d1c381-24d9-460b-93ca-781bdcfac3e9',
    'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf4zz6n8ym5w26'
),
(
    'Quần Jean Straight',
    'Quần jean ống đứng basic',
    399000.00,
    40,
    'b8d1c381-24d9-460b-93ca-781bdcfac3e9',
    'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf9yjzslq49u38'
);

-- Thêm category mới
INSERT INTO public.categories (
    name,
    description
) VALUES 
(
    'Áo Thun',
    'Các loại áo thun nam nữ'
),
(
    'Áo Sơ Mi',
    'Các loại áo sơ mi công sở'
);

-- Thêm sản phẩm cho category mới
INSERT INTO public.products (
    name, 
    description, 
    price, 
    "stockQuantity", 
    "categoryId",
    img
) 
SELECT 
    'Áo Thun Basic',
    'Áo thun cotton 100% form rộng',
    150000.00,
    100,
    id,
    'https://down-vn.img.susercontent.com/file/vn-11134207-7qukw-lf9yjzslq49u38'
FROM public.categories 
WHERE name = 'Áo Thun'
UNION ALL
SELECT 
    'Áo Sơ Mi Trắng',
    'Áo sơ mi công sở dài tay',
    250000.00,
    80,
    id,
    'https://down-vn.img.susercontent.com/file/sg-11134201-22100-i5k0ashock3iv3c'
FROM public.categories 
WHERE name = 'Áo Sơ Mi';