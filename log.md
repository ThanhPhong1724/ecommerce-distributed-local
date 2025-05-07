2025-05-07 11:16:22.057 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [NestFactory] Starting Nest application...
2025-05-07 11:16:22.069 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] AppModule dependencies initialized +13ms
2025-05-07 11:16:22.070 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
2025-05-07 11:16:22.070 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] HttpModule dependencies initialized +1ms
2025-05-07 11:16:22.070 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
2025-05-07 11:16:22.071 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +1ms
2025-05-07 11:16:22.071 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
2025-05-07 11:16:22.129 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] ClientsModule dependencies initialized +58ms
2025-05-07 11:16:22.129 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] JwtModule dependencies initialized +0ms
2025-05-07 11:16:22.161 | query: SELECT version()
2025-05-07 11:16:22.167 | query: SELECT * FROM current_schema()
2025-05-07 11:16:22.177 | query: CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
2025-05-07 11:16:22.181 | query: START TRANSACTION
2025-05-07 11:16:22.183 | query: SELECT * FROM current_schema()
2025-05-07 11:16:22.183 | query: SELECT * FROM current_database()
2025-05-07 11:16:22.185 | query: SELECT "table_schema", "table_name", obj_description(('"' || "table_schema" || '"."' || "table_name" || '"')::regclass, 'pg_class') AS table_comment FROM "information_schema"."tables" WHERE ("table_schema" = 'public' AND "table_name" = 'order_items') OR ("table_schema" = 'public' AND "table_name" = 'orders')
2025-05-07 11:16:22.208 | query: SELECT TRUE FROM information_schema.columns WHERE table_name = 'pg_class' and column_name = 'relispartition'
2025-05-07 11:16:22.222 | query: SELECT columns.*, pg_catalog.col_description(('"' || table_catalog || '"."' || table_schema || '"."' || table_name || '"')::regclass::oid, ordinal_position) AS description, ('"' || "udt_schema" || '"."' || "udt_name" || '"')::"regtype" AS "regtype", pg_catalog.format_type("col_attr"."atttypid", "col_attr"."atttypmod") AS "format_type" FROM "information_schema"."columns" LEFT JOIN "pg_catalog"."pg_attribute" AS "col_attr" ON "col_attr"."attname" = "columns"."column_name" AND "col_attr"."attrelid" = ( SELECT "cls"."oid" FROM "pg_catalog"."pg_class" AS "cls" LEFT JOIN "pg_catalog"."pg_namespace" AS "ns" ON "ns"."oid" = "cls"."relnamespace" WHERE "cls"."relname" = "columns"."table_name" AND "ns"."nspname" = "columns"."table_schema" ) WHERE ("table_schema" = 'public' AND "table_name" = 'order_items') OR ("table_schema" = 'public' AND "table_name" = 'orders')
2025-05-07 11:16:22.223 | query: SELECT "ns"."nspname" AS "table_schema", "t"."relname" AS "table_name", "cnst"."conname" AS "constraint_name", pg_get_constraintdef("cnst"."oid") AS "expression", CASE "cnst"."contype" WHEN 'p' THEN 'PRIMARY' WHEN 'u' THEN 'UNIQUE' WHEN 'c' THEN 'CHECK' WHEN 'x' THEN 'EXCLUDE' END AS "constraint_type", "a"."attname" AS "column_name" FROM "pg_constraint" "cnst" INNER JOIN "pg_class" "t" ON "t"."oid" = "cnst"."conrelid" INNER JOIN "pg_namespace" "ns" ON "ns"."oid" = "cnst"."connamespace" LEFT JOIN "pg_attribute" "a" ON "a"."attrelid" = "cnst"."conrelid" AND "a"."attnum" = ANY ("cnst"."conkey") WHERE "t"."relkind" IN ('r', 'p') AND (("ns"."nspname" = 'public' AND "t"."relname" = 'order_items') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'orders'))
2025-05-07 11:16:22.223 | query: SELECT "ns"."nspname" AS "table_schema", "t"."relname" AS "table_name", "i"."relname" AS "constraint_name", "a"."attname" AS "column_name", CASE "ix"."indisunique" WHEN 't' THEN 'TRUE' ELSE'FALSE' END AS "is_unique", pg_get_expr("ix"."indpred", "ix"."indrelid") AS "condition", "types"."typname" AS "type_name", "am"."amname" AS "index_type" FROM "pg_class" "t" INNER JOIN "pg_index" "ix" ON "ix"."indrelid" = "t"."oid" INNER JOIN "pg_attribute" "a" ON "a"."attrelid" = "t"."oid"  AND "a"."attnum" = ANY ("ix"."indkey") INNER JOIN "pg_namespace" "ns" ON "ns"."oid" = "t"."relnamespace" INNER JOIN "pg_class" "i" ON "i"."oid" = "ix"."indexrelid" INNER JOIN "pg_type" "types" ON "types"."oid" = "a"."atttypid" INNER JOIN "pg_am" "am" ON "i"."relam" = "am"."oid" LEFT JOIN "pg_constraint" "cnst" ON "cnst"."conname" = "i"."relname" WHERE "t"."relkind" IN ('r', 'p') AND "cnst"."contype" IS NULL AND (("ns"."nspname" = 'public' AND "t"."relname" = 'order_items') OR ("ns"."nspname" = 'public' AND "t"."relname" = 'orders'))
2025-05-07 11:16:22.224 | query: SELECT "con"."conname" AS "constraint_name", "con"."nspname" AS "table_schema", "con"."relname" AS "table_name", "att2"."attname" AS "column_name", "ns"."nspname" AS "referenced_table_schema", "cl"."relname" AS "referenced_table_name", "att"."attname" AS "referenced_column_name", "con"."confdeltype" AS "on_delete", "con"."confupdtype" AS "on_update", "con"."condeferrable" AS "deferrable", "con"."condeferred" AS "deferred" FROM ( SELECT UNNEST ("con1"."conkey") AS "parent", UNNEST ("con1"."confkey") AS "child", "con1"."confrelid", "con1"."conrelid", "con1"."conname", "con1"."contype", "ns"."nspname", "cl"."relname", "con1"."condeferrable", CASE WHEN "con1"."condeferred" THEN 'INITIALLY DEFERRED' ELSE 'INITIALLY IMMEDIATE' END as condeferred, CASE "con1"."confdeltype" WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END as "confdeltype", CASE "con1"."confupdtype" WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT' WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END as "confupdtype" FROM "pg_class" "cl" INNER JOIN "pg_namespace" "ns" ON "cl"."relnamespace" = "ns"."oid" INNER JOIN "pg_constraint" "con1" ON "con1"."conrelid" = "cl"."oid" WHERE "con1"."contype" = 'f' AND (("ns"."nspname" = 'public' AND "cl"."relname" = 'order_items') OR ("ns"."nspname" = 'public' AND "cl"."relname" = 'orders')) ) "con" INNER JOIN "pg_attribute" "att" ON "att"."attrelid" = "con"."confrelid" AND "att"."attnum" = "con"."child" INNER JOIN "pg_class" "cl" ON "cl"."oid" = "con"."confrelid"  AND "cl"."relispartition" = 'f'INNER JOIN "pg_namespace" "ns" ON "cl"."relnamespace" = "ns"."oid" INNER JOIN "pg_attribute" "att2" ON "att2"."attrelid" = "con"."conrelid" AND "att2"."attnum" = "con"."parent"
2025-05-07 11:16:22.247 | query: SELECT "udt_schema", "udt_name" FROM "information_schema"."columns" WHERE "table_schema" = 'public' AND "table_name" = 'orders' AND "column_name"='status'
2025-05-07 11:16:22.249 | query: SELECT "e"."enumlabel" AS "value" FROM "pg_enum" "e" INNER JOIN "pg_type" "t" ON "t"."oid" = "e"."enumtypid" INNER JOIN "pg_namespace" "n" ON "n"."oid" = "t"."typnamespace" WHERE "n"."nspname" = 'public' AND "t"."typname" = 'orders_status_enum'
2025-05-07 11:16:22.252 | query: SELECT * FROM "information_schema"."tables" WHERE "table_schema" = 'public' AND "table_name" = 'typeorm_metadata'
2025-05-07 11:16:22.255 | query: COMMIT
2025-05-07 11:16:22.257 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized +127ms
2025-05-07 11:16:22.257 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized +0ms
2025-05-07 11:16:22.258 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [InstanceLoader] OrdersModule dependencies initialized +2ms
2025-05-07 11:16:22.260 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [OrderServiceMain] RABBITMQ_URL from config: amqp://rabbit_user:rabbit_pass@rabbitmq_queue:5672
2025-05-07 11:16:22.345 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [NestMicroservice] Nest microservice successfully started +86ms
2025-05-07 11:16:22.345 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [OrderServiceMain] Order Service is listening on RabbitMQ queue: 'orders_queue' for relevant patterns.
2025-05-07 11:16:22.349 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [RoutesResolver] OrdersController {/orders}: +3ms
2025-05-07 11:16:22.350 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [RouterExplorer] Mapped {/orders/health, GET} route +2ms
2025-05-07 11:16:22.351 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [RouterExplorer] Mapped {/orders, POST} route +1ms
2025-05-07 11:16:22.351 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [RouterExplorer] Mapped {/orders, GET} route +0ms
2025-05-07 11:16:22.352 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [RouterExplorer] Mapped {/orders/:id, GET} route +1ms
2025-05-07 11:16:22.354 | [Nest] 1  - 05/07/2025, 4:16:22 AM     LOG [NestApplication] Nest application successfully started +2ms
2025-05-07 11:16:22.356 | Order Service is running on: http://[::1]:3004
2025-05-07 11:17:14.252 | [Nest] 1  - 05/07/2025, 4:17:14 AM   DEBUG [AuthGuard] Request headers:
2025-05-07 11:17:14.254 | [Nest] 1  - 05/07/2025, 4:17:14 AM   DEBUG [AuthGuard] Object(20) {
2025-05-07 11:17:14.254 |   host: 'localhost',
2025-05-07 11:17:14.254 |   'x-real-ip': '172.18.0.1',
2025-05-07 11:17:14.254 |   'x-forwarded-for': '172.18.0.1',
2025-05-07 11:17:14.254 |   'x-forwarded-proto': 'http',
2025-05-07 11:17:14.254 |   connection: 'close',
2025-05-07 11:17:14.254 |   'content-length': '121',
2025-05-07 11:17:14.254 |   'sec-ch-ua-platform': '"Windows"',
2025-05-07 11:17:14.254 |   authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU4NzY4MSwiZXhwIjoxNzQ2NTkxMjgxfQ.i2JfGJ089-imNkrXkLGnqzFvfbIGxi0_DAEYsZqIY44',
2025-05-07 11:17:14.254 |   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
2025-05-07 11:17:14.254 |   accept: 'application/json, text/plain, */*',
2025-05-07 11:17:14.254 |   'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
2025-05-07 11:17:14.254 |   'content-type': 'application/json',
2025-05-07 11:17:14.254 |   'sec-ch-ua-mobile': '?0',
2025-05-07 11:17:14.254 |   origin: 'http://localhost:5173',
2025-05-07 11:17:14.254 |   'sec-fetch-site': 'same-site',
2025-05-07 11:17:14.254 |   'sec-fetch-mode': 'cors',
2025-05-07 11:17:14.254 |   'sec-fetch-dest': 'empty',
2025-05-07 11:17:14.254 |   referer: 'http://localhost:5173/',
2025-05-07 11:17:14.254 |   'accept-encoding': 'gzip, deflate, br, zstd',
2025-05-07 11:17:14.254 |   'accept-language': 'en-GB,en;q=0.9'
2025-05-07 11:17:14.254 | }
2025-05-07 11:17:14.254 | [Nest] 1  - 05/07/2025, 4:17:14 AM   DEBUG [AuthGuard] Authorization header:
2025-05-07 11:17:14.254 | [Nest] 1  - 05/07/2025, 4:17:14 AM   DEBUG [AuthGuard] Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU4NzY4MSwiZXhwIjoxNzQ2NTkxMjgxfQ.i2JfGJ089-imNkrXkLGnqzFvfbIGxi0_DAEYsZqIY44
2025-05-07 11:17:14.254 | [Nest] 1  - 05/07/2025, 4:17:14 AM   DEBUG [AuthGuard] Token type:
2025-05-07 11:17:14.254 | [Nest] 1  - 05/07/2025, 4:17:14 AM   DEBUG [AuthGuard] Bearer
2025-05-07 11:17:14.254 | [Nest] 1  - 05/07/2025, 4:17:14 AM   DEBUG [AuthGuard] Extracted token:
2025-05-07 11:17:14.254 | [Nest] 1  - 05/07/2025, 4:17:14 AM   DEBUG [AuthGuard] eyJhbGciOiJIUzI1NiIs...
2025-05-07 11:17:14.262 | [Nest] 1  - 05/07/2025, 4:17:14 AM   ERROR [AuthGuard] Token verification failed:
2025-05-07 11:17:14.264 | [Nest] 1  - 05/07/2025, 4:17:14 AM   ERROR [AuthGuard] TokenExpiredError: jwt expired
2025-05-07 11:17:14.264 |     at /usr/src/app/node_modules/jsonwebtoken/verify.js:190:21
2025-05-07 11:17:14.264 |     at getSecret (/usr/src/app/node_modules/jsonwebtoken/verify.js:97:14)
2025-05-07 11:17:14.264 |     at module.exports [as verify] (/usr/src/app/node_modules/jsonwebtoken/verify.js:101:10)
2025-05-07 11:17:14.264 |     at /usr/src/app/node_modules/@nestjs/jwt/dist/jwt.service.js:75:17
2025-05-07 11:17:14.264 |     at process.processTicksAndRejections (node:internal/process/task_queues:95:5) {
2025-05-07 11:17:14.264 |   expiredAt: 2025-05-07T04:14:41.000Z
2025-05-07 11:17:14.264 | }
2025-05-07 11:17:29.552 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Request headers:
2025-05-07 11:17:29.553 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Object(20) {
2025-05-07 11:17:29.553 |   host: 'localhost',
2025-05-07 11:17:29.553 |   'x-real-ip': '172.18.0.1',
2025-05-07 11:17:29.553 |   'x-forwarded-for': '172.18.0.1',
2025-05-07 11:17:29.553 |   'x-forwarded-proto': 'http',
2025-05-07 11:17:29.553 |   connection: 'close',
2025-05-07 11:17:29.553 |   'content-length': '153',
2025-05-07 11:17:29.553 |   'sec-ch-ua-platform': '"Windows"',
2025-05-07 11:17:29.553 |   authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU5MTQ0NiwiZXhwIjoxNzQ2NTk1MDQ2fQ.1D8Oex60kFPcXAirX1zGsdjRn7agosBn4C5GQCFcreE',
2025-05-07 11:17:29.553 |   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
2025-05-07 11:17:29.553 |   accept: 'application/json, text/plain, */*',
2025-05-07 11:17:29.553 |   'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
2025-05-07 11:17:29.553 |   'content-type': 'application/json',
2025-05-07 11:17:29.553 |   'sec-ch-ua-mobile': '?0',
2025-05-07 11:17:29.553 |   origin: 'http://localhost:5173',
2025-05-07 11:17:29.553 |   'sec-fetch-site': 'same-site',
2025-05-07 11:17:29.553 |   'sec-fetch-mode': 'cors',
2025-05-07 11:17:29.553 |   'sec-fetch-dest': 'empty',
2025-05-07 11:17:29.553 |   referer: 'http://localhost:5173/',
2025-05-07 11:17:29.553 |   'accept-encoding': 'gzip, deflate, br, zstd',
2025-05-07 11:17:29.553 |   'accept-language': 'en-GB,en;q=0.9'
2025-05-07 11:17:29.553 | }
2025-05-07 11:17:29.553 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Authorization header:
2025-05-07 11:17:29.553 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU5MTQ0NiwiZXhwIjoxNzQ2NTk1MDQ2fQ.1D8Oex60kFPcXAirX1zGsdjRn7agosBn4C5GQCFcreE
2025-05-07 11:17:29.553 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Token type:
2025-05-07 11:17:29.554 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Bearer
2025-05-07 11:17:29.554 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Extracted token:
2025-05-07 11:17:29.554 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] eyJhbGciOiJIUzI1NiIs...
2025-05-07 11:17:29.555 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Token verified successfully. Payload:
2025-05-07 11:17:29.556 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [AuthGuard] Object(4) {
2025-05-07 11:17:29.556 |   email: 'na@gmail.com',
2025-05-07 11:17:29.556 |   sub: '7d2a0c93-de37-44ed-a84d-5c0c2ef9257c',
2025-05-07 11:17:29.556 |   iat: 1746591446,
2025-05-07 11:17:29.556 |   exp: 1746595046
2025-05-07 11:17:29.556 | }
2025-05-07 11:17:29.562 | Received order request: {
2025-05-07 11:17:29.562 |   user: {
2025-05-07 11:17:29.562 |     email: 'na@gmail.com',
2025-05-07 11:17:29.562 |     sub: '7d2a0c93-de37-44ed-a84d-5c0c2ef9257c',
2025-05-07 11:17:29.562 |     iat: 1746591446,
2025-05-07 11:17:29.562 |     exp: 1746595046
2025-05-07 11:17:29.562 |   },
2025-05-07 11:17:29.562 |   payload: CreateOrderDto {
2025-05-07 11:17:29.562 |     shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
2025-05-07 11:17:29.562 |     orderItems: [ [OrderItemDto] ]
2025-05-07 11:17:29.562 |   }
2025-05-07 11:17:29.562 | }
2025-05-07 11:17:29.562 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] Bắt đầu tạo đơn hàng cho user: 7d2a0c93-de37-44ed-a84d-5c0c2ef9257c
2025-05-07 11:17:29.562 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] Token being sent to cart service:
2025-05-07 11:17:29.562 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU5MTQ0NiwiZXhwIjoxNzQ2NTk1MDQ2fQ.1D8Oex60kFPcXAirX1zGsdjRn7agosBn4C5GQCFcreE
2025-05-07 11:17:29.563 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] Calling service:
2025-05-07 11:17:29.563 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] http://cart_service:3003/cart
2025-05-07 11:17:29.563 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] Request config:
2025-05-07 11:17:29.563 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] Object(1) {
2025-05-07 11:17:29.563 |   headers: {
2025-05-07 11:17:29.563 |     Authorization: 'Bearer eyJhbGciOiJIU...'
2025-05-07 11:17:29.563 |   }
2025-05-07 11:17:29.563 | }
2025-05-07 11:17:29.587 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] Kiểm tra thông tin sản phẩm và tồn kho...
2025-05-07 11:17:29.587 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] Calling service:
2025-05-07 11:17:29.587 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] http://product_service:3002/products/a3c738bb-80d5-4bb6-9f46-afcbf3e2d37e
2025-05-07 11:17:29.587 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] Request config:
2025-05-07 11:17:29.587 | [Nest] 1  - 05/07/2025, 4:17:29 AM   DEBUG [OrdersService] Object(1) {
2025-05-07 11:17:29.587 |   headers: {
2025-05-07 11:17:29.587 |     Authorization: 'No token'
2025-05-07 11:17:29.587 |   }
2025-05-07 11:17:29.587 | }
2025-05-07 11:17:29.592 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] Tổng tiền đơn hàng dự kiến: 450000
2025-05-07 11:17:29.603 | query: START TRANSACTION
2025-05-07 11:17:29.604 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] Bắt đầu lưu đơn hàng vào DB...
2025-05-07 11:17:29.613 | query: INSERT INTO "orders"("id", "userId", "status", "totalAmount", "shippingAddress", "createdAt", "updatedAt") VALUES (DEFAULT, $1, $2, $3, $4, DEFAULT, DEFAULT) RETURNING "id", "status", "createdAt", "updatedAt" -- PARAMETERS: ["7d2a0c93-de37-44ed-a84d-5c0c2ef9257c","pending",450000,"123 Đường ABC, Quận 1, TP.HCM"]
2025-05-07 11:17:29.635 | query: INSERT INTO "order_items"("id", "productId", "quantity", "price", "productName", "orderId") VALUES (DEFAULT, $1, $2, $3, $4, $5) RETURNING "id" -- PARAMETERS: ["a3c738bb-80d5-4bb6-9f46-afcbf3e2d37e",1,"450000.00","Quần Jeans Slimfit Xanh","d2104bd5-f704-4f09-970b-589592355779"]
2025-05-07 11:17:29.640 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] Đã lưu Order ID: d2104bd5-f704-4f09-970b-589592355779
2025-05-07 11:17:29.640 | query: COMMIT
2025-05-07 11:17:29.643 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] Transaction commited cho Order ID: d2104bd5-f704-4f09-970b-589592355779
2025-05-07 11:17:29.643 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] Query runner released.
2025-05-07 11:17:29.643 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] Xóa giỏ hàng cho user: 7d2a0c93-de37-44ed-a84d-5c0c2ef9257c
2025-05-07 11:17:29.652 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] [7d2a0c93-de37-44ed-a84d-5c0c2ef9257c] Chuẩn bị emit sự kiện đến queue 'notifications.queue' cho Order ID: d2104bd5-f704-4f09-970b-589592355779
2025-05-07 11:17:29.652 | [Nest] 1  - 05/07/2025, 4:17:29 AM   ERROR [OrdersService] Lỗi khi xóa giỏ hàng user 7d2a0c93-de37-44ed-a84d-5c0c2ef9257c sau khi tạo đơn d2104bd5-f704-4f09-970b-589592355779: Request failed with status code 404
2025-05-07 11:17:29.652 | [Nest] 1  - 05/07/2025, 4:17:29 AM   ERROR [OrdersService] Không thể gửi yêu cầu xóa giỏ hàng cho user 7d2a0c93-de37-44ed-a84d-5c0c2ef9257c: Request failed with status code 404
2025-05-07 11:17:29.654 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [OrdersService] [7d2a0c93-de37-44ed-a84d-5c0c2ef9257c] Đã emit sự kiện đến Default Exchange với routing key (tên queue) 'notifications.queue' cho Order ID: d2104bd5-f704-4f09-970b-589592355779
2025-05-07 11:17:29.661 | query: SELECT DISTINCT "distinctAlias"."Order_id" AS "ids_Order_id" FROM (SELECT "Order"."id" AS "Order_id", "Order"."userId" AS "Order_userId", "Order"."status" AS "Order_status", "Order"."totalAmount" AS "Order_totalAmount", "Order"."shippingAddress" AS "Order_shippingAddress", "Order"."createdAt" AS "Order_createdAt", "Order"."updatedAt" AS "Order_updatedAt", "Order__Order_items"."id" AS "Order__Order_items_id", "Order__Order_items"."productId" AS "Order__Order_items_productId", "Order__Order_items"."quantity" AS "Order__Order_items_quantity", "Order__Order_items"."price" AS "Order__Order_items_price", "Order__Order_items"."productName" AS "Order__Order_items_productName", "Order__Order_items"."orderId" AS "Order__Order_items_orderId" FROM "orders" "Order" LEFT JOIN "order_items" "Order__Order_items" ON "Order__Order_items"."orderId"="Order"."id" WHERE (("Order"."id" = $1) AND ("Order"."userId" = $2))) "distinctAlias" ORDER BY "Order_id" ASC LIMIT 1 -- PARAMETERS: ["d2104bd5-f704-4f09-970b-589592355779","7d2a0c93-de37-44ed-a84d-5c0c2ef9257c"]
2025-05-07 11:17:29.666 | query: SELECT "Order"."id" AS "Order_id", "Order"."userId" AS "Order_userId", "Order"."status" AS "Order_status", "Order"."totalAmount" AS "Order_totalAmount", "Order"."shippingAddress" AS "Order_shippingAddress", "Order"."createdAt" AS "Order_createdAt", "Order"."updatedAt" AS "Order_updatedAt", "Order__Order_items"."id" AS "Order__Order_items_id", "Order__Order_items"."productId" AS "Order__Order_items_productId", "Order__Order_items"."quantity" AS "Order__Order_items_quantity", "Order__Order_items"."price" AS "Order__Order_items_price", "Order__Order_items"."productName" AS "Order__Order_items_productName", "Order__Order_items"."orderId" AS "Order__Order_items_orderId" FROM "orders" "Order" LEFT JOIN "order_items" "Order__Order_items" ON "Order__Order_items"."orderId"="Order"."id" WHERE ( (("Order"."id" = $1) AND ("Order"."userId" = $2)) ) AND ( "Order"."id" IN ($3) ) -- PARAMETERS: ["d2104bd5-f704-4f09-970b-589592355779","7d2a0c93-de37-44ed-a84d-5c0c2ef9257c","d2104bd5-f704-4f09-970b-589592355779"]
2025-05-07 11:17:29.724 | [Nest] 1  - 05/07/2025, 4:17:29 AM     LOG [ClientProxy] Successfully connected to RMQ broker
2025-05-07 11:18:09.256 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Request headers:
2025-05-07 11:18:09.257 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Object(18) {
2025-05-07 11:18:09.257 |   host: 'localhost',
2025-05-07 11:18:09.257 |   'x-real-ip': '172.18.0.1',
2025-05-07 11:18:09.257 |   'x-forwarded-for': '172.18.0.1',
2025-05-07 11:18:09.257 |   'x-forwarded-proto': 'http',
2025-05-07 11:18:09.257 |   connection: 'close',
2025-05-07 11:18:09.257 |   'sec-ch-ua-platform': '"Windows"',
2025-05-07 11:18:09.257 |   authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU5MTQ0NiwiZXhwIjoxNzQ2NTk1MDQ2fQ.1D8Oex60kFPcXAirX1zGsdjRn7agosBn4C5GQCFcreE',
2025-05-07 11:18:09.257 |   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
2025-05-07 11:18:09.257 |   accept: 'application/json, text/plain, */*',
2025-05-07 11:18:09.257 |   'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
2025-05-07 11:18:09.257 |   'sec-ch-ua-mobile': '?0',
2025-05-07 11:18:09.257 |   origin: 'http://localhost:5173',
2025-05-07 11:18:09.257 |   'sec-fetch-site': 'same-site',
2025-05-07 11:18:09.257 |   'sec-fetch-mode': 'cors',
2025-05-07 11:18:09.257 |   'sec-fetch-dest': 'empty',
2025-05-07 11:18:09.257 |   referer: 'http://localhost:5173/',
2025-05-07 11:18:09.257 |   'accept-encoding': 'gzip, deflate, br, zstd',
2025-05-07 11:18:09.257 |   'accept-language': 'en-GB,en;q=0.9'
2025-05-07 11:18:09.257 | }
2025-05-07 11:18:09.257 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Authorization header:
2025-05-07 11:18:09.257 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU5MTQ0NiwiZXhwIjoxNzQ2NTk1MDQ2fQ.1D8Oex60kFPcXAirX1zGsdjRn7agosBn4C5GQCFcreE
2025-05-07 11:18:09.257 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Token type:
2025-05-07 11:18:09.257 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Bearer
2025-05-07 11:18:09.258 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Extracted token:
2025-05-07 11:18:09.258 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] eyJhbGciOiJIUzI1NiIs...
2025-05-07 11:18:09.262 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Token verified successfully. Payload:
2025-05-07 11:18:09.262 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Object(4) {
2025-05-07 11:18:09.262 |   email: 'na@gmail.com',
2025-05-07 11:18:09.262 |   sub: '7d2a0c93-de37-44ed-a84d-5c0c2ef9257c',
2025-05-07 11:18:09.262 |   iat: 1746591446,
2025-05-07 11:18:09.262 |   exp: 1746595046
2025-05-07 11:18:09.262 | }
2025-05-07 11:18:09.281 | query: SELECT DISTINCT "distinctAlias"."Order_id" AS "ids_Order_id" FROM (SELECT "Order"."id" AS "Order_id", "Order"."userId" AS "Order_userId", "Order"."status" AS "Order_status", "Order"."totalAmount" AS "Order_totalAmount", "Order"."shippingAddress" AS "Order_shippingAddress", "Order"."createdAt" AS "Order_createdAt", "Order"."updatedAt" AS "Order_updatedAt", "Order__Order_items"."id" AS "Order__Order_items_id", "Order__Order_items"."productId" AS "Order__Order_items_productId", "Order__Order_items"."quantity" AS "Order__Order_items_quantity", "Order__Order_items"."price" AS "Order__Order_items_price", "Order__Order_items"."productName" AS "Order__Order_items_productName", "Order__Order_items"."orderId" AS "Order__Order_items_orderId" FROM "orders" "Order" LEFT JOIN "order_items" "Order__Order_items" ON "Order__Order_items"."orderId"="Order"."id" WHERE (("Order"."id" = $1) AND ("Order"."userId" = $2))) "distinctAlias" ORDER BY "Order_id" ASC LIMIT 1 -- PARAMETERS: ["d2104bd5-f704-4f09-970b-589592355779","7d2a0c93-de37-44ed-a84d-5c0c2ef9257c"]
2025-05-07 11:18:09.289 | query: SELECT "Order"."id" AS "Order_id", "Order"."userId" AS "Order_userId", "Order"."status" AS "Order_status", "Order"."totalAmount" AS "Order_totalAmount", "Order"."shippingAddress" AS "Order_shippingAddress", "Order"."createdAt" AS "Order_createdAt", "Order"."updatedAt" AS "Order_updatedAt", "Order__Order_items"."id" AS "Order__Order_items_id", "Order__Order_items"."productId" AS "Order__Order_items_productId", "Order__Order_items"."quantity" AS "Order__Order_items_quantity", "Order__Order_items"."price" AS "Order__Order_items_price", "Order__Order_items"."productName" AS "Order__Order_items_productName", "Order__Order_items"."orderId" AS "Order__Order_items_orderId" FROM "orders" "Order" LEFT JOIN "order_items" "Order__Order_items" ON "Order__Order_items"."orderId"="Order"."id" WHERE ( (("Order"."id" = $1) AND ("Order"."userId" = $2)) ) AND ( "Order"."id" IN ($3) ) -- PARAMETERS: ["d2104bd5-f704-4f09-970b-589592355779","7d2a0c93-de37-44ed-a84d-5c0c2ef9257c","d2104bd5-f704-4f09-970b-589592355779"]
2025-05-07 11:18:09.294 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Request headers:
2025-05-07 11:18:09.295 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Object(19) {
2025-05-07 11:18:09.295 |   host: 'localhost',
2025-05-07 11:18:09.295 |   'x-real-ip': '172.18.0.1',
2025-05-07 11:18:09.295 |   'x-forwarded-for': '172.18.0.1',
2025-05-07 11:18:09.295 |   'x-forwarded-proto': 'http',
2025-05-07 11:18:09.295 |   connection: 'close',
2025-05-07 11:18:09.295 |   'sec-ch-ua-platform': '"Windows"',
2025-05-07 11:18:09.295 |   authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU5MTQ0NiwiZXhwIjoxNzQ2NTk1MDQ2fQ.1D8Oex60kFPcXAirX1zGsdjRn7agosBn4C5GQCFcreE',
2025-05-07 11:18:09.295 |   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
2025-05-07 11:18:09.295 |   accept: 'application/json, text/plain, */*',
2025-05-07 11:18:09.295 |   'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
2025-05-07 11:18:09.295 |   'sec-ch-ua-mobile': '?0',
2025-05-07 11:18:09.295 |   origin: 'http://localhost:5173',
2025-05-07 11:18:09.295 |   'sec-fetch-site': 'same-site',
2025-05-07 11:18:09.295 |   'sec-fetch-mode': 'cors',
2025-05-07 11:18:09.295 |   'sec-fetch-dest': 'empty',
2025-05-07 11:18:09.295 |   referer: 'http://localhost:5173/',
2025-05-07 11:18:09.295 |   'accept-encoding': 'gzip, deflate, br, zstd',
2025-05-07 11:18:09.295 |   'accept-language': 'en-GB,en;q=0.9',
2025-05-07 11:18:09.295 |   'if-none-match': 'W/"1f7-Jo1MJiFNHXq4kakztylDwnq/8+s"'
2025-05-07 11:18:09.295 | }
2025-05-07 11:18:09.295 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Authorization header:
2025-05-07 11:18:09.295 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5hQGdtYWlsLmNvbSIsInN1YiI6IjdkMmEwYzkzLWRlMzctNDRlZC1hODRkLTVjMGMyZWY5MjU3YyIsImlhdCI6MTc0NjU5MTQ0NiwiZXhwIjoxNzQ2NTk1MDQ2fQ.1D8Oex60kFPcXAirX1zGsdjRn7agosBn4C5GQCFcreE
2025-05-07 11:18:09.295 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Token type:
2025-05-07 11:18:09.295 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Bearer
2025-05-07 11:18:09.295 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Extracted token:
2025-05-07 11:18:09.295 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] eyJhbGciOiJIUzI1NiIs...
2025-05-07 11:18:09.296 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Token verified successfully. Payload:
2025-05-07 11:18:09.297 | [Nest] 1  - 05/07/2025, 4:18:09 AM   DEBUG [AuthGuard] Object(4) {
2025-05-07 11:18:09.297 |   email: 'na@gmail.com',
2025-05-07 11:18:09.297 |   sub: '7d2a0c93-de37-44ed-a84d-5c0c2ef9257c',
2025-05-07 11:18:09.297 |   iat: 1746591446,
2025-05-07 11:18:09.297 |   exp: 1746595046
2025-05-07 11:18:09.297 | }
2025-05-07 11:18:09.301 | query: SELECT DISTINCT "distinctAlias"."Order_id" AS "ids_Order_id" FROM (SELECT "Order"."id" AS "Order_id", "Order"."userId" AS "Order_userId", "Order"."status" AS "Order_status", "Order"."totalAmount" AS "Order_totalAmount", "Order"."shippingAddress" AS "Order_shippingAddress", "Order"."createdAt" AS "Order_createdAt", "Order"."updatedAt" AS "Order_updatedAt", "Order__Order_items"."id" AS "Order__Order_items_id", "Order__Order_items"."productId" AS "Order__Order_items_productId", "Order__Order_items"."quantity" AS "Order__Order_items_quantity", "Order__Order_items"."price" AS "Order__Order_items_price", "Order__Order_items"."productName" AS "Order__Order_items_productName", "Order__Order_items"."orderId" AS "Order__Order_items_orderId" FROM "orders" "Order" LEFT JOIN "order_items" "Order__Order_items" ON "Order__Order_items"."orderId"="Order"."id" WHERE (("Order"."id" = $1) AND ("Order"."userId" = $2))) "distinctAlias" ORDER BY "Order_id" ASC LIMIT 1 -- PARAMETERS: ["d2104bd5-f704-4f09-970b-589592355779","7d2a0c93-de37-44ed-a84d-5c0c2ef9257c"]
2025-05-07 11:18:09.303 | query: SELECT "Order"."id" AS "Order_id", "Order"."userId" AS "Order_userId", "Order"."status" AS "Order_status", "Order"."totalAmount" AS "Order_totalAmount", "Order"."shippingAddress" AS "Order_shippingAddress", "Order"."createdAt" AS "Order_createdAt", "Order"."updatedAt" AS "Order_updatedAt", "Order__Order_items"."id" AS "Order__Order_items_id", "Order__Order_items"."productId" AS "Order__Order_items_productId", "Order__Order_items"."quantity" AS "Order__Order_items_quantity", "Order__Order_items"."price" AS "Order__Order_items_price", "Order__Order_items"."productName" AS "Order__Order_items_productName", "Order__Order_items"."orderId" AS "Order__Order_items_orderId" FROM "orders" "Order" LEFT JOIN "order_items" "Order__Order_items" ON "Order__Order_items"."orderId"="Order"."id" WHERE ( (("Order"."id" = $1) AND ("Order"."userId" = $2)) ) AND ( "Order"."id" IN ($3) ) -- PARAMETERS: ["d2104bd5-f704-4f09-970b-589592355779","7d2a0c93-de37-44ed-a84d-5c0c2ef9257c","d2104bd5-f704-4f09-970b-589592355779"]