// src/main.ts (của notification-service)
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices'; // Import MicroserviceOptions, Transport
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common'; // Import Logger

async function bootstrap() {
  const logger = new Logger('Bootstrap-NotificationService'); // Tạo logger riêng cho bootstrap

  // Tạo context ứng dụng để lấy ConfigService mà không cần tạo HTTP server
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
  const queueName = configService.get<string>('RABBITMQ_ORDERS_QUEUE', 'orders_notifications_queue'); // Lấy tên queue từ env, mặc định là 'orders_notifications_queue'

  if (!rabbitmqUrl) {
    logger.error('RABBITMQ_URL is not defined in environment variables!');
    await appContext.close();
    process.exit(1); // Thoát nếu thiếu cấu hình quan trọng
  }

  logger.log(`Connecting to RabbitMQ: ${rabbitmqUrl}, Queue: ${queueName}`);

  // Tạo microservice listener
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ, // Chỉ định transport là RabbitMQ
      options: {
        urls: [rabbitmqUrl],   // URL kết nối
        queue: queueName,      // Tên Queue mà service này sẽ lắng nghe
        noAck: false,          // !!! QUAN TRỌNG: Để false để yêu cầu ack thủ công trong controller
        persistent: true,      // Messages trong queue sẽ được lưu lại nếu RabbitMQ restart
        queueOptions: {
          durable: true,     // Queue sẽ tồn tại sau khi RabbitMQ restart
        },
        // --- Cấu hình credentials nếu cần (tương tự order-service) ---
        // credentials: {
        //    username: configService.get<string>('RABBITMQ_USER'),
        //    password: configService.get<string>('RABBITMQ_PASS'),
        // },
      },
    },
  );

  await app.listen(); // Bắt đầu lắng nghe message
  logger.log(`Notification Service is listening on queue: ${queueName}`);

  // Không cần listen port HTTP vì đây là worker
  // const port = configService.get<number>('PORT', 3005);
  // await app.listen(port);
  // console.log(`Notification Service HTTP (if any) is running on port ${port}`);
}
bootstrap();