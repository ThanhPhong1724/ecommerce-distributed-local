// src/main.ts
import * as crypto from 'crypto'; // Import module crypto

// !!! THÊM ĐOẠN NÀY: Gán vào global scope một cách tường minh
// Kiểm tra để tránh lỗi nếu global.crypto đã tồn tại
if (typeof global !== 'undefined' && typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}
// Hoặc cách đơn giản hơn (nhưng kém an toàn hơn nếu global.crypto đã có):
// (global as any).crypto = crypto;

// src/main.ts (của cart-service)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));

  const port = configService.get<number>('PORT', 3003); // <<< Lấy port 3003
  await app.listen(port);
  console.log(`Cart Service is running on: ${await app.getUrl()}`); // Sửa tên service
}
bootstrap();