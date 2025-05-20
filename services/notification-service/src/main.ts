// src/main.ts (của notification-service)
import 'reflect-metadata';
import * as crypto from 'crypto';

if (typeof global !== 'undefined' && typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap-NotificationService');

  // Tạo app context để lấy config trước khi tạo microservice
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');

  if (!rabbitmqUrl) {
    logger.error('RABBITMQ_URL is not defined in .env. Microservice cannot start.');
    await appContext.close();
    return;
  }

  logger.log(`Attempting to connect Notification Service microservice to RabbitMQ: ${rabbitmqUrl}`);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule, // AppModule chứa NotificationsModule và các cấu hình cần thiết
    {
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        // KHÔNG chỉ định queue ở đây. NestJS sẽ tự tạo queue(s)
        // dựa trên các @MessagePattern trong controllers.
        // Tên queue mặc định thường là tên pattern.
        queueOptions: {
          durable: true, // Nên để durable để queue không mất khi RabbitMQ restart
        },
        noAck: false, // Quan trọng: Xử lý ack/nack thủ công
      },
    },
  );

  await app.listen(); // Bắt đầu lắng nghe messages
  logger.log(`Notification Service microservice is running and listening for patterns.`);
  await appContext.close(); // Đóng app context tạm thời
}
bootstrap();