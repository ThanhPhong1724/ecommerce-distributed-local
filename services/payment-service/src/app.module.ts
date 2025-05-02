// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentModule } from './payment/payment.module';
// Không cần import PaymentController, PaymentService ở đây nữa
// vì chúng đã được quản lý bởi PaymentModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    HttpModule,
    PaymentModule, // Chỉ cần import PaymentModule

    // Cấu hình RabbitMQ Client (giữ nguyên như cũ)
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
          // Lấy user/pass từ biến riêng nếu dùng RabbitMQ có xác thực
          // const rabbitmqUser = configService.get<string>('RABBITMQ_USER');
          // const rabbitmqPass = configService.get<string>('RABBITMQ_PASS');

          if (!rabbitmqUrl) { // Chỉ cần kiểm tra URL nếu ko có xác thực
            throw new Error('RABBITMQ_URL env var not defined!');
          }
          console.log('Payment Service connecting to RabbitMQ:', rabbitmqUrl);
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'payments_events', // Đặt tên queue cụ thể cho events này
              queueOptions: { durable: true },
              // credentials: { username: rabbitmqUser, password: rabbitmqPass }, // Bỏ comment nếu cần
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [], // Xóa AppController
  providers: [],   // Xóa AppService
})
export class AppModule {}