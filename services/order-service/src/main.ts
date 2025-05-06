import 'reflect-metadata'; // <--- Thêm dòng này VÀO ĐẦU TIÊN!

// src/main.ts
import * as crypto from 'crypto'; // Import module crypto

// !!! THÊM ĐOẠN NÀY: Gán vào global scope một cách tường minh
// Kiểm tra để tránh lỗi nếu global.crypto đã tồn tại
if (typeof global !== 'undefined' && typeof global.crypto === 'undefined') {
  (global as any).crypto = crypto;
}
// Hoặc cách đơn giản hơn (nhưng kém an toàn hơn nếu global.crypto đã có):
// (global as any).crypto = crypto;

// src/main.ts (của order-service)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('OrderServiceMain');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // app.setGlobalPrefix('api');

  // --- KẾT NỐI MICROSERVICE VỚI RABBITMQ ĐỂ LẮNG NGHE ---
  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  logger.log(`RABBITMQ_URL from config: ${rabbitmqUrl}`); // <<<< THÊM LOG NÀY
  if (!rabbitmqUrl) {
    logger.error('RABBITMQ_URL is not defined. Microservice listener will not start.');
  } else {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'orders_queue', // <<<< TÊN QUEUE MÀ ORDER SERVICE SẼ LẮNG NGHE
                              // PaymentService sẽ emit đến default exchange,
                              // RabbitMQ sẽ route message có routing key 'payment_processed'
                              // đến queue này nếu có binding tương ứng.
        queueOptions: {
          durable: true, // Queue sẽ tồn tại sau khi RabbitMQ khởi động lại
        },
        noAck: false, // QUAN TRỌNG: Đặt là false để có thể ack/nack message thủ công
      },
    });
    await app.startAllMicroservices();
    logger.log(`Order Service is listening on RabbitMQ queue: 'orders_queue' for relevant patterns.`);
  }
  // --- KẾT THÚC KẾT NỐI MICROSERVICE ---
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));

  const port = configService.get<number>('PORT', 3004); // <<< Lấy port 3004
  await app.listen(port);
  console.log(`Order Service is running on: ${await app.getUrl()}`); // Sửa tên service
}
bootstrap();