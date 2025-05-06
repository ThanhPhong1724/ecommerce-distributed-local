// src/main.ts (của notification-service)
import * as crypto from 'crypto'; // Import module crypto

// !!! THÊM ĐOẠN NÀY: Gán vào global scope một cách tường minh
// Kiểm tra để tránh lỗi nếu global.crypto đã tồn tại
if (typeof global !== 'undefined' && typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}
// Hoặc cách đơn giản hơn (nhưng kém an toàn hơn nếu global.crypto đã có):
// (global as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap-NotificationService');

  // Tạo microservice trực tiếp từ AppModule
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule, // Truyền AppModule vào đây
    {
      transport: Transport.RMQ,
      options: {
        // Lấy config trực tiếp từ AppModule (nếu ConfigModule là global)
        // Hoặc bạn cần inject ConfigService vào đây nếu không global
        // Cách đơn giản là đọc trực tiếp từ process.env nếu ConfigModule gặp vấn đề
        urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'], // Lấy trực tiếp từ env
        queue: process.env.RABBITMQ_NOTIFICATIONS_QUEUE || 'notifications.queue', // Lấy trực tiếp từ env
        queueOptions: {
          durable: true,
        },
        noAck: false,
      },
    },
  );

  // Lấy ConfigService từ microservice instance để lấy tên queue chính xác cho log
  const configService = app.get(ConfigService);
  const queueName = configService.get<string>('RABBITMQ_NOTIFICATIONS_QUEUE', 'notifications.queue');

  await app.listen();
  logger.log(`Notification Service is listening on queue: ${queueName}`);
}
bootstrap();