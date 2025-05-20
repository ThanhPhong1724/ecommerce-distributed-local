// src/main.ts (của payment-service)
import 'reflect-metadata';
import * as crypto from 'crypto';

if (typeof global !== 'undefined' && typeof global.crypto === 'undefined'){
  (global as any).crypto = crypto;
}

import { NestFactory } from "@nestjs/core/nest-factory";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// ... imports ...
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  // Sửa lại cấu hình ValidationPipe
  app.useGlobalPipes(new ValidationPipe({ // <<< SỬA Ở ĐÂY
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
        enableImplicitConversion: true,
    }
  }));
  const port = configService.get<number>('PORT', 3005); // <<< Lấy port 3005
  await app.listen(port);
  console.log(`Payment Service is running on: ${await app.getUrl()}`); // Sửa tên
}
bootstrap();