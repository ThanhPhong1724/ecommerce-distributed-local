// src/main.ts
import * as crypto from 'crypto'; // Import module crypto

// !!! THÊM ĐOẠN NÀY: Gán vào global scope một cách tường minh
// Kiểm tra để tránh lỗi nếu global.crypto đã tồn tại
if (typeof global !== 'undefined' && typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}
// Hoặc cách đơn giản hơn (nhưng kém an toàn hơn nếu global.crypto đã có):
// (global as any).crypto = crypto;


import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'; // Bỏ comment nếu bạn dùng global guard ở đây

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,
    }
  }));

  // const reflector = app.get(Reflector);
  // app.useGlobalGuards(new JwtAuthGuard(reflector)); // Bỏ comment nếu dùng global guard ở đây

  const port = configService.get<number>('PORT', 3001);
  await app.listen(port);
  console.log(`User Service is running on: ${await app.getUrl()}`);
}
bootstrap();