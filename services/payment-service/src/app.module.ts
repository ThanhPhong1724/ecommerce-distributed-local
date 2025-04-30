// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PaymentModule } from './payment/payment.module';
import { PaymentController } from './payment/payment.controller';
import { PaymentService } from './payment/payment.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    HttpModule, // Import HttpModule
    PaymentModule,

    // Cấu hình RabbitMQ Client để publish sự kiện
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE', // Tên để inject client
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL');
          const rabbitmqUser = configService.get<string>('RABBITMQ_USER');
          const rabbitmqPass = configService.get<string>('RABBITMQ_PASS');
          if (!rabbitmqUrl || !rabbitmqUser || !rabbitmqPass) {
            throw new Error('RabbitMQ env vars not defined!');
          }
          console.log('Payment Service connecting to RabbitMQ:', rabbitmqUrl);
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'payments_publish_queue', // Có thể đặt tên khác hoặc ko cần nếu chỉ publish
              queueOptions: { durable: true },
              // --- Thêm credentials nếu cần ---
              // credentials: {
              //   username: rabbitmqUser,
              //   password: rabbitmqPass,
              // },
              // --- Có thể cấu hình exchange mặc định để publish ---
              // publishOptions: {
              //   exchange: 'payments_exchange',
              // },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class AppModule {}